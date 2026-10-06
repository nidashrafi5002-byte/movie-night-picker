export function pickMovies(people, minutes, catalog) {
  const youngest = Math.min(...people.map(p => p.age));
  const eligible = catalog.filter(
    m => m.minutes <= minutes && m.minAge <= youngest
  );

  const scored = eligible.map(m => {
    const fans = people.filter(p => m.moods.includes(p.mood));
    return { ...m, score: fans.length, fans: fans.map(p => p.name) };
  });

  scored.sort((a, b) => b.score - a.score || a.minutes - b.minutes);

  return scored.slice(0, 3).map(m => ({ ...m, reason: buildReason(m, minutes) }));
}

function buildReason(m, minutes) {
  const who = m.fans.length ? `Matches ${m.fans.join(" and ")}'s mood` : "A safe pick for everyone";
  return `${who}, and it fits your ${minutes} minutes (${m.minutes} min).`;
}