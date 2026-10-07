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
for (const m of pickMovies(people, 120, catalog)) {
  console.log(`${m.title} [${m.tag}]\n  ${m.reason}\n`);
}