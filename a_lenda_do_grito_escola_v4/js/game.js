import * as THREE from "three";
import {GLTFLoader} from "three/addons/loaders/GLTFLoader.js";
import {OBJLoader} from "three/addons/loaders/OBJLoader.js";
import {MTLLoader} from "three/addons/loaders/MTLLoader.js";
import {MD2Loader} from "three/addons/loaders/MD2Loader.js";
import {AnimationMixer} from "three";
const $=id=>document.getElementById(id),canvas=$("game-canvas");
const ui={loading:$("loading"),detail:$("loading-detail"),screen:$("start-screen"),title:$("screen-title"),copy:$("screen-copy"),start:$("start-button"),pause:$("pause-button"),status:$("status"),objective:$("objective"),objectiveDetail:$("objective-detail"),progress:$("progress"),healthNumber:$("health-number"),healthBar:$("health-bar"),healthLabel:$("health-label"),staminaBar:$("stamina-bar"),staminaLabel:$("stamina-label"),timer:$("timer"),keyState:$("key-state"),keyCheck:$("key-check"),toast:$("toast")};
const scene=new THREE.Scene();scene.background=new THREE.Color(0x263747);scene.fog=new THREE.Fog(0x263747,26,88);
const camera=new THREE.PerspectiveCamera(72,1,.1,180),renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.7));renderer.useLegacyLights=false;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.38;
const clock=new THREE.Clock(),loader=new GLTFLoader(),down=new Set();let player,monster,key,flash,gateLeft,gateRight,playerModel,monsterMixer,monsterAction,state="menu",yaw=0,pitch=-.05,locked=false,hasKey=false,health=100,stamina=100,time=0,damageWait=0,toastTime=0,flashOn=true;
const exit=new THREE.Vector3(0,0,29),keyStart=new THREE.Vector3(-8,0,-23);
const mat=(c,r=.85,e={})=>new THREE.MeshStandardMaterial({color:c,roughness:r,...e});
function box(w,h,d,m,x,y,z){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;scene.add(o);return o}
function light(c,i,dist,x,y,z){const l=new THREE.PointLight(c,i,dist,2);l.position.set(x,y,z);scene.add(l);return l}
function school(){
 const wall=mat(0x99988a),floor=mat(0x565950),trim=mat(0x484d50),door=mat(0x3c2922);
 const f=box(34,.25,78,floor,0,-.15,-5);box(34,.3,78,mat(0x313438),0,5.6,-5);
 box(.45,5.7,78,wall,-16.8,2.7,-5);box(.45,5.7,78,wall,16.8,2.7,-5);
 for(let z=-40;z<33;z+=4)box(33,.035,.055,mat(0xb3a581),0,-.015,z);
 for(let z=-32;z<=20;z+=10)for(const side of [-1,1]){
   const x=side*12.4;box(7.4,4.9,.3,wall,x,2.4,z-3.7);box(7.4,4.9,.3,wall,x,2.4,z+3.7);box(.3,4.9,7.4,wall,side*8.7,2.4,z);
   box(1.7,3.1,.16,door,side*15.1,1.55,z);
   for(let j=0;j<3;j++){box(1.35,.16,.72,mat(0x543d2c),side*(10.1+(j%2)*2),1.05,z-1.5+j*1.6);box(.1,.95,.1,trim,side*(9.65+(j%2)*2),.5,z-1.5+j*1.6);}
 }
 // Entrada inspirada na referência de faculdade/hospital, com pórtico largo.
 box(9,5,.5,wall,-11,2.4,31);box(9,5,.5,wall,11,2.4,31);box(13,1,.65,trim,0,5,31);
 // Portão metálico de duas folhas: abre quando o jogador usa a chave.
 gateLeft=new THREE.Group();gateRight=new THREE.Group();
 for(const [group,cx] of [[gateLeft,-1.55],[gateRight,1.55]]){
   const panel=new THREE.Mesh(new THREE.BoxGeometry(3.05,3.9,.22),mat(0x303a40,.32,{metalness:.82}));panel.position.set(0,1.95,0);panel.castShadow=true;panel.receiveShadow=true;group.add(panel);
   for(let x=-1.35;x<=1.36;x+=.34){const bar=new THREE.Mesh(new THREE.BoxGeometry(.075,3.72,.29),mat(0x829096,.25,{metalness:.9}));bar.position.set(x,1.95,-.03);bar.castShadow=true;group.add(bar)}
   const cross=new THREE.Mesh(new THREE.BoxGeometry(2.9,.12,.31),mat(0x5d696d,.25,{metalness:.85}));cross.position.set(0,2.05,-.04);group.add(cross);
   group.position.set(cx,0,29.1);scene.add(group);
 }
 box(.18,4.25,.5,trim,-3.25,2.05,29.1);box(.18,4.25,.5,trim,3.25,2.05,29.1);
 for(let i=0;i<4;i++)box(8-i*.65,.25,1.05,mat(0x747774),0,-.08-i*.15,33+i*.8);
 box(7,.8,.2,mat(0x26343b),0,4.7,29.2);
 for(let z=-28;z<20;z+=6)for(const side of [-1,1]){
   box(1.1,2.5,.55,mat(side<0?0x3c5155:0x4c3d42,.55,{metalness:.3}),side*15.8,1.3,z);
   light(0xffe1ae,4.5,11,side*8.1,4.8,z);
 }
 for(let z=-34;z<=24;z+=8){box(3,.12,.5,mat(0xe6f4eb,.25,{emissive:0xc4e2d1,emissiveIntensity:1.2}),0,5.25,z);light(0xd5e9ff,6,15,0,5,z)}
 light(0xff3434,5,11,-15.7,3.7,25);light(0xffb75e,6,13,15.7,3.7,25);box(34,6,.5,wall,0,2.5,-41);
 // Desks and stacked old boxes in the corridor.
 for(const [x,z,s] of [[-5,-18,1],[5,-13,.8],[-5,-3,.9],[5,7,1],[-3,17,.75]]){
  box(1.25*s,1.15*s,1.15*s,mat(0x49382a),x,.58*s,z);
  for(const dx of [-.48,.48])box(.09*s,1.2*s,.08*s,mat(0x555a5b,.4,{metalness:.6}),x+dx*s,.58*s,z+.59*s);
 }
 // Reflective sculpture
 const chrome=mat(0xc4d1d8,.07,{metalness:1,emissive:0x28343b,emissiveIntensity:.35});
 const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(.65,.85,.25,12),chrome);pedestal.position.set(-4,.13,24);scene.add(pedestal);
 const statue=new THREE.Mesh(new THREE.IcosahedronGeometry(.8,2),chrome);statue.position.set(-4,1.35,24);statue.scale.set(.65,1.45,.6);scene.add(statue);
 // Creepy doll placed at the school entrance.
 const skin=mat(0xb5a59a),dress=mat(0x632332),dark=mat(0x211b24),eyes=new THREE.MeshBasicMaterial({color:0xff1428});
 box(.6,1.2,.42,dress,0,.7,25.2);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.32,12,10),skin);head.position.set(0,1.55,25.2);scene.add(head);
 const hat=new THREE.Mesh(new THREE.ConeGeometry(.36,.42,8),dark);hat.position.set(0,1.9,25.2);scene.add(hat);
 for(const x of [-.12,.12]){const e=new THREE.Mesh(new THREE.SphereGeometry(.045,8,8),eyes);e.position.set(x,1.59,24.91);scene.add(e)}
 light(0xff2525,3,6,0,1.8,24.4);
}
function buildPlayer(){
 const g=new THREE.Group(),jacket=mat(0x28333b),skin=mat(0xb59c86),pants=mat(0x171d25);
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.32,.72,4,8),jacket);body.position.y=1.2;g.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.24,12,10),skin);head.position.y=1.92;g.add(head);
 for(const x of [-.18,.18]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.17,.65,.2),pants);leg.position.set(x,.42,0);g.add(leg)}
 g.position.set(0,0,18);scene.add(g);return g;
}
function buildMonster(){
 const g=new THREE.Group(),fur=mat(0x1c5549),skin=mat(0xc3d1b9),red=new THREE.MeshBasicMaterial({color:0xff0929});
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.48,.95,5,9),fur);torso.position.y=1.4;g.add(torso);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.48,14,12),fur);head.position.set(0,2.45,-.04);g.add(head);
 const muzzle=new THREE.Mesh(new THREE.BoxGeometry(.52,.28,.24),skin);muzzle.position.set(0,2.28,-.43);g.add(muzzle);
 for(const x of [-.19,.19]){const e=new THREE.Mesh(new THREE.SphereGeometry(.085,8,8),red);e.position.set(x,2.52,-.45);g.add(e);const ear=new THREE.Mesh(new THREE.ConeGeometry(.16,.6,6),fur);ear.position.set(x*1.7,2.95,-.02);g.add(ear);const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.78,3,7),fur);arm.position.set(x*2,1.45,0);arm.rotation.z=x<0?-.25:.25;g.add(arm)}
 g.position.set(0,0,-32);scene.add(g);return g;
}
async function loadCharacterModels(){
 // O protagonista usa o modelo OBJ oficial de demonstração do Three.js; mantém fallback se a rede falhar.
 try{
   const materials=await new MTLLoader().setPath("https://threejs.org/examples/models/obj/male02/").loadAsync("male02.mtl");materials.preload();
   const obj=await new OBJLoader().setMaterials(materials).setPath("https://threejs.org/examples/models/obj/male02/").loadAsync("male02.obj");
   obj.scale.setScalar(.012);obj.position.set(0,-.02,0);obj.rotation.y=Math.PI;
   obj.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.material){o.material.roughness=.82}}});
   // Substitui o corpo procedural mantendo o grupo de movimento.
   player.children.forEach(c=>{c.visible=false});player.add(obj);playerModel=obj;
 }catch(err){console.warn("Modelo OBJ não carregou; usando personagem procedural.",err)}
 // O perseguidor usa MD2 animado, com a criatura procedural como fallback.
 try{
   const md2=new MD2Loader();
   const geometry=await md2.loadAsync("https://threejs.org/examples/models/md2/ogro/ogro.md2");
   const texture=await new THREE.TextureLoader().loadAsync("https://threejs.org/examples/models/md2/ogro/ogro.jpg");texture.colorSpace=THREE.SRGBColorSpace;
   const material=new THREE.MeshStandardMaterial({map:texture,roughness:.9,metalness:0});
   const mesh=new THREE.Mesh(geometry,material);mesh.scale.setScalar(.028);mesh.position.set(0,0,0);mesh.rotation.y=Math.PI;mesh.castShadow=true;mesh.receiveShadow=true;
   monster.children.forEach(c=>{c.visible=false});monster.add(mesh);
   if(geometry.animations?.length){monsterMixer=new AnimationMixer(mesh);const clip=geometry.animations.find(a=>/run|walk/i.test(a.name))||geometry.animations[0];monsterAction=monsterMixer.clipAction(clip);monsterAction.play()}
 }catch(err){console.warn("Modelo MD2 não carregou; usando criatura procedural.",err)}
}
async function loadKey(){
 try{const gltf=await loader.loadAsync("./assets/models/chave.glb");key=gltf.scene;key.scale.setScalar(.72);key.position.copy(keyStart);key.position.y=1.05;key.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});scene.add(key)}
 catch{const g=new THREE.Group(),gold=mat(0xe8c56d,.2,{metalness:.9});const ring=new THREE.Mesh(new THREE.TorusGeometry(.25,.065,8,18),gold);ring.position.x=-.2;g.add(ring);const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.72,8),gold);shaft.rotation.z=Math.PI/2;shaft.position.x=.27;g.add(shaft);const tooth=new THREE.Mesh(new THREE.BoxGeometry(.16,.18,.1),gold);tooth.position.set(.53,-.14,0);g.add(tooth);key=g;key.position.copy(keyStart);key.position.y=1;scene.add(key)}
}
function toast(t){ui.toast.textContent=t;ui.toast.classList.add("visible");toastTime=performance.now()}
function fmt(t){const s=Math.floor(t);return String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0")}
function hud(){ui.healthNumber.textContent=`${Math.ceil(health)} / 100`;ui.healthLabel.textContent=`${Math.ceil(health)}%`;ui.healthBar.style.width=health+"%";ui.staminaLabel.textContent=Math.ceil(stamina)+"%";ui.staminaBar.style.width=stamina+"%";ui.timer.textContent=fmt(time)}
function start(){state="playing";ui.screen.classList.add("hidden");ui.pause.disabled=false;ui.pause.textContent="Pausar jogo";ui.status.textContent=hasKey?"ENCONTRE A SAÍDA":"PROCURANDO A CHAVE";renderer.domElement.requestPointerLock?.();clock.start()}
function pause(){if(state==="playing"){state="paused";ui.title.textContent="Pausa";ui.copy.textContent="Recupere o fôlego e planeje sua fuga. O monstro continua na escola.";ui.start.textContent="Continuar";ui.screen.classList.remove("hidden");ui.pause.textContent="Continuar";document.exitPointerLock?.()}else if(state==="paused")start()}
function finish(win){state=win?"won":"lost";ui.title.textContent=win?"VOCÊ ESCAPOU DA ESCOLA":"O MONSTRO TE ALCANÇOU";ui.copy.textContent=win?`Você escapou em ${fmt(time)}.`:"Sua vida chegou a zero. Tente novamente e use a corrida para ganhar distância.";ui.start.textContent="Jogar novamente";ui.screen.classList.remove("hidden");ui.pause.disabled=true;ui.status.textContent=win?"FUGA CONCLUÍDA":"FIM DE JOGO";document.exitPointerLock?.()}
function restart(){hasKey=false;health=100;stamina=100;time=0;damageWait=0;player.position.set(0,0,18);monster.position.set(0,0,-32);key.visible=true;key.position.copy(keyStart);key.position.y=1.05;ui.objective.textContent="Encontre a chave";ui.objectiveDetail.textContent="Explore as salas e os corredores.";ui.progress.style.width="12%";ui.keyState.textContent="Ainda não encontrada";ui.keyCheck.textContent="○";ui.keyCheck.classList.remove("on");hud();start()}
function move(dt){const f=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw)),r=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)),d=new THREE.Vector3();if(down.has("w"))d.add(f);if(down.has("s"))d.sub(f);if(down.has("d"))d.add(r);if(down.has("a"))d.sub(r);const moving=d.lengthSq()>0,sprinting=moving&&down.has("shift")&&stamina>1;if(sprinting)stamina=Math.max(0,stamina-32*dt);else stamina=Math.min(100,stamina+19*dt);if(moving){d.normalize().multiplyScalar((sprinting?7.8:4.4)*dt);player.position.x=THREE.MathUtils.clamp(player.position.x+d.x,-14.5,14.5);player.position.z=THREE.MathUtils.clamp(player.position.z+d.z,-38,35);player.rotation.y=yaw}return sprinting}
function interact(){if(!hasKey&&player.position.distanceTo(key.position)<2.8){hasKey=true;key.visible=false;ui.keyState.textContent="Chave coletada";ui.keyCheck.textContent="✓";ui.keyCheck.classList.add("on");ui.objective.textContent="Volte à entrada";ui.objectiveDetail.textContent="Chegue às portas principais e pressione E.";ui.progress.style.width="70%";ui.status.textContent="ENCONTRE A SAÍDA";toast("Chave encontrada! O portão está liberado. Volte à entrada.");return}if(player.position.distanceTo(exit)<5){if(hasKey){ui.progress.style.width="100%";finish(true)}else toast("O portão está trancado. Procure a chave!")}else toast("Chegue mais perto da chave ou da porta.")}
function chase(dt){const d=new THREE.Vector3(player.position.x-monster.position.x,0,player.position.z-monster.position.z),dist=d.length();if(dist>1.45){d.normalize();monster.position.addScaledVector(d,(dist<9?4.6:dist<17?3.6:2.7)*dt);monster.rotation.y=Math.atan2(d.x,d.z)}if(damageWait>0)damageWait-=dt;if(dist<1.85&&damageWait<=0){health=Math.max(0,health-25);damageWait=1.15;const away=new THREE.Vector3(player.position.x-monster.position.x,0,player.position.z-monster.position.z).normalize();player.position.addScaledVector(away,1.7);toast(`O monstro te pegou! -25 de vida (${health}/100).`);if(health<=0)finish(false)}}
function cameraUpdate(){if(!player)return;const target=new THREE.Vector3(player.position.x,1.55,player.position.z),dir=new THREE.Vector3(-Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),-Math.cos(yaw)*Math.cos(pitch));camera.position.copy(target).addScaledVector(dir,-3.7);camera.position.y+=.75;camera.lookAt(target.addScaledVector(dir,7));flash.position.set(player.position.x,1.8,player.position.z);flash.target.position.set(player.position.x-Math.sin(yaw)*10,1.15,player.position.z-Math.cos(yaw)*10);flash.intensity=flashOn?105:0}
function resize(){const w=canvas.clientWidth||900,h=canvas.clientHeight||550;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
function bind(){ui.start.addEventListener("click",()=>state==="paused"?(state="playing",ui.screen.classList.add("hidden"),ui.pause.textContent="Pausar jogo",renderer.domElement.requestPointerLock?.()):restart());ui.pause.addEventListener("click",pause);window.addEventListener("keydown",e=>{const k=e.key.toLowerCase();if(["w","a","s","d","e","f","shift","escape"].includes(k))e.preventDefault();down.add(k);if(k==="e"&&state==="playing")interact();if(k==="f"){flashOn=!flashOn;toast(flashOn?"Lanterna ligada":"Lanterna desligada")}if(k==="escape"&&state==="playing")pause()});window.addEventListener("keyup",e=>down.delete(e.key.toLowerCase()));document.addEventListener("mousemove",e=>{if(locked&&state==="playing"){yaw-=e.movementX*.0022;pitch=THREE.MathUtils.clamp(pitch-e.movementY*.0018,-.55,.3)}});document.addEventListener("pointerlockchange",()=>locked=document.pointerLockElement===renderer.domElement);canvas.addEventListener("click",()=>{if(state==="playing")renderer.domElement.requestPointerLock?.()});window.addEventListener("resize",resize)}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);if(state==="playing"){time+=dt;move(dt);chase(dt);if(monsterMixer)monsterMixer.update(dt);key.visible&&(key.rotation.y+=dt*.8,key.position.y=1.05+Math.sin(performance.now()*.002)*.12);cameraUpdate();hud()}else if(player)cameraUpdate();if(gateLeft&&gateRight){const amount=hasKey?2.25:0;gateLeft.position.x=THREE.MathUtils.damp(gateLeft.position.x,-1.55-amount,4,dt);gateRight.position.x=THREE.MathUtils.damp(gateRight.position.x,1.55+amount,4,dt)}if(ui.toast.classList.contains("visible")&&performance.now()-toastTime>2300)ui.toast.classList.remove("visible");renderer.render(scene,camera)}
async function init(){school();buildLighting();player=buildPlayer();monster=buildMonster();await Promise.all([loadKey(),loadCharacterModels()]);resize();bind();animate();ui.loading.classList.add("done");setTimeout(()=>ui.loading.remove(),650)}
function buildLighting(){scene.add(new THREE.HemisphereLight(0xc6d7f2,0x363025,.65));scene.add(new THREE.AmbientLight(0x9aa9bd,.22));const moon=new THREE.DirectionalLight(0xb7d2ff,2.8);moon.position.set(-12,24,18);moon.castShadow=true;moon.shadow.mapSize.set(1024,1024);scene.add(moon);flash=new THREE.SpotLight(0xffedc8,180,30,Math.PI/6,.62,2);flash.castShadow=true;flash.shadow.mapSize.set(512,512);scene.add(flash);scene.add(flash.target)}
init().catch(e=>{console.error(e);ui.detail.textContent="Falha ao iniciar. Abra o projeto com Live Server."});