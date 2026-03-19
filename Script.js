‎<script>
‎const UI={
‎slots:document.getElementById("slots"),
‎tiles:document.getElementById("tiles"),
‎coins:document.getElementById("coins"),
‎level:document.getElementById("level"),
‎status:document.getElementById("status"),
‎timerBar:document.getElementById("timerBar"),
‎hypeBar:document.getElementById("hypeBar"),
‎nextBtn:document.getElementById("nextBtn"),
‎question:document.getElementById("questionBox"),
‎clue:document.getElementById("clueBox"),
‎emoji:document.getElementById("emojiBox")
‎};
‎
‎const SFX={
‎correct:document.getElementById("correctSound"),
‎wrong:document.getElementById("wrongSound"),
‎win:document.getElementById("winSound"),
‎cheer:document.getElementById("cheerSound"),
‎sigh:document.getElementById("sighSound"),
‎click:document.getElementById("clickSound"),
‎hint:document.getElementById("hintSound"),
‎levelUp:document.getElementById("levelUpSound"),
‎tick:document.getElementById("tickSound"),
‎bg:document.getElementById("bgMusic"),
‎heartbeat:document.getElementById("heartbeatSound"),
‎drumroll:document.getElementById("drumrollSound"),
‎crowdClap:document.getElementById("crowdClap")
‎};
‎
‎const GameModes = [
‎
‎  "missing",
‎  "unscramble",
‎  "emoji",
‎  "reverse",
‎  "fastType",
‎  "definition",
‎  "category",
‎  "oneLetterOff",
‎  "firstLast",
‎  "memoryFlash",
‎  "speedRound",
‎  "bossFinal"
‎];
‎
‎let modeIndex = 0;
‎
‎function getNextMode(){
‎  modeIndex++;
‎  
‎  if(modeIndex % 10 === 0){
‎    return "bossFinal"; // hype moment every 10 rounds
‎  }
‎
‎  return GameModes[modeIndex % (GameModes.length - 1)];
‎}
‎
‎const Game={
‎coins:0, level:1, correctWords:0, streak:0, bossActive:false, bossHealth:5,
‎baseTime:40, time:40, maxTime:40, timer:null,
‎word:"", slots:[], hidden:[],
‎hype:0, ticked:false, hypeSpiked:false,
‎
‎getHintCost(){if(this.level<=3) return 100; if(this.level<=7) return 200; if(this.level<=12) return 400; return 800},
‎getLevelRequirement(){return 10 + (this.level-1)*2},
‎
‎chatMessages:["Alex: OMG hurry!","Mia: use a hint!","Ryan sent 💎","Luna: you got this!","Jake: that was close","Noah: wrong letter!","Sara: nice solve!","Chris: LEVEL UP!","Emma: gift incoming!","Leo: try again!"],
‎
‎spawnChat(){const box=document.getElementById("chatBox"); if(!box) return; const msg=document.createElement("div"); msg.className="chatMsg"; msg.innerText=this.chatMessages[Math.floor(Math.random()*this.chatMessages.length)]; box.appendChild(msg); setTimeout(()=>msg.remove(),6000)},
‎
‎reactionChat:{wrong:["Nooo wrong letter!","Chat: try another!","Oof that hurt 😬","That wasn't it!","Careful!"],
‎correct:["Nice move!","Chat approves 👍","Smart play!","Good letter!","That helped!"],
‎win:["CHAT IS GOING CRAZY 🔥","LEVEL CLEARED!!","That was clutch!","Let's gooooo!","Victory!!"],
‎panic:["HURRY!!","3 seconds left!","CHAT IS SCREAMING 😱","GO GO GO!","TIME IS RUNNING OUT!"]},
‎
‎spawnReaction(type){const box=document.getElementById("chatBox"); if(!box) return; const list=this.reactionChat[type]; if(!list) return; const msg=document.createElement("div"); msg.className="chatMsg"; msg.innerText=list[Math.floor(Math.random()*list.length)]; box.appendChild(msg); setTimeout(()=>msg.remove(),6000)},
‎
‎donationRain(){for(let i=0;i<15;i++){const coin=document.createElement("div"); coin.className="coinRain"; coin.innerText="🪙"; coin.style.left=Math.random()*100+"vw"; coin.style.animationDuration=(2+Math.random()*2)+"s"; document.body.appendChild(coin); setTimeout(()=>coin.remove(),4000);} this.coins+=50; UI.coins.innerText="🪙 "+this.coins; UI.status.innerText="💖 Viewers sent coins!"; SFX.cheer.currentTime=0; SFX.cheer.play();},
‎
‎leaderboard:[],
‎
‎updateLeaderboard(){this.leaderboard.push({score:this.correctWords, level:this.level}); this.leaderboard.sort((a,b)=>b.score-a.score); this.leaderboard=this.leaderboard.slice(0,5); const list=document.getElementById("scores"); if(!list) return; list.innerHTML=""; this.leaderboard.forEach(p=>{const li=document.createElement("li"); li.innerText="Lvl "+p.level+" • "+p.score+" words"; list.appendChild(li);})},
‎
‎spawnBoss(){this.bossActive=true; this.bossHealth=5; UI.status.innerText="👾 BOSS ROUND!"; const boss=document.createElement("div"); boss.id="boss"; boss.innerText="👾"; document.body.appendChild(boss);},
‎
‎resetBoxes(){UI.question.style.display="none"; UI.clue.style.display="none"; UI.emoji.style.display="none";},
‎
‎fullReset(){this.updateLeaderboard(); clearInterval(this.timer); this.level=1; this.coins=0; this.correctWords=0; this.streak=0; this.hype=0; UI.level.innerText="Level 1"; UI.coins.innerText="🪙 0"; UI.hypeBar.style.width="0%"; document.getElementById("combo").innerText="🔥 Combo x0"; UI.status.innerText="💔 The crowd is disappointed..."; this.failAliens();},
‎
‎words:[
‎"STREAM","CONTENT","CREATOR","VIRAL","TRENDING",
‎"ALGORITHM","SUBSCRIBE","FOLLOWERS","COMMUNITY",
‎"ENGAGEMENT","MONETIZE","INFLUENCER","AUDIENCE",
‎"DISCOVER","HASHTAG","REELS","SHORTS","VIEWS",
‎"LIKES","SHARES","COMMENT","CREATIVE","DIGITAL",
‎"BRANDING","MARKETING","ONLINE","NETWORK","GROWTH"
‎],
‎
‎start(){clearInterval(this.timer); this.resetBoxes(); 
‎currentMode = getNextMode();
‎UI.status.innerText="🧠 Solve the puzzle!"; currentMode = GameModes[Math.floor(Math.random() * GameModes.length)];
‎this.word = this.words[Math.floor(Math.random()*this.words.length)];
‎UI.status.innerText = "🎮 Mode: " + currentMode.toUpperCase(); UI.level.innerText="Level "+this.level; this.render(); document.getElementById("hintBtn").disabled=false; this.startTimer();},
‎
‎render(){UI.slots.innerHTML=""; UI.tiles.innerHTML=""; this.slots=this.word.split(""); this.hidden=[]; if(currentMode === "missing"){
‎  // your existing logic
‎}
‎
‎if(currentMode === "unscramble"){
‎  UI.question.style.display="block";
‎  UI.question.innerText = "Unscramble this:";
‎  
‎  const scrambled = this.word.split('').sort(()=>Math.random()-0.5).join('');
‎  UI.clue.style.display="block";
‎  UI.clue.innerText = scrambled;
‎}
‎
‎if(currentMode === "emoji"){
‎  const emojis = {
‎    STREAM:"📺🎥",
‎    VIRAL:"🔥📈",
‎    FOLLOWERS:"👥➕",
‎    CONTENT:"📱🎬"
‎  };
‎
‎  UI.emoji.style.display="block";
‎  UI.emoji.innerText = emojis[this.word] || "❓";
‎}
‎
‎if(currentMode === "reverse"){
‎  UI.question.style.display="block";
‎  UI.question.innerText = "🔁 Read this backwards:";
‎  UI.clue.style.display="block";
‎  UI.clue.innerText = this.word.split('').reverse().join('');
‎}
‎
‎if(currentMode === "fastType"){
‎  UI.question.style.display="block";
‎  UI.question.innerText = "⚡ TYPE THIS FAST!";
‎  UI.clue.style.display="block";
‎  UI.clue.innerText = this.word;
‎}
‎
‎const definitions = {
‎  VIRAL:"Spreads very fast online",
‎  STREAM:"Live broadcast online",
‎  FOLLOWERS:"People who subscribe to you"
‎};
‎
‎if(currentMode === "definition"){
‎  UI.question.style.display="block";
‎  UI.question.innerText = "📖 Guess the word:";
‎  UI.clue.style.display="block";
‎  UI.clue.innerText = definitions[this.word] || "No clue";
‎}
‎
‎const categories = {
‎  STREAM:"Social Media",
‎  VIRAL:"Internet",
‎  CONTENT:"Creation"
‎};
‎
‎if(currentMode === "category"){
‎  UI.question.style.display="block";
‎  UI.question.innerText = "🗂️ Guess from category:";
‎  UI.clue.style.display="block";
‎  UI.clue.innerText = categories[this.word] || "General";
‎}
‎
‎if(currentMode === "oneLetterOff"){
‎  UI.question.style.display="block";
‎  UI.question.innerText = "🔤 Fix the wrong letter:";
‎  
‎  let wrong = this.word.split('');
‎  let i = Math.floor(Math.random()*wrong.length);
‎  wrong[i] = "X";
‎  
‎  UI.clue.style.display="block";
‎  UI.clue.innerText = wrong.join('');
‎}
‎
‎if(currentMode === "firstLast"){
‎  UI.question.style.display="block";
‎  UI.question.innerText = "🔍 Guess the word:";
‎  UI.clue.style.display="block";
‎  UI.clue.innerText = this.word[0] + "____" + this.word[this.word.length-1];
‎}
‎
‎if(currentMode === "memoryFlash"){
‎  UI.question.style.display="block";
‎  UI.question.innerText = "🧠 Memorize!";
‎  UI.clue.style.display="block";
‎  UI.clue.innerText = this.word;
‎
‎  setTimeout(()=>{
‎    UI.clue.innerText = "???";
‎  },2000);
‎}
‎
‎if(currentMode === "speedRound"){
‎  UI.status.innerText = "⚡ SPEED ROUND!";
‎  this.baseTime = 10;
‎}
‎
‎if(currentMode === "bossFinal"){
‎  UI.question.style.display="block";
‎  UI.question.innerText = "👾 FINAL BOSS WORD!";
‎  UI.clue.style.display="block";
‎  UI.clue.innerText = this.word.split('').join(' ');
‎  
‎  this.time = 20;
‎}
‎
‎this.slots.forEach((l,i)=>{if(Math.random()<0.5){this.hidden.push(i); this.slots[i]="";}}); if(this.hidden.length===0){const i=Math.floor(Math.random()*this.word.length); this.hidden=[i]; this.slots[i]="";} this.slots.forEach((l,i)=>{const s=document.createElement("div"); s.className="slot"; if(l!==""){s.innerText=l; s.classList.add("fixed");} UI.slots.appendChild(s);}); const options=[]; this.hidden.forEach(i=>options.push(this.word[i])); const alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ"; while(options.length<12){options.push(alphabet[Math.floor(Math.random()*26)]);} options.sort(()=>Math.random()-.5); options.forEach(l=>{const t=document.createElement("div"); t.className="tile"; t.innerText=l; t.onclick=()=>this.place(l,t); UI.tiles.appendChild(t);});},
‎
‎place(letter,tile){if(this.slots.every(s=>s!=="")) return; SFX.click.currentTime=0; SFX.click.play(); const index=this.hidden.find(i=>this.slots[i]===""); if(index===undefined) return; const slot=UI.slots.children[index]; slot.innerText=letter; if(letter===this.word[index]){slot.classList.add("correct"); this.spawnReaction("correct"); SFX.correct.play(); UI.status.innerText="✨ Nice!";}else{slot.classList.add("wrong"); this.spawnReaction("wrong"); SFX.wrong.play(); this.time=Math.max(1,this.time-2); this.streak=0; document.getElementById("combo").innerText="🔥 Combo x0"; UI.status.innerText="⚠️ Wrong!";} this.slots[index]=letter; tile.classList.add("used"); this.check();},
‎
‎check(){if(this.slots.includes("")) return; if(this.slots.join("")===this.word){clearInterval(this.timer); this.coins+=100; this.streak++; UI.coins.innerText="🪙 "+this.coins; document.getElementById("combo").innerText="🔥 Combo x"+this.streak; 
‎if(this.streak % 5 === 0){
‎  UI.status.innerText = "🔥 BONUS ROUND!";
‎  this.coins += 200;
‎}
‎
‎if(this.streak>=3){this.coins+=300; UI.coins.innerText="🪙 "+this.coins; UI.status.innerText="🔥 COMBO BONUS!";} SFX.win.play(); this.spawnReaction("win"); SFX.cheer.play(); SFX.levelUp.play(); this.confetti(); this.correctWords++; if(this.correctWords>=this.getLevelRequirement()){this.level++; this.correctWords=0; UI.status.innerText="🔥 LEVEL UP!"; if(this.level%5===0){this.spawnBoss();} this.hype+=20; this.updateHype(); setTimeout(()=>this.start(),2500);} if(this.bossActive){this.bossHealth--; if(this.bossHealth<=0){this.bossActive=false; document.getElementById("boss")?.remove(); this.coins+=500; UI.status.innerText="🏆 Boss defeated! +500 coins";}}}},
‎
‎updateHype(){if(this.hype>100) this.hype=100; UI.hypeBar.style.width=this.hype+"%"; if(this.hype===100){this.coins+=200; UI.coins.innerText="🪙 "+this.coins; UI.status.innerText="🔥 HYPE BONUS!"; this.hype=0; UI.hypeBar.style.width="0%";}},
‎
‎startTimer(){clearInterval(this.timer); this.ticked=false; this.hypeSpiked=false; this.time=this.baseTime-(this.level*2); if(this.time<15) this.time=15; this.maxTime=this.time; UI.timerBar.style.width="100%"; this.timer=setInterval(()=>{this.time--; UI.timerBar.style.width=(this.time/this.maxTime)*100+"%"; if(this.time<=3){this.spawnReaction("panic"); document.body.classList.add("shake"); if(SFX.heartbeat.paused){SFX.heartbeat.volume=0.6; SFX.heartbeat.play().catch(()=>{});}} else{document.body.classList.remove("shake"); SFX.heartbeat.pause(); SFX.heartbeat.currentTime=0;} if(this.time<=5 && !this.ticked){SFX.tick.currentTime=0; SFX.tick.play(); this.ticked=true;} if(this.time<=5 && !this.hypeSpiked){this.hype+=10; this.updateHype(); this.hypeSpiked=true;} if(this.time<=0){clearInterval(this.timer); this.fullReset(); SFX.sigh.play();}},1000);},
‎
‎confetti(){const box=document.getElementById("confetti"); for(let i=0;i<30;i++){const c=document.createElement("span"); c.innerText=["🎉","✨","🎊","💫"][Math.floor(Math.random()*4)]; c.style.left=Math.random()*100+"%"; box.appendChild(c); setTimeout(()=>c.remove(),3000);}},  
‎
‎failAliens(){const box=document.getElementById("aliens"); for(let i=0;i<10;i++){const a=document.createElement("span"); a.innerText="😭"; a.style.left=Math.random()*100+"%"; a.style.fontSize=20+Math.random()*20+"px"; box.appendChild(a); setTimeout(()=>a.remove(),3000);}},  
‎
‎hint:function(){const cost=this.getHintCost(); if(this.coins<cost){UI.status.innerText="❌ Need "+cost+" coins"; return;} const index=this.hidden.find(i=>this.slots[i]===""); if(index===undefined) return; const letter=this.word[index]; const slot=UI.slots.children[index]; slot.innerText=letter; slot.classList.add("correct"); this.slots[index]=letter; this.coins-=cost; UI.coins.innerText="🪙 "+this.coins; document.getElementById("hintBtn").disabled=true; SFX.hint.play(); this.check();}
‎
‎};
‎
‎UI.nextBtn.onclick=()=>{if(SFX.bg.paused){SFX.bg.volume=0.25; SFX.bg.loop=true; SFX.bg.play().catch(()=>{});} Game.start();};
‎
‎document.getElementById("hintBtn").onclick=()=>Game.hint();
‎
‎document.getElementById("giftRow").onclick=()=>{
‎Game.donationRain();
‎Game.hype+=5;
‎Game.updateHype();
‎UI.status.innerText="💖 Gift received!";
‎SFX.cheer.play();
‎};
‎
‎setInterval(()=>Game.spawnChat(),3000);
‎
‎document.addEventListener("keydown", (e)=>{
‎  if(e.key === "g") Game.donationRain(); // fake gifts
‎  if(e.key === "h") Game.hint();
‎  if(e.key === "n") Game.start();
‎});
‎
‎// ✅ SERVICE WORKER REGISTRATION (PUT AT THE VERY BOTTOM)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js")
      .then(() => console.log("Service Worker Registered"))
      .catch((err) => console.log("SW failed:", err));
  });
}
‎</script>
‎
