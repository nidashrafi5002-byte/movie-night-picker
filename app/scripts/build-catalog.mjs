import { writeFileSync } from "node:fs";

const SEARCH = "https://archive.org/advancedsearch.php";
const query =
  "collection:feature_films AND mediatype:movies AND date:[1920-01-01 TO 1965-12-31]";

const params = new URLSearchParams({
  q: query,
  rows: "60",
  page: "1",
  output: "json",
});
params.append("sort[]", "downloads desc");
for (const f of ["identifier", "title", "year", "licenseurl", "subject"]) {
  params.append("fl[]", f);
}

const asArray = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

function toMoods(subjects) {
  const s = subjects.join(" ").toLowerCase();
  const moods = new Set();
  if (/comed|humor|funny|farce/.test(s)) moods.add("funny");
  if (/horror|monster|vampire|ghost|zombie/.test(s)) moods.add("scary");
  if (/adventure|action|thriller|crime|mystery|western|war|noir|detective/.test(s))
    moods.add("exciting");
  if (/family|children|cartoon|animation|musical|romance|travel|documentary/.test(s))
    moods.add("relaxed");
  if (moods.size === 0) moods.add("relaxed");
  return [...moods];
}

function toMinAge(moods) {
  if (moods.includes("scary")) return 14;
  if (moods.includes("exciting")) return 10;
  return 6;
}

function parseLength(len) {
  if (!len) return null;
  if (String(len).includes(":")) {
    const parts = String(len).split(":").map(Number);
    return parts.reduce((acc, n) => acc * 60 + n, 0);
  }
  return Number(len);
}

const res = await fetch(`${SEARCH}?${params}`);
const docs = (await res.json()).response.docs;
console.log(`Search returned ${docs.length} items`);

const out = [];
for (const d of docs) {
  try {
    const m = await (
      await fetch(`https://archive.org/metadata/${d.identifier}`)
    ).json();
    const mp4s = (m.files || []).filter((f) => /\.mp4$/i.test(f.name));
    if (mp4s.length === 0) continue;
    const pick =
      mp4s.find((f) => /512kb/i.test(f.name)) ||
      mp4s.sort((a, b) => Number(a.size) - Number(b.size))[0];

    const seconds = parseLength(pick.length);
    if (!seconds) continue;
    const minutes = Math.round(seconds / 60);
    if (minutes < 5 || minutes > 200) continue;

    const subjects = asArray(d.subject);
    const moods = toMoods(subjects);
    const desc = asArray(m.metadata?.description).join(" ")
      .replace(/<[^>]*>/g, "").slice(0, 140);

    out.push({
      id: d.identifier,
      title: d.title,
      year: Number(d.year) || null,
      minutes,
      minAge: toMinAge(moods),
      moods,
      blurb: desc,
      video: `https://archive.org/download/${d.identifier}/${encodeURIComponent(pick.name)}`,
      license: d.licenseurl || "",
      page: `https://archive.org/details/${d.identifier}`,
    });
    console.log("OK ", d.identifier, minutes + " min");
  } catch (e) {
    console.log("SKIP", d.identifier, e.message);
  }
  await new Promise((r) => setTimeout(r, 300));
}

writeFileSync("src/data/catalog.candidates.json", JSON.stringify(out, null, 2));
console.log(`Saved ${out.length} candidates`);