import { readFileSync } from "node:fs";
import { pickMovies } from "./scoring.js";

const catalog = JSON.parse(
  readFileSync(new URL("../data/catalog.json", import.meta.url))
);
const people = [
  { name: "Sam", age: 30, mood: "funny" },
  { name: "Mia", age: 8, mood: "relaxed" },
  { name: "Dad", age: 30, mood: "exciting" },
];

function show(label, streaks) {
  console.log(`--- ${label} ---`);
  for (const m of pickMovies(people, 120, catalog, streaks)) {
    console.log(`${m.title} [${m.tag}]\n  ${m.reason}`);
  }
  console.log();
}

show("No history", {});
show("Mia lost out two nights in a row", { Mia: 2 });