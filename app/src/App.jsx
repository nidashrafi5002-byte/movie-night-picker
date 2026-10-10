import { useState, useEffect, useRef } from "react";
import catalog from "./data/catalog.json";
import { pickMovies } from "./logic/scoring.js";
import { moveFocus } from "./logic/dpad.js";
import "./App.css";

const MOODS = ["funny", "exciting", "relaxed", "scary"];
const AGES = [5, 8, 12, 16, 30];
const TIMES = [75, 90, 120, 180];

export default function App() {
  const [people, setPeople] = useState([
    { name: "Person 1", age: 30, mood: "funny" },
  ]);
  const [minutes, setMinutes] = useState(120);
  const [results, setResults] = useState(null);
  const [playing, setPlaying] = useState(null);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  // Remote control: arrows move focus, Back goes up one screen.
  // The Android wrapper calls window.__handleBack and exits if it returns false.
  useEffect(() => {
    function goBack() {
      if (playing) {
        setPlaying(null);
        return true;
      }
      if (results) {
        setResults(null);
        return true;
      }
      return false;
    }
    window.__handleBack = goBack;

    function onKey(e) {
      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        moveFocus(e.key);
      } else if (e.key === "Escape" || e.key === "Backspace") {
        e.preventDefault();
        goBack();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      delete window.__handleBack;
    };
  }, [playing, results]);

  // Put focus on the first button whenever the screen changes
  useEffect(() => {
    document.querySelector("button")?.focus();
  }, [results, playing]);

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

  function watch(movie) {
    setVideoError(false);
    setPlaying(movie);
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }

  function seek(seconds) {
    const v = videoRef.current;
    if (v) v.currentTime = Math.max(0, v.currentTime + seconds);
  }

  if (playing) {
    return (
      <main className="screen">
        <h2>
          {playing.title} <span>({playing.year})</span>
        </h2>
        <video
          ref={videoRef}
          className="player"
          src={playing.video}
          autoPlay
          onError={() => setVideoError(true)}
        />
        {videoError && (
          <p className="card">
            Can't play this film right now. Check your internet connection.
          </p>
        )}
        <div className="row">
          <button className="chip" onClick={togglePlay}>Play / Pause</button>
          <button className="chip" onClick={() => seek(-10)}>-10s</button>
          <button className="chip" onClick={() => seek(10)}>+10s</button>
          <button className="chip" onClick={() => setPlaying(null)}>
            Back to picks
          </button>
        </div>
      </main>
    );
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
            <div className="card movie" key={m.id}>
              <img
                className="poster"
                src={`https://archive.org/services/img/${m.id}`}
                alt=""
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div className="info">
                <p className="tag">{m.tag}</p>
                <h2>
                  {m.title} <span>({m.year})</span>
                </h2>
                <p>{m.blurb}</p>
                <p className="reason">{m.reason}</p>
                <button className="chip" onClick={() => watch(m)}>
                  ▶ Watch
                </button>
              </div>
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