import { useState } from "react";
import catalog from "./data/catalog.json";
import { pickMovies } from "./logic/scoring.js";
import "./App.css";

const MOODS = ["funny", "exciting", "relaxed", "scary"];
const AGES = [5, 8, 12, 16, 30];
const TIMES = [45, 90, 120, 180];

export default function App() {
  const [people, setPeople] = useState([
    { name: "Person 1", age: 30, mood: "funny" },
  ]);
  const [minutes, setMinutes] = useState(120);
  const [results, setResults] = useState(null);

  function updatePerson(i, field, value) {
    setPeople(people.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  }

  function addPerson() {
    if (people.length >= 6) return;
    setPeople([
      ...people,
      { name: `Person ${people.length + 1}`, age: 30, mood: "funny" },
    ]);
  }

  function removePerson() {
    if (people.length > 1) setPeople(people.slice(0, -1));
  }

  if (results) {
    return (
      <main className="screen">
        <h1>Tonight's picks</h1>
        {results.length === 0 && (
          <p className="card">
            No film fits. Try more time or a different group.
          </p>
        )}
        <div className="cards">
          {results.map((m) => (
            <div className="card" key={m.id}>
              <h2>
                {m.title} <span>({m.year})</span>
              </h2>
              <p>{m.blurb}</p>
              <p className="reason">{m.reason}</p>
            </div>
          ))}
        </div>
        <button className="big" onClick={() => setResults(null)}>
          Start over
        </button>
      </main>
    );
  }

  return (
    <main className="screen">
      <h1>Movie Night Picker</h1>

      {people.map((p, i) => (
        <section className="person" key={i}>
          <h2>{p.name}</h2>
          <div className="row">
            <span className="label">Age</span>
            {AGES.map((a) => (
              <button
                key={a}
                className={`chip ${p.age === a ? "selected" : ""}`}
                onClick={() => updatePerson(i, "age", a)}
              >
                {a === 30 ? "Adult" : a}
              </button>
            ))}
          </div>
          <div className="row">
            <span className="label">Mood</span>
            {MOODS.map((m) => (
              <button
                key={m}
                className={`chip ${p.mood === m ? "selected" : ""}`}
                onClick={() => updatePerson(i, "mood", m)}
              >
                {m}
              </button>
            ))}
          </div>
        </section>
      ))}

      <div className="row">
        <button className="chip" onClick={addPerson}>+ Add person</button>
        <button className="chip" onClick={removePerson}>- Remove person</button>
      </div>

      <div className="row">
        <span className="label">Time</span>
        {TIMES.map((t) => (
          <button
            key={t}
            className={`chip ${minutes === t ? "selected" : ""}`}
            onClick={() => setMinutes(t)}
          >
            {t} min
          </button>
        ))}
      </div>

      <button
        className="big"
        onClick={() => setResults(pickMovies(people, minutes, catalog))}
      >
        Find my movie
      </button>
    </main>
  );
}