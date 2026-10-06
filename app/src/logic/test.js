import { readFileSync } from "node:fs";
import { pickMovies } from "./scoring.js";

const catalog = JSON.parse(
  readFileSync(new URL("../data/catalog.json", import.meta.url))
);
const people = [
  { name: "Sam", age: 30, mood: "funny" },
  { name: "Mia", age: 9, mood: "relaxed" },
];
console.log(pickMovies(people, 100, catalog));