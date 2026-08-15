import {useEffect,useRef,useState} from 'react'
import {supabase} from '../lib/supabase'
import {FACE,REACTIONS} from '../lib/game'

const Dice=({values=[],rolling})=><div className="dice-row">{values.length?values.map((v,i)=><div key={i} className={`die ${rolling?'rolling':''}`}>{FACE[v]}</div>):Array.from({length:5},(_,i)=><div className="die empty" key={i}>?</div>)}</div>

export default function GameRoom({roomCode,myRole,userId,onLeave}){
 const [room,setRoom]=useState(null)
 const [state,setState]=useState(null)
 const [members,setMembers]=useState([])
 const [reactions,setReactions]=useState([])
 const [history,setHistory]=useState([])
 const [rolling,setRolling]=useState(false)
 const [countdown,setCountdown]=useState(null)
 const [soundOn,setSoundOn]=useState(()=>localStorage.getItem('firstdice_sound')!=='off')
 const [msg,setMsg]=useState('')
 const lastVersion=useRef(null)

 const roomId=room?.id
 const me=members.find(m=>m.user_id===userId)
 const host=members.find(m=>m.role==='host')
 const player=members.find(m=>m.role==='player')
 const spectators=members.filter(m=>m.role==='spectator')
 const bothReady=host?.ready&&player?.ready

 async function load(){
  const {data:r,error}=await supabase.from('game_rooms').select('*').eq('room_code',roomCode).single()
  if(error){setMsg(error.message);return}
  setRoom(r)
  const [{data:s},{data:m},{data:h},{data:rx}]=await Promise.all([
   supabase.from('game_state').select('*').eq('room_id',r.id).single(),
   supabase.from('room_members').select('*,profile:profiles(id,username,display_name,avatar_emoji)').eq('room_id',r.id).order('joined_at'),
   supabase.from('match_history').select('*').eq('room_id',r.id).order('created_at',{ascending:false}).limit(12),
   supabase.from('reactions').select('*,profile:profiles(display_name,avatar_emoji)').eq('room_id',r.id).order('created_at',{ascending:false}).limit(20)
  ])
  setState(s);setMembers(m||[]);setHistory(h||[]);setReactions(rx||[])
 }

 useEffect(()=>{load()},[roomCode])

 useEffect(()=>{
  if(!roomId)return
  const c=supabase.channel(`first-dice-room-${roomId}`)
   .on('postgres_changes',{event:'*',schema:'public',table:'game_state',filter:`room_id=eq.${roomId}`},()=>load())
   .on('postgres_changes',{event:'*',schema:'public',table:'room_members',filter:`room_id=eq.${roomId}`},()=>load())
   .on('postgres_changes',{event:'*',schema:'public',table:'game_rooms',filter:`id=eq.${roomId}`},()=>load())
   .on('postgres_changes',{event:'INSERT',schema:'public',table:'reactions',filter:`room_id=eq.${roomId}`},()=>load())
   .on('postgres_changes',{event:'INSERT',schema:'public',table:'match_history',filter:`room_id=eq.${roomId}`},()=>load())
   .subscribe()
  const heartbeat=setInterval(()=>supabase.rpc('heartbeat',{p_room_code:roomCode}),20000)
  return()=>{clearInterval(heartbeat);supabase.removeChannel(c)}
 },[roomId,roomCode])


 function tone(freq=440,duration=.08,volume=.06){
  if(!soundOn)return
  try{
   const Ctx=window.AudioContext||window.webkitAudioContext
   const ctx=new Ctx(),osc=ctx.createOscillator(),gain=ctx.createGain()
   osc.frequency.value=freq;gain.gain.value=volume
   osc.connect(gain);gain.connect(ctx.destination);osc.start()
   gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration)
   osc.stop(ctx.currentTime+duration)
  }catch{}
 }

 useEffect(()=>{
  if(!state)return
  if(state.phase==='rolling'&&state.roll_started_at){
   setRolling(true)
   const start=new Date(state.roll_started_at).getTime()
   const tick=()=>{
    const elapsed=(Date.now()-start)/1000
    const left=Math.max(0,3-Math.floor(elapsed))
    setCountdown(left>0?left:null)
   }
   tick()
   const timer=setInterval(tick,150)
   tone(240,.07,.04)
   return()=>clearInterval(timer)
  }
  setRolling(false);setCountdown(null)
  if(lastVersion.current!==null&&state.version!==lastVersion.current&&state.phase==='result'){
   tone((state.dealer_hand_rank>=7||state.player_hand_rank>=7)?880:620,.18,.07)
  }
  lastVersion.current=state.version
 },[state?.version,state?.phase,state?.roll_started_at])

 function toggleSound(){
  const next=!soundOn
  setSoundOn(next)
  localStorage.setItem('firstdice_sound',next?'on':'off')
  if(next)setTimeout(()=>tone(500,.06,.04),0)
 }

 async function ready(){
  const {error}=await supabase.rpc('set_ready',{p_room_code:roomCode,p_ready:!me?.ready})
  if(error)setMsg(error.message)
 }
 async function roll(){
  setMsg('')
  const {error}=await supabase.rpc('announce_roll',{p_room_code:roomCode})
  if(error){setMsg(error.message);return}
  tone(260,.08,.05)
  setTimeout(async()=>{
   const {error:rollError}=await supabase.rpc('roll_round',{p_room_code:roomCode})
   if(rollError)setMsg(rollError.message)
  },3100)
 }
 async function rematch(){
  const {error}=await supabase.rpc('rematch',{p_room_code:roomCode})
  if(error)setMsg(error.message)
 }
 async function react(reaction){
  await supabase.rpc('send_reaction',{p_room_code:roomCode,p_reaction:reaction})
 }
 async function lock(){
  await supabase.rpc('host_set_locked',{p_room_code:roomCode,p_locked:!room.is_locked})
 }
 async function kick(id){
  await supabase.rpc('host_remove_member',{p_room_code:roomCode,p_user_id:id})
 }
 function copy(role){
  const u=`${location.origin}${location.pathname}?room=${roomCode}&role=${role}`
  navigator.clipboard?.writeText(u);setMsg(`${role} invite copied.`)
 }

 if(!room||!state)return <div className="empty">Loading room…</div>

 const audience=myRole==='spectator'
 return <div className={audience?'audience-layout':''}>
  <section className="room-toolbar">
   <button onClick={onLeave}>← Leave</button>
   <div><small>ROOM</small><b>{roomCode}</b></div>
   <div><small>FORMAT</small><b>First to {room.target_wins}</b></div>
   <div><small>VIEWERS</small><b>{spectators.length}</b></div>
   {myRole==='host'&&<><button onClick={()=>copy('player')}>Copy Player Link</button><button onClick={()=>copy('spectator')}>Copy Audience Link</button></>}
   <button onClick={toggleSound}>{soundOn?'🔊 Sound':'🔇 Sound'}</button>
  </section>

  <section className="match-score">
   <div><span>{host?.profile?.avatar_emoji} {host?.profile?.display_name||'Dealer'}</span><strong>{state.dealer_wins}</strong></div>
   <div className="round-center"><small>ROUND</small><strong>{state.round_number}</strong><span>{room.status.toUpperCase()}</span></div>
   <div><strong>{state.player_wins}</strong><span>{player?.profile?.display_name||'Waiting for Player 2'} {player?.profile?.avatar_emoji}</span></div>
  </section>

  <section className="broadcast-table">
   {countdown&&<div className="countdown-overlay"><small>FIRST DICE</small><strong>{countdown}</strong><span>ROLLING</span></div>}
   <div className={`hand ${state.winner==='dealer'?'winner':''} ${(state.dealer_hand_rank||0)>=7?'rare':''}`}>
    <div className="hand-title"><h2>DEALER</h2><b>{state.dealer_hand_name||'Waiting…'}</b></div>
    <Dice values={state.dealer_dice} rolling={rolling}/>
   </div>
   <div className="vs">VS</div>
   <div className={`hand ${state.winner==='player'?'winner':''} ${(state.player_hand_rank||0)>=7?'rare':''}`}>
    <div className="hand-title"><h2>PLAYER 2</h2><b>{state.player_hand_name||'Waiting…'}</b></div>
    <Dice values={state.player_dice} rolling={rolling}/>
   </div>
   <div className={`showdown-message ${state.winner||''}`}>{state.message}</div>

   {!audience&&<div className="game-actions">
    {(myRole==='host'||myRole==='player')&&<button className={me?.ready?'ready active':'ready'} onClick={ready}>{me?.ready?'✓ READY':'READY UP'}</button>}
    {myRole==='host'&&room.status!=='finished'&&<button className="primary giant" disabled={!bothReady||rolling} onClick={roll}>{rolling?'ROLLING…':'🎲 ROLL ROUND'}</button>}
    {myRole==='host'&&room.status==='finished'&&<button className="primary giant" onClick={rematch}>REMATCH</button>}
   </div>}
   {msg&&<div className="notice">{msg}</div>}
  </section>

  <section className="reaction-bar">{REACTIONS.map(r=><button key={r} onClick={()=>react(r)}>{r}</button>)}</section>

  <div className="room-lower">
   {!audience&&<section className="page-card">
    <div className="page-head"><h3>At the table</h3><span>{members.length} connected</span></div>
    <div className="member-list">{members.map(m=><div className="member" key={m.id}>
     <span>{m.profile?.avatar_emoji} <b>{m.profile?.display_name}</b><small>{m.role}</small></span>
     <span>{m.role!=='spectator'?(m.ready?'READY':'NOT READY'):'WATCHING'}</span>
     {myRole==='host'&&m.role!=='host'&&<button className="tiny" onClick={()=>kick(m.user_id)}>Remove</button>}
    </div>)}</div>
    {myRole==='host'&&<button onClick={lock}>{room.is_locked?'Unlock Player Seat':'Lock Player Seat'}</button>}
   </section>}

   <section className="page-card">
    <h3>Live reactions</h3>
    <div className="reaction-feed">{reactions.slice(0,10).map(r=><div key={r.id}><span>{r.reaction}</span> {r.profile?.display_name}</div>)}</div>
   </section>

   <section className="page-card">
    <h3>Round history</h3>
    <div className="history-list">{history.length?history.map(h=><div key={h.id}><b>R{h.round_number}</b><span>{h.dealer_hand_name} vs {h.player_hand_name}</span><strong>{h.winner}</strong></div>):<div className="empty">No rolls yet.</div>}</div>
   </section>
  </div>
 </div>
}
