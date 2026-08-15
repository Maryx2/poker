import {useEffect,useState} from 'react'
import {configured,supabase} from './lib/supabase'
import Auth from './components/Auth'
import Nav from './components/Nav'
import Home from './components/Home'
import Leaderboard from './components/Leaderboard'
import Profile from './components/Profile'
import GameRoom from './components/GameRoom'

export default function App(){
 const [session,setSession]=useState(null)
 const [profile,setProfile]=useState(null)
 const [view,setView]=useState('home')
 const [room,setRoom]=useState(null)
 const [role,setRole]=useState(null)

 const params=new URLSearchParams(location.search)
 const inviteRoom=(params.get('room')||'').toUpperCase()
 const inviteRole=params.get('role')||null

 useEffect(()=>{
  if(!configured)return
  supabase.auth.getSession().then(({data})=>setSession(data.session))
  const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s))
  return()=>subscription.unsubscribe()
 },[])

 useEffect(()=>{
  if(!session){setProfile(null);return}
  supabase.from('profiles').select('*').eq('id',session.user.id).single().then(({data})=>setProfile(data))
 },[session])

 useEffect(()=>{
  if(!session||!profile||!inviteRoom||!inviteRole||room)return
  if(!['player','spectator'].includes(inviteRole))return
  supabase.rpc('join_room',{p_room_code:inviteRoom,p_role:inviteRole}).then(({error})=>{
    if(!error){setRoom(inviteRoom);setRole(inviteRole)}
  })
 },[session,profile])

 if(!configured)return <main className="config-error"><h1>First Dice</h1><p>Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to your environment. Use an sb_publishable_... key, never sb_secret_....</p></main>
 if(!session)return <Auth/>
 if(!profile)return <div className="empty">Loading profile…</div>

 if(room)return <main className="app-shell"><GameRoom roomCode={room} myRole={role} userId={session.user.id} onLeave={()=>{setRoom(null);setRole(null);history.replaceState({},'',location.pathname)}}/></main>

 return <main className="app-shell">
  <Nav view={view} setView={setView} profile={profile} onLogout={()=>supabase.auth.signOut()}/>
  <div className="page">
   {view==='home'&&<Home profile={profile} onEnterRoom={(r,x)=>{setRoom(r);setRole(x)}}/>}
   {view==='leaderboard'&&<Leaderboard/>}
   {view==='profile'&&<Profile profile={profile} onUpdated={setProfile}/>}
  </div>
 </main>
}
