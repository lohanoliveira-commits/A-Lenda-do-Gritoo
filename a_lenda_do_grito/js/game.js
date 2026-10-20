(() => {
  "use strict";
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayText = document.getElementById("overlay-text");
  const startBtn = document.getElementById("start-btn");
  const restartBtn = document.getElementById("restart-btn");
  const objectiveEl = document.getElementById("objective");
  const healthEl = document.getElementById("health");
  const keyStatusEl = document.getElementById("key-status");
  const timerEl = document.getElementById("timer");

  const W = canvas.width, H = canvas.height;
  const keys = new Set();
  let player, ghost, keyItem, exit, trees, rocks, state, flashlight, startTime, elapsed, lastTick;

  function resetGame() {
    player = {x: 90, y: 440, r: 11, speed: 190, hp: 3, invulnerable: 0};
    ghost = {x: 730, y: 110, r: 18, speed: 54};
    keyItem = {x: 735, y: 420, found: false};
    exit = {x: 815, y: 65, w: 46, h: 62};
    trees = [];
    rocks = [];
    for (let i = 0; i < 30; i++) {
      const x = 25 + ((i * 137) % 850);
      const y = 30 + ((i * 83) % 480);
      if (Math.hypot(x-player.x,y-player.y)>70 && Math.hypot(x-keyItem.x,y-keyItem.y)>60) trees.push({x,y,r:13+(i%3)*3});
    }
    rocks = [{x:260,y:155,r:20},{x:360,y:330,r:25},{x:560,y:200,r:22},{x:640,y:460,r:18},{x:165,y:260,r:16}];
    state = "ready"; flashlight = true; elapsed = 0; startTime = 0; lastTick = 0;
    updateHud(); draw();
  }
  function begin() { state = "playing"; startTime = performance.now(); lastTick = startTime; overlay.classList.add("hidden"); requestAnimationFrame(loop); }
  function showOverlay(title, text, buttonText="Jogar novamente") {
    overlayTitle.textContent = title; overlayText.textContent = text; startBtn.textContent = buttonText;
    overlay.classList.remove("hidden");
  }
  function updateHud() {
    objectiveEl.textContent = keyItem.found ? "Escape pela saída!" : "Encontre a chave";
    healthEl.textContent = "♥ ".repeat(player.hp).trim() || "0";
    keyStatusEl.textContent = keyItem.found ? "Encontrada" : "Não encontrada";
    const secs = Math.floor(elapsed/1000);
    timerEl.textContent = String(Math.floor(secs/60)).padStart(2,"0")+":"+String(secs%60).padStart(2,"0");
  }
  function moveEntity(entity, dx, dy) {
    const nx = Math.max(entity.r, Math.min(W-entity.r, entity.x+dx));
    const ny = Math.max(entity.r, Math.min(H-entity.r, entity.y+dy));
    if (!rocks.some(o => Math.hypot(nx-o.x,ny-o.y)<entity.r+o.r)) { entity.x=nx; entity.y=ny; }
    else {
      if (!rocks.some(o => Math.hypot(nx-o.x,entity.y)<entity.r+o.r)) entity.x=nx;
      if (!rocks.some(o => Math.hypot(entity.x,ny)<entity.r+o.r)) entity.y=ny;
    }
  }
  function update(dt, now) {
    if (state !== "playing") return;
    elapsed = now-startTime;
    let dx=0,dy=0;
    if(keys.has("w")||keys.has("arrowup"))dy--;
    if(keys.has("s")||keys.has("arrowdown"))dy++;
    if(keys.has("a")||keys.has("arrowleft"))dx--;
    if(keys.has("d")||keys.has("arrowright"))dx++;
    if(dx&&dy){dx*=Math.SQRT1_2;dy*=Math.SQRT1_2;}
    moveEntity(player,dx*player.speed*dt,dy*player.speed*dt);
    const distance = Math.hypot(player.x-ghost.x,player.y-ghost.y);
    const chaseSpeed = distance < 210 ? ghost.speed*1.2 : ghost.speed*.55;
    if(distance>1){moveEntity(ghost,(player.x-ghost.x)/distance*chaseSpeed*dt,(player.y-ghost.y)/distance*chaseSpeed*dt);}
    player.invulnerable=Math.max(0,player.invulnerable-dt);
    if(distance < player.r+ghost.r+3 && player.invulnerable<=0){
      player.hp--; player.invulnerable=1.35;
      if(player.hp<=0){state="lost";updateHud();draw();showOverlay("O GRITO TE ENCONTROU","A presença tomou conta da floresta. Tente novamente e use os obstáculos a seu favor.");return;}
    }
    if(!keyItem.found && Math.hypot(player.x-keyItem.x,player.y-keyItem.y)<29) objectiveEl.textContent="Pressione E para pegar";
    if(keyItem.found && player.x>exit.x-15 && player.x<exit.x+exit.w+15 && player.y>exit.y-15 && player.y<exit.y+exit.h+15){
      state="won";updateHud();draw();showOverlay("VOCÊ ESCAPOU!","Você encontrou a chave e saiu da floresta em "+timerEl.textContent+". Mandou bem!","Jogar novamente");return;
    }
    updateHud();
  }
  function interact(){
    if(state!=="playing")return;
    if(!keyItem.found && Math.hypot(player.x-keyItem.x,player.y-keyItem.y)<45){keyItem.found=true;updateHud();}
    else if(player.x>exit.x-25&&player.x<exit.x+exit.w+25&&player.y>exit.y-25&&player.y<exit.y+exit.h+25&&!keyItem.found){objectiveEl.textContent="A saída está trancada";}
  }
  function circle(x,y,r,color){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
  function draw(){
    ctx.clearRect(0,0,W,H);
    const bg=ctx.createLinearGradient(0,0,W,H);bg.addColorStop(0,"#15232a");bg.addColorStop(.55,"#0a1216");bg.addColorStop(1,"#020608");ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    // trilhas no chão
    ctx.strokeStyle="#26352e";ctx.lineWidth=36;ctx.beginPath();ctx.moveTo(0,490);ctx.quadraticCurveTo(270,380,430,470);ctx.quadraticCurveTo(650,520,900,250);ctx.stroke();
    // casa abandonada
    ctx.fillStyle="#17191a";ctx.fillRect(680,28,155,95);ctx.fillStyle="#242323";ctx.beginPath();ctx.moveTo(660,32);ctx.lineTo(758,0);ctx.lineTo(856,32);ctx.closePath();ctx.fill();
    ctx.fillStyle="#d1a45c";ctx.fillRect(710,52,17,20);ctx.fillRect(780,52,17,20);ctx.fillStyle="#090b0d";ctx.fillRect(744,78,25,45);
    ctx.fillStyle="#34413a";ctx.font="12px Arial";ctx.fillText("CASA ABANDONADA",676,139);
    // saída
    ctx.fillStyle=keyItem.found?"#bd9c54":"#4b3430";ctx.fillRect(exit.x,exit.y,exit.w,exit.h);ctx.strokeStyle="#8d7546";ctx.strokeRect(exit.x,exit.y,exit.w,exit.h);
    ctx.fillStyle="#e8d39b";ctx.font="11px Arial";ctx.fillText(keyItem.found?"SAÍDA":"TRANCADA",exit.x-8,exit.y-8);
    // obstáculos
    rocks.forEach(o=>{circle(o.x,o.y,o.r,"#30383a");circle(o.x-5,o.y-5,o.r*.55,"#3e4949");});
    trees.forEach(t=>{circle(t.x,t.y,t.r,"#07100d");circle(t.x-3,t.y-4,t.r*.65,"#10241b");});
    // chave
    if(!keyItem.found){ctx.save();ctx.translate(keyItem.x,keyItem.y);ctx.rotate(-.3);ctx.strokeStyle="#f5d46b";ctx.lineWidth=5;ctx.beginPath();ctx.arc(-5,0,7,0,Math.PI*2);ctx.moveTo(2,0);ctx.lineTo(24,0);ctx.lineTo(24,7);ctx.moveTo(16,0);ctx.lineTo(16,6);ctx.stroke();ctx.restore();}
    // fantasma
    ctx.save();ctx.globalAlpha=.92;circle(ghost.x,ghost.y,ghost.r+9,"#8b172c33");ctx.fillStyle="#d9d8d4";ctx.beginPath();ctx.arc(ghost.x,ghost.y-4,ghost.r*.75,Math.PI,0);ctx.lineTo(ghost.x+ghost.r*.75,ghost.y+ghost.r);ctx.lineTo(ghost.x+ghost.r*.25,ghost.y+ghost.r*.65);ctx.lineTo(ghost.x,ghost.y+ghost.r);ctx.lineTo(ghost.x-ghost.r*.25,ghost.y+ghost.r*.65);ctx.lineTo(ghost.x-ghost.r*.75,ghost.y+ghost.r);ctx.closePath();ctx.fill();circle(ghost.x-5,ghost.y-4,2.8,"#a40018");circle(ghost.x+5,ghost.y-4,2.8,"#a40018");ctx.restore();
    // jogador
    circle(player.x,player.y,player.r+4,player.invulnerable>0?"#e8d8a8":"#7d9aa0");circle(player.x,player.y,player.r,"#d9e3df");circle(player.x+3,player.y-3,3,"#101820");
    // lanterna: escurece e abre cone circular
    ctx.save();ctx.fillStyle="rgba(0,0,0,.58)";ctx.fillRect(0,0,W,H);
    if(flashlight){const glow=ctx.createRadialGradient(player.x,player.y,8,player.x,player.y,210);glow.addColorStop(0,"rgba(255,235,170,.78)");glow.addColorStop(.35,"rgba(255,224,151,.28)");glow.addColorStop(1,"rgba(255,224,151,0)");ctx.globalCompositeOperation="lighter";ctx.fillStyle=glow;ctx.beginPath();ctx.arc(player.x,player.y,210,0,Math.PI*2);ctx.fill();}
    ctx.restore();
    // vinheta e dicas
    const v=ctx.createRadialGradient(W/2,H/2,120,W/2,H/2,540);v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(0,0,0,.6)");ctx.fillStyle=v;ctx.fillRect(0,0,W,H);
    ctx.fillStyle="#e4e8e6";ctx.font="bold 14px Arial";ctx.fillText("ENCONTRE A CHAVE E FUJA",20,26);
    if(!keyItem.found&&Math.hypot(player.x-keyItem.x,player.y-keyItem.y)<48){ctx.fillStyle="#f5d46b";ctx.fillText("E — PEGAR CHAVE",player.x+18,player.y-18);}
  }
  function loop(now){if(state!=="playing")return;const dt=Math.min((now-lastTick)/1000,.04);lastTick=now;update(dt,now);draw();if(state==="playing")requestAnimationFrame(loop);}
  window.addEventListener("keydown",e=>{
    const k=e.key.toLowerCase();if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();
    keys.add(k);
    if(k==="e")interact();
    if(k==="f"&&state==="playing"){flashlight=!flashlight;}
    if(k==="escape"&&state==="playing"){state="paused";showOverlay("PAUSADO","Respira um pouco. Quando estiver pronto, continue a exploração.","Continuar");}
  });
  window.addEventListener("keyup",e=>keys.delete(e.key.toLowerCase()));
  startBtn.addEventListener("click",()=>{if(state==="paused"){begin();return;}resetGame();begin();});
  restartBtn.addEventListener("click",()=>{resetGame();begin();});
  resetGame();
})();