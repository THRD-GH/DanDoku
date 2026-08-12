"use client";

import { useState } from "react";

const games = [
  {
    id: "variants",
    eyebrow: "The original, remixed",
    title: "Sudoku Variants",
    description: "Mix X, Jigsaw, Hyper, Percent and Colour rules in any combination. Every puzzle is generated for you and proven unique.",
    meta: "32 combinations · 6 levels",
    accent: "coral",
    marks: ["X", "J", "H", "%", "C"],
    grid: [5,0,0,0,7,0,0,0,2,0,8,0,4,0,6,0,1,0,0,0,3,0,0,0,8,0,0,9,0,0,6,0,2,0,0,7,0,2,0,0,8,0,0,6,0,6,0,0,3,0,9,0,0,4,0,0,4,0,0,0,7,0,0,0,3,0,9,0,5,0,8,0,7,0,0,0,1,0,0,0,6],
  },
  {
    id: "killer",
    eyebrow: "Arithmetic meets logic",
    title: "Killer Sudoku",
    description: "No given digits—only dashed cages and their sums. Work from small combinations to satisfying 45-rule breakthroughs.",
    meta: "5,200 classics · Unlimited new",
    accent: "blue",
    marks: ["12", "17", "23"],
    grid: [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  },
  {
    id: "solduku",
    eyebrow: "Solitaire meets Sudoku",
    title: "Solduku",
    description: "Deal number cards into a real Sudoku grid. Park awkward cards, spend wild jokers and chase suit flushes for bonus points.",
    meta: "6 levels · Infinite deals",
    accent: "gold",
    marks: ["♠", "♥", "♦", "♣"],
    grid: [0,0,7,0,0,4,0,0,0,0,4,0,0,7,0,1,0,0,2,0,0,0,0,0,0,7,0,0,0,0,5,0,0,0,2,0,0,8,0,0,0,0,0,3,0,0,1,0,0,0,8,0,0,0,0,6,0,0,0,0,0,0,9,0,0,2,0,5,0,0,6,0,0,0,0,1,0,8,0,0,0],
  },
];

function MiniBoard({ game }: { game: (typeof games)[number] }) {
  return (
    <div className={`mini-board ${game.accent}`} aria-hidden="true">
      {game.grid.map((n, index) => (
        <span key={index} className={game.id === "killer" && index % 7 === 0 ? "cage" : ""}>{n || ""}</span>
      ))}
      <div className="board-marks">{game.marks.map((mark) => <b key={mark}>{mark}</b>)}</div>
    </div>
  );
}

export default function Home() {
  const [active, setActive] = useState("all");
  const visible = active === "all" ? games : games.filter((game) => game.id === active);

  return (
    <main>
      <nav className="nav" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Puzzle Cabinet home"><span className="brand-grid">9</span><span>Puzzle<br/>Cabinet</span></a>
        <div className="nav-links"><a href="#games">Games</a><a href="#how">How it works</a><button aria-label="Open player profile">DT</button></div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="kicker">A collection for curious minds</p>
          <h1>Your next <em>aha!</em><br/>moment is waiting.</h1>
          <p className="intro">Three distinctive ways to play with nine digits. Choose a familiar grid, bend the rules, or shuffle the whole idea into a deck of cards.</p>
          <a className="primary" href="#games">Explore the collection <span>↓</span></a>
        </div>
        <div className="hero-art" aria-label="Decorative puzzle grid">
          <div className="sun"></div>
          <div className="floating-board">
            {[4,0,8,0,6,0,0,1,0,0,7,0,3,0,9,0,0,5,0,0,2,0,8,0,6,0,0,0,4,0,0,1,0,7,0,0].map((n,i)=><span key={i}>{n || ""}</span>)}
          </div>
          <span className="orbit orbit-one">✦</span><span className="orbit orbit-two">9</span><span className="orbit orbit-three">?</span>
        </div>
      </section>

      <section className="collection" id="games">
        <div className="section-heading"><div><p className="kicker">The collection</p><h2>Pick your puzzle</h2></div><p>Every game works offline, remembers your progress, and offers six carefully measured difficulty levels.</p></div>
        <div className="filters" aria-label="Filter games">
          <button className={active === "all" ? "active" : ""} onClick={() => setActive("all")}>All games</button>
          {games.map((game) => <button key={game.id} className={active === game.id ? "active" : ""} onClick={() => setActive(game.id)}>{game.title}</button>)}
        </div>
        <div className="game-grid">
          {visible.map((game, index) => (
            <article className={`game-card ${game.accent}`} key={game.id}>
              <div className="card-number">0{index + 1}</div><MiniBoard game={game}/>
              <div className="card-copy"><p className="eyebrow">{game.eyebrow}</p><h3>{game.title}</h3><p>{game.description}</p><div className="card-foot"><span>{game.meta}</span><button aria-label={`Play ${game.title}`}>Play <b>↗</b></button></div></div>
            </article>
          ))}
        </div>
      </section>

      <section className="how" id="how">
        <p className="kicker">Designed to disappear</p><h2>Just you and the puzzle.</h2>
        <div className="benefits"><div><b>01</b><h3>Play anywhere</h3><p>Install once and every game works offline, from the train to the garden.</p></div><div><b>02</b><h3>Learn as you solve</h3><p>Hints name the exact technique and explain why it works before filling anything.</p></div><div><b>03</b><h3>Never lose your place</h3><p>Every unfinished grid, move and setting stays ready for your return.</p></div></div>
      </section>

      <footer><a className="brand" href="#top"><span className="brand-grid">9</span><span>Puzzle<br/>Cabinet</span></a><p>Three games. Endless thoughtful minutes.</p><span>© 2026</span></footer>
    </main>
  );
}
