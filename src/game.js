export const FACE=['','⚀','⚁','⚂','⚃','⚄','⚅']
export const rollFive=()=>Array.from({length:5},()=>1+Math.floor(Math.random()*6))
const counts=v=>v.reduce((o,n)=>(o[n]=(o[n]||0)+1,o),{})
export function evaluate(v){
 if(!v||v.length!==5)return{rank:0,name:'Waiting…',tie:[]}
 const g=Object.entries(counts(v)).map(([value,count])=>({value:+value,count})).sort((a,b)=>b.count-a.count||b.value-a.value)
 const u=[...new Set(v)].sort((a,b)=>a-b)
 if(g[0].count===5)return{rank:9,name:'Five of a Kind',tie:[g[0].value]}
 if(g[0].count===4)return{rank:8,name:'Four of a Kind',tie:[g[0].value,g.find(x=>x.count===1).value]}
 if(g[0].count===3&&g[1].count===2)return{rank:7,name:'Full House',tie:[g[0].value,g[1].value]}
 if(u.join(',')==='2,3,4,5,6')return{rank:6,name:'Royal Run',tie:[6]}
 if(u.join(',')==='1,2,3,4,5')return{rank:5,name:'Low Run',tie:[5]}
 if(g[0].count===3)return{rank:4,name:'Three of a Kind',tie:[g[0].value,...g.filter(x=>x.count===1).map(x=>x.value).sort((a,b)=>b-a)]}
 const p=g.filter(x=>x.count===2).sort((a,b)=>b.value-a.value)
 if(p.length===2)return{rank:3,name:'Two Pair',tie:[p[0].value,p[1].value,g.find(x=>x.count===1).value]}
 if(p.length===1)return{rank:2,name:'Pair',tie:[p[0].value,...g.filter(x=>x.count===1).map(x=>x.value).sort((a,b)=>b-a)]}
 return{rank:1,name:'High Dice',tie:[...v].sort((a,b)=>b-a)}
}
export function compareHands(a,b){
 if(a.rank!==b.rank)return a.rank>b.rank?1:-1
 for(let i=0;i<Math.max(a.tie.length,b.tie.length);i++){const x=a.tie[i]||0,y=b.tie[i]||0;if(x!==y)return x>y?1:-1}
 return 0
}
export function newGame(){
 return {round:1,dealerWins:0,playerWins:0,dealerDice:[],playerDice:[],winner:null,message:'Host can roll when both players are ready.',version:0}
}
export function playRound(game){
 const dealerDice=rollFive(),playerDice=rollFive()
 const d=evaluate(dealerDice),p=evaluate(playerDice),r=compareHands(d,p)
 if(r>0)return{...game,dealerDice,playerDice,dealerWins:game.dealerWins+1,round:game.round+1,winner:'dealer',message:`Dealer wins — ${d.name} beats ${p.name}.`,version:game.version+1}
 if(r<0)return{...game,dealerDice,playerDice,playerWins:game.playerWins+1,round:game.round+1,winner:'player',message:`Player 2 wins — ${p.name} beats ${d.name}.`,version:game.version+1}
 return{...game,dealerDice,playerDice,round:game.round+1,winner:'push',message:`Push — both hands are ${d.name}.`,version:game.version+1}
}
