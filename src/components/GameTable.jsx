import {FACE,evaluate} from '../game'

const Dice=({values})=><div className="dice-row">
  {values.length
    ? values.map((v,i)=><div className="die" key={i}>{FACE[v]}</div>)
    : Array.from({length:5},(_,i)=><div className="die empty" key={i}>?</div>)}
</div>

export default function GameTable({game,role,onRoll,onReset,people,room}){
  const d=evaluate(game.dealerDice),p=evaluate(game.playerDice)
  const invite=`${location.origin}${location.pathname}?room=${encodeURIComponent(room)}`

  const copyInvite=async()=>{
    try{
      await navigator.clipboard.writeText(invite)
      alert('Invite link copied.')
    }catch{
      prompt('Copy this invite link:',invite)
    }
  }

  return <div>
    <section className="roombar card">
      <span>Room <b>{room}</b></span>
      <span>{people.length} connected</span>
      <button onClick={copyInvite}>Copy invite link</button>
    </section>

    <section className="score">
      <div><span>Dealer</span><b>{game.dealerWins}</b></div>
      <div><span>Round</span><b>{game.round}</b></div>
      <div><span>Player 2</span><b>{game.playerWins}</b></div>
    </section>

    <section className="table card">
      <div className={`hand ${game.winner==='dealer'?'winner':''}`}>
        <div className="handtop"><h2>Dealer</h2><b>{d.name}</b></div>
        <Dice values={game.dealerDice}/>
      </div>

      <div className="vs">VS</div>

      <div className={`hand ${game.winner==='player'?'winner':''}`}>
        <div className="handtop"><h2>Player 2</h2><b>{p.name}</b></div>
        <Dice values={game.playerDice}/>
      </div>

      <div className="message">{game.message}</div>

      {role==='host'&&<div className="actions">
        <button className="primary" onClick={onRoll}>🎲 Roll Round</button>
        <button onClick={onReset}>Reset Match</button>
      </div>}
    </section>

    <section className="card people">
      <b>At the table</b>
      <div>
        {people.length
          ? people.map((x,i)=><span className="person" key={`${x.name}-${i}`}>{x.name} · {x.role}</span>)
          : <span className="person">Waiting for others…</span>}
      </div>
    </section>
  </div>
}
