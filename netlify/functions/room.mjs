import { getStore } from '@netlify/blobs'

const rooms = () => getStore({ name: 'royal-poker-rooms', consistency: 'strong' })
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
const money = n => '$' + Math.max(0, Math.round(Number(n) || 0)).toLocaleString()

const defaultState = {
  dealerName:'Dealer',playerName:'Player 2',dealer:1240,player:1000,pot:0,minBet:5,betStep:5,
  smallBlind:5,bigBlind:10,bet:10,toCall:0,dealerHole:[],playerHole:[],board:[],deck:[],queue:[],
  street:'waiting',active:false,message:'Table ready. Host: start a new hand.',showHost:false,lockPlayer:false,
  turn:'host',dealerButton:'host',theme:'classic',sound:true,history:[],lastAction:null,handNo:0,
  playerConnected:false,pendingPlayer:null,joinStatus:'not_joined'
}

function json(data, status=200) {
  return Response.json(data, { status, headers: { 'cache-control': 'no-store' } })
}
function roomCode() {
  let out=''; for(let i=0;i<6;i++) out += ALPHABET[Math.floor(Math.random()*ALPHABET.length)]; return out
}
function cleanRoom(v='') { return String(v).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8) }
function clone(v) { return structuredClone(v) }
function addHistory(state, text) {
  state.history = [{ text, time: now() }, ...(state.history || [])].slice(0,80)
}
function sanitize(state, role) {
  const s = clone(state)
  if (role !== 'host') {
    s.deck = []
    s.queue = []
    s.lastAction = null
    if (!s.showHost) s.dealerHole = []
    if (!s.playerConnected) s.playerHole = []
  }
  return s
}
async function loadRoom(code) {
  return await rooms().get(code, { type:'json', consistency:'strong' })
}
async function saveRoom(code, room) {
  room.updatedAt = Date.now()
  await rooms().setJSON(code, room)
}
async function createUniqueRoom() {
  for (let i=0;i<8;i++) {
    const code=roomCode()
    const exists=await loadRoom(code)
    if (!exists) return code
  }
  throw new Error('Could not allocate room code')
}
function auth(room, token, role) {
  if (role === 'host') return Boolean(token && token === room.hostToken)
  if (role === 'player') return Boolean(token && token === room.playerToken)
  return false
}
function playerAction(state, type, value) {
  const s = clone(state)
  if (!s.playerConnected) throw new Error('You have not been accepted into this room yet')
  if (!s.active) throw new Error('No active hand')
  if (s.lockPlayer) throw new Error('Player controls are locked by HOST')
  if (s.turn !== 'player') throw new Error('It is not Player 2’s turn')
  s.lastAction = null
  if (type === 'fold') {
    s.dealer += s.pot; s.pot=0; s.active=false; s.street='finished'; s.turn='host'
    s.message=`${s.playerName} folds. ${s.dealerName} wins the pot.`
    addHistory(s, `${s.playerName} folded.`)
    return s
  }
  if (type === 'check') {
    if (s.toCall !== 0) throw new Error('You cannot check while facing a call')
    s.turn='host'; s.message=`${s.playerName} checks. Host may deal the next street.`
    addHistory(s, `${s.playerName} checked.`)
    return s
  }
  if (type === 'call') {
    if (!(s.toCall > 0)) throw new Error('There is nothing to call')
    const pay=Math.min(s.toCall,s.player)
    s.player-=pay; s.pot+=pay; s.toCall=0; s.turn='host'
    s.message=`${s.playerName} calls ${money(pay)}. Host may continue.`
    addHistory(s, `${s.playerName} called ${money(pay)}.`)
    return s
  }
  if (type === 'raise') {
    const amt=Math.max(s.minBet,Math.min(Number(value)||s.bet,s.player))
    if (!(amt > 0)) throw new Error('Invalid bet amount')
    s.player-=amt; s.pot+=amt; s.toCall=0; s.turn='host'
    s.message=`${s.playerName} bets ${money(amt)}. Host controls the response manually.`
    addHistory(s, `${s.playerName} bet ${money(amt)}.`)
    return s
  }
  throw new Error('Unknown player action')
}

export default async (req) => {
  try {
    if (req.method === 'GET') {
      const url=new URL(req.url)
      const code=cleanRoom(url.searchParams.get('room'))
      const token=url.searchParams.get('token')||''
      const role=url.searchParams.get('role')==='host'?'host':'player'
      const room=await loadRoom(code)
      if (!room) return json({error:'Room not found'},404)
      if (!auth(room,token,role)) return json({error:'This device is not authorized for that room'},403)
      return json({room:code,state:sanitize(room.state,role),updatedAt:room.updatedAt})
    }
    if (req.method !== 'POST') return json({error:'Method not allowed'},405)
    const body=await req.json()
    const op=body.op
    if (op === 'create') {
      const code=await createUniqueRoom()
      const hostToken=crypto.randomUUID()+crypto.randomUUID()
      const room={hostToken,playerToken:null,state:clone(defaultState),createdAt:Date.now(),updatedAt:Date.now()}
      await saveRoom(code,room)
      return json({room:code,hostToken,state:room.state})
    }
    const code=cleanRoom(body.room)
    if (!code) return json({error:'Room code required'},400)
    const room=await loadRoom(code)
    if (!room) return json({error:'Room not found'},404)

    if (op === 'knock') {
      const name=String(body.name||'Player 2').trim().slice(0,28)||'Player 2'
      const playerToken=crypto.randomUUID()+crypto.randomUUID()
      room.playerToken=playerToken
      room.state.pendingPlayer={name,at:now()}
      room.state.playerConnected=false
      room.state.joinStatus='pending'
      addHistory(room.state, `${name} is knocking to join the table.`)
      await saveRoom(code,room)
      return json({playerToken,state:sanitize(room.state,'player')})
    }

    if (op === 'kickPlayer') {
      if (!auth(room,body.token,'host')) return json({error:'HOST authorization failed'},403)
      const oldName=room.state.playerName || 'Player 2'
      // Fully revoke the admitted device and clear every visible seat/presence field.
      room.playerToken=null
      room.state.playerConnected=false
      room.state.pendingPlayer=null
      room.state.joinStatus='not_joined'
      room.state.playerName='Player 2'
      room.state.playerHole=[]
      room.state.turn='host'
      room.state.toCall=0
      if (room.state.active) {
        room.state.active=false
        room.state.street='finished'
        room.state.message=`${oldName} was removed. The player seat is now empty.`
      } else {
        room.state.message='Player seat is empty. Waiting for someone to knock.'
      }
      addHistory(room.state, `${oldName} was removed from the table.`)
      await saveRoom(code,room)
      return json({state:room.state})
    }

    if (op === 'hostState') {
      if (!auth(room,body.token,'host')) return json({error:'HOST authorization failed'},403)
      const incoming={...defaultState,...body.state}
      // Never allow client-side room credentials inside persisted game state.
      delete incoming.hostToken; delete incoming.playerToken
      room.state=incoming
      await saveRoom(code,room)
      return json({state:room.state})
    }

    if (op === 'playerAction') {
      if (!auth(room,body.token,'player')) return json({error:'Player authorization failed'},403)
      room.state=playerAction(room.state,body.type,body.value)
      await saveRoom(code,room)
      return json({state:sanitize(room.state,'player')})
    }

    return json({error:'Unknown operation'},400)
  } catch (err) {
    console.error(err)
    return json({error:err?.message||'Server error'},400)
  }
}

export const config = { path:'/api/room' }
