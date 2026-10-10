const MATCH = 1;
const OK = 0.2;

function satisfaction(person, movie) {
  return movie.moods.includes(person.mood) ? MATCH : OK;
}

// streaks: { name: number of recent nights that person lost out }
export function pickMovies(people, minutes, catalog, streaks = {}) {
  const youngest = Math.min(...people.map((p) => p.age));
  const eligible = catalog.filter(
    (m) => m.minutes <= minutes && m.minAge <= youngest
  );
  if (eligible.length === 0) return [];

  const weights = people.map((p) => 1 + 0.5 * (streaks[p.name] || 0));
  const weightSum = weights.reduce((a, b) => a + b, 0);

  const rated = eligible.map((m) => {
    const sats = people.map((p) => satisfaction(p, m));
    const min = Math.min(...sats);
    const wavg = sats.reduce((sum, s, i) => sum + s * weights[i], 0) / weightSum;
    return {
      ...m,
      sats,
      happy: people.filter((_, i) => sats[i] === MATCH).map((p) => p.name),
      score: 0.6 * min + 0.4 * wavg,
    };
  });

  // Pick 1: best compromise, tilted toward people who lost out recently
  rated.sort((a, b) => b.score - a.score || a.minutes - b.minutes);
  const picks = [{ ...rated[0], tag: "Best for the group" }];

  // Picks 2-3: serve whoever the earlier picks served least
  while (picks.length < 3 && picks.length < rated.length) {
    const served = people.map((_, i) => Math.max(...picks.map((p) => p.sats[i])));
    const rest = rated.filter((m) => !picks.some((p) => p.id === m.id));

    let best = null;
    let bestGain = -1;
    for (const m of rest) {
      const gain = m.sats.reduce(
        (sum, s, i) => sum + weights[i] * Math.max(0, s - served[i]),
        0
      );
      const total = gain + m.score * 0.01;
      if (total > bestGain) {
        bestGain = total;
        best = m;
      }
    }
    const tag = best.happy.length
      ? `Great for ${best.happy.join(" & ")}`
      : "Another option";
    picks.push({ ...best, tag });
  }

  return picks.map((m) => ({ ...m, reason: buildReason(m, people, minutes, streaks) }));
}

function buildReason(m, people, minutes, streaks) {
  let who;
  if (m.happy.length === people.length) who = "Matches everyone's mood";
  else if (m.happy.length === 0)
    who = "Not anyone's exact mood, but suitable for everyone in the room";
  else who = `Matches ${m.happy.join(" and ")}'s mood`;

  const others = people.filter((p) => !m.happy.includes(p.name)).map((p) => p.name);
  const tradeoff =
    others.length && m.happy.length ? `; less of a fit for ${others.join(" and ")}` : "";

  const turn = m.happy.filter((n) => (streaks[n] || 0) > 0);
  const turnText = turn.length ? ` It's ${turn.join(" and ")}'s turn.` : "";

  return `${who}${tradeoff}.${turnText} Fits your ${minutes} minutes (${m.minutes} min).`;
}