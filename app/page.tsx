"use client";

import { useState } from "react";

const games = [
  { id:"variants", eyebrow:"The original, remixed", title:"Sudoku Variants", description:"Mix X, Jigsaw, Hyper, Percent and Colour rules in any combination. Every puzzle is generated for you and proven unique.", meta:"32 combinations · 6 levels", accent:"coral", marks:["X","J","H","%","C"], grid:[5,0,0,0,7,0,0,0,2,0,8,0,4,0,6,0,1,0,0,0,3,0,0,0,8,0,0,9,0,0,6,0,2,0,0,7,0,2,0,0,8,0,0,6,0,6,0,0,3,0,9,0,0,4,0,0,4,0,0,0,7,0,0,0,3,0,9,0,5,0,8,0,7,0,0,0,1,0,0,0,6] },
  { id:"killer", eyebrow:"Arithmetic meets logic", title:"Killer Sudoku", description:"No given digits—only dashed cages and their sums. Work from small combinations to satisfying 45-rule breakthroughs.", meta:"5,200 classics · Unlimited new", accent:"blue", marks:["12","17","23"], grid:Array(81).fill(0) },
  { id:"solduku", eyebrow:"Solitaire meets Sudoku", title:"Solduku", description:"Deal number cards into a real Sudoku grid. Park awkward cards, spend wild jokers and chase suit flushes for bonus points.", meta:"6 levels · Infinite deals", accent:"gold", marks:["♠","♥","♦","♣"], grid:[0,0,7,0,0,4,0,0,0,0,4,0,0,7,0,1,0,0,2,0,0,0,0,0,0,7,0,0,0,0,5,0,0,0,2,0,0,8,0,0,0,0,0,3,0,0,1,0,0,0,8,0,0,0,0,6,0,0,0,0,0,0,9,0,0,2,0,5,0,0,6,0,0,0,0,1,0,8,0,0,0] },
];

const regionColors=[0,0,1,1,1,2,2,2,3,0,0,1,4,4,4,2,3,3,0,5,5,5,4,6,6,3,3,7,7,5,8,8,6,6,6,3,7,7,5,5,8,8,6,1,1,7,2,2,5,8,0,0,1,1,7,2,4,4,8,0,3,3,3,6,6,4,4,8,0,0,3,5,6,6,6,4,7,7,7,5,5];
function GamePreview({game,compact=false}:{game:(typeof games)[number];compact?:boolean}){
  if(game.id==="killer") return <div className={`real-preview ${compact?"compact":""}`} aria-hidden="true"><div className="preview-label"><span>K6-104</span><b>★★★★★☆</b></div><div className="real-board killer-real">{Array.from({length:81},(_,i)=><i key={i} data-sum={i===0?"12":i===2?"17":i===9?"14":i===13?"8":i===20?"11":i===24?"20":i===31?"18":i===36?"9":i===43?"19":i===48?"17":i===55?"16":i===61?"12":i===67?"18":i===75?"20":""}></i>)}</div><div className="preview-bottom"><span>Undo</span><span>Hint</span><span>Sum</span></div></div>;
  if(game.id==="solduku") return <div className={`real-preview ${compact?"compact":""}`} aria-hidden="true"><div className="preview-label"><span>DEAL 3-18</span><b>1,240 PTS</b></div><div className="solduku-scene"><div className="real-board solduku-real">{game.grid.map((n,i)=><i key={i} className={n?"given":""}>{n||""}</i>)}</div><div className="freecell"><i></i><i>6♣</i></div><div className="drawpile">24</div><div className="real-hand"><i>7♠</i><i>4♥</i><i>9♦</i><i>★</i></div></div></div>;
  return <div className={`real-preview ${compact?"compact":""}`} aria-hidden="true"><div className="preview-label"><span>XJHC5-27</span><b>X · J · H · C</b></div><div className="real-board variant-real">{game.grid.map((n,i)=><i key={i} className={`rg-${regionColors[i]} ${(i%10===0||i%8===0)?"diag":""}`}>{n||""}</i>)}</div><div className="preview-bottom"><span>X diagonals</span><span>Jigsaw</span><span>Colour</span></div></div>;
}
function MiniBoard({game}:{game:(typeof games)[number]}){return <GamePreview game={game} compact/>}

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
        <div className="stack-card stack-variants"><span>01</span><b>Variants</b><GamePreview game={games[0]}/></div>
        <div className="stack-card stack-killer"><span>02</span><b>Killer</b><GamePreview game={games[1]}/></div>
        <div className="stack-card stack-solduku"><span>03</span><b>Solduku</b><GamePreview game={games[2]}/></div>
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
