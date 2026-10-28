// Carrega Three.js por duas CDNs para evitar travamento silencioso quando uma falhar.
let THREE;
try {
  THREE = await import('https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.js');
} catch (primaryError) {
  try {
    THREE = await import('https://unpkg.com/three@0.169.0/build/three.module.js');
  } catch (fallbackError) {
    const loading = document.getElementById('loading');
    if (loading) loading.innerHTML = '<strong>Não foi possível carregar o motor 3D.</strong><span>Confira a internet e abra o projeto pelo Live Server no VS Code. Depois, pressione F5.</span>';
    console.error('Falha ao carregar Three.js nas duas CDNs:', primaryError, fallbackError);
    throw fallbackError;
  }
}

const $ = (id) => document.getElementById(id);
const ui = {
  canvas: $('game-canvas'), loading: $('loading'), start: $('start-screen'),
  end: $('end-screen'), startButton: $('start-button'), restart: $('restart-button'),
  pause: $('pause-button'), status: $('status'), clock: $('clock'), timer: $('timer'),
  objective: $('objective'), detail: $('objective-detail'), progress: $('progress'),
  healthNumber: $('health-number'), healthLabel: $('health-label'), healthBar: $('health-bar'),
  staminaLabel: $('stamina-label'), staminaBar: $('stamina-bar'), batteryLabel: $('battery-label'),
  batteryBar: $('battery-bar'), keyState: $('key-state'), keyCheck: $('key-check'),
  tapeState: $('tape-state'), tapeCheck: $('tape-check'), lore: $('lore-note'),
  interaction: $('interaction'), toast: $('toast'), screenTitle: $('screen-title'),
  screenCopy: $('screen-copy'), endKicker: $('end-kicker'), endTitle: $('end-title'),
  endCopy: $('end-copy')
};

let scene, camera, renderer, clock, player, monster, keyObject, tapeObject, gate, flashlight;
let running = false, paused = false, ended = false, hasKey = false, hasTape = false;
let health = 100, stamina = 100, battery = 100, elapsed = 0, damageCooldown = 0;
let toastTimer = 0, nearestInteractable = null, monsterState = 'patrol', stateTimer = 0;
let monsterTarget = new THREE.Vector3(), monsterSpeed = 2.05, lastFootstep = 0, footstepCounter = 0;
const keys = new Set();
const world = { width: 42, length: 64, walls: [], objects: [], ambient: null };
const vecForward = new THREE.Vector3(), vecRight = new THREE.Vector3(), moveDir = new THREE.Vector3();
const raycaster = new THREE.Raycaster();
const roomNotes = [
  '“Se ouvir alguém chamar pelo seu nome, não responda.”',
  '“O último sinal tocou depois que todos já tinham ido embora.”',
  '“Não é o eco. O eco sempre responde atrasado.”',
  '“A sala 13 não aparece na planta antiga.”'
];

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x090c10);
  scene.fog = new THREE.FogExp2(0x11161b, 0.026);
  camera = new THREE.PerspectiveCamera(72, 1, 0.1, 180);
  camera.rotation.order = 'YXZ';
  renderer = new THREE.WebGLRenderer({ canvas: ui.canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  clock = new THREE.Clock();
  buildLighting();
  buildSchool();
  buildPlayer();
  buildMonster();
  buildInteractables();
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', e => keys.delete(e.code));
  ui.startButton.addEventListener('click', startGame);
  ui.restart.addEventListener('click', resetGame);
  ui.pause.addEventListener('click', togglePause);
  ui.canvas.addEventListener('click', () => { if (running && !paused && !ended) ui.canvas.requestPointerLock?.(); });
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement !== ui.canvas && running && !paused && !ended) {
      // Pointer lock can be released by the browser; keyboard play remains available.
    }
  });
  ui.loading.style.display = 'none';
  renderer.setAnimationLoop(animate);
}

function buildLighting() {
  const hemi = new THREE.HemisphereLight(0x91a0ae, 0x17110f, 0.72);
  scene.add(hemi);
  const ambient = new THREE.AmbientLight(0x8a9aaa, 0.22); scene.add(ambient);
  const moon = new THREE.DirectionalLight(0x9daec3, 1.15);
  moon.position.set(-12, 22, 5); moon.castShadow = true;
  moon.shadow.mapSize.set(1024, 1024);
  moon.shadow.camera.left = -38; moon.shadow.camera.right = 38;
  moon.shadow.camera.top = 38; moon.shadow.camera.bottom = -38;
  moon.shadow.bias = -0.00025; scene.add(moon);
  const flicker = new THREE.PointLight(0xb94b37, 5, 12, 2);
  flicker.position.set(0, 2.5, -14); scene.add(flicker);
  const flicker2 = new THREE.PointLight(0x8a9bb2, 2.6, 10, 2);
  flicker2.position.set(-11, 2.4, -32); scene.add(flicker2);
  world.ambient = { flicker, flicker2 };
  flashlight = new THREE.SpotLight(0xe0e8ed, 38, 24, Math.PI / 7, 0.45, 1.4);
  flashlight.castShadow = true;
  flashlight.shadow.mapSize.set(512, 512);
  flashlight.position.set(0, 0, 0);
  flashlight.target.position.set(0, 0, -1);
  camera.add(flashlight); camera.add(flashlight.target); scene.add(camera);
}

function material(color, roughness = 0.92, extra = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: extra.metalness ?? 0, ...extra });
}
const mats = {
  floor: material(0x343638), wall: material(0x6b6b64), darkWall: material(0x393d3f),
  trim: material(0x24292b), tile: material(0x4a4b47), wood: material(0x51443a),
  metal: material(0x343b40, 0.56, { metalness: 0.72 }), rust: material(0x67443a, 0.86),
  paper: material(0xb8b2a2), black: material(0x090b0e), red: material(0x6b1f22),
  glass: material(0x7c9195, 0.18, { metalness: 0.2, transparent: true, opacity: 0.26 })
};

try {
  init();
} catch (error) {
  console.error('Falha ao inicializar A Lenda do Grito:', error);
  if (ui.loading) {
    ui.loading.style.display = 'flex';
    ui.loading.innerHTML = '<strong>Falha ao montar o cenário 3D.</strong><span>Abra o console do navegador (F12 → Console) para ver o erro. Use Live Server e atualize com Ctrl+F5.</span>';
  }
}

function addBox(name, x, y, z, sx, sy, sz, mat, shadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  mesh.name = name; mesh.position.set(x, y, z);
  mesh.castShadow = shadow; mesh.receiveShadow = true; scene.add(mesh);
  world.objects.push(mesh);
  return mesh;
}
function addWall(x, y, z, sx, sy, sz, mat = mats.wall) {
  const wall = addBox('wall', x, y, z, sx, sy, sz, mat);
  world.walls.push({ minX: x - sx/2, maxX: x + sx/2, minZ: z - sz/2, maxZ: z + sz/2 });
  return wall;
}
function addLamp(x, z, color = 0xc6d0d2) {
  const fixture = addBox('lamp-fixture', x, 3.85, z, 1.3, 0.08, 0.25, material(0x8a8f8d, 0.55));
  const light = new THREE.PointLight(color, 2.1, 9, 2);
  light.position.set(x, 3.55, z); scene.add(light);
  return light;
}
function buildSchool() {
  // Main floor and ceiling silhouette.
  addBox('floor', 0, -0.16, -25, 42, 0.3, 64, mats.floor, false);
  addBox('ceiling', 0, 4.5, -25, 42, 0.25, 64, mats.darkWall, false);
  addWall(-21, 2, -25, 0.6, 4, 64, mats.darkWall);
  addWall(21, 2, -25, 0.6, 4, 64, mats.darkWall);
  addWall(0, 2, 7, 42, 4, 0.6, mats.darkWall);
  addWall(0, 2, -57, 42, 4, 0.6, mats.darkWall);

  // Long hallway with side classroom alcoves and staggered partitions.
  for (let z = 1; z > -55; z -= 8) {
    addBox('floor-tile', 0, 0.005, z - 3.5, 9.5, 0.02, 7.4, mats.tile, false);
    addLamp(0, z - 3);
  }
  // Classroom partition walls deliberately leave door-sized gaps.
  for (const z of [-5, -17, -29, -41]) {
    addWall(-14.5, 1.9, z, 13, 3.8, 0.5, mats.wall);
    addWall(14.5, 1.9, z, 13, 3.8, 0.5, mats.wall);
    addWall(-8.5, 1.9, z + 5.5, 0.5, 3.8, 5.5, mats.wall);
    addWall(8.5, 1.9, z + 5.5, 0.5, 3.8, 5.5, mats.wall);
  }
  // Classroom furniture: desks, chairs, lockers, shelves, scattered debris.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const z = -7 - i * 9.1;
      const x = side * (11 + (i % 2) * 2.3);
      addBox('desk-top', x, 1.05, z, 2.0, 0.13, 1.25, mats.wood);
      for (const dx of [-0.78, 0.78]) for (const dz of [-0.42, 0.42]) addBox('desk-leg', x+dx, 0.53, z+dz, 0.09, 1, 0.09, mats.metal);
      addBox('chair-seat', x + 0.3, 0.56, z + 1.25, 0.8, 0.12, 0.8, mats.wood);
      addBox('chair-back', x + 0.3, 1.02, z + 1.62, 0.8, 0.82, 0.1, mats.wood);
    }
    for (let i=0; i<4; i++) {
      const z = -10 - i*11;
      addBox('locker', side*19.25, 1.45, z, 2.4, 2.9, 0.75, mats.metal);
      for (let j=0;j<3;j++) addBox('locker-vent', side*19.25, 2.1+j*0.18, z-0.2, 0.03, 0.035, 0.36, mats.black, false);
    }
  }
  // A few broken windows on the right wall.
  for (let z=-11; z>-48; z-=10) {
    addBox('window-frame', 20.62, 2.65, z, 0.12, 1.45, 3.1, mats.metal);
    addBox('window-glass', 20.54, 2.65, z, 0.06, 1.25, 2.85, mats.glass, false);
    addBox('window-cross', 20.48, 2.65, z, 0.08, 1.3, 0.07, mats.metal);
  }
  // School signs and environmental storytelling.
  const sign = addBox('sign-board', -4.5, 2.65, -6.65, 2.8, 0.8, 0.08, mats.black);
  const signText = makeLabel('BLOCO B  /  SALAS 08—13', '#d4c9b8');
  signText.position.set(-4.5, 2.65, -6.58); scene.add(signText);
  addBox('blood-smear', 0, 0.012, -35, 1.1, 0.008, 2.6, mats.red, false).rotation.y = 0.32;
  // A toppled display case.
  const caseBody = addBox('display-case', -4.5, 0.52, -25, 2.6, 1, 0.8, mats.wood);
  caseBody.rotation.z = 0.13;
  addBox('glass-shard', -4.2, 0.12, -23.7, 0.7, 0.025, 0.9, mats.glass, false).rotation.y = 0.4;
  // Entrance and double metal gate.
  addBox('entry-frame-top', 0, 3.6, 5.95, 7.4, 0.35, 0.45, mats.metal);
  addBox('entry-frame-left', -3.55, 1.8, 5.95, 0.3, 3.6, 0.45, mats.metal);
  addBox('entry-frame-right', 3.55, 1.8, 5.95, 0.3, 3.6, 0.45, mats.metal);
  gate = new THREE.Group();
  const left = new THREE.Mesh(new THREE.BoxGeometry(3.4, 3.25, 0.22), mats.metal);
  left.position.x = -1.7; left.castShadow = true; left.receiveShadow = true;
  const right = left.clone(); right.position.x = 1.7;
  gate.add(left, right);
  for (let x=-3.1; x<=3.1; x+=0.52) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.25, 0.28), mats.rust);
    bar.position.set(x, 0, 0); gate.add(bar);
  }
  gate.position.set(0, 1.65, 5.7); scene.add(gate);
  gate.userData.open = false;
  // Distant silhouettes to prevent the level from feeling like a blank box.
  for (let i=0;i<7;i++) {
    const pillar = addBox('pillar', (i%2 ? -1 : 1)*(16 + (i%3)), 2, -50+i*7, 0.6, 4, 0.6, mats.darkWall);
    pillar.rotation.z = (i%2 ? 1 : -1)*0.02;
  }
}
function makeLabel(text, color) {
  const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 96;
  const ctx = canvas.getContext('2d'); ctx.clearRect(0,0,512,96);
  ctx.fillStyle = color; ctx.font = 'bold 30px monospace'; ctx.textAlign = 'center'; ctx.fillText(text,256,57);
  const tex = new THREE.CanvasTexture(canvas);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2,0.6), new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide}));
  return mesh;
}
function buildPlayer() {
  player = { position: new THREE.Vector3(0, 0, 3.2), yaw: Math.PI, pitch: 0, crouching: false, moving: false, running: false };
  camera.position.copy(player.position); camera.position.y = 1.68;
}
function buildMonster() {
  monster = new THREE.Group();
  const bodyMat = material(0x111316, 0.98);
  const pale = material(0x777b79, 0.92);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.47, 1.15, 4, 8), bodyMat);
  torso.position.y = 1.65; torso.scale.set(0.72,1,0.7); torso.castShadow = true; monster.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), pale);
  head.position.set(0,2.62,0); head.scale.set(0.82,1.25,0.65); head.castShadow = true; monster.add(head);
  const face = new THREE.Mesh(new THREE.BoxGeometry(0.27,0.52,0.05), mats.black);
  face.position.set(0,2.58,-0.28); monster.add(face);
  for (const x of [-0.14,0.14]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035,8,6), new THREE.MeshBasicMaterial({color:0xd9483e}));
    eye.position.set(x,2.7,-0.32); monster.add(eye);
  }
  for (const side of [-1,1]) {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.11,1.05,3,6), bodyMat);
    arm.position.set(side*0.46,1.55,-0.02); arm.rotation.z = side*0.12; arm.castShadow = true; monster.add(arm);
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.13,0.75,3,6), bodyMat);
    leg.position.set(side*0.2,0.52,0.02); monster.add(leg);
  }
  // Long, crooked silhouette spikes.
  for (let i=0;i<3;i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.11,0.8,5), bodyMat);
    spike.position.set((i-1)*0.22,3.12,-0.03); spike.rotation.z=(i-1)*0.28; monster.add(spike);
  }
  monster.position.set(0,0,-42); monster.visible = true; scene.add(monster);
  monster.userData.patrolPoints = [new THREE.Vector3(-13,0,-15),new THREE.Vector3(13,0,-23),new THREE.Vector3(-11,0,-38),new THREE.Vector3(10,0,-47)];
  monster.userData.patrolIndex = 0;
}
function makePickup(color, type) {
  const group = new THREE.Group();
  const core = new THREE.Mesh(new THREE.BoxGeometry(type==='key'?0.22:0.55, type==='key'?0.08:0.36, type==='key'?0.08:0.06), material(color,0.45,{metalness:type==='key'?0.8:0.1,emissive:color,emissiveIntensity:0.16}));
  core.castShadow=true; group.add(core);
  if (type==='key') {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13,0.035,6,12), material(color,0.4,{metalness:0.8}));
    ring.position.x=-0.18; group.add(ring);
    const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.06,0.13,0.07), material(color,0.4,{metalness:0.8}));
    tooth.position.set(0.11,-0.08,0); group.add(tooth);
  } else {
    const reel = new THREE.Mesh(new THREE.BoxGeometry(0.13,0.13,0.08), mats.black); group.add(reel);
  }
  group.userData.kind=type; scene.add(group); return group;
}
function buildInteractables() {
  keyObject=makePickup(0xe0b35e,'key'); keyObject.position.set(11.2,0.8,-44.5);
  tapeObject=makePickup(0x9eaaa6,'tape'); tapeObject.position.set(-11.4,0.7,-26.2);
}
function resize() {
  const rect = ui.canvas.getBoundingClientRect();
  const w = Math.max(1,rect.width), h = Math.max(1,rect.height);
  renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix();
}
function startGame() {
  if (ended) resetGame();
  running=true; paused=false; ui.start.classList.add('hidden'); ui.end.classList.add('hidden'); ui.startButton.textContent='Entrar na escola';
  ui.pause.disabled=false; ui.pause.innerHTML='Pausar jogo <span>Ⅱ</span>';
  ui.status.textContent='EXPLORAÇÃO'; clock.getDelta();
  ui.canvas.requestPointerLock?.();
  showToast('A escola está escutando. Controle seus passos.');
}
function resetGame() {
  player.position.set(0,0,3.2); player.yaw=Math.PI; player.pitch=0;
  monster.position.set(0,0,-42); monsterState='patrol'; monster.userData.patrolIndex=0;
  hasKey=false;hasTape=false;health=100;stamina=100;battery=100;elapsed=0;damageCooldown=0;
  if (gate) { gate.position.x=0; gate.userData.open=false; }
  keyObject.visible=true;tapeObject.visible=true;
  ended=false;running=false;paused=false;
  ui.keyState.textContent='Não localizada';ui.keyCheck.textContent='○';ui.keyCheck.classList.remove('on');
  ui.tapeState.textContent='Não encontrada';ui.tapeCheck.textContent='○';ui.tapeCheck.classList.remove('on');
  ui.lore.textContent=roomNotes[0];ui.start.classList.remove('hidden');ui.end.classList.add('hidden');
  ui.pause.disabled=true;ui.pause.innerHTML='Pausar jogo <span>Ⅱ</span>';
  updateHud();ui.objective.textContent='Encontre a chave';ui.detail.textContent='Procure nas salas próximas. Não faça barulho sem necessidade.';
  ui.progress.style.width='12%';camera.position.set(0,1.68,3.2);camera.rotation.set(0,Math.PI,0);
}
function onKeyDown(e) {
  if (['KeyW','KeyA','KeyS','KeyD','ShiftLeft','ControlLeft','KeyE','KeyF','Escape','Space'].includes(e.code)) e.preventDefault();
  if (e.code==='Escape' && running && !ended) { togglePause(); return; }
  if (e.code==='KeyE' && running && !paused && !ended) interact();
  if (e.code==='KeyF' && running && !paused && !ended) {
    if (battery>0) { flashlight.visible=!flashlight.visible; showToast(flashlight.visible?'Lanterna ligada':'Lanterna desligada'); }
    else showToast('Bateria descarregada.');
  }
  if (e.code==='KeyC' || e.code==='ControlLeft') player.crouching=true;
  keys.add(e.code);
}
function onMouseMove(e) {
  if (!running || paused || ended) return;
  if (document.pointerLockElement !== ui.canvas && e.buttons!==1) return;
  player.yaw -= e.movementX * 0.0022;
  player.pitch -= e.movementY * 0.0018;
  player.pitch=THREE.MathUtils.clamp(player.pitch,-1.15,1.15);
  camera.rotation.set(player.pitch,player.yaw,0,'YXZ');
}
function togglePause() {
  if (!running || ended) return;
  paused=!paused;
  if (paused) {
    ui.start.classList.remove('hidden');ui.screenTitle.textContent='Pausa — escute o silêncio';
    ui.screenCopy.textContent='A criatura também parece ter parado. Retome quando estiver pronto.';
    ui.startButton.textContent='Continuar';ui.pause.innerHTML='Retomar jogo <span>▶</span>';
    document.exitPointerLock?.();
  } else {
    ui.start.classList.add('hidden');ui.pause.innerHTML='Pausar jogo <span>Ⅱ</span>';
    ui.canvas.requestPointerLock?.();clock.getDelta();
  }
}
function interact() {
  if (!nearestInteractable) { showToast('Nada ao alcance.'); return; }
  if (nearestInteractable===keyObject) {
    hasKey=true;keyObject.visible=false;ui.keyState.textContent='Coletada';ui.keyCheck.textContent='✓';ui.keyCheck.classList.add('on');
    ui.objective.textContent='Volte ao portão';ui.detail.textContent='A chave serve na saída principal. A entidade ficou mais agitada.';
    ui.progress.style.width='72%';monsterState='investigate';stateTimer=0;showToast('Chave da portaria encontrada. Você ouviu algo se mover.');
  } else if (nearestInteractable===tapeObject) {
    hasTape=true;tapeObject.visible=false;ui.tapeState.textContent='Coletada';ui.tapeCheck.textContent='✓';ui.tapeCheck.classList.add('on');
    ui.lore.textContent=roomNotes[(Math.floor(Math.random()*3)+1)%roomNotes.length];
    showToast('Gravação recuperada. A voz parece repetir seus passos.');
    // The sound of the interaction attracts the entity.
    monsterState='investigate';stateTimer=0;
  } else if (nearestInteractable==='gate') {
    if (!hasKey) { showToast('Portão trancado. Falta a chave da portaria.'); return; }
    gate.userData.open=true;showToast('O portão range. Corra para a saída!');
    ui.objective.textContent='Escape da escola';ui.detail.textContent='O portão abriu. Atravesse a entrada para concluir a fuga.';
    ui.progress.style.width='92%';
  }
}
function showToast(message) {
  ui.toast.textContent=message;ui.toast.classList.add('show');toastTimer=2.8;
}
function updateHud() {
  health=Math.max(0,Math.min(100,health));stamina=Math.max(0,Math.min(100,stamina));battery=Math.max(0,Math.min(100,battery));
  ui.healthNumber.innerHTML=`${Math.ceil(health)} <small>/ 100</small>`;
  ui.healthLabel.textContent=`${Math.ceil(health)}%`;ui.healthBar.style.width=`${health}%`;
  ui.staminaLabel.textContent=`${Math.ceil(stamina)}%`;ui.staminaBar.style.width=`${stamina}%`;
  ui.batteryLabel.textContent=`${Math.ceil(battery)}%`;ui.batteryBar.style.width=`${battery}%`;
  const t=Math.floor(elapsed);const time=`${String(Math.floor(t/60)).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`;
  ui.timer.textContent=time;ui.clock.textContent=time;
}
function collides(x,z,r=0.42) {
  if (x < -19.8+r || x > 19.8-r || z < -56.2+r || z > 6.6-r) return true;
  for (const w of world.walls) {
    if (x+r>w.minX && x-r<w.maxX && z+r>w.minZ && z-r<w.maxZ) return true;
  }
  // Collision against desks/lockers; only objects that block movement.
  for (const o of world.objects) {
    if (!['desk-top','locker','display-case','pillar','chair-seat'].includes(o.name)) continue;
    const b=new THREE.Box3().setFromObject(o);
    if (x+r>b.min.x && x-r<b.max.x && z+r>b.min.z && z-r<b.max.z) return true;
  }
  return false;
}
function moveTowards(entity, target, speed, dt) {
  const dx=target.x-entity.position.x,dz=target.z-entity.position.z;
  const d=Math.hypot(dx,dz);
  if (d>0.03) {
    const step=Math.min(d,speed*dt);
    const nx=entity.position.x+dx/d*step,nz=entity.position.z+dz/d*step;
    if (!collides(nx,nz,0.48)) { entity.position.x=nx;entity.position.z=nz; }
    else {
      const sidestep=entity.position.x+Math.sign(-dz)*step;
      const other=entity.position.z+Math.sign(dx)*step;
      if (!collides(sidestep,entity.position.z,0.48)) entity.position.x=sidestep;
      else if (!collides(entity.position.x,other,0.48)) entity.position.z=other;
    }
    entity.rotation.y=Math.atan2(dx,dz);
  }
  return d;
}
function updatePlayer(dt) {
  const forward=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0);
  const strafe=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);
  player.moving=forward!==0||strafe!==0;
  player.running=keys.has('ShiftLeft')||keys.has('ShiftRight');
  player.crouching=keys.has('ControlLeft')||keys.has('ControlRight')||keys.has('KeyC');
  const canRun=player.running&&!player.crouching&&stamina>0&&player.moving;
  const speed=player.crouching?1.45:(canRun?5.7:3.15);
  vecForward.set(-Math.sin(player.yaw),0,-Math.cos(player.yaw));
  vecRight.set(Math.cos(player.yaw),0,-Math.sin(player.yaw));
  moveDir.set(0,0,0).addScaledVector(vecForward,forward).addScaledVector(vecRight,strafe);
  if(moveDir.lengthSq()>0) moveDir.normalize();
  const nx=player.position.x+moveDir.x*speed*dt,nz=player.position.z+moveDir.z*speed*dt;
  if(!collides(nx,player.position.z)) player.position.x=nx;
  if(!collides(player.position.x,nz)) player.position.z=nz;
  if(canRun) stamina-=23*dt; else stamina+= (player.moving?8:17)*dt;
  if(player.crouching) stamina+=7*dt;
  stamina=THREE.MathUtils.clamp(stamina,0,100);
  camera.position.set(player.position.x,player.crouching?1.05:1.68,player.position.z);
  const bob=player.moving?(canRun?0.075:0.035):0;
  camera.position.y+=(Math.sin(elapsed*(canRun?15:9))*bob);
  if (flashlight.visible) battery-=0.18*dt;
  if (battery<=0) {battery=0;flashlight.visible=false;}
  // Running is loud and increases the chance of being detected.
  const footstepInterval=player.crouching?0.72:(canRun?0.27:0.52);
  lastFootstep+=dt;
  if(player.moving&&lastFootstep>footstepInterval) {
    lastFootstep=0;footstepCounter++;
    if(!player.crouching && (canRun || Math.random()<0.24)) {
      const dist=monster.position.distanceTo(player.position);
      if(dist<27) {monsterState='investigate';stateTimer=0;monsterTarget.copy(player.position);}
    }
  }
  // The gate only counts as an escape after the key has opened it.
  if(gate.userData.open && player.position.z>5.9 && Math.abs(player.position.x)<3.6) finishGame(true);
}
function updateMonster(dt) {
  if(!running||paused||ended) return;
  const dist=monster.position.distanceTo(player.position);
  stateTimer+=dt;
  if(monsterState==='patrol') {
    const points=monster.userData.patrolPoints;
    let target=points[monster.userData.patrolIndex];
    if(monster.position.distanceTo(target)<1.3) monster.userData.patrolIndex=(monster.userData.patrolIndex+1)%points.length;
    target=points[monster.userData.patrolIndex];
    // Sprinting in the hallway is easier to hear than to see.
    if(dist<11 || (player.running&&dist<27)) {monsterState='chase';stateTimer=0;}
    else moveTowards(monster,target,1.35,dt);
  } else if(monsterState==='investigate') {
    if(stateTimer<2.8) moveTowards(monster,monsterTarget,2.15,dt);
    else if(dist<13) {monsterState='chase';stateTimer=0;}
    else {monsterState='patrol';stateTimer=0;}
    if(dist<8) {monsterState='chase';stateTimer=0;}
  } else if(monsterState==='chase') {
    const speed=dist<5?3.55:2.85;
    moveTowards(monster,player.position,speed,dt);
    if(dist>30) {monsterState='investigate';monsterTarget.copy(player.position);stateTimer=0;}
    if(dist<1.45 && damageCooldown<=0) {
      health-=25;damageCooldown=1.25;showToast('A entidade te alcançou! Afaste-se!');
      // Brief red flash without blinding the whole screen.
      ui.canvas.style.filter='sepia(.3) saturate(1.5)';
      setTimeout(()=>{ui.canvas.style.filter='';},180);
      if(health<=0) finishGame(false);
    }
  }
  damageCooldown=Math.max(0,damageCooldown-dt);
  // Distinctive head sway and a threatening lean while chasing.
  monster.children[1].rotation.z=Math.sin(elapsed*4.4)*(monsterState==='chase'?0.28:0.1);
  monster.position.y=0.035*Math.sin(elapsed*5);
  if(dist<13 && monsterState==='chase') ui.status.textContent='AMEAÇA PRÓXIMA';
  else if(monsterState==='investigate') ui.status.textContent='SOM DETECTADO';
  else ui.status.textContent='EXPLORAÇÃO';
}
function updateInteractables() {
  nearestInteractable=null;let best=2.5;
  const check=(obj,label)=> {
    if(!obj.visible) return;
    const d=obj.position.distanceTo(player.position);
    if(d<best){best=d;nearestInteractable=obj;ui.interaction.textContent=`[E] ${label}`;}
  };
  check(keyObject,'PEGAR A CHAVE');check(tapeObject,'OUVIR GRAVAÇÃO');
  const gatePos=new THREE.Vector3(0,1.5,5.65);
  if(player.position.distanceTo(gatePos)<4.4 && !gate.userData.open) {
    if(4.4<best+1.5 || !nearestInteractable){nearestInteractable='gate';ui.interaction.textContent='[E] ABRIR PORTÃO';}
  }
  ui.interaction.classList.toggle('visible',!!nearestInteractable&&running&&!paused&&!ended);
}
function animate() {
  const dt=Math.min(clock.getDelta(),0.05);
  if(running&&!paused&&!ended) {
    elapsed+=dt;updatePlayer(dt);updateMonster(dt);updateInteractables();
    if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)ui.toast.classList.remove('show');}
    // Tiny electrical light fluctuations: readable silhouettes, not total darkness.
    world.ambient.flicker.intensity=4.1+Math.sin(elapsed*8.3)*0.55+(Math.random()<0.015? -2.3:0);
    world.ambient.flicker2.intensity=2.1+Math.sin(elapsed*3.7)*0.35;
    keyObject.rotation.y+=dt*0.8;keyObject.position.y=0.8+Math.sin(elapsed*2)*0.07;
    tapeObject.rotation.y+=dt*0.45;
    if(gate.userData.open) {
      gate.position.x=THREE.MathUtils.lerp(gate.position.x,4.3,dt*1.1);
      for(const child of gate.children) child.material=mats.metal;
    }
    updateHud();
  } else if(paused) {
    // No simulation advances while paused.
  } else {
    // Idle ambience motion keeps the scene alive behind the title screen.
    const t=performance.now()*0.001;
    world.ambient.flicker.intensity=3.6+Math.sin(t*3)*0.3;
  }
  renderer.render(scene,camera);
}
function finishGame(won) {
  if(ended)return;
  ended=true;running=false;paused=false;document.exitPointerLock?.();
  ui.end.classList.remove('hidden');ui.start.classList.add('hidden');ui.pause.disabled=true;
  if(won) {
    ui.endKicker.textContent='REGISTRO DE FUGA';ui.endTitle.textContent='Você saiu. Mas não veio sozinho.';
    ui.endCopy.textContent=`Você escapou em ${ui.timer.textContent}. A gravação captou um segundo conjunto de passos atrás de você.`;
    ui.progress.style.width='100%';ui.status.textContent='FUGA REGISTRADA';
  } else {
    ui.endKicker.textContent='SINAL PERDIDO';ui.endTitle.textContent='O grito encontrou você.';
    ui.endCopy.textContent='A gravação termina com uma porta batendo. A escola voltou ao silêncio — por enquanto.';
    ui.status.textContent='SINAL PERDIDO';
  }
  ui.restart.focus();
}
