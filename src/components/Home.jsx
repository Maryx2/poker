import {useState} from 'react'
import {randomRoom} from '../lib/game'
import {supabase} from '../lib/supabase'

export default function Home({profile,onEnterRoom}){
 const [code,setCode]=useState('')
 const [target,setTarget]=useState(5)
 const [msg,setMsg]=useState('')

 async function create(){
  const room=randomRoom()
  const {error}=await supabase.rpc('create_room',{p_room_code:room,p_target_wins:Number(target)})
  if(error)return setMsg(error.message)
  onEnterRoom(room,'host')
 }
 async function join(role){
  const room=code.toUpperCase()
  const {error}=await supabase.rpc('join_room',{p_room_code:room,p_role:role})
  if(error)return setMsg(error.message)
  onEnterRoom(room,role)
 }
 return <div className="home-grid">
  <section className="hero-card">
   <div className="eyebrow">WELCOME BACK, {profile.display_name.toUpperCase()}</div>
   <h1>ONE ROLL.<br/>HIGHEST HAND.</h1>
   <p>Create a live room, invite Player 2, and let spectators watch the showdown.</p>
   <div className="create-row">
    <select value={target} onChange={e=>setTarget(e.target.value)}>
     <option value="2">First to 2</option><option value="3">First to 3</option><option value="5">First to 5</option><option value="7">First to 7</option><option value="10">First to 10</option>
    </select>
    <button className="primary" onClick={create}>Create Room</button>
   </div>
  </section>
  <section className="page-card">
   <h2>Join a room</h2>
   <input className="room-input" value={code} maxLength="6" onChange={e=>setCode(e.target.value.replace(/[^A-Za-z0-9]/g,'').toUpperCase())} placeholder="ABC123"/>
   <div className="button-row"><button disabled={code.length!==6} onClick={()=>join('player')}>Join as Player 2</button><button disabled={code.length!==6} onClick={()=>join('spectator')}>Spectate</button></div>
   {msg&&<div className="notice">{msg}</div>}
  </section>
  <section className="page-card quick-stats">
   <h2>Your career</h2>
   <div className="stat-grid"><div><b>{profile.wins}</b><span>Wins</span></div><div><b>{profile.matches_played}</b><span>Matches</span></div><div><b>{profile.best_win_streak}</b><span>Best streak</span></div><div><b>{profile.best_hand_name||'—'}</b><span>Best hand</span></div></div>
  </section>
 </div>
}
