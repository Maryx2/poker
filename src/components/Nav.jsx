export default function Nav({view,setView,profile,onLogout}){
 return <nav className="nav">
  <button className="brand" onClick={()=>setView('home')}>🎲 FIRST DICE</button>
  <div className="nav-links">
   <button className={view==='home'?'active':''} onClick={()=>setView('home')}>Play</button>
   <button className={view==='leaderboard'?'active':''} onClick={()=>setView('leaderboard')}>Leaderboard</button>
   <button className={view==='profile'?'active':''} onClick={()=>setView('profile')}>{profile?.avatar_emoji||'🎲'} Profile</button>
   <button onClick={onLogout}>Sign out</button>
  </div>
 </nav>
}
