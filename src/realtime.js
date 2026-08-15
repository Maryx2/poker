import { createClient } from '@supabase/supabase-js'

const url=import.meta.env.VITE_SUPABASE_URL
const key=import.meta.env.VITE_SUPABASE_ANON_KEY

export const onlineEnabled=Boolean(url&&key)
export const supabase=onlineEnabled?createClient(url,key):null

export function randomRoomCode(){
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({length:6},()=>alphabet[Math.floor(Math.random()*alphabet.length)]).join('')
}

export function createLocalRoom(room,onGame,onPresence,onConnection=()=>{}){
  const channel=new BroadcastChannel(`first-dice-${room}`)
  const id=crypto.randomUUID()
  const people=new Map()
  let requestHandler=null

  channel.onmessage=e=>{
    const m=e.data||{}
    if(m.type==='game') onGame(m.game)
    if(m.type==='presence'){
      people.set(m.id,m.user)
      onPresence([...people.values()])
    }
    if(m.type==='leave'){
      people.delete(m.id)
      onPresence([...people.values()])
    }
    if(m.type==='request-game') requestHandler?.()
  }

  return {
    async join(user){
      people.set(id,user)
      onPresence([...people.values()])
      onConnection('local')
      channel.postMessage({type:'presence',id,user})
    },
    sendGame(game){ channel.postMessage({type:'game',game}) },
    requestGame(){ channel.postMessage({type:'request-game'}) },
    subscribeRequests(handler){ requestHandler=handler },
    async leave(){
      channel.postMessage({type:'leave',id})
      channel.close()
    }
  }
}

export function createSupabaseRoom(room,onGame,onPresence,onConnection=()=>{}){
  const presenceKey=crypto.randomUUID()
  const channel=supabase.channel(`room:${room}`,{
    config:{
      broadcast:{self:false},
      presence:{key:presenceKey}
    }
  })

  let currentUser=null
  let requestHandler=null

  channel.on('broadcast',{event:'game'},payload=>onGame(payload.payload.game))
  channel.on('broadcast',{event:'request-game'},()=>requestHandler?.())

  channel.on('presence',{event:'sync'},()=>{
    const presence=channel.presenceState()
    const people=Object.values(presence).flat().map(x=>x.user).filter(Boolean)
    onPresence(people)
  })

  return {
    async join(user){
      currentUser=user
      onConnection('connecting')
      await channel.subscribe(async status=>{
        if(status==='SUBSCRIBED'){
          onConnection('connected')
          await channel.track({user})
        } else if(status==='CHANNEL_ERROR' || status==='TIMED_OUT'){
          onConnection('connection error')
        } else if(status==='CLOSED'){
          onConnection('disconnected')
        }
      })
    },
    async sendGame(game){
      await channel.send({type:'broadcast',event:'game',payload:{game}})
    },
    async requestGame(){
      await channel.send({type:'broadcast',event:'request-game',payload:{}})
    },
    subscribeRequests(handler){ requestHandler=handler },
    async leave(){
      if(currentUser) await channel.untrack()
      await supabase.removeChannel(channel)
    }
  }
}
