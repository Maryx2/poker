import {useEffect,useState} from 'react'

const AVATAR_KEY='firstdice_avatar'
const BIO_KEY='firstdice_bio'
const NAME_KEY='firstdice_player_name'

export default function Profile({playerName,onNameChange,stats}){
 const [display,setDisplay]=useState(playerName)
 const [avatar,setAvatar]=useState(()=>localStorage.getItem(AVATAR_KEY)||'🎲')
 const [bio,setBio]=useState(()=>localStorage.getItem(BIO_KEY)||'')
 const [msg,setMsg]=useState('')

 useEffect(()=>setDisplay(playerName),[playerName])

 function save(){
  const name=display.trim().slice(0,24)
  if(name.length<2){
    setMsg('Name must be at least 2 characters.')
    return
  }

  localStorage.setItem(NAME_KEY,name)
  localStorage.setItem(AVATAR_KEY,avatar.slice(0,8))
  localStorage.setItem(BIO_KEY,bio.slice(0,160))
  onNameChange(name)
  setMsg('Profile saved on this browser.')
 }

 const safeStats=stats||{
  wins:0,losses:0,matches_played:0,best_win_streak:0,rounds_won:0,best_hand_name:'—'
 }

 const rate=safeStats.matches_played
   ? Math.round((safeStats.wins/safeStats.matches_played)*100)
   : 0

 return <div className="profile-grid">
  <section className="page-card profile-card">
   <div className="avatar">{avatar}</div>
   <h2>{playerName}</h2>
   <div className="muted">Saved locally on this browser</div>
   <p>{bio||'No bio yet.'}</p>

   <div className="stat-grid">
    <div><b>{safeStats.wins||0}</b><span>Wins</span></div>
    <div><b>{safeStats.losses||0}</b><span>Losses</span></div>
    <div><b>{rate}%</b><span>Win rate</span></div>
    <div><b>{safeStats.best_win_streak||0}</b><span>Best streak</span></div>
    <div><b>{safeStats.rounds_won||0}</b><span>Rounds won</span></div>
    <div><b>{safeStats.best_hand_name||'—'}</b><span>Best hand</span></div>
   </div>
  </section>

  <section className="page-card">
   <h2>Edit local profile</h2>

   <label>
    Player name
    <input
      value={display}
      onChange={e=>setDisplay(e.target.value)}
      maxLength="24"
    />
   </label>

   <label>
    Avatar emoji
    <input
      value={avatar}
      onChange={e=>setAvatar(e.target.value)}
      maxLength="8"
    />
   </label>

   <label>
    Bio
    <textarea
      value={bio}
      onChange={e=>setBio(e.target.value)}
      maxLength="160"
    />
   </label>

   <button className="primary" onClick={save}>Save profile</button>
   {msg&&<div className="notice">{msg}</div>}
  </section>
 </div>
}
