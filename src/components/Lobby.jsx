import {useState} from 'react'
import {randomRoomCode} from '../realtime'

export default function Lobby({onEnter,onlineEnabled,initialRoom=''}) {
  const [name,setName]=useState('')
  const [code,setCode]=useState(initialRoom)

  const enter=(role,roomOverride)=>{
    const room=(roomOverride||code).trim().toUpperCase()
    if(room.length!==6) return
    const fallbackName=role==='host'?'Dealer':role==='player'?'Player 2':'Spectator'
    onEnter({name:name.trim()||fallbackName,role,room})
  }

  return <section className="lobby card">
    <div className={`status-dot ${onlineEnabled?'is-online':'is-local'}`}>
      {onlineEnabled?'● Internet multiplayer ready':'● Setup required for internet multiplayer'}
    </div>
    <h2>Join the table</h2>
    <p className="lobby-help">
      {onlineEnabled
        ? 'Create a room, share the code or invite link, and play from different devices.'
        : 'Add your Supabase environment variables in Netlify to enable cross-device rooms.'}
    </p>

    <input
      value={name}
      onChange={e=>setName(e.target.value)}
      placeholder="Your display name"
      maxLength="24"
    />

    <div className="lobby-grid">
      <button className="primary" onClick={()=>enter('host',randomRoomCode())}>Create Room</button>
      <input
        value={code}
        onChange={e=>setCode(e.target.value.replace(/[^a-z0-9]/gi,'').slice(0,6))}
        placeholder="ROOM CODE"
        maxLength="6"
        autoCapitalize="characters"
      />
      <button disabled={code.length!==6} onClick={()=>enter('player')}>Join as Player 2</button>
      <button disabled={code.length!==6} onClick={()=>enter('spectator')}>Spectate</button>
    </div>
  </section>
}
