import {useState} from 'react'
import {supabase} from '../lib/supabase'

export default function Auth(){
 const [mode,setMode]=useState('login')
 const [email,setEmail]=useState('')
 const [password,setPassword]=useState('')
 const [username,setUsername]=useState('')
 const [displayName,setDisplayName]=useState('')
 const [message,setMessage]=useState('')
 const [busy,setBusy]=useState(false)

 async function submit(e){
  e.preventDefault();setBusy(true);setMessage('')
  try{
   if(mode==='signup'){
    const {error}=await supabase.auth.signUp({
      email,password,
      options:{data:{username,display_name:displayName||username}}
    })
    if(error)throw error
    setMessage('Account created. Check your email if confirmation is enabled, then sign in.')
    setMode('login')
   }else{
    const {error}=await supabase.auth.signInWithPassword({email,password})
    if(error)throw error
   }
  }catch(err){setMessage(err.message)}finally{setBusy(false)}
 }

 return <main className="auth-shell">
  <section className="auth-card">
   <div className="eyebrow">HIGH ROLLER HIGH NOTES</div>
   <h1>FIRST DICE</h1>
   <p>One roll. Five dice. Public records.</p>
   <div className="segmented">
    <button className={mode==='login'?'active':''} onClick={()=>setMode('login')}>Sign in</button>
    <button className={mode==='signup'?'active':''} onClick={()=>setMode('signup')}>Create account</button>
   </div>
   <form onSubmit={submit}>
    {mode==='signup'&&<>
     <input required minLength="3" maxLength="20" value={username} onChange={e=>setUsername(e.target.value.replace(/[^A-Za-z0-9_]/g,''))} placeholder="Username"/>
     <input maxLength="24" value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Display name"/>
    </>}
    <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email"/>
    <input required minLength="6" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password"/>
    <button className="primary full" disabled={busy}>{busy?'Working…':mode==='login'?'Sign in':'Create account'}</button>
   </form>
   {message&&<div className="notice">{message}</div>}
  </section>
 </main>
}
