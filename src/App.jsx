import {useEffect,useState} from 'react'
import {configured,supabase} from './lib/supabase'
import Auth,{clearSavedPlayerName,getSavedPlayerName} from './components/Auth'
import Nav from './components/Nav'
import Home from './components/Home'
import Leaderboard from './components/Leaderboard'
import Profile from './components/Profile'
import GameRoom from './components/GameRoom'

export default function App(){
 const [playerName,setPlayerName]=useState(()=>getSavedPlayerName())
 const [view,setView]=useState('home')
 const [room,setRoom]=useState(null)
 const [role,setRole]=useState(null)
 const [session,setSession]=useState(null)

 // Multiplayer backend can still use anonymous Supabase auth,
 // but the player name itself is completely local and independent.
 useEffect(()=>{
  if(!configured)return

  supabase.auth.getSession().then(async({data})=>{
   if(data.session){
    setSession(data.session)
    return
   }

   const {data:anon}=await supabase.auth.signInAnonymously()
   if(anon?.session)setSession(anon.session)
  })

  const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{
   setSession(next)
  })

  return()=>subscription.unsubscribe()
 },[])

 if(!playerName){
  return <Auth onComplete={setPlayerName}/>
 }

 if(room&&configured&&session){
  return <main className="app-shell">
   <GameRoom
    roomCode={room}
    myRole={role}
    userId={session.user.id}
    onLeave={()=>{
     setRoom(null)
     setRole(null)
     history.replaceState({},'',location.pathname)
    }}
   />
  </main>
 }

 return <main className="app-shell">
  <Nav
   view={view}
   setView={setView}
   playerName={playerName}
   onResetName={()=>{
    const ok=window.confirm('Change the saved player name on this browser?')
    if(ok){
     clearSavedPlayerName()
     setPlayerName('')
     setView('home')
    }
   }}
  />

  <div className="page">
   {view==='home'&&
    <Home
     playerName={playerName}
     onEnterRoom={(r,x)=>{
      setRoom(r)
      setRole(x)
     }}
    />
   }

   {view==='leaderboard'&&<Leaderboard/>}

   {view==='profile'&&
    <Profile
     playerName={playerName}
     onNameChange={setPlayerName}
     stats={null}
    />
   }
  </div>
 </main>
}
