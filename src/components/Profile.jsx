import {useState} from 'react'
import {supabase} from '../lib/supabase'

export default function Profile({profile,onUpdated}){
 const [username,setUsername]=useState(profile.username)
 const [display,setDisplay]=useState(profile.display_name)
 const [avatar,setAvatar]=useState(profile.avatar_emoji)
 const [bio,setBio]=useState(profile.bio||'')
 const [msg,setMsg]=useState('')

 async function save(){
  const {data,error}=await supabase.rpc('update_my_profile',{p_username:username,p_display_name:display,p_avatar_emoji:avatar,p_bio:bio})
  if(error)return setMsg(error.message)
  setMsg('Profile saved.');onUpdated(data)
 }
 const rate=profile.matches_played?Math.round(profile.wins/profile.matches_played*100):0
 return <div className="profile-grid">
  <section className="page-card profile-card">
   <div className="avatar">{profile.avatar_emoji}</div>
   <h2>{profile.display_name}</h2><div className="muted">@{profile.username}</div>
   <p>{profile.bio||'No bio yet.'}</p>
   <div className="stat-grid">
    <div><b>{profile.wins}</b><span>Wins</span></div><div><b>{profile.losses}</b><span>Losses</span></div>
    <div><b>{rate}%</b><span>Win rate</span></div><div><b>{profile.best_win_streak}</b><span>Best streak</span></div>
    <div><b>{profile.rounds_won}</b><span>Rounds won</span></div><div><b>{profile.best_hand_name||'—'}</b><span>Best hand</span></div>
   </div>
  </section>
  <section className="page-card">
   <h2>Edit profile</h2>
   <label>Username<input value={username} onChange={e=>setUsername(e.target.value.replace(/[^A-Za-z0-9_]/g,''))}/></label>
   <label>Display name<input value={display} onChange={e=>setDisplay(e.target.value)}/></label>
   <label>Avatar emoji<input value={avatar} onChange={e=>setAvatar(e.target.value)} maxLength="8"/></label>
   <label>Bio<textarea value={bio} onChange={e=>setBio(e.target.value)} maxLength="160"/></label>
   <button className="primary" onClick={save}>Save profile</button>
   {msg&&<div className="notice">{msg}</div>}
  </section>
 </div>
}
