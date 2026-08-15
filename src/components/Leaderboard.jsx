import {useEffect,useState} from 'react'
import {supabase} from '../lib/supabase'

export default function Leaderboard(){
 const [rows,setRows]=useState([])
 const [loading,setLoading]=useState(true)
 useEffect(()=>{(async()=>{
  const {data}=await supabase.from('public_leaderboard').select('*').order('wins',{ascending:false}).order('best_win_streak',{ascending:false}).limit(100)
  setRows(data||[]);setLoading(false)
 })()},[])
 return <section className="page-card">
  <div className="page-head"><div><div className="eyebrow">GLOBAL</div><h2>Public Leaderboard</h2></div><span>Top 100</span></div>
  {loading?<div className="empty">Loading…</div>:<div className="leaderboard">
   <div className="leader-row leader-head"><span>#</span><span>Player</span><span>Wins</span><span>Win %</span><span>Streak</span><span>Best Hand</span></div>
   {rows.map((r,i)=><div className="leader-row" key={r.id}>
    <strong>{i+1}</strong><span>{r.avatar_emoji} <b>{r.display_name}</b><small>@{r.username}</small></span>
    <strong>{r.wins}</strong><span>{r.win_rate}%</span><span>{r.best_win_streak}</span><span>{r.best_hand_name||'—'}</span>
   </div>)}
  </div>}
 </section>
}
