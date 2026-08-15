import {useState} from 'react'

const STORAGE_KEY='firstdice_player_name'

function cleanName(value){
  return value.replace(/[^\p{L}\p{N}_ .'-]/gu,'').slice(0,24)
}

export function getSavedPlayerName(){
  try{
    return localStorage.getItem(STORAGE_KEY)||''
  }catch{
    return ''
  }
}

export function savePlayerName(name){
  try{
    localStorage.setItem(STORAGE_KEY,name)
  }catch{}
}

export function clearSavedPlayerName(){
  try{
    localStorage.removeItem(STORAGE_KEY)
  }catch{}
}

export default function Auth({onComplete}){
  const [name,setName]=useState('')
  const [message,setMessage]=useState('')

  function submit(e){
    e.preventDefault()
    const cleaned=cleanName(name).trim()

    if(cleaned.length<2){
      setMessage('Enter a name with at least 2 characters.')
      return
    }

    savePlayerName(cleaned)
    onComplete(cleaned)
  }

  return <main className="auth-shell">
    <section className="auth-card first-visit-card">
      <div className="eyebrow">WELCOME TO</div>
      <h1>FIRST DICE</h1>
      <p>Choose the name people will see at the table.</p>

      <form onSubmit={submit}>
        <input
          autoFocus
          required
          minLength="2"
          maxLength="24"
          autoComplete="nickname"
          value={name}
          onChange={e=>setName(cleanName(e.target.value))}
          placeholder="Your player name"
        />

        <button className="primary full">
          ENTER THE TABLE
        </button>
      </form>

      <div className="auth-note">
        Your name is saved on this browser. No account or email required.
      </div>

      {message&&<div className="notice">{message}</div>}
    </section>
  </main>
}
