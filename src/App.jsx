import {useEffect,useRef,useState} from 'react'
import Lobby from './components/Lobby'
import GameTable from './components/GameTable'
import {newGame,playRound} from './game'
import {createLocalRoom,createSupabaseRoom,onlineEnabled} from './realtime'

export default function App(){
  const params=new URLSearchParams(location.search)
  const initialRoom=(params.get('room')||'').toUpperCase().slice(0,6)

  const [session,setSession]=useState(null)
  const [game,setGame]=useState(newGame())
  const [people,setPeople]=useState([])
  const [connection,setConnection]=useState(onlineEnabled?'ready':'local')
  const roomRef=useRef(null)
  const gameRef=useRef(game)

  useEffect(()=>{ gameRef.current=game },[game])

  useEffect(()=>{
    if(!session) return

    const adapter=onlineEnabled?createSupabaseRoom:createLocalRoom

    const room=adapter(
      session.room,
      incoming=>{
        if(incoming?.__request){
          if(session.role==='host') room.sendGame(gameRef.current)
          return
        }
        if(incoming && Number(incoming.version)>=Number(gameRef.current.version)){
          setGame(incoming)
        }
      },
      setPeople,
      setConnection
    )

    roomRef.current=room
    room.join({name:session.name,role:session.role})

    if(session.role!=='host') room.requestGame()
    if(session.role==='host'&&room.subscribeRequests){
      room.subscribeRequests(()=>room.sendGame(gameRef.current))
    }

    return()=>{
      room.leave()
      roomRef.current=null
      setPeople([])
    }
  },[session])

  const publish=next=>{
    gameRef.current=next
    setGame(next)
    roomRef.current?.sendGame(next)
  }

  const roll=()=>publish(playRound(gameRef.current))
  const reset=()=>publish({...newGame(),version:Number(gameRef.current.version)+1})

  if(!session){
    return <main className="shell">
      <header>
        <div className="eyebrow">ONLINE TABLE GAME</div>
        <h1>FIRST DICE</h1>
        <p>One roll. Five dice each. Highest hand wins.</p>
      </header>
      <Lobby onEnter={setSession} onlineEnabled={onlineEnabled} initialRoom={initialRoom}/>
    </main>
  }

  return <main className="shell">
    <header>
      <div className="eyebrow">{session.role.toUpperCase()} VIEW</div>
      <h1>FIRST DICE</h1>
      <p>{onlineEnabled?'Live internet room':'Local test room'} · {session.room} · {connection}</p>
    </header>
    <GameTable
      game={game}
      role={session.role}
      onRoll={roll}
      onReset={reset}
      people={people}
      room={session.room}
    />
  </main>
}
