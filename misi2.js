// ============================================================
// misi2.js — Misi 2: Holo-Orbit Simulator | Bimbel RBS
// Simulasi orbit Bumi–Bulan–Matahari, fase bulan, perigee/apogee, gerhana
// ============================================================

(function () {
  'use strict';

  // ── Web Audio (BGM Kosmik) ─────────────────────────────────
  const AudioEngine = {
    ctx: null, masterGain: null, isMuted: false, bgmStarted: false,
    bgmTimer: null, bellTimer: null, droneOsc: null,
    bgmChords: [
      [73.42, 110.00, 174.61, 261.63, 329.63],
      [65.41,  98.00, 164.81, 246.94, 293.66],
      [82.41, 123.47, 196.00, 293.66, 392.00],
      [110.00, 164.81, 261.63, 392.00, 493.88]
    ],
    bellNotes: [523.25, 659.25, 783.99, 1046.50, 1318.51],
    chordIdx: 0,

    init() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.7;
      this.masterGain.connect(this.ctx.destination);
      this._createNoise();
    },

    _createNoise() {
      const r = this.ctx.sampleRate;
      const buf = this.ctx.createBuffer(1, r * 3, r);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuf = buf;
    },

    startBGM() {
      if (this.bgmStarted || !this.ctx) return;
      this.bgmStarted = true;
      // Drone
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        const f = this.ctx.createBiquadFilter();
        osc.type = 'sine'; osc.frequency.value = 65.41;
        f.type = 'lowpass'; f.frequency.value = 200;
        g.gain.value = 0.08;
        osc.connect(f); f.connect(g); g.connect(this.masterGain);
        osc.start(now);
        this.droneOsc = osc;
      } catch(e) {}
      this._playChord();
      this.bgmTimer = setInterval(() => { if (!this.isMuted) this._playChord(); }, 8000);
      this._scheduleBell();
    },

    _playChord() {
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const chord = this.bgmChords[this.chordIdx % this.bgmChords.length];
      this.chordIdx++;
      const pf = this.ctx.createBiquadFilter();
      pf.type = 'lowpass';
      pf.frequency.setValueAtTime(700, now);
      pf.frequency.linearRampToValueAtTime(1200, now + 4);
      pf.frequency.linearRampToValueAtTime(600, now + 8.5);
      pf.connect(this.masterGain);
      chord.forEach(freq => {
        try {
          const o1 = this.ctx.createOscillator();
          const o2 = this.ctx.createOscillator();
          const g  = this.ctx.createGain();
          o1.type = 'sine'; o1.frequency.value = freq; o1.detune.value = -5;
          o2.type = 'triangle'; o2.frequency.value = freq; o2.detune.value = 5;
          g.gain.setValueAtTime(0.0001, now);
          g.gain.exponentialRampToValueAtTime(0.07, now + 2);
          g.gain.setValueAtTime(0.07, now + 5.5);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 8.5);
          o1.connect(g); o2.connect(g); g.connect(pf);
          o1.start(now); o2.start(now);
          o1.stop(now + 8.7); o2.stop(now + 8.7);
        } catch(e) {}
      });
      setTimeout(() => { try { pf.disconnect(); } catch(e) {} }, 9000);
    },

    _scheduleBell() {
      this.bellTimer = setTimeout(() => {
        if (!this.isMuted && this.bgmStarted && this.ctx) {
          try {
            const now = this.ctx.currentTime;
            const note = this.bellNotes[Math.floor(Math.random() * this.bellNotes.length)];
            const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
            o.type = 'sine'; o.frequency.value = note;
            g.gain.setValueAtTime(0.0001, now);
            g.gain.exponentialRampToValueAtTime(0.10, now + 0.03);
            g.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
            o.connect(g); g.connect(this.masterGain);
            o.start(now); o.stop(now + 2.1);
          } catch(e) {}
        }
        this._scheduleBell();
      }, 2000 + Math.random() * 3000);
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.ctx && this.masterGain) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 0.7, now + 0.2);
      }
      this.updateUI();
    },

    sfx(freq, type = 'sine', dur = 0.15, vol = 0.15) {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
        o.type = type; o.frequency.value = freq;
        g.gain.setValueAtTime(vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
        o.connect(g); g.connect(this.masterGain);
        o.start(now); o.stop(now + dur);
      } catch(e) {}
    },

    capture() {
      this.sfx(880, 'sine', 0.05, 0.2);
      setTimeout(() => this.sfx(660, 'sine', 0.08, 0.15), 60);
    },
    eclipse() {
      this.sfx(220, 'sawtooth', 0.3, 0.18);
      setTimeout(() => this.sfx(180, 'sawtooth', 0.4, 0.18), 200);
    },
    perigee() {
      [440, 550, 660].forEach((f,i) => setTimeout(() => this.sfx(f, 'triangle', 0.2, 0.12), i * 70));
    },
    fanfare() {
      [261.63, 329.63, 392.00, 523.25].forEach((f,i) => setTimeout(() => {
        this.sfx(f, 'triangle', 0.3, 0.22);
      }, i * 130));
    },

    updateUI() {
      const icon = document.getElementById('audio-icon');
      const lbl  = document.getElementById('audio-label');
      const btn  = document.getElementById('btn-toggle-audio');
      if (icon) icon.textContent = this.isMuted ? '🔇' : '🔊';
      if (lbl)  lbl.textContent  = this.isMuted ? 'Hening' : 'Musik';
      if (btn)  btn.classList.toggle('muted', this.isMuted);
    }
  };

  // ── Data Fase Bulan ────────────────────────────────────────
  const PHASES = [
    { emoji: '🌑', name: 'Bulan Baru',       nameEn: 'New Moon',            min: 0,   max: 22.5  },
    { emoji: '🌒', name: 'Sabit Muda',        nameEn: 'Waxing Crescent',     min: 22.5, max: 67.5  },
    { emoji: '🌓', name: 'Kuartir Pertama',   nameEn: 'First Quarter',       min: 67.5, max: 112.5 },
    { emoji: '🌔', name: 'Cembung Muda',      nameEn: 'Waxing Gibbous',      min: 112.5, max: 157.5 },
    { emoji: '🌕', name: 'Bulan Purnama',     nameEn: 'Full Moon',           min: 157.5, max: 202.5 },
    { emoji: '🌖', name: 'Cembung Tua',       nameEn: 'Waning Gibbous',      min: 202.5, max: 247.5 },
    { emoji: '🌗', name: 'Kuartir Terakhir',  nameEn: 'Last Quarter',        min: 247.5, max: 292.5 },
    { emoji: '🌘', name: 'Sabit Tua',         nameEn: 'Waning Crescent',     min: 292.5, max: 337.5 },
    // closes back to New Moon at 337.5–360
  ];

  function getPhaseFromAngle(angleDeg) {
    const a = ((angleDeg % 360) + 360) % 360;
    for (const p of PHASES) {
      if (a >= p.min && a < p.max) return p;
    }
    return PHASES[0]; // 337.5–360 = Sabit Tua or back to New
  }

  // ── State ──────────────────────────────────────────────────
  const state = {
    moonAngle: 0,         // degrees, 0 = between sun and earth (new moon position)
    orbitSpeed: 1.0,      // multiplier (real = ~13.18 deg/day → fast sim)
    eccentricity: 0.05,   // 0 to 0.5
    inclination: 5,       // degrees
    paused: false,
    zoom: 1.0,
    playerName: localStorage.getItem('rbs_player_name') || 'Kadet Astronot',

    // Objectives
    objOrbitWatched: false,     // auto-done when sim starts
    objAllPhasesSeen: false,    // all 8 phases seen
    objPerigeeSeen: false,
    objApogeeSeen: false,
    objPhotos: 0,

    phasesSeen: new Set(),
    capturedPhases: new Set(),
    photos: [],                 // { emoji, name, angle }

    // Eclipse
    lastEclipseType: null,
    eclipseActive: false,
    solarEclipseSeen: false,
    lunarEclipseSeen: false,

    // Perigee/Apogee near
    nearPerigee: false,
    nearApogee: false,
    lastToast: null,

    // Base distances (km)
    avgDist: 384400,
    perigeeDist: 362600,
    apogeeDist: 405500,
  };

  // ── DOM refs ───────────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const screens = {
    intro:    $('screen-intro'),
    sim:      $('screen-sim'),
    complete: $('screen-complete'),
    logbook:  $('screen-logbook')
  };

  function showScreen(key) {
    Object.values(screens).forEach(s => { if (s) { s.classList.remove('active'); } });
    if (screens[key]) screens[key].classList.add('active');
  }

  // ── Canvas Setup ───────────────────────────────────────────
  const canvas = $('orbit-canvas');
  const ctx = canvas.getContext('2d');
  let animId = null;

  function resizeCanvas() {
    const vp = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const w = vp.clientWidth;
    const h = vp.clientHeight;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    canvas._w = w;
    canvas._h = h;
  }

  // ── Main Render Loop ───────────────────────────────────────
  let lastTime = null;
  const BASE_SPEED = 1.5; // degrees per second at speed=1.0x

  function renderLoop(ts) {
    animId = requestAnimationFrame(renderLoop);
    const dt = lastTime ? Math.min((ts - lastTime) / 1000, 0.1) : 0;
    lastTime = ts;

    if (!state.paused) {
      state.moonAngle += BASE_SPEED * state.orbitSpeed * dt;
      if (state.moonAngle >= 360) state.moonAngle -= 360;
    }

    drawOrbit();
    updateOverlays();
    detectEclipses();
    detectPerigeApogee();
    updateMissionProgress();
  }

  // ── Draw Functions ─────────────────────────────────────────
  function drawOrbit() {
    const W = canvas._w || canvas.clientWidth;
    const H = canvas._h || canvas.clientHeight;
    ctx.clearRect(0, 0, W, H);

    // Background deep space
    const bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.max(W,H)*0.7);
    bg.addColorStop(0, '#061020');
    bg.addColorStop(1, '#020608');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Stars
    drawStars(W, H);

    const z = state.zoom;

    const isMobile = W < 600;

    // Sun position: left 1/5 of viewport
    const sunX = (isMobile ? W * 0.12 : W * 0.13) * z + (W * (1 - z) / 2);
    const sunY = H / 2;
    const sunR = (isMobile ? Math.max(22, Math.min(36, W * 0.062)) : Math.max(32, Math.min(50, W * 0.055))) * z;

    // Earth position: center (offset slightly right on mobile for Sun spacing)
    const earthX = isMobile ? W * 0.58 : W / 2;
    const earthY = H / 2;
    const earthR = (isMobile ? Math.max(14, Math.min(22, W * 0.038)) : Math.max(18, Math.min(28, W * 0.032))) * z;

    // Moon orbit (elliptical)
    const orbitA = (isMobile ? Math.max(58, Math.min(110, W * 0.23)) : Math.max(80, Math.min(160, W * 0.22))) * z; // semi-major axis
    const ecc    = state.eccentricity;
    const orbitB = orbitA * Math.sqrt(1 - ecc * ecc);
    const incRad = state.inclination * Math.PI / 180;

    // Moon position on ellipse (angle from Earth)
    const moonRad = state.moonAngle * Math.PI / 180;
    // Ellipse formula: r = a(1-e²) / (1 + e·cos θ)
    const rFromFocus = orbitA * (1 - ecc * ecc) / (1 + ecc * Math.cos(moonRad));
    const moonX = earthX + Math.cos(moonRad) * rFromFocus * Math.cos(incRad * 0.3);
    const moonY = earthY + Math.sin(moonRad) * rFromFocus * Math.sin(Math.PI / 2 - incRad * 0.3);
    const moonR = (isMobile ? Math.max(8, Math.min(14, W * 0.024)) : Math.max(10, Math.min(18, W * 0.02))) * z;

    // Perigee & Apogee positions
    const periX = earthX + orbitA * (1 - ecc);  // closest (angle=0 in this simplified model)
    const apoX  = earthX - orbitA * (1 + ecc);  // farthest

    // Draw orbit path
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.18)';
    ctx.setLineDash([4, 8]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(earthX - orbitA * ecc, earthY, orbitA, orbitB, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // Perigee label
    drawOrbitalPoint(periX, earthY, '🔴', 'Perigee', '#ff6655');
    // Apogee label
    drawOrbitalPoint(apoX, earthY, '🔵', 'Apogee', '#6688ff');

    // Sun-Earth alignment line (for eclipse visualization)
    const syzAlign = Math.abs(Math.cos(moonRad));
    if (syzAlign > 0.85) {
      ctx.save();
      ctx.strokeStyle = syzAlign > 0.95
        ? 'rgba(255, 200, 0, 0.55)'
        : 'rgba(255, 200, 0, 0.2)';
      ctx.setLineDash([6, 10]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(earthX + Math.cos(moonRad) * orbitA * 1.5, earthY + Math.sin(moonRad) * orbitA * 0.3);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }

    // ── Draw Sun ──────────────────────────────────────────────
    drawSun(sunX, sunY, sunR);

    // ── Eclipse Shadows ────────────────────────────────────────
    const eclipseInfo = computeEclipse(moonRad, ecc, orbitA, orbitB, sunX, sunY, earthX, earthY, moonX, moonY, sunR, earthR, moonR);

    // Draw eclipse shadow if applicable
    if (eclipseInfo.type === 'solar') {
      drawSolarEclipseShadow(moonX, moonY, earthX, earthY, sunX, sunY, moonR, sunR, eclipseInfo.intensity);
    } else if (eclipseInfo.type === 'lunar') {
      drawLunarEclipseShadow(moonX, moonY, earthX, earthY, sunX, sunY, earthR, moonR, eclipseInfo.intensity);
    }

    // ── Draw Earth ────────────────────────────────────────────
    drawEarth(earthX, earthY, earthR);

    // ── Draw Moon ─────────────────────────────────────────────
    drawMoon(moonX, moonY, moonR, state.moonAngle, eclipseInfo);

    // ── Labels ────────────────────────────────────────────────
    // Sun-Earth dotted line
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 200, 80, 0.12)';
    ctx.setLineDash([3, 8]);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(sunX, sunY); ctx.lineTo(earthX, earthY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // ── Distance indicators ───────────────────────────────────
    drawDistanceLine(earthX, earthY, moonX, moonY);

    // ── HUD Corner Info ────────────────────────────────────────
    drawHUD(W, H, moonX, moonY, earthX, earthY, sunX, sunY, eclipseInfo);

    // Store for other uses
    state._moonX = moonX; state._moonY = moonY;
    state._rFromFocus = rFromFocus;
    state._orbitA = orbitA;
    state._periX = periX; state._apoX = apoX;
  }

  // ── Sub Draw Functions ─────────────────────────────────────
  const starCache = [];
  function initStars() {
    for (let i = 0; i < 180; i++) {
      starCache.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.3 + Math.random() * 1.2,
        a: 0.3 + Math.random() * 0.7,
        tw: Math.random() * Math.PI * 2
      });
    }
  }
  initStars();

  function drawStars(W, H) {
    const t = Date.now() * 0.001;
    starCache.forEach(s => {
      const alpha = s.a * (0.6 + 0.4 * Math.sin(t * 0.5 + s.tw));
      ctx.fillStyle = `rgba(200, 220, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawSun(x, y, r) {
    // Outer glow
    const glow = ctx.createRadialGradient(x, y, r * 0.3, x, y, r * 2.2);
    glow.addColorStop(0,   'rgba(255, 230, 80, 0.35)');
    glow.addColorStop(0.5, 'rgba(255, 140, 0, 0.12)');
    glow.addColorStop(1,   'rgba(255, 80, 0, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2); ctx.fill();

    // Corona rays
    const rayCount = 12;
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#ffdd55';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2 + Date.now() * 0.0003;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * r * 1.15, y + Math.sin(angle) * r * 1.15);
      ctx.lineTo(x + Math.cos(angle) * r * 1.7, y + Math.sin(angle) * r * 1.7);
      ctx.stroke();
    }
    ctx.restore();

    // Core body
    const core = ctx.createRadialGradient(x - r * 0.2, y - r * 0.2, r * 0.05, x, y, r);
    core.addColorStop(0, '#ffffff');
    core.addColorStop(0.2, '#fff8aa');
    core.addColorStop(0.6, '#ffcc00');
    core.addColorStop(1, '#ff8800');
    ctx.fillStyle = core;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

    // Label
    ctx.fillStyle = 'rgba(255, 230, 100, 0.8)';
    ctx.font = `bold ${Math.max(10, r * 0.38)}px Orbitron, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('☀️ Matahari', x, y + r + 16);
  }

  function drawEarth(x, y, r) {
    // Atmosphere glow
    const atm = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 1.5);
    atm.addColorStop(0, 'rgba(80, 160, 255, 0.3)');
    atm.addColorStop(1, 'rgba(0, 80, 200, 0)');
    ctx.fillStyle = atm;
    ctx.beginPath(); ctx.arc(x, y, r * 1.5, 0, Math.PI * 2); ctx.fill();

    // Body
    const body = ctx.createRadialGradient(x - r*0.25, y - r*0.25, r*0.05, x, y, r);
    body.addColorStop(0, '#88ccff');
    body.addColorStop(0.35, '#3399ee');
    body.addColorStop(0.7, '#1166cc');
    body.addColorStop(1, '#003366');
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();

    // Landmass blobs
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = 'rgba(50, 180, 90, 0.7)';
    [[x-r*0.2, y-r*0.15, r*0.28], [x+r*0.1, y+r*0.1, r*0.2], [x-r*0.05, y+r*0.25, r*0.15]].forEach(([cx,cy,cr]) => {
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI*2); ctx.fill();
    });
    // Cloud bands
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    [[x, y-r*0.35, r*0.45, r*0.08], [x+r*0.1, y+r*0.2, r*0.35, r*0.07]].forEach(([cx,cy,rw,rh]) => {
      ctx.beginPath(); ctx.ellipse(cx, cy, rw, rh, 0.3, 0, Math.PI*2); ctx.fill();
    });
    // Terminator shadow
    const shad = ctx.createRadialGradient(x+r*0.3, y+r*0.3, 0, x, y, r);
    shad.addColorStop(0.4, 'rgba(0,0,0,0)');
    shad.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = shad;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
    ctx.restore();

    // Label
    ctx.fillStyle = 'rgba(100, 180, 255, 0.85)';
    ctx.font = `bold ${Math.max(9, r*0.36)}px Orbitron, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('🌍 Bumi', x, y + r + 14);
  }

  function drawMoon(x, y, r, angleDeg, eclipseInfo) {
    const phase = getPhaseFromAngle(angleDeg);

    // Subtle glow
    const glow = ctx.createRadialGradient(x, y, r*0.5, x, y, r*1.8);
    glow.addColorStop(0, 'rgba(220,220,200,0.12)');
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(x, y, r*1.8, 0, Math.PI*2); ctx.fill();

    // Moon base
    const body = ctx.createRadialGradient(x-r*0.2, y-r*0.2, r*0.05, x, y, r);
    body.addColorStop(0, '#e8e4d8');
    body.addColorStop(0.5, '#c8c2b0');
    body.addColorStop(1, '#706855');
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();

    // Craters
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();
    ctx.fillStyle = 'rgba(80,70,55,0.35)';
    [[x-r*0.3, y-r*0.2, r*0.18], [x+r*0.25, y+r*0.1, r*0.12], [x-r*0.1, y+r*0.3, r*0.1]].forEach(([cx,cy,cr]) => {
      ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI*2); ctx.fill();
    });
    ctx.restore();

    // Phase shadow overlay
    applyMoonPhase(x, y, r, angleDeg);

    // Eclipse blood moon effect
    if (eclipseInfo.type === 'lunar' && eclipseInfo.intensity > 0.5) {
      ctx.save();
      ctx.globalAlpha = Math.min(0.7, (eclipseInfo.intensity - 0.5) * 1.4);
      ctx.fillStyle = '#cc2200';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    }

    // Phase label
    ctx.fillStyle = 'rgba(200, 195, 175, 0.8)';
    ctx.font = `${Math.max(8, r*0.45)}px Orbitron, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`${phase.emoji} Bulan`, x, y + r + 14);
  }

  function applyMoonPhase(x, y, r, angleDeg) {
    // angleDeg 0 = new moon (between sun and earth, sun on left)
    // angleDeg 180 = full moon (earth between sun and moon)
    // The shadow is on the side facing the sun
    const a = ((angleDeg % 360) + 360) % 360;
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.clip();

    // Shadow as dark half that transitions
    const normalizedAngle = a / 360;
    let shadowX;
    if (a <= 180) {
      // Waxing: shadow on left, shrinking
      const t = a / 180;
      shadowX = x - r + t * 2 * r;
    } else {
      // Waning: shadow on right, growing
      const t = (a - 180) / 180;
      shadowX = x + r - t * 2 * r;
    }

    const shadowGrad = ctx.createRadialGradient(shadowX, y, 0, x, y, r);
    if (a <= 180) {
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0.9)');
      shadowGrad.addColorStop(0.45, 'rgba(0,0,0,0.85)');
      shadowGrad.addColorStop(0.5, 'rgba(0,0,0,0.4)');
      shadowGrad.addColorStop(0.55, 'rgba(0,0,0,0)');
    } else {
      shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
      shadowGrad.addColorStop(0.45, 'rgba(0,0,0,0)');
      shadowGrad.addColorStop(0.5, 'rgba(0,0,0,0.5)');
      shadowGrad.addColorStop(0.55, 'rgba(0,0,0,0.9)');
    }
    ctx.fillStyle = shadowGrad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }

  function drawOrbitalPoint(x, y, icon, label, color) {
    ctx.save();
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(icon, x, y);
    ctx.fillStyle = color;
    ctx.font = '9px Orbitron, sans-serif';
    ctx.fillText(label, x, y - 12);
    ctx.restore();
  }

  function drawDistanceLine(ex, ey, mx, my) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.25)';
    ctx.setLineDash([3, 6]);
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(mx, my); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  function computeEclipse(moonRad, ecc, orbitA, orbitB, sunX, sunY, earthX, earthY, moonX, moonY, sunR, earthR, moonR) {
    // Angle 0 = new moon (sun on left of earth, moon between sun and earth)
    // Angle 180 = full moon (moon on right, earth between sun and moon)
    const a = ((state.moonAngle % 360) + 360) % 360;

    // Solar eclipse: moon between sun and earth (angle ~0°)
    // Moon must be near angle=0 (or 360)
    const solarAlignment = Math.abs(Math.cos(moonRad));
    const moonOnSunSide   = (a < 25 || a > 335);

    // Lunar eclipse: earth between sun and moon (angle ~180°)
    const lunarAlignment = Math.abs(Math.cos(moonRad - Math.PI));
    const moonOnOtherSide = (a > 155 && a < 205);

    let type = null, intensity = 0;

    if (moonOnSunSide && solarAlignment > 0.90) {
      type = 'solar';
      intensity = (solarAlignment - 0.90) / 0.10;
    } else if (moonOnOtherSide && lunarAlignment > 0.90) {
      type = 'lunar';
      intensity = (lunarAlignment - 0.90) / 0.10;
    }

    return { type, intensity: Math.min(1, intensity) };
  }

  function drawSolarEclipseShadow(mx, my, ex, ey, sx, sy, mr, sunR, intensity) {
    ctx.save();
    ctx.globalAlpha = intensity * 0.6;
    // Umbra shadow cone pointing from moon toward earth and beyond
    const dx = ex - mx; const dy = ey - my;
    const dist = Math.hypot(dx, dy);
    const nx = dx / dist; const ny = dy / dist;
    // Draw shadow gradient behind moon in direction of earth
    const sg = ctx.createRadialGradient(
      mx + nx * mr * 0.5, my + ny * mr * 0.5, 0,
      mx + nx * mr * 3,   my + ny * mr * 3,   mr * 4
    );
    sg.addColorStop(0, 'rgba(0,0,0,0.75)');
    sg.addColorStop(0.4, 'rgba(0,0,30,0.4)');
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, canvas._w || 800, canvas._h || 600);
    ctx.restore();

    // Corona ring around sun (visible during total solar eclipse)
    if (intensity > 0.8) {
      ctx.save();
      ctx.globalAlpha = (intensity - 0.8) * 3;
      const coronaGrad = ctx.createRadialGradient(sx, sy, sunR * 1.05, sx, sy, sunR * 2.5);
      coronaGrad.addColorStop(0, 'rgba(255, 240, 150, 0.8)');
      coronaGrad.addColorStop(0.4, 'rgba(255, 180, 50, 0.35)');
      coronaGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
      ctx.fillStyle = coronaGrad;
      ctx.beginPath(); ctx.arc(sx, sy, sunR * 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  function drawLunarEclipseShadow(mx, my, ex, ey, sx, sy, earthR, moonR, intensity) {
    ctx.save();
    ctx.globalAlpha = intensity * 0.65;
    // Earth's umbra cone covers moon
    const dx = mx - ex; const dy = my - ey;
    const dist = Math.hypot(dx, dy);
    const nx = dx / dist; const ny = dy / dist;
    const sg = ctx.createRadialGradient(
      ex + nx * earthR, ey + ny * earthR, 0,
      mx, my, earthR * 1.2
    );
    sg.addColorStop(0, 'rgba(0,0,0,0.8)');
    sg.addColorStop(0.5, 'rgba(50,0,0,0.5)');
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, canvas._w || 800, canvas._h || 600);
    ctx.restore();
  }

  function drawHUD(W, H, mx, my, ex, ey, sx, sy, eclipseInfo) {
    const moonDist = Math.hypot(mx - ex, my - ey);
    const orbitA = state._orbitA || 130;
    const ecc = state.eccentricity;
    const periDist = orbitA * (1 - ecc);
    const apoDist  = orbitA * (1 + ecc);
    const distPct  = (moonDist - periDist) / (apoDist - periDist);

    // Syzygy angle label (bottom center)
    const a = ((state.moonAngle % 360) + 360) % 360;
    if (eclipseInfo.type) {
      ctx.save();
      const color = eclipseInfo.type === 'solar' ? '#ffd84d' : '#ff6655';
      ctx.font = 'bold 13px Orbitron, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = color;
      const label = eclipseInfo.type === 'solar'
        ? `⚠️ GERHANA MATAHARI (${Math.round(eclipseInfo.intensity * 100)}%)`
        : `⚠️ GERHANA BULAN (${Math.round(eclipseInfo.intensity * 100)}%)`;
      ctx.fillText(label, W / 2, H - 50);
      ctx.restore();
    }
  }

  // ── Update UI Overlays ──────────────────────────────────── 
  function updateOverlays() {
    const a = ((state.moonAngle % 360) + 360) % 360;
    const phase = getPhaseFromAngle(a);

    // Phase display
    const phaseIconEl  = $('phase-icon-large');
    const phaseNameEl  = $('phase-name-display');
    const phaseAngEl   = $('phase-angle-display');
    if (phaseIconEl)  phaseIconEl.textContent  = phase.emoji;
    if (phaseNameEl)  phaseNameEl.textContent  = phase.name;
    if (phaseAngEl)   phaseAngEl.textContent   = `${Math.round(a)}°`;

    // Camera
    const camMoonEl  = $('cam-moon-graphic');
    const camPhaseEl = $('cam-phase-label');
    const camAngEl   = $('cam-angle-label');
    if (camMoonEl)  camMoonEl.textContent  = phase.emoji;
    if (camPhaseEl) camPhaseEl.textContent = phase.name;
    if (camAngEl)   camAngEl.textContent   = `${Math.round(a)}°`;

    // Track seen phases
    const phaseIdx = PHASES.findIndex(p => p.name === phase.name);
    if (phaseIdx >= 0 && !state.phasesSeen.has(phaseIdx)) {
      state.phasesSeen.add(phaseIdx);
      updatePhaseGrid();
      if (state.phasesSeen.size === 8 && !state.objAllPhasesSeen) {
        state.objAllPhasesSeen = true;
        tickObjective('mini-obj-2');
        showToast('🌙 Semua 8 Fase Bulan Teridentifikasi!', 'orbital-event-toast', 'event-toast-icon', 'event-toast-text');
      }
    }

    // Update current phase card highlight
    updatePhaseGrid();

    // Distance update
    const orbitA = state._orbitA || 130;
    const ecc = state.eccentricity;
    const rFromFocus = state._rFromFocus || orbitA;
    // Scale to real km
    const periKm = state.perigeeDist * (1 - ecc + 0.0549);
    const apoKm  = state.apogeeDist  * (1 + ecc - 0.0549);
    const t = rFromFocus / (orbitA * (1 + ecc));
    const currentKm = Math.round(state.perigeeDist + t * (state.apogeeDist - state.perigeeDist));

    const distEl = $('val-current-dist');
    if (distEl) distEl.textContent = currentKm.toLocaleString('id-ID') + ' km';

    const distBarEl = $('dist-bar');
    if (distBarEl) {
      const pct = ((currentKm - state.perigeeDist) / (state.apogeeDist - state.perigeeDist)) * 100;
      distBarEl.style.width = Math.max(2, Math.min(100, pct)) + '%';
    }

    // Perigee/Apogee values update with eccentricity
    const periEl = $('val-perigee');
    const apoEl  = $('val-apogee');
    if (periEl) periEl.textContent = Math.round(state.perigeeDist * (1 - ecc * 0.5 + 0.03)).toLocaleString('id-ID') + ' km';
    if (apoEl)  apoEl.textContent  = Math.round(state.apogeeDist  * (1 + ecc * 0.5 - 0.02)).toLocaleString('id-ID') + ' km';
  }

  function detectEclipses() {
    const a = ((state.moonAngle % 360) + 360) % 360;
    const ecc = state.eccentricity;
    const orbitA = state._orbitA || 130;
    const isSolar = (a < 22 || a > 338);
    const isLunar = (a > 158 && a < 202);

    if (isSolar && !state.solarEclipseSeen) {
      state.solarEclipseSeen = true;
      state.eclipseActive = true;
      AudioEngine.eclipse();
      showEclipseToast('solar', '☀️ Gerhana Matahari! Bulan menutupi Matahari!');
      updateEclipsePanel('solar', 'Gerhana Matahari Aktif', 'Bulan berada di antara Matahari & Bumi. Umbra jatuh ke Bumi!');
    } else if (isLunar && !state.lunarEclipseSeen) {
      state.lunarEclipseSeen = true;
      state.eclipseActive = true;
      AudioEngine.eclipse();
      showEclipseToast('lunar', '🌕 Gerhana Bulan! Blood Moon terdeteksi!');
      updateEclipsePanel('lunar', 'Gerhana Bulan Aktif', 'Bumi berada di antara Matahari & Bulan. Bulan memasuki umbra Bumi!');
    } else if (!isSolar && !isLunar) {
      state.eclipseActive = false;
      if (!isSolar && !isLunar) {
        updateEclipsePanel('none', 'Tidak ada gerhana', 'Atur posisi Bulan sejajar Matahari–Bumi untuk memicu gerhana!');
      }
    }
  }

  function detectPerigeApogee() {
    const a = ((state.moonAngle % 360) + 360) % 360;
    const rFromFocus = state._rFromFocus;
    const orbitA = state._orbitA || 130;
    const ecc = state.eccentricity;
    const periR = orbitA * (1 - ecc);
    const apoR  = orbitA * (1 + ecc);

    if (rFromFocus && !state.nearPerigee && rFromFocus < periR * 1.08) {
      state.nearPerigee = true;
      if (!state.objPerigeeSeen) {
        state.objPerigeeSeen = true;
        tickObjective('mini-obj-3');
        AudioEngine.perigee();
        showToast('🔴 Perigee Tercapai! Jarak terdekat Bulan!', 'orbital-event-toast', 'event-toast-icon', 'event-toast-text');
        document.getElementById('card-perigee')?.classList.add('active');
        setTimeout(() => document.getElementById('card-perigee')?.classList.remove('active'), 700);
      }
    } else if (rFromFocus && rFromFocus > periR * 1.15) {
      state.nearPerigee = false;
    }

    if (rFromFocus && !state.nearApogee && rFromFocus > apoR * 0.94) {
      state.nearApogee = true;
      if (!state.objApogeeSeen) {
        state.objApogeeSeen = true;
        showToast('🔵 Apogee Tercapai! Jarak terjauh Bulan!', 'orbital-event-toast', 'event-toast-icon', 'event-toast-text');
        document.getElementById('card-apogee')?.classList.add('active');
        setTimeout(() => document.getElementById('card-apogee')?.classList.remove('active'), 700);
        // Check if both perigee and apogee have been seen
        if (state.objPerigeeSeen) checkMissionProgress();
      }
    } else if (rFromFocus && rFromFocus < apoR * 0.9) {
      state.nearApogee = false;
    }
  }

  // ── Phase Grid Render ──────────────────────────────────────
  function renderPhaseGrid() {
    const grid = $('phase-grid');
    if (!grid) return;
    grid.innerHTML = '';
    PHASES.forEach((p, i) => {
      const card = document.createElement('div');
      card.className = 'phase-card';
      card.id = `phase-card-${i}`;

      const isCurrent = getPhaseFromAngle(state.moonAngle).name === p.name;
      const isSeen    = state.phasesSeen.has(i);
      const isCaptured= state.capturedPhases.has(i);

      if (isCaptured) card.classList.add('captured');
      else if (isCurrent) card.classList.add('current');
      else if (isSeen)    card.classList.add('seen');

      const status = isCaptured ? '📸' : isCurrent ? '▶' : isSeen ? '✓' : '○';
      card.innerHTML = `
        <div class="phase-emoji">${p.emoji}</div>
        <div class="phase-name-sm">${p.name}</div>
        <div class="phase-deg-sm">${p.min}°–${p.max}°</div>
        <div class="phase-status-icon">${status}</div>
      `;
      grid.appendChild(card);
    });
  }

  function updatePhaseGrid() {
    const currentPhase = getPhaseFromAngle(state.moonAngle);
    PHASES.forEach((p, i) => {
      const card = document.getElementById(`phase-card-${i}`);
      if (!card) return;
      const isCurrent  = p.name === currentPhase.name;
      const isSeen     = state.phasesSeen.has(i);
      const isCaptured = state.capturedPhases.has(i);

      card.className = 'phase-card';
      if (isCaptured) card.classList.add('captured');
      else if (isCurrent) card.classList.add('current');
      else if (isSeen)    card.classList.add('seen');

      const statusEl = card.querySelector('.phase-status-icon');
      if (statusEl) statusEl.textContent = isCaptured ? '📸' : isCurrent ? '▶' : isSeen ? '✓' : '○';
    });
  }

  // ── Toast / Notifications ──────────────────────────────────
  let toastTimeout = null;
  function showToast(text, containerId, iconId, textId) {
    const el = $(containerId);
    if (!el) return;
    el.querySelector ? null : null;
    const textEl = $(textId);
    if (textEl) textEl.textContent = text;
    el.classList.remove('hidden');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => el.classList.add('hidden'), 3000);
  }

  let eclipseToastTimeout = null;
  function showEclipseToast(type, text) {
    const el = $('eclipse-event-toast');
    const textEl = $('eclipse-toast-text');
    const iconEl = $('eclipse-toast-icon');
    if (!el) return;
    el.className = `eclipse-event-toast ${type}`;
    if (type === 'solar') { if (iconEl) iconEl.textContent = '☀️'; }
    else                  { if (iconEl) iconEl.textContent = '🌕'; }
    if (textEl) textEl.textContent = text;
    clearTimeout(eclipseToastTimeout);
    eclipseToastTimeout = setTimeout(() => el.classList.add('hidden'), 4500);
  }

  function tickObjective(miniId) {
    const el = $(miniId);
    if (el) el.classList.add('done');
    checkMissionProgress();
  }

  // ── Eclipse Panel Update ───────────────────────────────────
  function updateEclipsePanel(type, status, hint) {
    const panel  = $('eclipse-info-panel');
    const statEl = $('eclipse-status');
    const hintEl = $('eclipse-hint');
    if (!panel) return;
    panel.className = 'eclipse-info-panel';
    if (type === 'solar') panel.classList.add('solar-eclipse');
    else if (type === 'lunar') panel.classList.add('lunar-eclipse');
    if (statEl) statEl.textContent = status;
    if (hintEl) hintEl.textContent = hint;
  }

  // ── Mission Progress ───────────────────────────────────────
  function updateMissionProgress() {
    let done = 0;
    if (state.objOrbitWatched) done++;
    if (state.objAllPhasesSeen) done++;
    if (state.objPerigeeSeen && state.objApogeeSeen) done++;
    if (state.objPhotos >= 4) done++;
    const pct = Math.round((done / 4) * 100);

    const bar = $('ms-bar');
    const pctEl = $('ms-percent');
    if (bar) bar.style.width = pct + '%';
    if (pctEl) pctEl.textContent = pct + '%';

    if (pct === 100) {
      const btn = $('btn-complete');
      if (btn) btn.classList.remove('hidden');
      const lbl = $('obj-complete-label');
      if (lbl) lbl.textContent = '✓ SEMUA SELESAI';
    }
  }

  function checkMissionProgress() {
    updateMissionProgress();
  }

  // ── Photo Capture ──────────────────────────────────────────
  function capturePhoto() {
    const a = ((state.moonAngle % 360) + 360) % 360;
    const phase = getPhaseFromAngle(a);
    const phaseIdx = PHASES.findIndex(p => p.name === phase.name);

    // Check unique phase
    const isUnique = !state.capturedPhases.has(phaseIdx);
    state.capturedPhases.add(phaseIdx);
    state.photos.push({ emoji: phase.emoji, name: phase.name, angle: Math.round(a), isUnique });

    AudioEngine.capture();

    // Update count
    const uniqCount = state.capturedPhases.size;
    state.objPhotos = uniqCount;
    const countEl = $('capture-count');
    if (countEl) countEl.textContent = Math.min(state.photos.length, 8);

    const badgeEl = $('unique-badge');
    if (badgeEl) badgeEl.textContent = uniqCount >= 4 ? `✓ ${uniqCount} fase unik!` : `${uniqCount}/4 fase unik`;

    const mTabBadge = $('m-tab-badge-photos');
    if (mTabBadge) mTabBadge.textContent = `${uniqCount}/4`;

    // Add thumbnail to gallery
    const gallery = $('photo-gallery');
    if (gallery) {
      const thumb = document.createElement('div');
      thumb.className = 'photo-thumb';
      thumb.title = `${phase.name} (${Math.round(a)}°)`;
      thumb.innerHTML = `
        <div>${phase.emoji}</div>
        <div class="photo-thumb-label">${phase.name.split(' ').slice(0,2).join('\n')}</div>
        ${isUnique ? '<div class="photo-thumb-badge">Baru</div>' : ''}
      `;
      gallery.appendChild(thumb);
    }

    if (uniqCount >= 4 && !state.objPhotos_done) {
      state.objPhotos_done = true;
      tickObjective('mini-obj-4');
      showToast('📸 4 Foto Fase Berbeda Terkumpul! Misi hampir selesai!', 'orbital-event-toast', 'event-toast-icon', 'event-toast-text');
    }

    updatePhaseGrid();
  }

  // ── Complete Screen ────────────────────────────────────────
  function showComplete() {
    cancelAnimationFrame(animId);

    // Stats
    const statsEl = $('complete-stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-card"><div class="stat-icon">🌙</div><div class="stat-num">${state.phasesSeen.size}/8</div><div class="stat-lbl">Fase Bulan Terlihat</div></div>
        <div class="stat-card"><div class="stat-icon">📸</div><div class="stat-num">${state.capturedPhases.size}</div><div class="stat-lbl">Fase Berbeda Difoto</div></div>
        <div class="stat-card"><div class="stat-icon">🌑</div><div class="stat-num">${(state.solarEclipseSeen ? 1 : 0) + (state.lunarEclipseSeen ? 1 : 0)}/2</div><div class="stat-lbl">Gerhana Ditemukan</div></div>
      `;
    }

    // Gallery recap
    const recapGrid = $('gallery-recap-grid');
    if (recapGrid) {
      recapGrid.innerHTML = '';
      state.photos.filter((p, i, arr) => arr.findIndex(x => x.name === p.name) === i).forEach(p => {
        const el = document.createElement('div');
        el.className = 'gallery-recap-item';
        el.innerHTML = `<div class="gri-emoji">${p.emoji}</div><div class="gri-phase">${p.name}</div><div class="gri-angle">${p.angle}°</div>`;
        recapGrid.appendChild(el);
      });
    }

    // Certificate
    const certName = $('cert-cadet-name');
    if (certName) certName.textContent = state.playerName.toUpperCase();

    // Grade
    const pts = (state.phasesSeen.size / 8) * 40 + (state.capturedPhases.size / 8) * 30 + (state.objPerigeeSeen && state.objApogeeSeen ? 20 : 0) + ((state.solarEclipseSeen ? 1 : 0) + (state.lunarEclipseSeen ? 1 : 0)) * 5;
    const grade = pts >= 90 ? 'A+ (Sangat Memuaskan)' : pts >= 75 ? 'A (Memuaskan)' : pts >= 60 ? 'B (Baik)' : 'C (Cukup)';
    const certGrade = $('cert-grade');
    if (certGrade) certGrade.textContent = `Predikat: ${grade}`;

    AudioEngine.fanfare();
    showScreen('complete');
  }

  // ── Slider Event Handlers ──────────────────────────────────
  function initSliders() {
    const speedSlider = $('slider-speed');
    const eccSlider   = $('slider-ecc');
    const incSlider   = $('slider-inc');

    if (speedSlider) {
      speedSlider.addEventListener('input', () => {
        state.orbitSpeed = parseFloat(speedSlider.value);
        const el = $('val-speed');
        if (el) el.textContent = state.orbitSpeed.toFixed(1) + '×';
      });
    }
    if (eccSlider) {
      eccSlider.addEventListener('input', () => {
        state.eccentricity = parseFloat(eccSlider.value);
        const el = $('val-ecc');
        if (el) el.textContent = state.eccentricity.toFixed(2);
      });
    }
    if (incSlider) {
      incSlider.addEventListener('input', () => {
        state.inclination = parseInt(incSlider.value);
        const el = $('val-inc');
        if (el) el.textContent = state.inclination + '°';
      });
    }
  }

  // ── Zoom Controls ──────────────────────────────────────────
  function initZoom() {
    $('btn-zoom-in')?.addEventListener('click', () => {
      state.zoom = Math.min(2.0, state.zoom + 0.15);
      $('zoom-label').textContent = state.zoom.toFixed(1) + '×';
    });
    $('btn-zoom-out')?.addEventListener('click', () => {
      state.zoom = Math.max(0.5, state.zoom - 0.15);
      $('zoom-label').textContent = state.zoom.toFixed(1) + '×';
    });
  }

  // ── Pause / Reset ──────────────────────────────────────────
  function initPauseReset() {
    $('btn-pause')?.addEventListener('click', () => {
      state.paused = !state.paused;
      const icon = $('pause-icon'); const lbl = $('pause-label');
      if (icon) icon.textContent = state.paused ? '▶️' : '⏸️';
      if (lbl)  lbl.textContent  = state.paused ? 'Lanjutkan' : 'Pause Simulasi';
    });
    $('btn-reset')?.addEventListener('click', () => {
      state.moonAngle = 0;
      state.orbitSpeed = 1.0;
      state.eccentricity = 0.05;
      state.inclination = 5;
      const ss = $('slider-speed'); const se = $('slider-ecc'); const si = $('slider-inc');
      if (ss) ss.value = 1;
      if (se) se.value = 0.05;
      if (si) si.value = 5;
      $('val-speed').textContent = '1.0×';
      $('val-ecc').textContent = '0.05';
      $('val-inc').textContent = '5°';
      state.paused = false;
      $('pause-icon').textContent = '⏸️';
      $('pause-label').textContent = 'Pause Simulasi';
    });
  }

  // ── Capture Button ─────────────────────────────────────────
  function initCapture() {
    $('btn-capture')?.addEventListener('click', () => {
      capturePhoto();
    });
  }

  // ── Mobile Tabs ───────────────────────────────────────────
  function initMobileTabs() {
    const tabs = document.querySelectorAll('.m-tab-btn');
    const layout = $('sim-layout');
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        btn.classList.add('active');
        const tabKey = btn.getAttribute('data-tab');
        if (layout) layout.setAttribute('data-active-tab', tabKey);
        // Trigger resize so canvas and viewport update
        setTimeout(resizeCanvas, 50);
      });
    });
  }

  // ── Screen Nav ─────────────────────────────────────────────
  function initNav() {
    $('btn-start-mission')?.addEventListener('click', () => {
      const inputEl = $('cadet-name-input-m2');
      if (inputEl && inputEl.value.trim()) {
        state.playerName = inputEl.value.trim();
        try { localStorage.setItem('rbs_player_name', state.playerName); } catch (e) {}
      }
      const hudNameEl = $('hud-m2-cadet-name');
      if (hudNameEl) hudNameEl.textContent = state.playerName;

      AudioEngine.init();
      AudioEngine.startBGM();
      showScreen('sim');
      state.objOrbitWatched = true;
      tickObjective('mini-obj-1');
      resizeCanvas();
      lastTime = null;
      animId = requestAnimationFrame(renderLoop);
      renderPhaseGrid();
      updateTickerMessages();
    });

    $('btn-logbook-m2')?.addEventListener('click', () => {
      cancelAnimationFrame(animId);
      showScreen('logbook');
    });
    $('btn-close-logbook')?.addEventListener('click', () => {
      showScreen('sim');
      lastTime = null;
      animId = requestAnimationFrame(renderLoop);
    });

    $('btn-complete')?.addEventListener('click', showComplete);
    $('btn-replay-m2')?.addEventListener('click', () => location.reload());
    $('btn-toggle-audio')?.addEventListener('click', () => AudioEngine.toggleMute());
  }

  // ── Ticker Messages ────────────────────────────────────────
  const TICKERS = [
    'Gunakan slider Kecepatan untuk mengamati orbit bulan lebih cepat!',
    'Perigee = titik terdekat Bulan dari Bumi. Apogee = titik terjauh!',
    '8 fase bulan terjadi dalam satu siklus ~29,5 hari!',
    'Atur inklinasi orbit untuk melihat kemiringan lintasan Bulan!',
    'Gerhana Matahari terjadi saat Bulan berada di antara Matahari & Bumi!',
    'Gerhana Bulan terjadi saat Bumi berada di antara Matahari & Bulan (Blood Moon)!',
    'Eksentrisitas orbit = 0 artinya orbit sempurna melingkar!',
    'Foto 4 fase bulan berbeda untuk melengkapi misi!',
    'Syzygy = kondisi tiga benda langit sejajar lurus — syarat gerhana!',
  ];
  let tickerIdx = 0;
  function updateTickerMessages() {
    const el = $('ticker-text');
    if (!el) return;
    setInterval(() => {
      tickerIdx = (tickerIdx + 1) % TICKERS.length;
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = TICKERS[tickerIdx];
        el.style.opacity = '1';
      }, 400);
    }, 8000);
  }

  // ── Init ───────────────────────────────────────────────────
  function init() {
    resizeCanvas();
    window.addEventListener('resize', () => {
      if (screens.sim?.classList.contains('active')) {
        resizeCanvas();
      }
    });

    initSliders();
    initZoom();
    initPauseReset();
    initCapture();
    initNav();
    initMobileTabs();

    // Try get player name from localStorage / misi1
    const name = localStorage.getItem('rbs_player_name');
    if (name) {
      state.playerName = name;
      const inputEl = $('cadet-name-input-m2');
      if (inputEl) inputEl.value = name;
    }
    const hudNameEl = $('hud-m2-cadet-name');
    if (hudNameEl) hudNameEl.textContent = state.playerName;
  }

  init();

})();
