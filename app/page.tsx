"use client";

import { useState } from "react";

const games = [
  { id:"variants", eyebrow:"The original, remixed", title:"Sudoku Variants", description:"Mix X, Jigsaw, Hyper, Percent and Colour rules in any combination. Every puzzle is generated for you and proven unique.", meta:"32 combinations · 6 levels", accent:"coral", marks:["X","J","H","%","C"], grid:[5,0,0,0,7,0,0,0,2,0,8,0,4,0,6,0,1,0,0,0,3,0,0,0,8,0,0,9,0,0,6,0,2,0,0,7,0,2,0,0,8,0,0,6,0,6,0,0,3,0,9,0,0,4,0,0,4,0,0,0,7,0,0,0,3,0,9,0,5,0,8,0,7,0,0,0,1,0,0,0,6] },
  { id:"killer", eyebrow:"Arithmetic meets logic", title:"Killer Sudoku", description:"No given digits—only dashed cages and their sums. Work from small combinations to satisfying 45-rule breakthroughs.", meta:"5,200 classics · Unlimited new", accent:"blue", marks:["12","17","23"], grid:Array(81).fill(0) },
  { id:"solduku", eyebrow:"Solitaire meets Sudoku", title:"Solduku", description:"Deal number cards into a real Sudoku grid. Park awkward cards, spend wild jokers and chase suit flushes for bonus points.", meta:"6 levels · Infinite deals", accent:"gold", marks:["♠","♥","♦","♣"], grid:[0,0,7,0,0,4,0,0,0,0,4,0,0,7,0,1,0,0,2,0,0,0,0,0,0,7,0,0,0,0,5,0,0,0,2,0,0,8,0,0,0,0,0,3,0,0,1,0,0,0,8,0,0,0,0,6,0,0,0,0,0,0,9,0,0,2,0,5,0,0,6,0,0,0,0,1,0,8,0,0,0] },
];

function MiniBoard({ game }: { game:(typeof games)[number] }) {
  return <div className={`mini-board ${game.accent}`} aria-hidden="true">{game.grid.map((n,index)=><span key={index} className={game.id==="killer"&&index%7===0?"cage":""}>{n||""}</span>)}<div className="board-marks">{game.marks.map(mark=><b key={mark}>{mark}</b>)}</div></div>;
}

export default function Home() {
  const [active,setActive]=useState("all");
  const visible=active==="all"?games:games.filter(game=>game.id===active);
  return <main>
    <header className="site-header" id="top">
      <a className="wordmark" href="#top"><span className="nine-mark">9×9</span><span>Ninefold</span></a>
      <nav aria-label="Main navigation"><a href="#games">All games</a><a href="#about">About</a></nav>
      <a className="header-cta" href="#games">Choose a game</a>
    </header>

    <section className="hero">
      <div className="hero-copy">
        <p className="hero-label">Three original number games</p>
        <h1>Sudoku,<br/><span>however you like it.</span></h1>
        <p className="intro">Classic logic with new rules, cage-sum deduction, or a deck of number cards. Pick a game and start at your level—no account needed.</p>
        <div className="hero-actions"><a className="primary" href="#games">Browse the games <span>↓</span></a><span className="offline-note"><b>●</b> Plays offline</span></div>
      </div>
      <div className="game-stack" aria-label="Preview of the three games">
        <div className="stack-card stack-variants"><span>01</span><b>Variants</b><div className="stack-grid">{[8,0,0,2,0,0,0,9,0,0,6,0,0,0,1,5].map((n,i)=><i key={i}>{n||""}</i>)}</div><em>X · J · H · % · C</em></div>
        <div className="stack-card stack-killer"><span>02</span><b>Killer</b><div className="stack-grid cage-grid">{Array.from({length:16},(_,i)=><i key={i}>{i===0?"12":i===6?"17":""}</i>)}</div><em>5,200 classic grids</em></div>
        <div className="stack-card stack-solduku"><span>03</span><b>Solduku</b><div className="card-hand"><i>7♠</i><i>4♥</i><i>9♦</i></div><em>Sudoku, dealt differently</em></div>
      </div>
    </section>

    <section className="quick-strip" aria-label="Collection summary"><span><b>3</b> distinct games</span><span><b>6</b> difficulty levels</span><span><b>∞</b> puzzles to play</span></section>

    <section className="collection" id="games">
      <div className="section-heading"><div><p className="kicker">The collection</p><h2>Pick your puzzle</h2></div><p>Every game works offline, remembers your progress, and offers six carefully measured difficulty levels.</p></div>
      <div className="filters" aria-label="Filter games"><button className={active==="all"?"active":""} onClick={()=>setActive("all")}>All games</button>{games.map(game=><button key={game.id} className={active===game.id?"active":""} onClick={()=>setActive(game.id)}>{game.title}</button>)}</div>
      <div className="game-grid">{visible.map((game,index)=><article className={`game-card ${game.accent}`} key={game.id}><div className="card-number">0{index+1}</div><MiniBoard game={game}/><div className="card-copy"><p className="eyebrow">{game.eyebrow}</p><h3>{game.title}</h3><p>{game.description}</p><div className="card-foot"><span>{game.meta}</span><button aria-label={`Play ${game.title}`}>Play <b>↗</b></button></div></div></article>)}</div>
    </section>

    <section className="about" id="about"><div><p className="kicker">Built for real play</p><h2>Start quickly.<br/>Come back anytime.</h2></div><div className="about-list"><p><b>Works offline</b><span>Install any game and play without a connection.</span></p><p><b>Useful hints</b><span>See the solving technique and reasoning—not just the answer.</span></p><p><b>Progress saved</b><span>Every unfinished puzzle waits exactly where you left it.</span></p></div></section>
    <footer><a className="wordmark" href="#top"><span className="nine-mark">9×9</span><span>Ninefold</span></a><p>Sudoku Variants · Killer Sudoku · Solduku</p><span>© 2026</span></footer>
  </main>;
}
