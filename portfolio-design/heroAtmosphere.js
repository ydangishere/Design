import * as THREE from 'three';

export function createHeroAtmosphere(container) {
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }

  const canvas = document.createElement('canvas');
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '0';
  container.insertBefore(canvas, container.firstChild);

  function getSize() {
    const r = container.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }
  let { w, h } = getSize();

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.z = 10;

  // ---------- textures ----------
  function makeDotTexture() {
    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,240,210,1)');
    g.addColorStop(0.4, 'rgba(245,217,168,0.6)');
    g.addColorStop(1, 'rgba(245,217,168,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }
  function makeGlowTexture() {
    const c = document.createElement('canvas');
    c.width = 128; c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,244,214,1)');
    g.addColorStop(0.25, 'rgba(255,221,150,0.85)');
    g.addColorStop(0.6, 'rgba(250,200,110,0.25)');
    g.addColorStop(1, 'rgba(250,200,110,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }
  function makeNebulaTexture() {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = size; c.height = size;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    const blobs = [
      { x: 0.42, y: 0.5, r: 0.30, color: '245,217,168', a: 0.5 },
      { x: 0.58, y: 0.42, r: 0.26, color: '190,150,190', a: 0.32 },
      { x: 0.5, y: 0.62, r: 0.24, color: '150,170,190', a: 0.22 },
      { x: 0.35, y: 0.35, r: 0.20, color: '210,180,150', a: 0.28 },
      { x: 0.65, y: 0.6, r: 0.22, color: '160,140,175', a: 0.22 },
    ];
    ctx.globalCompositeOperation = 'lighter';
    blobs.forEach(b => {
      const cx = b.x * size, cy = b.y * size, r = b.r * size;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0, `rgba(${b.color},${b.a})`);
      grad.addColorStop(0.5, `rgba(${b.color},${b.a * 0.35})`);
      grad.addColorStop(1, `rgba(${b.color},0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-atop';
    const imgData = ctx.getImageData(0, 0, size, size);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 14;
      d[i] = Math.max(0, Math.min(255, d[i] + n));
      d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
      d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
    }
    ctx.putImageData(imgData, 0, 0);
    return new THREE.CanvasTexture(c);
  }

  const dustTex = makeDotTexture();
  const glowTex = makeGlowTexture();
  const nebulaTex = makeNebulaTexture();

  // ---------- dust particles (orbit motion, biased to the RIGHT, away from the portrait) ----------
  const COUNT = 50;               // reduced to about 60% of the previous 84 particles
  const rangeY = 7.8, rangeZ = 7.8;
  const PX_MIN = -0.8, PX_MAX = 5.7; // keeps particles clear of the left-side portrait
  const cols = 14, rows = 10;
  const centers = [];
  let idx = 0;
  for (let c = 0; c < cols && idx < COUNT; c++) {
    for (let r = 0; r < rows && idx < COUNT; r++) {
      if (Math.random() < 0.72) {
        const cellW = (PX_MAX - PX_MIN) / cols;
        const gx = PX_MIN + (c / cols) * (PX_MAX - PX_MIN) + (Math.random() - 0.5) * cellW;
        const gy = (r / rows - 0.5) * rangeY + (Math.random() - 0.5) * (rangeY / rows);
        centers.push([gx, gy, (Math.random() - 0.5) * rangeZ]);
        idx++;
      }
    }
  }
  for (; idx < COUNT; idx++) {
    centers.push([PX_MIN + Math.random() * (PX_MAX - PX_MIN), (Math.random() - 0.5) * rangeY, (Math.random() - 0.5) * rangeZ]);
  }

  const glowRatio = 0.02; // 2% of particles glow
  const indices = [...Array(COUNT).keys()];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const glowCount = Math.max(1, Math.round(COUNT * glowRatio));
  const glowSet = new Set(indices.slice(0, glowCount));
  const normalCount = COUNT - glowCount;

  function makeOrbitArrays(n) {
    return {
      cx: new Float32Array(n), cy: new Float32Array(n), cz: new Float32Array(n),
      radius: new Float32Array(n), speed: new Float32Array(n), phase: new Float32Array(n),
      squash: new Float32Array(n), zDrift: new Float32Array(n), wobble: new Float32Array(n),
    };
  }
  const nOrb = makeOrbitArrays(normalCount);
  const gOrb = makeOrbitArrays(glowCount);
  const nPos = new Float32Array(normalCount * 3);
  const gPos = new Float32Array(glowCount * 3);

  const SPEED_BOOST = 1.75;
  let ni = 0, gi = 0;
  for (let i = 0; i < COUNT; i++) {
    const [cx, cy, cz] = centers[i];
    const radius = 0.65 + Math.random() * 1.45;
    const speed = (0.09 + Math.random() * 0.18) * SPEED_BOOST;
    const phase = Math.random() * Math.PI * 2;
    const squash = 0.5 + Math.random() * 0.55;
    const zDrift = 0.16 + Math.random() * 0.32;
    const wobble = 0.12 + Math.random() * 0.26;
    if (glowSet.has(i)) {
      gOrb.cx[gi] = cx; gOrb.cy[gi] = cy; gOrb.cz[gi] = cz;
      gOrb.radius[gi] = radius; gOrb.speed[gi] = speed; gOrb.phase[gi] = phase; gOrb.squash[gi] = squash;
      gOrb.zDrift[gi] = zDrift; gOrb.wobble[gi] = wobble;
      gi++;
    } else {
      nOrb.cx[ni] = cx; nOrb.cy[ni] = cy; nOrb.cz[ni] = cz;
      nOrb.radius[ni] = radius; nOrb.speed[ni] = speed; nOrb.phase[ni] = phase; nOrb.squash[ni] = squash;
      nOrb.zDrift[ni] = zDrift; nOrb.wobble[ni] = wobble;
      ni++;
    }
  }

  const normalGeo = new THREE.BufferGeometry();
  normalGeo.setAttribute('position', new THREE.BufferAttribute(nPos, 3));
  const normalMat = new THREE.PointsMaterial({
    size: 0.12, map: dustTex, transparent: true, opacity: 0.32,
    depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(0xf5d9a8),
  });
  const normalPoints = new THREE.Points(normalGeo, normalMat);

  const glowGeo = new THREE.BufferGeometry();
  glowGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
  const glowMat = new THREE.PointsMaterial({
    size: 0.34, map: glowTex, transparent: true, opacity: 0.75,
    depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(0xffdca0),
  });
  const glowPoints = new THREE.Points(glowGeo, glowMat);

  const dustGroup = new THREE.Group();
  dustGroup.add(normalPoints, glowPoints);
  scene.add(dustGroup);

  // ---------- nebula cloud: faint, breathing, disperses on hover, right side only ----------
  const smokeGroup = new THREE.Group();
  const SMOKE_COUNT = 4;
  const smokeSprites = [];
  for (let i = 0; i < SMOKE_COUNT; i++) {
    const baseOpacity = 0.04 + Math.random() * 0.025; // very faint
    const smokeMat = new THREE.SpriteMaterial({
      map: nebulaTex, transparent: true, opacity: baseOpacity,
      depthWrite: false, blending: THREE.AdditiveBlending, rotation: Math.random() * Math.PI * 2,
    });
    const sprite = new THREE.Sprite(smokeMat);
    const baseScale = 3.0 + Math.random() * 2.2; // small cluster size
    sprite.scale.set(baseScale, baseScale, 1);
    const baseX = 2.0 + Math.random() * 2.5; // right side, clear of the portrait
    const baseY = (Math.random() - 0.5) * rangeY * 0.9;
    sprite.position.set(baseX, baseY, -3 - Math.random() * 2);
    smokeSprites.push({
      sprite, driftSpeed: (0.015 + Math.random() * 0.015), phase: Math.random() * Math.PI * 2,
      baseX, baseY, baseScale, baseOpacity,
      breathSpeed: 0.12 + Math.random() * 0.08, breathPhase: Math.random() * Math.PI * 2,
      hover: 0, jx: Math.random() * 100, jy: Math.random() * 100,
    });
    smokeGroup.add(sprite);
  }
  scene.add(smokeGroup);

  // ---------- mouse tracking (parallax + hover-disperse on nebula) ----------
  let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
  let mousePx = -9999, mousePy = -9999;
  function onMouseMove(e) {
    const r = container.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    targetX = (x - 0.5) * 1.2;
    targetY = (y - 0.5) * 1.2;
    mousePx = e.clientX - r.left;
    mousePy = e.clientY - r.top;
  }
  function onMouseLeave() { mousePx = -9999; mousePy = -9999; }
  window.addEventListener('mousemove', onMouseMove);
  container.addEventListener('mouseleave', onMouseLeave);

  let running = true;
  function onVisibility() { running = !document.hidden; }
  document.addEventListener('visibilitychange', onVisibility);

  // ---------- responsive: fewer particles + no parallax on small screens ----------
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  if (isMobile) {
    normalMat.size *= 0.8;
  }

  const clock = new THREE.Clock();
  const _v = new THREE.Vector3();
  const HOVER_RADIUS_PX = 220;
  let raf = null;

  function updateOrbit(geo, orb, count, t) {
    const pos = geo.attributes.position;
    for (let i = 0; i < count; i++) {
      const ang = t * orb.speed[i] + orb.phase[i];
      const x = orb.cx[i] + Math.cos(ang) * orb.radius[i] + Math.sin(ang * 0.43) * orb.wobble[i];
      const y = orb.cy[i] + Math.sin(ang) * orb.radius[i] * orb.squash[i] + Math.cos(ang * 0.61) * orb.wobble[i] * 0.7;
      const z = orb.cz[i] + Math.sin(ang * 0.78 + orb.phase[i]) * orb.zDrift[i];
      pos.setXYZ(i, x, y, z);
    }
    pos.needsUpdate = true;
  }

  function animate() {
    if (!running) { raf = requestAnimationFrame(animate); return; }
    const t = clock.getElapsedTime();

    updateOrbit(normalGeo, nOrb, normalCount, t);
    updateOrbit(glowGeo, gOrb, glowCount, t);
    glowMat.opacity = 0.55 + Math.sin(t * 1.3) * 0.2; // twinkle

    smokeSprites.forEach(s => {
      const px = s.baseX + Math.sin(t * s.driftSpeed + s.phase) * 0.5;
      const py = s.baseY + Math.cos(t * s.driftSpeed * 0.7 + s.phase) * 0.4;

      _v.set(px, py, s.sprite.position.z);
      _v.project(camera);
      const sx = (_v.x * 0.5 + 0.5) * w;
      const sy = (-_v.y * 0.5 + 0.5) * h;
      const dist = Math.hypot(mousePx - sx, mousePy - sy);
      const targetHover = dist < HOVER_RADIUS_PX ? (1 - dist / HOVER_RADIUS_PX) : 0;
      const rate = targetHover > s.hover ? 0.06 : 0.02;
      s.hover += (targetHover - s.hover) * rate;

      const jitterAmt = s.hover * 0.35;
      const jx = Math.sin(t * 2.3 + s.jx) * jitterAmt;
      const jy = Math.cos(t * 2.1 + s.jy) * jitterAmt;
      s.sprite.position.x = px + jx;
      s.sprite.position.y = py + jy;
      s.sprite.material.rotation += 0.0003 + s.hover * 0.004;

      const breath = Math.sin(t * s.breathSpeed + s.breathPhase);
      const scaleMod = 1 + breath * 0.18;
      const opacityMod = 1 + breath * 0.45;
      const disperseScale = 1 + s.hover * 1.4;   // puffs up when hovered
      const disperseOpacity = 1 - s.hover * 0.7;  // thins out when hovered

      const sc = s.baseScale * scaleMod * disperseScale;
      s.sprite.scale.set(sc, sc, 1);
      s.sprite.material.opacity = Math.max(0.01, s.baseOpacity * opacityMod * disperseOpacity);
    });

    if (!isMobile) {
      mouseX += (targetX - mouseX) * 0.03;
      mouseY += (targetY - mouseY) * 0.03;
      camera.position.x = mouseX * 0.8;
      camera.position.y = -mouseY * 0.8;
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }

  function onResize() {
    const s = getSize();
    w = s.w; h = s.h;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }
  window.addEventListener('resize', onResize);

  animate();

  return function dispose() {
    cancelAnimationFrame(raf);
    window.removeEventListener('mousemove', onMouseMove);
    container.removeEventListener('mouseleave', onMouseLeave);
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    normalGeo.dispose(); normalMat.dispose();
    glowGeo.dispose(); glowMat.dispose();
    dustTex.dispose(); glowTex.dispose(); nebulaTex.dispose();
    smokeSprites.forEach(s => s.sprite.material.dispose());
    renderer.dispose();
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
  };
}
