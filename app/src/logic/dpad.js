export function moveFocus(direction) {
  const items = Array.from(document.querySelectorAll("button"));
  const current = document.activeElement;

  if (!items.includes(current)) {
    items[0]?.focus();
    return;
  }

  const c = current.getBoundingClientRect();
  const cx = c.left + c.width / 2;
  const cy = c.top + c.height / 2;

  let best = null;
  let bestScore = Infinity;

  for (const el of items) {
    if (el === current) continue;
    const r = el.getBoundingClientRect();
    const dx = r.left + r.width / 2 - cx;
    const dy = r.top + r.height / 2 - cy;

    let primary;
    let secondary;
    if (direction === "ArrowRight") { if (dx <= 1) continue; primary = dx; secondary = Math.abs(dy); }
    else if (direction === "ArrowLeft") { if (dx >= -1) continue; primary = -dx; secondary = Math.abs(dy); }
    else if (direction === "ArrowDown") { if (dy <= 1) continue; primary = dy; secondary = Math.abs(dx); }
    else if (direction === "ArrowUp") { if (dy >= -1) continue; primary = -dy; secondary = Math.abs(dx); }
    else return;

    const score = primary + secondary * 2;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }

  if (best) {
    best.focus();
    best.scrollIntoView({ block: "center", behavior: "smooth" });
  }
}