"use client";

import { useState } from "react";
import gameManifest from "../games.json";

// games.json is the single source of truth for where each game is deployed.
// The CI workflow reads it to check out, build and assemble the games, and to
// poll them for changes; this builds the play links from the same file. Keying
// on the repository — the stable identifier — means renaming a slug moves the
// deployed path and these links together, instead of silently 404ing.
function playPath(repo: string, query = ""): string {
  const entry = gameManifest.find((game) => game.repo === repo);
  if (!entry) throw new Error(`games.json has no entry for ${repo}`);
  return `/${entry.slug}/${query}`;
}
const SUDOKU = "THRD-GH/SodukuCombined";
const KILLER = "THRD-GH/KillerSoduku";
const SOLDUKU = "THRD-GH/Solduku";

// Real puzzles, lifted from the games' own generators rather than drawn by
// hand: S4-128, XJ5-27 and K6-104 are the ids shown on the cards, and each was
// re-verified here (unique solution; cages tiling the grid with no single-cell
// cage; Solduku's dealt digits conflict-free).
const classicGivens=[0,0,0,0,0,0,0,0,3,0,0,9,0,6,8,0,2,0,8,0,0,0,0,5,0,0,0,0,4,0,0,0,1,0,0,7,0,5,0,0,4,0,0,9,0,0,0,2,3,0,0,0,6,0,0,0,0,5,0,0,0,0,4,0,0,4,9,0,0,2,0,8,0,0,3,0,0,0,1,0,0];
const variantGivens=[8,7,0,0,0,1,0,0,0,0,1,0,0,0,6,0,0,0,0,6,0,3,0,0,0,0,0,4,0,0,0,0,0,0,9,0,0,0,6,0,0,0,1,0,0,0,9,0,0,0,0,0,0,4,0,0,0,0,0,7,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,8,2];
// Irregular nine-cell jigsaw regions replacing the 3x3 boxes, and a colouring
// where no two touching regions share a shade.
const jigsawRegions=[0,0,0,1,1,1,2,2,2,0,0,0,1,1,1,2,2,2,3,0,0,0,1,1,1,2,2,3,3,4,4,4,5,5,2,5,3,3,3,4,4,4,5,5,5,3,6,3,3,4,4,4,5,5,6,6,7,7,7,8,8,8,5,6,6,6,7,7,7,8,8,8,6,6,6,7,7,7,8,8,8];
const jigsawColour=[0,1,0,1,2,3,0,3,0];
const killerCage=[11,21,21,2,2,18,18,18,4,11,11,21,2,2,2,25,18,4,20,20,5,1,1,2,25,19,4,6,6,5,5,1,23,25,19,4,6,9,12,12,17,23,15,15,4,6,9,12,12,17,23,7,7,4,8,8,12,0,0,10,10,7,16,22,8,14,14,14,10,24,24,16,22,22,13,13,3,3,3,3,3];
const killerSum=[17,14,0,30,0,19,0,0,26,0,0,0,0,0,0,17,0,0,7,0,14,14,0,0,0,12,0,21,0,0,0,0,17,0,0,0,0,15,20,0,11,0,9,0,0,0,0,0,0,0,0,14,0,0,16,0,0,9,0,9,0,0,17,12,0,17,0,0,0,13,0,0,0,0,14,0,21,0,0,0,0];
const soldukuGivens=[0,6,5,0,0,0,0,8,3,0,0,0,0,0,0,0,0,4,0,0,0,0,0,8,0,9,0,2,0,8,0,0,0,0,0,0,5,0,0,2,0,0,7,0,0,0,1,0,0,4,0,0,0,0,1,0,7,0,0,9,8,0,0,4,8,0,5,0,3,1,0,0,0,0,0,0,0,6,0,0,0];

const games = [
  { id:"classic", url:playPath(SUDOKU,"?v=S"), eyebrow:"The timeless original", title:"Classic Sudoku", description:"Rows, columns and 3×3 boxes—the familiar game, presented cleanly with measured difficulty and useful technique-based hints.", meta:"Classic play · White belt through to 1st Dan", accent:"classic" },
  { id:"variants", url:playPath(SUDOKU,"?v=XJ"), eyebrow:"The original, remixed", title:"Sudoku Variants", description:"Mix X, Jigsaw, Hyper, Percent and Colour rules in any combination. Every puzzle is generated for you and proven unique.", meta:"32 combinations · White belt through to 1st Dan", accent:"coral" },
  { id:"killer", url:playPath(KILLER), eyebrow:"Arithmetic meets logic", title:"Killer Sudoku", description:"No given digits—only dashed cages and their sums. Work from small combinations to satisfying 45-rule breakthroughs.", meta:"8,200 puzzles · White belt through to 1st Dan", accent:"blue" },
  { id:"solduku", url:playPath(SOLDUKU), eyebrow:"Solitaire meets Sudoku", title:"Solduku", description:"Deal number cards into a real Sudoku grid. Park awkward cards, spend wild jokers and chase suit flushes for bonus points.", meta:"Shareable deals · White belt through to 1st Dan", accent:"gold" },
];

// Which sides of cell i sit on the boundary of its group, so a region or cage
// is outlined once around the whole shape rather than drawn per cell.
function edges(group:number[],i:number):string{
  const r=Math.floor(i/9),c=i%9,out:string[]=[];
  if(r===0||group[i-9]!==group[i])out.push("et");
  if(c===8||group[i+1]!==group[i])out.push("er");
  if(r===8||group[i+9]!==group[i])out.push("eb");
  if(c===0||group[i-1]!==group[i])out.push("el");
  return out.join(" ");
}
// Both main diagonals: i%10 walks the leading one, i%8 the anti-diagonal
// (excluding the two corners, which belong to the leading one).
const onDiagonal=(i:number)=>i%10===0||(i%8===0&&i!==0&&i!==80);

function PlayingCard({rank,suit,className=""}:{rank:string;suit:string;className?:string}){
  const pipPositions:Record<string,number[]>={"2":[1,7],"3":[1,4,7],"4":[0,2,6,8],"5":[0,2,4,6,8]};
  return <i className={className}><span className="card-index"><b>{rank}</b><em>{suit}</em></span><span className="pip-field">{Array.from({length:9},(_,i)=><em key={i}>{pipPositions[rank]?.includes(i)?suit:""}</em>)}</span><span className="card-index card-index-bottom"><b>{rank}</b><em>{suit}</em></span></i>
}
function GamePreview({game,compact=false}:{game:(typeof games)[number];compact?:boolean}){
  if(game.id==="killer") return <div className={`real-preview ${compact?"compact":""}`} aria-hidden="true"><div className="preview-label"><span>K6-104</span><b>★★★★★☆</b></div><div className="real-board killer-real">{killerCage.map((_,i)=><i key={i} className={edges(killerCage,i)} data-sum={killerSum[i]||""}></i>)}</div><div className="preview-bottom"><span>Undo</span><span>Hint</span><span>Sum</span></div></div>;
  if(game.id==="solduku") {const cardsOnDisplay=5;const cardsInDrawPile=Math.max(0,soldukuGivens.filter(n=>!n).length-cardsOnDisplay);return <div className={`real-preview ${compact?"compact":""}`} aria-hidden="true"><div className="preview-label"><span>DEAL 3-18</span><b>1,240 PTS</b></div><div className="solduku-scene"><div className="real-board solduku-real">{soldukuGivens.map((n,i)=><i key={i} className={n?"given":""}>{n||""}</i>)}</div><div className="freecell"><PlayingCard rank="3" suit="♣" className="club"/></div><div className="drawpile"><b>{cardsInDrawPile}</b></div><div className="real-hand"><PlayingCard rank="2" suit="♠" className="spade"/><PlayingCard rank="4" suit="♥" className="heart"/><PlayingCard rank="5" suit="♦" className="diamond"/><i className="joker"><span className="joker-index">JOKER</span><img src="joker-jester.png" alt=""/><span className="joker-ribbon">WILD</span><span className="joker-index joker-index-bottom">JOKER</span></i></div></div></div>}
  if(game.id==="classic") return <div className={`real-preview ${compact?"compact":""}`} aria-hidden="true"><div className="preview-label"><span>S4-128</span><b>★★★★☆☆</b></div><div className="real-board classic-real">{classicGivens.map((n,i)=><i key={i} className={n?"given":""}>{n||""}</i>)}</div><div className="preview-bottom"><span>Classic 9×9</span><span>Hints</span><span>Notes</span></div></div>;
  return <div className={`real-preview ${compact?"compact":""}`} aria-hidden="true"><div className="preview-label"><span>XJ5-27</span><b>X · Jigsaw</b></div><div className="real-board variant-real">{variantGivens.map((n,i)=><i key={i} className={`rg-${jigsawColour[jigsawRegions[i]]} ${edges(jigsawRegions,i)}${onDiagonal(i)?" diag":""}${n?" given":""}`}>{n||""}</i>)}</div><div className="preview-bottom"><span>X diagonals</span><span>Jigsaw</span><span>Unique</span></div></div>;
}

function MiniBoard({game}:{game:(typeof games)[number]}){return <GamePreview game={game} compact/>}
const beltRanks=[
  {rank:"5th Kyū",colour:"White belt",note:"Foundations"},
  {rank:"4th Kyū",colour:"Yellow belt",note:"Developing"},
  {rank:"3rd Kyū",colour:"Green belt",note:"Confident"},
  {rank:"2nd Kyū",colour:"Blue belt",note:"Advanced"},
  {rank:"1st Kyū",colour:"Brown belt",note:"Expert"},
  {rank:"1st Dan",colour:"Black belt",note:"Dan challenge"},
];
function LevelGuideLink(){return <a className="level-guide-link" href="#levels"><span><b>View level guide</b><small>White belt through to 1st Dan</small></span><em aria-hidden="true">↓</em></a>}

function AdPlaceholder({format,className=""}:{format:string;className?:string}){
  return <aside className={`ad-placeholder ${className}`} aria-label={`Advertisement placeholder, ${format}`}>
    <div className="ad-copy"><span>Advertisement</span><b>Your message here</b><small>{format} placeholder</small></div>
    <button aria-label="Example advertisement button">Learn more</button>
  </aside>;
}

export default function Home() {
  const [active,setActive]=useState("all");
  const visible=active==="all"?games:games.filter(game=>game.id===active);
  return <main>
    <header className="site-header" id="top">
      <a className="wordmark" href="#top" aria-label="DanDoku home"><span className="word-dan">Dan</span><span className="word-doku">Doku</span></a>
      <nav aria-label="Main navigation"><a href="#games">All games</a><a href="#levels">Level guide</a><a href="#about">About</a></nav>
      <a className="header-cta" href="#games">Choose a game</a>
    </header>

    <section className="hero">
      <div className="hero-copy">
        <p className="hero-label">Sudoku and other number games</p>
        <h1>Sudoku,<br/><span>however you like&nbsp;it.</span></h1>
        <p className="intro">Classic logic with new rules, cage-sum deduction, or a deck of number cards. Pick a game and start at your level—no account needed.</p>
        <div className="hero-actions"><a className="primary" href="#games">Browse the games <span>↓</span></a><span className="offline-note"><b>●</b> Plays offline</span></div>
      </div>
      <div className="game-stack" aria-label="Preview of the four games">
        {games.map((game,index)=><a key={game.id} className={`stack-card stack-${game.id}`} href="#games" onClick={()=>setActive(game.id)} aria-label={`Show ${game.title} in the collection`}><span>0{index+1}</span><b>{game.id==="variants"?"Variants":game.id==="killer"?"Killer":game.title.replace(" Sudoku","")}</b><GamePreview game={game}/></a>)}
      </div>
    </section>

    <section className="quick-strip" aria-label="Collection summary"><span><b>{games.length}</b> ways to play</span><span><b>{beltRanks.length}</b> ranks · White belt through to 1st Dan</span><span><b>✓</b> always a harder game</span></section>

    <div className="ad-wrap ad-leaderboard"><AdPlaceholder format="970 × 90"/></div>

    <section className="collection" id="games">
      <div className="section-heading"><div><p className="kicker">The collection</p><h2>Pick your puzzle</h2></div><p>Every game works offline, remembers your progress, and lets you play from white belt through to 1st Dan—with a harder game always waiting.</p></div>
      <div className="filters" aria-label="Filter games"><button className={active==="all"?"active":""} aria-pressed={active==="all"} onClick={()=>setActive("all")}>All games</button>{games.map(game=><button key={game.id} className={active===game.id?"active":""} aria-pressed={active===game.id} onClick={()=>setActive(game.id)}>{game.title}</button>)}</div>
      <div className="game-grid">{visible.map((game,index)=><article className={`game-card ${game.accent}`} id={`game-${game.id}`} key={game.id}><div className="card-number">0{index+1}</div><MiniBoard game={game}/><div className="card-copy"><p className="eyebrow">{game.eyebrow}</p><h3>{game.title}</h3><p>{game.description}</p><LevelGuideLink/><div className="card-foot"><span>{game.meta}</span><a className="play-now" href={game.url} aria-label={`Play ${game.title}`}>Play now <b>↗</b></a></div></div></article>)}</div>
      <div className="ad-wrap ad-native"><AdPlaceholder format="Responsive native banner"/></div>
    </section>

    <section className="levels" id="levels">
      <div className="levels-heading"><div><p className="kicker">The level system</p><h2>White belt through<br/>to 1st Dan.</h2></div><p>Every game has the same six-step difficulty ladder. The guide keeps the Kyū rank names so you can see exactly where each belt sits. Move up when you are ready—there is always a harder game.</p></div>
      <div className="level-grid">{beltRanks.map((belt,index)=><article className="level-rank" key={belt.rank}><i className={`level-colour belt-${index}`} aria-hidden="true"/><span>{belt.colour}</span><b>{belt.rank}</b><small>{belt.note}</small></article>)}</div>
      <a className="levels-play-link" href="#games">Choose a game <span>↑</span></a>
    </section>

    <section className="about" id="about"><div><p className="kicker">Built for real play</p><h2>Find your level.<br/>Earn your Dan.</h2></div><div className="about-list"><p><b>Rise through the ranks</b><span>Play from white belt through to 1st Dan, with a harder game always waiting.</span></p><p><b>Useful hints</b><span>See the solving technique and reasoning—not just the answer.</span></p><p><b>Progress saved</b><span>Every unfinished puzzle waits exactly where you left it.</span></p></div></section>
    <footer>
      <div className="footer-main"><a className="wordmark" href="#top" aria-label="DanDoku home"><span className="word-dan">Dan</span><span className="word-doku">Doku</span></a><p>Classic · Variants · Killer Sudoku · Solduku</p><span suppressHydrationWarning>© {new Date().getFullYear()}</span></div>
      <p className="privacy-note"><b>Clean by design.</b> DanDoku does not collect personal data, run analytics or use tracking cookies. Your game progress stays on your device. Any advert spaces shown are placeholders only.</p>
    </footer>
  </main>;
}
