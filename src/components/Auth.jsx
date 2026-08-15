import {useState} from 'react'
import {supabase} from '../lib/supabase'

function normalizeUsername(value){
  return value.replace(/[^A-Za-z0-9_]/g,'').slice(0,20)
}

// Supabase password auth requires an email or phone identity.
// Users never see or enter this internal address.
function usernameToInternalEmail(username){
  return `${username.toLowerCase()}@users.firstdice.invalid`
}

export default function Auth(){
  const [mode,setMode]=useState('login')
  const [username,setUsername]=useState('')
  const [password,setPassword]=useState('')
  const [displayName,setDisplayName]=useState('')
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)

  async function submit(e){
    e.preventDefault()
    setBusy(true)
    setMessage('')

    const cleanUsername=normalizeUsername(username)

    if(cleanUsername.length<3){
      setMessage('Username must be at least 3 characters.')
      setBusy(false)
      return
    }

    const email=usernameToInternalEmail(cleanUsername)

    try{
      if(mode==='signup'){
        const {data,error}=await supabase.auth.signUp({
          email,
          password,
          options:{
            data:{
              username:cleanUsername,
              display_name:displayName.trim()||cleanUsername,
              first_dice_internal_email:true
            }
          }
        })

        if(error) throw error

        // If Confirm Email is disabled, Supabase returns a session immediately.
        if(!data.session){
          setMessage(
            'Account created, but Supabase is still requiring confirmation. ' +
            'Turn off Authentication → Providers → Email → Confirm Email.'
          )
        }
      }else{
        const {error}=await supabase.auth.signInWithPassword({
          email,
          password
        })

        if(error) throw error
      }
    }catch(err){
      const text=err?.message||'Authentication failed.'

      if(/email not confirmed/i.test(text)){
        setMessage(
          'This project still has email confirmation enabled in Supabase. ' +
          'Turn off Authentication → Providers → Email → Confirm Email.'
        )
      }else if(/invalid login credentials/i.test(text)){
        setMessage('Incorrect username or password.')
      }else if(/user already registered/i.test(text)){
        setMessage('That username is already taken.')
      }else{
        setMessage(text)
      }
    }finally{
      setBusy(false)
    }
  }

  function switchMode(next){
    setMode(next)
    setMessage('')
    setPassword('')
  }

  return <main className="auth-shell">
    <section className="auth-card">
      <div className="eyebrow">HIGH ROLLER HIGH NOTES</div>
      <h1>FIRST DICE</h1>
      <p>One roll. Five dice. Public records.</p>

      <div className="segmented">
        <button
          type="button"
          className={mode==='login'?'active':''}
          onClick={()=>switchMode('login')}
        >
          Sign in
        </button>

        <button
          type="button"
          className={mode==='signup'?'active':''}
          onClick={()=>switchMode('signup')}
        >
          Create account
        </button>
      </div>

      <form onSubmit={submit}>
        <input
          required
          minLength="3"
          maxLength="20"
          autoComplete="username"
          value={username}
          onChange={e=>setUsername(normalizeUsername(e.target.value))}
          placeholder="Username"
        />

        {mode==='signup'&&
          <input
            maxLength="24"
            value={displayName}
            onChange={e=>setDisplayName(e.target.value)}
            placeholder="Display name (optional)"
          />
        }

        <input
          required
          minLength="6"
          type="password"
          autoComplete={mode==='signup'?'new-password':'current-password'}
          value={password}
          onChange={e=>setPassword(e.target.value)}
          placeholder="Password"
        />

        <button className="primary full" disabled={busy}>
          {busy
            ? 'Working…'
            : mode==='login'
              ? 'Sign in'
              : 'Create account'}
        </button>
      </form>

      <div className="auth-note">
        No email required.
      </div>

      {message&&<div className="notice">{message}</div>}
    </section>
  </main>
}
