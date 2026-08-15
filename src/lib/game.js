export const FACE=['','⚀','⚁','⚂','⚃','⚄','⚅']
export const REACTIONS=['🔥','🎲','😱','👑','👏','💀']
export const randomRoom=()=>{
 const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
 return Array.from({length:6},()=>a[Math.floor(Math.random()*a.length)]).join('')
}
