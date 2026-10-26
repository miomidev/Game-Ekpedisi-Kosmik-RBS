/**
 * misi3.js — Misi 3: Detektif Gerhana (Solar & Lunar Eclipse)
 * SKB Banjarnegara — Ekspedisi Kosmik
 * 
 * Interactive 2D Canvas Orbit & Ray-Casting Engine
 * Telescopic Spectroscopic Viewfinder with Procedural Solar Corona & Blood Moon
 * Evidence Photography System & Detective Case Verification
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════
     1. STATE & CONSTANTS
     ═══════════════════════════════════════════════════════════ */
  const STATE = {
    screen: 'intro', // 'intro', 'sim', 'quiz', 'complete'
    cadetName: localStorage.getItem('skb_player_name') || localStorage.getItem('rbs_player_name') || 'Kadet Kosmik',
    activeCase: 'solar', // 'solar', 'lunar', 'sandbox'
    
    // Orbit Simulation Parameters
    moonAngle: 0, // degrees (0° = Moon between Sun & Earth; 180° = Moon behind Earth)
    moonDistance: 362000, // km (360,000 = Perigee -> Total, 406,000 = Apogee -> Annular)
    inclination: 0.0, // degrees (0° = Syzygy node alignment; 5.14° = natural tilt)
    isPlaying: true,
    simSpeed: 1, // multiplier
    
    // Viewport & Zoom on Orbit Canvas
    zoom: 1.0,
    panX: 0,
    panY: 0,
    isDraggingMoon: false,
    
    // Evidence Captured
    evidence: {
      solar: null, // dataUrl or canvas snapshot
      lunar: null,
      bonus: null
    },
    
    // Layers
    showRays: true,
    showCones: true,
    showLabels: true,

    // Audio
    audioEnabled: true,
    
    // Quiz
    quizIndex: 0,
    quizScore: 0,
    quizAnswers: []
  };

  /* ═══════════════════════════════════════════════════════════
     2. AUDIO SYNTHESIZER (WEB AUDIO API)
     ═══════════════════════════════════════════════════════════ */
  class SoundSynth {
    constructor() {
      this.ctx = null;
      this.bgmOsc1 = null;
      this.bgmOsc2 = null;
      this.bgmGain = null;
      this.isInit = false;
    }

    init() {
      if (this.isInit) return;
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
        this.isInit = true;
        this.startAmbientSpaceBGM();
      } catch (e) {
        console.warn('Web Audio not supported', e);
      }
    }

    startAmbientSpaceBGM() {
      if (!this.ctx || !STATE.audioEnabled) return;
      try {
        // Space Ambient Drone: Detuned sine waves with slow resonant LFO filter
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, this.ctx.currentTime);

        this.bgmOsc1 = this.ctx.createOscillator();
        this.bgmOsc1.type = 'sine';
        this.bgmOsc1.frequency.setValueAtTime(65.41, this.ctx.currentTime); // C2

        this.bgmOsc2 = this.ctx.createOscillator();
        this.bgmOsc2.type = 'sine';
        this.bgmOsc2.frequency.setValueAtTime(98.00, this.ctx.currentTime); // G2

        this.bgmOsc1.connect(filter);
        this.bgmOsc2.connect(filter);
        filter.connect(this.bgmGain);
        this.bgmGain.connect(this.ctx.destination);

        this.bgmOsc1.start();
        this.bgmOsc2.start();
      } catch (e) {
        console.warn('Error starting BGM drone', e);
      }
    }

    toggleMute() {
      STATE.audioEnabled = !STATE.audioEnabled;
      if (this.ctx && this.bgmGain) {
        this.bgmGain.gain.setValueAtTime(STATE.audioEnabled ? 0.04 : 0, this.ctx.currentTime);
      }
      return STATE.audioEnabled;
    }

    play(name) {
      if (!this.ctx || !STATE.audioEnabled) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      switch (name) {
        case 'click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, t);
          osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.linearRampToValueAtTime(0, t + 0.05);
          osc.start(t);
          osc.stop(t + 0.05);
          break;

        case 'shutter': {
          // Camera click sound: double burst of noise/click
          osc.type = 'square';
          osc.frequency.setValueAtTime(1200, t);
          osc.frequency.setValueAtTime(400, t + 0.04);
          gain.gain.setValueAtTime(0.25, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
          osc.start(t);
          osc.stop(t + 0.12);

          // Second click part
          const osc2 = this.ctx.createOscillator();
          const gain2 = this.ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(this.ctx.destination);
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(700, t + 0.06);
          gain2.gain.setValueAtTime(0.2, t + 0.06);
          gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
          osc2.start(t + 0.06);
          osc2.stop(t + 0.18);
          break;
        }

        case 'lock': {
          // High tech chime for Syzygy lock
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, t); // C5
          osc.frequency.setValueAtTime(659.25, t + 0.08); // E5
          osc.frequency.setValueAtTime(1046.50, t + 0.16); // C6
          gain.gain.setValueAtTime(0.15, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
          osc.start(t);
          osc.stop(t + 0.45);
          break;
        }

        case 'correct': {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, t); // D5
          osc.frequency.exponentialRampToValueAtTime(880.00, t + 0.18); // A5
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          osc.start(t);
          osc.stop(t + 0.35);
          break;
        }

        case 'wrong': {
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(180, t);
          osc.frequency.linearRampToValueAtTime(120, t + 0.25);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
          osc.start(t);
          osc.stop(t + 0.25);
          break;
        }

        case 'fanfare': {
          // Victory chord progression
          [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
            const o = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            o.connect(g);
            g.connect(this.ctx.destination);
            o.type = 'triangle';
            o.frequency.setValueAtTime(freq, t + i * 0.1);
            g.gain.setValueAtTime(0.15, t + i * 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.8 + i * 0.1);
            o.start(t + i * 0.1);
            o.stop(t + 0.8 + i * 0.1);
          });
          break;
        }
      }
    }
  }

  const audio = new SoundSynth();

  /* ═══════════════════════════════════════════════════════════
     3. QUIZ DATA (CURRICULUM ALIGNED FOR SMP/SD IPA)
     ═══════════════════════════════════════════════════════════ */
  const QUIZ_DATA = [
    {
      q: "Ketika terjadi fenomena Gerhana Matahari, bagaimanakah susunan posisi ketiga benda langit secara berurutan?",
      options: [
        "Bumi — Matahari — Bulan",
        "Matahari — Bulan — Bumi",
        "Matahari — Bumi — Bulan",
        "Bulan — Matahari — Bumi"
      ],
      correct: 1,
      explanation: "Tepat sekali! Pada Gerhana Matahari, Bulan berada di antara Matahari dan Bumi (Matahari — Bulan — Bumi) saat fase Bulan Baru, sehingga bayangan Bulan jatuh ke permukaan Bumi."
    },
    {
      q: "Seorang pengamat di Bumi berada tepat di daerah bayangan UMBRA Bulan. Fenomena apa yang disaksikan oleh pengamat tersebut?",
      options: [
        "Gerhana Matahari Sebagian",
        "Gerhana Bulan Total (Blood Moon)",
        "Gerhana Matahari Total dengan terlihatnya Korona Matahari",
        "Matahari bersinar normal tanpa ada tutupan bayangan"
      ],
      correct: 2,
      explanation: "Benar! Daerah UMBRA adalah bayangan inti yang gelap total karena seluruh piringan matahari terhalang. Di zona ini, siang hari berubah gelap seperti malam dan Korona Matahari yang indah tampak memancar."
    },
    {
      q: "Mengapa pada saat Gerhana Bulan Total, piringan Bulan tidak tampak hitam pekat melainkan menyala merah tembaga (Blood Moon)?",
      options: [
        "Karena Bulan memancarkan cahaya magma dari intinya sendiri",
        "Hamburan Rayleigh di atmosfer Bumi membiaskan cahaya matahari bergelombang panjang (merah) ke Bulan",
        "Karena pantulan cahaya dari planet Mars yang sedang berdekatan",
        "Karena debu asteroid di sabuk Kuiper membakar permukaan Bulan"
      ],
      correct: 1,
      explanation: "Hebat, analisis detektifmu tepat! Cahaya matahari melewati atmosfer Bumi. Cahaya biru dihamburkan (Hamburan Rayleigh), sedangkan spektrum merah dibiaskan menembus atmosfer dan menyinari permukaan Bulan, menghasilkan fenomena Blood Moon."
    }
  ];

  /* ═══════════════════════════════════════════════════════════
     4. DOM REFERENCES
     ═══════════════════════════════════════════════════════════ */
  const DOM = {
    // Screens
    screenIntro: document.getElementById('screen-intro'),
    screenSim: document.getElementById('screen-sim'),
    screenQuiz: document.getElementById('screen-quiz'),
    screenComplete: document.getElementById('screen-complete'),
    cameraFlash: document.getElementById('camera-flash'),
    modalArchive: document.getElementById('modal-archive'),

    // Intro elements
    cadetInput: document.getElementById('cadet-name-input'),
    btnStartMission: document.getElementById('btn-start-mission'),

    // HUD
    btnToggleAudio: document.getElementById('btn-toggle-audio'),
    audioIcon: document.getElementById('audio-icon'),
    audioLabel: document.getElementById('audio-label'),
    hudCadetName: document.getElementById('hud-cadet-name'),
    hudSyzygyFill: document.getElementById('hud-syzygy-fill'),
    hudSyzygyPct: document.getElementById('hud-syzygy-pct'),
    hudSyzygyStatus: document.getElementById('hud-syzygy-status'),
    pipSolar: document.getElementById('pip-solar'),
    pipLunar: document.getElementById('pip-lunar'),
    pipQuiz: document.getElementById('pip-quiz'),
    btnOpenArchive: document.getElementById('btn-open-archive'),
    btnOpenQuizDirect: document.getElementById('btn-open-quiz-direct'),

    // Case Control & Tabs
    tabSolar: document.getElementById('tab-case-solar'),
    tabLunar: document.getElementById('tab-case-lunar'),
    tabSandbox: document.getElementById('tab-case-sandbox'),
    cbcBadge: document.getElementById('cbc-badge'),
    cbcTitle: document.getElementById('cbc-title'),
    cbcDesc: document.getElementById('cbc-desc'),
    cbcTargetVal: document.getElementById('cbc-target-val'),

    // Syzygy Card
    syzygyLockTag: document.getElementById('syzygy-lock-tag'),
    syzygyMeterBar: document.getElementById('syzygy-meter-bar'),
    valAngleOffset: document.getElementById('val-angle-offset'),
    valShadowZone: document.getElementById('val-shadow-zone'),

    // Sliders & Controls
    sliderMoonAngle: document.getElementById('slider-moon-angle'),
    valMoonDeg: document.getElementById('val-moon-deg'),
    btnStepPrev: document.getElementById('btn-step-prev'),
    btnStepNext: document.getElementById('btn-step-next'),
    btnQuickSolar: document.getElementById('btn-quick-solar'),
    btnQuickLunar: document.getElementById('btn-quick-lunar'),
    sliderMoonDist: document.getElementById('slider-moon-dist'),
    valMoonDist: document.getElementById('val-moon-dist'),
    sliderInclination: document.getElementById('slider-inclination'),
    valInclination: document.getElementById('val-inclination'),
    btnPlayPause: document.getElementById('btn-play-pause'),
    btnResetPos: document.getElementById('btn-reset-pos'),
    speedBtns: document.querySelectorAll('.btn-speed'),
    chkShowRays: document.getElementById('chk-show-rays'),
    chkShowCones: document.getElementById('chk-show-cones'),
    chkShowLabels: document.getElementById('chk-show-labels'),

    // Canvases
    simCanvas: document.getElementById('simCanvas'),
    canvasWrapper: document.getElementById('canvas-wrapper'),
    canvasStatusTitle: document.getElementById('canvas-status-title'),
    csbPhenomenon: document.getElementById('csb-phenomenon'),
    btnZoomIn: document.getElementById('btn-zoom-in'),
    btnZoomReset: document.getElementById('btn-zoom-reset'),
    btnZoomOut: document.getElementById('btn-zoom-out'),
    telescopeCanvas: document.getElementById('telescopeCanvas'),

    // Telemetry & Viewfinder
    teleTarget: document.getElementById('tele-target'),
    teleCondition: document.getElementById('tele-condition'),
    teleObscuration: document.getElementById('tele-obscuration'),
    telePhenom: document.getElementById('tele-phenom'),
    camStatusMsg: document.getElementById('cam-status-msg'),
    btnCapturePhoto: document.getElementById('btn-capture-photo'),
    camBtnSub: document.getElementById('cam-btn-sub'),
    edcCounter: document.getElementById('edc-counter'),
    slotSolar: document.getElementById('slot-solar'),
    slotLunar: document.getElementById('slot-lunar'),
    slotBonus: document.getElementById('slot-bonus'),
    badgeSolar: document.getElementById('badge-solar'),
    badgeLunar: document.getElementById('badge-lunar'),
    badgeBonus: document.getElementById('badge-bonus'),
    previewSolar: document.getElementById('preview-solar'),
    previewLunar: document.getElementById('preview-lunar'),
    previewBonus: document.getElementById('preview-bonus'),
    btnProceedQuiz: document.getElementById('btn-proceed-quiz'),
    tickerText: document.getElementById('ticker-text'),

    // Quiz Elements
    quizProgressFill: document.getElementById('quiz-progress-fill'),
    quizQuestionNum: document.getElementById('quiz-question-num'),
    quizScoreBadge: document.getElementById('quiz-score-badge'),
    quizQuestionText: document.getElementById('quiz-question-text'),
    quizOptionsList: document.getElementById('quiz-options-list'),
    quizFeedbackBox: document.getElementById('quiz-feedback-box'),
    qfbTitle: document.getElementById('qfb-title'),
    qfbDesc: document.getElementById('qfb-desc'),
    btnQuizNext: document.getElementById('btn-quiz-next'),
    btnBackToSim: document.getElementById('btn-back-to-sim'),

    // Complete & Certificate
    esGrid: document.getElementById('es-grid'),
    certRecipientName: document.getElementById('cert-recipient-name'),
    certFinalGrade: document.getElementById('cert-final-grade'),
    certDateText: document.getElementById('cert-date-text'),
    btnPrintCertificate: document.getElementById('btnPrintCertificate') || document.getElementById('btn-print-certificate'),
    btnReplayMisi3: document.getElementById('btn-replay-misi3'),

    // Modals
    btnCloseArchive: document.getElementById('btn-close-archive'),
    btnCloseArchive2: document.getElementById('btn-close-archive-2')
  };

  /* ═══════════════════════════════════════════════════════════
     5. INITIALIZATION & SCREEN SWITCHING
     ═══════════════════════════════════════════════════════════ */
  function init() {
    // Fill cadet name from storage
    if (STATE.cadetName && DOM.cadetInput) {
      DOM.cadetInput.value = STATE.cadetName;
    }
    updateCadetDisplay();

    // Canvas sizes
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Event listeners
    bindEvents();

    // Start simulation render loop
    requestAnimationFrame(renderLoop);

    // Set initial case
    setCase('solar');
  }

  function setScreen(screenName) {
    STATE.screen = screenName;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    if (screenName === 'intro') DOM.screenIntro.classList.add('active');
    else if (screenName === 'sim') {
      DOM.screenSim.classList.add('active');
      resizeCanvas();
    } else if (screenName === 'quiz') {
      DOM.screenQuiz.classList.add('active');
      renderQuizQuestion();
    } else if (screenName === 'complete') {
      DOM.screenComplete.classList.add('active');
      renderCompletionScreen();
    }
  }

  function updateCadetDisplay() {
    if (DOM.hudCadetName) DOM.hudCadetName.textContent = STATE.cadetName;
    if (DOM.certRecipientName) DOM.certRecipientName.textContent = STATE.cadetName.toUpperCase();
  }

  function resizeCanvas() {
    if (!DOM.simCanvas) return;
    const rect = DOM.canvasWrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    DOM.simCanvas.width = rect.width * dpr;
    DOM.simCanvas.height = rect.height * dpr;
  }

  /* ═══════════════════════════════════════════════════════════
     6. GEOMETRY & ECLIPSE CALCULATIONS
     ═══════════════════════════════════════════════════════════ */
  function getSimulationMetrics() {
    const angle = ((STATE.moonAngle % 360) + 360) % 360; // 0 to 360
    const inc = STATE.inclination; // 0 to 5.14
    const dist = STATE.moonDistance; // 360000 to 406000 km

    // Is it near Solar eclipse (around 0° or 360°)?
    let diffSolar = Math.abs(angle > 180 ? 360 - angle : angle);
    // Is it near Lunar eclipse (around 180°)?
    let diffLunar = Math.abs(angle - 180);

    // Vertical displacement caused by inclination
    // When angle is 0° or 180° (nodes), vertical offset is minimal
    const verticalOffsetDeg = Math.abs(Math.sin(angle * Math.PI / 180)) * inc;

    // Combined angular misalignment
    const totalMisalignSolar = Math.sqrt(diffSolar * diffSolar + inc * inc);
    const totalMisalignLunar = Math.sqrt(diffLunar * diffLunar + inc * inc);

    // Syzygy alignment score (0 - 100%)
    let syzygyScore = 0;
    let modeType = 'none';

    if (STATE.activeCase === 'solar' || (STATE.activeCase !== 'lunar' && totalMisalignSolar <= totalMisalignLunar)) {
      modeType = 'solar';
      syzygyScore = Math.max(0, 100 - (totalMisalignSolar * 10));
    } else {
      modeType = 'lunar';
      syzygyScore = Math.max(0, 100 - (totalMisalignLunar * 10));
    }

    // Eclipse State Detection
    let eclipseState = 'NORMAL';
    let obscuration = 0; // 0 to 100%
    let shadowZone = 'Luar Bayangan';
    let phenomText = 'Normal';

    const isPerigee = dist < 380000;
    const isApogee = dist > 395000;

    if (modeType === 'solar') {
      if (totalMisalignSolar < 1.4) {
        // High syzygy!
        if (isApogee) {
          eclipseState = 'ANNULAR';
          obscuration = 94.5;
          shadowZone = 'Antumbra (Bulan di Apogee)';
          phenomText = 'Gerhana Matahari Cincin (Ring of Fire)';
        } else {
          eclipseState = 'TOTAL_SOLAR';
          obscuration = 100.0;
          shadowZone = 'Umbra (Gelap Total)';
          phenomText = 'Gerhana Matahari Total (Korona & Cincin Berlian)';
        }
      } else if (totalMisalignSolar < 5.0) {
        eclipseState = 'PARTIAL_SOLAR';
        obscuration = Math.max(10, Math.round((1 - (totalMisalignSolar / 5.0)) * 90));
        shadowZone = 'Penumbra (Gelap Sebagian)';
        phenomText = 'Gerhana Matahari Sebagian';
      }
    } else if (modeType === 'lunar') {
      if (totalMisalignLunar < 1.8) {
        eclipseState = 'TOTAL_LUNAR';
        obscuration = 100.0;
        shadowZone = 'Umbra Bumi (Gelap Penuh)';
        phenomText = 'Gerhana Bulan Total (Blood Moon / Rayleigh)';
      } else if (totalMisalignLunar < 5.5) {
        eclipseState = 'PARTIAL_LUNAR';
        obscuration = Math.max(15, Math.round((1 - (totalMisalignLunar / 5.5)) * 85));
        shadowZone = 'Sebagian Umbra / Penumbra';
        phenomText = 'Gerhana Bulan Sebagian';
      } else if (totalMisalignLunar < 8.0) {
        eclipseState = 'PENUMBRAL_LUNAR';
        obscuration = 20.0;
        shadowZone = 'Penumbra Bumi';
        phenomText = 'Gerhana Bulan Penumbra (Redup Halus)';
      }
    }

    return {
      angle,
      inc,
      dist,
      modeType,
      syzygyScore: Math.round(syzygyScore),
      totalMisalign: modeType === 'solar' ? totalMisalignSolar : totalMisalignLunar,
      eclipseState,
      obscuration,
      shadowZone,
      phenomText
    };
  }

  /* ═══════════════════════════════════════════════════════════
     7. MAIN ORBIT CANVAS RENDERING
     ═══════════════════════════════════════════════════════════ */
  function renderOrbitCanvas(metrics) {
    const canvas = DOM.simCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // Apply Zoom & Pan
    ctx.translate(w / 2 + STATE.panX, h / 2 + STATE.panY);
    ctx.scale(STATE.zoom, STATE.zoom);

    // Layout coordinates: Sun on left, Earth on center-right
    const sunX = -w * 0.38;
    const sunY = 0;
    const sunR = 48;

    const earthX = w * 0.18;
    const earthY = 0;
    const earthR = 26;

    // Moon Orbit calculation
    // Scale orbit radius according to distance (Perigee vs Apogee)
    const distNorm = (STATE.moonDistance - 360000) / (406000 - 360000); // 0 (perigee) to 1 (apogee)
    const orbitR = 96 + distNorm * 28; // 96px to 124px

    const rad = STATE.moonAngle * Math.PI / 180;
    // When angle = 0, Moon is towards Sun (x = earthX - orbitR)
    // When angle = 180, Moon is opposite Sun (x = earthX + orbitR)
    const moonX = earthX - Math.cos(rad) * orbitR;
    // Vertical position modified by inclination
    const moonY = earthY - Math.sin(rad) * orbitR * 0.5 + Math.sin(rad) * (STATE.inclination * 4);
    const moonR = 11 + (1 - distNorm) * 2.5; // larger disk at perigee

    // Store moon position for drag hit test
    STATE.moonScreenX = moonX;
    STATE.moonScreenY = moonY;
    STATE.earthScreenX = earthX;
    STATE.earthScreenY = earthY;
    STATE.orbitR = orbitR;

    // ── Layer: Moon Orbit Ring ──
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(earthX, earthY, orbitR, orbitR * 0.5, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.22)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.restore();

    // ── Layer: Optical Rays & Shadow Cones ──
    if (STATE.showCones || STATE.showRays) {
      // 1. Moon Shadow Cones (Solar Eclipse)
      drawShadowCones(ctx, sunX, sunY, sunR, moonX, moonY, moonR, earthX, earthY, earthR, 'moon');

      // 2. Earth Shadow Cones (Lunar Eclipse)
      drawShadowCones(ctx, sunX, sunY, sunR, earthX, earthY, earthR, moonX, moonY, moonR, 'earth');
    }

    // ── Layer: The Sun (Surya) ──
    drawSun(ctx, sunX, sunY, sunR);

    // ── Layer: Planet Earth (Bumi) ──
    drawEarth(ctx, earthX, earthY, earthR, sunX, sunY);

    // ── Layer: The Moon (Luna) ──
    drawMoon(ctx, moonX, moonY, moonR, sunX, sunY);

    // ── Layer: SKB-03 Detective Satellite / Sensor Drone ──
    drawDetectiveDrone(ctx, earthX, earthY, earthR, moonX, moonY, metrics);

    // ── Layer: Labels & Overlays ──
    if (STATE.showLabels) {
      drawCanvasLabels(ctx, sunX, sunY, sunR, earthX, earthY, earthR, moonX, moonY, moonR, metrics);
    }

    ctx.restore();
  }

  // Draw Sun with radiant corona glow
  function drawSun(ctx, x, y, r) {
    const time = performance.now() * 0.002;

    // Outer Corona Flare Halo
    const coronaGrad = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 3.0);
    coronaGrad.addColorStop(0, 'rgba(255, 230, 120, 0.85)');
    coronaGrad.addColorStop(0.3, 'rgba(255, 140, 20, 0.45)');
    coronaGrad.addColorStop(0.7, 'rgba(255, 60, 0, 0.15)');
    coronaGrad.addColorStop(1, 'rgba(255, 30, 0, 0)');
    ctx.fillStyle = coronaGrad;
    ctx.beginPath();
    ctx.arc(x, y, r * 3.0, 0, Math.PI * 2);
    ctx.fill();

    // Solar Prominence / Flares (procedural animated tentacles)
    ctx.save();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI / 4) + time * 0.2;
      const flareLen = r * 1.35 + Math.sin(time * 3 + i) * 6;
      const fx = x + Math.cos(angle) * flareLen;
      const fy = y + Math.sin(angle) * flareLen;

      ctx.beginPath();
      ctx.arc(fx, fy, 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 100, 30, 0.6)';
      ctx.fill();
    }
    ctx.restore();

    // Sun Core Disc
    const coreGrad = ctx.createRadialGradient(x - r * 0.25, y - r * 0.25, 2, x, y, r);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.3, '#fff4b8');
    coreGrad.addColorStop(0.75, '#ffbb22');
    coreGrad.addColorStop(1, '#ff6600');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw Earth with continents, atmosphere glow & day/night terminator
  function drawEarth(ctx, x, y, r, sunX, sunY) {
    ctx.save();

    // Atmosphere Rayleigh Blue Halo
    const atmoGrad = ctx.createRadialGradient(x, y, r * 0.85, x, y, r * 1.3);
    atmoGrad.addColorStop(0, 'rgba(70, 160, 255, 0.6)');
    atmoGrad.addColorStop(0.6, 'rgba(0, 140, 255, 0.2)');
    atmoGrad.addColorStop(1, 'rgba(0, 100, 255, 0)');
    ctx.fillStyle = atmoGrad;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Earth Base Ocean
    const oceanGrad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r);
    oceanGrad.addColorStop(0, '#2d78d6');
    oceanGrad.addColorStop(0.7, '#14468f');
    oceanGrad.addColorStop(1, '#092147');
    ctx.fillStyle = oceanGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Stylized Continents (Green/Earth tones)
    ctx.fillStyle = '#2d9c58';
    ctx.beginPath();
    ctx.arc(x - r * 0.2, y - r * 0.1, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + r * 0.3, y + r * 0.2, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Day/Night Shading (Sun is to the left)
    // Night is on the right side
    const nightGrad = ctx.createLinearGradient(x - r * 0.3, y, x + r, y);
    nightGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    nightGrad.addColorStop(0.4, 'rgba(0, 3, 10, 0.3)');
    nightGrad.addColorStop(0.8, 'rgba(0, 2, 8, 0.88)');
    nightGrad.addColorStop(1, 'rgba(0, 1, 5, 0.95)');
    ctx.fillStyle = nightGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Subtle clouds swirl
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y - r * 0.2, r * 0.65, 0.2, 1.6);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Moon with shaded terminator and craters
  function drawMoon(ctx, x, y, r, sunX, sunY) {
    ctx.save();

    // Moon body
    ctx.fillStyle = '#adb8c4';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Small craters
    ctx.fillStyle = '#838e9c';
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + r * 0.2, y + r * 0.3, r * 0.18, 0, Math.PI * 2);
    ctx.fill();

    // Day/Night shading: Left faces Sun, Right is in shadow
    const shadowGrad = ctx.createLinearGradient(x - r * 0.2, y, x + r, y);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0)');
    shadowGrad.addColorStop(0.5, 'rgba(5,10,20,0.4)');
    shadowGrad.addColorStop(1, 'rgba(2,4,8,0.92)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Drag ring highlight indicator
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, r + 4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Shadow Cones (Umbra & Penumbra) using optical geometric tangents
  function drawShadowCones(ctx, sunX, sunY, sunR, bX, bY, bR, tX, tY, tR, type) {
    ctx.save();

    // Vector from Sun to Blocker Body
    const dx = bX - sunX;
    const dy = bY - sunY;
    const distSB = Math.hypot(dx, dy);
    if (distSB === 0) { ctx.restore(); return; }

    const angle = Math.atan2(dy, dx);
    const perpAngle = angle + Math.PI / 2;

    // Tangent points on Sun
    const sunTopX = sunX + Math.cos(perpAngle) * sunR;
    const sunTopY = sunY + Math.sin(perpAngle) * sunR;
    const sunBotX = sunX - Math.cos(perpAngle) * sunR;
    const sunBotY = sunY - Math.sin(perpAngle) * sunR;

    // Tangent points on Blocker
    const bTopX = bX + Math.cos(perpAngle) * bR;
    const bTopY = bY + Math.sin(perpAngle) * bR;
    const bBotX = bX - Math.cos(perpAngle) * bR;
    const bBotY = bY - Math.sin(perpAngle) * bR;

    // 1. UMBRA VERTEX (Apex of the shadow cone where direct rays converge)
    // Length of Umbra = bR * distSB / (sunR - bR)
    const umbraLen = (bR * distSB) / Math.max(1, sunR - bR);
    const umbraApexX = bX + Math.cos(angle) * umbraLen;
    const umbraApexY = bY + Math.sin(angle) * umbraLen;

    // 2. PENUMBRA CONE (Outer divergent shadow)
    // Cross rays: SunTop -> BlockerBottom, and SunBottom -> BlockerTop
    const crossApexDist = (bR * distSB) / (sunR + bR);
    const crossApexX = bX - Math.cos(angle) * crossApexDist;
    const crossApexY = bY - Math.sin(angle) * crossApexDist;

    // Project penumbra rays far out
    const penumbraReach = 450;
    const pRay1Angle = Math.atan2(bBotY - sunTopY, bBotX - sunTopX);
    const pRay2Angle = Math.atan2(bTopY - sunBotY, bTopX - sunBotX);

    const pen1EndX = bBotX + Math.cos(pRay1Angle) * penumbraReach;
    const pen1EndY = bBotY + Math.sin(pRay1Angle) * penumbraReach;
    const pen2EndX = bTopX + Math.cos(pRay2Angle) * penumbraReach;
    const pen2EndY = bTopY + Math.sin(pRay2Angle) * penumbraReach;

    // ── DRAW PENUMBRA CONE ──
    if (STATE.showCones) {
      const penGrad = ctx.createRadialGradient(bX, bY, bR, bX + Math.cos(angle) * 200, bY + Math.sin(angle) * 200, 300);
      penGrad.addColorStop(0, 'rgba(40, 70, 120, 0.35)');
      penGrad.addColorStop(0.5, 'rgba(25, 45, 90, 0.20)');
      penGrad.addColorStop(1, 'rgba(10, 20, 50, 0)');

      ctx.fillStyle = penGrad;
      ctx.beginPath();
      ctx.moveTo(bTopX, bTopY);
      ctx.lineTo(pen2EndX, pen2EndY);
      ctx.lineTo(pen1EndX, pen1EndY);
      ctx.lineTo(bBotX, bBotY);
      ctx.closePath();
      ctx.fill();

      // Penumbra outer dotted boundary lines
      ctx.strokeStyle = 'rgba(80, 140, 220, 0.4)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(sunTopX, sunTopY);
      ctx.lineTo(pen1EndX, pen1EndY);
      ctx.moveTo(sunBotX, sunBotY);
      ctx.lineTo(pen2EndX, pen2EndY);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // ── DRAW UMBRA CONE ──
    if (STATE.showCones) {
      const umbraGrad = ctx.createLinearGradient(bX, bY, umbraApexX, umbraApexY);
      umbraGrad.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
      umbraGrad.addColorStop(0.6, 'rgba(2, 4, 12, 0.88)');
      umbraGrad.addColorStop(1, 'rgba(8, 12, 25, 0.75)');

      ctx.fillStyle = umbraGrad;
      ctx.beginPath();
      ctx.moveTo(bTopX, bTopY);
      ctx.lineTo(umbraApexX, umbraApexY);
      ctx.lineTo(bBotX, bBotY);
      ctx.closePath();
      ctx.fill();

      // Umbra solid core outline
      ctx.strokeStyle = 'rgba(255, 60, 60, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(bTopX, bTopY);
      ctx.lineTo(umbraApexX, umbraApexY);
      ctx.lineTo(bBotX, bBotY);
      ctx.stroke();

      // If Antumbra (Moon at Apogee during solar eclipse)
      // Umbra apex falls short of Earth, so shadow inverts into Antumbra cone!
      if (type === 'moon' && umbraApexX < tX - tR) {
        const antumbraReach = 200;
        const ant1EndX = umbraApexX + Math.cos(angle - 0.12) * antumbraReach;
        const ant1EndY = umbraApexY + Math.sin(angle - 0.12) * antumbraReach;
        const ant2EndX = umbraApexX + Math.cos(angle + 0.12) * antumbraReach;
        const ant2EndY = umbraApexY + Math.sin(angle + 0.12) * antumbraReach;

        ctx.fillStyle = 'rgba(255, 140, 40, 0.18)';
        ctx.beginPath();
        ctx.moveTo(umbraApexX, umbraApexY);
        ctx.lineTo(ant1EndX, ant1EndY);
        ctx.lineTo(ant2EndX, ant2EndY);
        ctx.closePath();
        ctx.fill();
      }
    }

    // ── DRAW DIRECT RAYS (Light Beams) ──
    if (STATE.showRays) {
      ctx.strokeStyle = 'rgba(255, 216, 77, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sunTopX, sunTopY);
      ctx.lineTo(bTopX, bTopY);
      ctx.moveTo(sunBotX, sunBotY);
      ctx.lineTo(bBotX, bBotY);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Detective Drone SKB-03
  function drawDetectiveDrone(ctx, earthX, earthY, earthR, moonX, moonY, metrics) {
    ctx.save();
    const time = performance.now() * 0.003;

    // Drone orbits around Earth observing shadow impact
    const droneOrbitR = earthR + 18;
    const droneAngle = (time * 0.8) + (metrics.modeType === 'solar' ? Math.PI : 0);
    const dx = earthX + Math.cos(droneAngle) * droneOrbitR;
    const dy = earthY + Math.sin(droneAngle) * droneOrbitR;

    // Drone Holographic Laser Scan
    ctx.strokeStyle = metrics.eclipseState.includes('TOTAL')
      ? 'rgba(56, 239, 125, 0.7)'
      : 'rgba(0, 212, 255, 0.5)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(dx, dy);
    ctx.lineTo(metrics.modeType === 'solar' ? earthX - earthR * 0.8 : earthX + earthR * 0.8, earthY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Drone Body
    ctx.fillStyle = '#00d4ff';
    ctx.beginPath();
    ctx.arc(dx, dy, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Drone Pulse Glow
    ctx.strokeStyle = 'rgba(0, 212, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(dx, dy, 6 + Math.sin(time * 5) * 2, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // Draw on-canvas labels
  function drawCanvasLabels(ctx, sunX, sunY, sunR, earthX, earthY, earthR, moonX, moonY, moonR, metrics) {
    ctx.save();
    ctx.font = 'bold 11px Outfit, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.textAlign = 'center';

    ctx.fillText('☀️ MATAHARI', sunX, sunY + sunR + 18);
    ctx.fillText('🌍 BUMI', earthX, earthY + earthR + 18);
    ctx.fillText('🌙 BULAN', moonX, moonY + moonR + 16);

    // Indicator of Syzygy alignment line
    if (metrics.syzygyScore > 90) {
      ctx.strokeStyle = 'rgba(56, 239, 125, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(earthX + 180, earthY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#38ef7d';
      ctx.font = 'bold 10px Orbitron, sans-serif';
      ctx.fillText('🎯 GARIS KESEGARISAN SYZYGY', (sunX + earthX) / 2, -35);
    }

    ctx.restore();
  }

  /* ═══════════════════════════════════════════════════════════
     8. VIEWFINDER TELESCOPE CANVAS RENDERING
     ═══════════════════════════════════════════════════════════ */
  function renderTelescopeViewfinder(metrics) {
    const canvas = DOM.telescopeCanvas;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const time = performance.now() * 0.002;

    ctx.clearRect(0, 0, w, h);

    // Deep space backdrop in lens
    ctx.fillStyle = '#010206';
    ctx.fillRect(0, 0, w, h);

    // Stars in telescope field of view
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    const seedStars = [
      [cx - 80, cy - 70, 1.2], [cx + 90, cy - 80, 1.5], [cx - 95, cy + 85, 1],
      [cx + 75, cy + 90, 1.3], [cx - 110, cy - 20, 0.8], [cx + 105, cy + 30, 1]
    ];
    seedStars.forEach(([sx, sy, sr]) => {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();

    const isSolar = metrics.modeType === 'solar';

    if (isSolar) {
      // ═══════════════════════════════════════════════════════
      // SOLAR VIEW: Viewing Sun from Earth
      // ═══════════════════════════════════════════════════════
      const sunRadius = 72;
      const moonRadius = metrics.dist < 380000 ? 73 : 66; // Larger than Sun at Perigee, smaller at Apogee

      // Angular offset between Moon and Sun disks (0 = dead center)
      const offsetScale = 45; // pixels per degree of total misalignment
      const moonOffsetX = metrics.totalMisalign * offsetScale;
      const moonOffsetY = (STATE.inclination * 6);

      // ── TOTAL SOLAR ECLIPSE (Totality) ──
      if (metrics.eclipseState === 'TOTAL_SOLAR') {
        // Dramatic Star Visibility during totality
        ctx.save();
        ctx.fillStyle = '#ffffff';
        [ [cx - 60, cy - 100], [cx + 80, cy - 60], [cx - 100, cy + 40], [cx + 70, cy + 80] ].forEach(([px, py]) => {
          ctx.beginPath();
          ctx.arc(px, py, 1.8, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.restore();

        // Procedural Solar Corona (Korona Matahari)
        drawSpectacularCorona(ctx, cx, cy, sunRadius, time);

        // Solar Prominences (Pink/Red hydrogen-alpha flame loops)
        drawSolarProminences(ctx, cx, cy, sunRadius, time);

        // Pitch Black Moon Disc
        ctx.fillStyle = '#020306';
        ctx.beginPath();
        ctx.arc(cx, cy, moonRadius, 0, Math.PI * 2);
        ctx.fill();

        // Diamond Ring Effect / Baily's Beads (if near the edge of totality)
        if (metrics.totalMisalign > 0.25 && metrics.totalMisalign < 0.6) {
          drawDiamondRing(ctx, cx, cy, sunRadius, time);
        }

      } else if (metrics.eclipseState === 'ANNULAR') {
        // ── ANNULAR SOLAR ECLIPSE ("Ring of Fire") ──
        // Sun Disc
        drawSunDisc(ctx, cx, cy, sunRadius);

        // Dark Moon in center revealing golden outer ring
        ctx.fillStyle = '#010204';
        ctx.beginPath();
        ctx.arc(cx + moonOffsetX * 0.3, cy + moonOffsetY * 0.3, moonRadius, 0, Math.PI * 2);
        ctx.fill();

        // Shimmering inner ring of fire
        ctx.strokeStyle = 'rgba(255, 230, 80, 0.9)';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(cx, cy, sunRadius, 0, Math.PI * 2);
        ctx.stroke();

      } else {
        // ── PARTIAL OR NORMAL SUN ──
        drawSunDisc(ctx, cx, cy, sunRadius);

        // If Partial Eclipse, cut out with Moon shadow disc
        if (metrics.totalMisalign < 2.5) {
          ctx.save();
          ctx.fillStyle = '#020408';
          ctx.beginPath();
          ctx.arc(cx + moonOffsetX, cy + moonOffsetY, moonRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

    } else {
      // ═══════════════════════════════════════════════════════
      // LUNAR VIEW: Viewing Moon from Earth
      // ═══════════════════════════════════════════════════════
      const moonRadius = 72;
      const earthShadowRadius = 110; // Earth's umbra shadow is much larger than Moon!
      const shadowOffsetX = metrics.totalMisalign * 35;
      const shadowOffsetY = (STATE.inclination * 7);

      if (metrics.eclipseState === 'TOTAL_LUNAR') {
        // ── BLOOD MOON (Total Lunar Eclipse) ──
        drawBloodMoon(ctx, cx, cy, moonRadius, time);

      } else if (metrics.eclipseState === 'PARTIAL_LUNAR') {
        // ── PARTIAL LUNAR ECLIPSE ──
        drawNormalMoonDisc(ctx, cx, cy, moonRadius);

        // Earth Umbra taking a bite out of Moon
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, moonRadius, 0, Math.PI * 2);
        ctx.clip(); // clip to moon disc

        // Earth shadow
        ctx.fillStyle = 'rgba(15, 8, 12, 0.94)';
        ctx.beginPath();
        ctx.arc(cx + shadowOffsetX, cy + shadowOffsetY, earthShadowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Copper glow at the edge of shadow (Rayleigh boundary)
        ctx.strokeStyle = 'rgba(215, 65, 40, 0.6)';
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();

      } else if (metrics.eclipseState === 'PENUMBRAL_LUNAR') {
        // ── PENUMBRAL ECLIPSE (Subtle dimming) ──
        drawNormalMoonDisc(ctx, cx, cy, moonRadius);

        ctx.fillStyle = 'rgba(10, 15, 30, 0.28)';
        ctx.beginPath();
        ctx.arc(cx, cy, moonRadius, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // ── NORMAL FULL MOON ──
        drawNormalMoonDisc(ctx, cx, cy, moonRadius);
      }
    }
  }

  // Draw Sun Disc in Viewfinder
  function drawSunDisc(ctx, cx, cy, r) {
    const sunGrad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, 5, cx, cy, r);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.25, '#fff6a8');
    sunGrad.addColorStop(0.65, '#ffd84d');
    sunGrad.addColorStop(0.92, '#ff9800');
    sunGrad.addColorStop(1, '#ff5722'); // limb darkening
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw Solar Corona (Totality)
  function drawSpectacularCorona(ctx, cx, cy, r, time) {
    ctx.save();

    // 1. Broad outer atmospheric glow
    const outerGrad = ctx.createRadialGradient(cx, cy, r, cx, cy, r * 2.8);
    outerGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    outerGrad.addColorStop(0.2, 'rgba(220, 240, 255, 0.65)');
    outerGrad.addColorStop(0.5, 'rgba(160, 210, 255, 0.3)');
    outerGrad.addColorStop(0.85, 'rgba(80, 150, 240, 0.1)');
    outerGrad.addColorStop(1, 'rgba(0, 40, 120, 0)');
    ctx.fillStyle = outerGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // 2. Radiating stream filaments (Ray streamers)
    const numRays = 36;
    for (let i = 0; i < numRays; i++) {
      const angle = (i / numRays) * Math.PI * 2;
      const rayLen = r * 1.5 + Math.sin(angle * 5 + time * 2) * (r * 0.6);

      const x1 = cx + Math.cos(angle) * r;
      const y1 = cy + Math.sin(angle) * r;
      const x2 = cx + Math.cos(angle) * rayLen;
      const y2 = cy + Math.sin(angle) * rayLen;

      ctx.strokeStyle = `rgba(235, 245, 255, ${0.15 + (i % 3) * 0.1})`;
      ctx.lineWidth = 2 + (i % 2);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Solar Prominences (Pink flares on limb)
  function drawSolarProminences(ctx, cx, cy, r, time) {
    ctx.save();
    const prominences = [0.8, 2.4, 4.1, 5.5];
    prominences.forEach((angle, idx) => {
      const px = cx + Math.cos(angle) * (r + 2);
      const py = cy + Math.sin(angle) * (r + 2);

      const flareSize = 5 + Math.sin(time * 4 + idx) * 2;
      ctx.fillStyle = 'rgba(255, 50, 120, 0.85)';
      ctx.beginPath();
      ctx.arc(px, py, flareSize, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  }

  // Draw Diamond Ring sparkle
  function drawDiamondRing(ctx, cx, cy, r, time) {
    ctx.save();
    const angle = 0.4;
    const dx = cx + Math.cos(angle) * r;
    const dy = cy + Math.sin(angle) * r;

    // Intense starburst
    const burstGrad = ctx.createRadialGradient(dx, dy, 1, dx, dy, 24);
    burstGrad.addColorStop(0, '#ffffff');
    burstGrad.addColorStop(0.3, 'rgba(255, 255, 200, 0.9)');
    burstGrad.addColorStop(0.7, 'rgba(255, 180, 50, 0.4)');
    burstGrad.addColorStop(1, 'rgba(255, 100, 0, 0)');
    ctx.fillStyle = burstGrad;
    ctx.beginPath();
    ctx.arc(dx, dy, 24, 0, Math.PI * 2);
    ctx.fill();

    // Cross spikes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(dx - 30, dy); ctx.lineTo(dx + 30, dy);
    ctx.moveTo(dx, dy - 30); ctx.lineTo(dx, dy + 30);
    ctx.stroke();
    ctx.restore();
  }

  // Draw Blood Moon in Viewfinder
  function drawBloodMoon(ctx, cx, cy, r, time) {
    ctx.save();

    // Ambient red scattering glow around Moon
    const halo = ctx.createRadialGradient(cx, cy, r * 0.9, cx, cy, r * 1.5);
    halo.addColorStop(0, 'rgba(215, 55, 30, 0.45)');
    halo.addColorStop(0.6, 'rgba(160, 30, 20, 0.15)');
    halo.addColorStop(1, 'rgba(80, 10, 10, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Blood Moon Body Gradient (Rich Copper & Crimson)
    const bloodGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 5, cx, cy, r);
    bloodGrad.addColorStop(0, '#e85d3f'); // bright copper
    bloodGrad.addColorStop(0.4, '#c0392b'); // crimson
    bloodGrad.addColorStop(0.8, '#8e1b13'); // dark wine
    bloodGrad.addColorStop(1, '#4a0808'); // shadow edge
    ctx.fillStyle = bloodGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Lunar Maria (Dark plains still faintly visible)
    ctx.fillStyle = 'rgba(40, 8, 8, 0.45)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.25, cy - r * 0.2, r * 0.28, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.2, cy + r * 0.15, r * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Atmosphere Ring of Rayleigh Refraction on edge
    ctx.strokeStyle = 'rgba(255, 120, 80, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Normal Full Moon in Viewfinder
  function drawNormalMoonDisc(ctx, cx, cy, r) {
    ctx.save();
    // Silver Lunar Disc
    const moonGrad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 5, cx, cy, r);
    moonGrad.addColorStop(0, '#ffffff');
    moonGrad.addColorStop(0.35, '#e4e8ee');
    moonGrad.addColorStop(0.8, '#b8c0cc');
    moonGrad.addColorStop(1, '#85909f');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Lunar Maria (Sea of Tranquility, etc.)
    ctx.fillStyle = 'rgba(100, 110, 125, 0.35)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.25, cy - r * 0.2, r * 0.3, 0, Math.PI * 2);
    ctx.arc(cx + r * 0.2, cy + r * 0.15, r * 0.35, 0, Math.PI * 2);
    ctx.arc(cx - r * 0.05, cy + r * 0.35, r * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // Craters
    ctx.fillStyle = 'rgba(70, 80, 95, 0.4)';
    ctx.beginPath();
    ctx.arc(cx + r * 0.4, cy - r * 0.3, 5, 0, Math.PI * 2);
    ctx.arc(cx - r * 0.35, cy + r * 0.25, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /* ═══════════════════════════════════════════════════════════
     9. UI & TELEMETRY UPDATER
     ═══════════════════════════════════════════════════════════ */
  function updateTelemetryAndUI(metrics) {
    // 1. Top HUD Syzygy Bar
    if (DOM.hudSyzygyFill) DOM.hudSyzygyFill.style.width = `${metrics.syzygyScore}%`;
    if (DOM.hudSyzygyPct) DOM.hudSyzygyPct.textContent = `${metrics.syzygyScore}%`;

    const isLocked = metrics.syzygyScore >= 85 || metrics.eclipseState.startsWith('TOTAL') || metrics.eclipseState === 'ANNULAR';
    if (DOM.hudSyzygyStatus) {
      if (isLocked) {
        DOM.hudSyzygyStatus.textContent = 'TERKUNCI! 🎯';
        DOM.hudSyzygyStatus.className = 'syzygy-hud-state locked';
      } else if (metrics.syzygyScore > 70) {
        DOM.hudSyzygyStatus.textContent = 'MENDEKATI ⚠️';
        DOM.hudSyzygyStatus.className = 'syzygy-hud-state';
      } else {
        DOM.hudSyzygyStatus.textContent = 'TIDAK SEGARIS';
        DOM.hudSyzygyStatus.className = 'syzygy-hud-state';
      }
    }

    // 2. Syzygy Card in Left Panel
    if (DOM.syzygyMeterBar) DOM.syzygyMeterBar.style.width = `${metrics.syzygyScore}%`;
    if (DOM.valAngleOffset) DOM.valAngleOffset.textContent = `${metrics.totalMisalign.toFixed(2)}°`;
    if (DOM.valShadowZone) DOM.valShadowZone.textContent = metrics.shadowZone;

    if (DOM.syzygyLockTag) {
      if (isLocked) {
        DOM.syzygyLockTag.textContent = 'TERKUNCI 🎯';
        DOM.syzygyLockTag.className = 'syzygy-badge-lock locked';
      } else {
        DOM.syzygyLockTag.textContent = 'BELUM SEGARIS';
        DOM.syzygyLockTag.className = 'syzygy-badge-lock';
      }
    }

    // 3. Status Banner above canvas
    if (DOM.csbPhenomenon) DOM.csbPhenomenon.textContent = `Status: ${metrics.phenomText}`;

    // 4. Viewfinder Telemetry
    if (DOM.teleTarget) {
      DOM.teleTarget.textContent = metrics.modeType === 'solar' ? 'Matahari (Surya)' : 'Bulan (Luna)';
    }
    if (DOM.teleCondition) {
      DOM.teleCondition.textContent = metrics.eclipseState;
    }
    if (DOM.teleObscuration) {
      DOM.teleObscuration.textContent = `${metrics.obscuration.toFixed(1)}%`;
    }
    if (DOM.telePhenom) {
      DOM.telePhenom.textContent = metrics.phenomText;
    }

    // 5. Evidence Camera Capture Button State
    const canCapture = metrics.eclipseState !== 'NORMAL';
    if (DOM.btnCapturePhoto) {
      DOM.btnCapturePhoto.disabled = !canCapture;
      if (canCapture) {
        DOM.btnCapturePhoto.classList.add('ready');
        if (DOM.camBtnSub) DOM.camBtnSub.textContent = `SIAP! Tekan untuk memotret ${metrics.phenomText}`;
      } else {
        DOM.btnCapturePhoto.classList.remove('ready');
        if (DOM.camBtnSub) DOM.camBtnSub.textContent = 'Terkunci (Sejajarkan orbit ke garis Syzygy)';
      }
    }

    // 6. Camera Status Message
    if (DOM.camStatusMsg) {
      if (isLocked) {
        DOM.camStatusMsg.innerHTML = `🌟 <strong>FENOMENA AKTIF:</strong> ${metrics.phenomText}`;
        DOM.camStatusMsg.style.color = '#38ef7d';
      } else {
        DOM.camStatusMsg.textContent = 'Arahkan posisi Bulan ke garis Syzygy untuk menjepret foto gerhana!';
        DOM.camStatusMsg.style.color = '';
      }
    }

    // 7. Update Objective Pips
    if (DOM.pipSolar) DOM.pipSolar.className = STATE.evidence.solar ? 'evidence-pip completed' : 'evidence-pip';
    if (DOM.pipLunar) DOM.pipLunar.className = STATE.evidence.lunar ? 'evidence-pip completed' : 'evidence-pip';
    if (DOM.pipQuiz) DOM.pipQuiz.className = STATE.quizScore > 0 ? 'evidence-pip completed' : 'evidence-pip';
  }

  /* ═══════════════════════════════════════════════════════════
     10. PHOTOGRAPHY SYSTEM (EVIDENCE CAPTURE)
     ═══════════════════════════════════════════════════════════ */
  function captureEvidencePhoto(metrics) {
    if (!DOM.telescopeCanvas) return;

    // Trigger Camera Flash Overlay
    if (DOM.cameraFlash) {
      DOM.cameraFlash.classList.add('flash-active');
      setTimeout(() => DOM.cameraFlash.classList.remove('flash-active'), 300);
    }

    // Sound effect
    audio.play('shutter');

    // Snapshot image from telescope canvas
    const dataUrl = DOM.telescopeCanvas.toDataURL('image/png');

    let capturedType = '';

    if (metrics.eclipseState === 'TOTAL_SOLAR') {
      STATE.evidence.solar = {
        title: 'Gerhana Matahari Total',
        desc: 'Korona Matahari & Cincin Berlian',
        date: new Date().toLocaleDateString('id-ID'),
        image: dataUrl,
        type: 'solar'
      };
      capturedType = 'solar';
      renderEvidenceSlot('solar', STATE.evidence.solar);
      showTickerToast('📸 FOTO KORONA MATAHARI TERVERIFIKASI! Suhu korona mencapai lebih dari 1.000.000°C.');

    } else if (metrics.eclipseState === 'TOTAL_LUNAR') {
      STATE.evidence.lunar = {
        title: 'Gerhana Bulan Total (Blood Moon)',
        desc: 'Pembiasan Rayleigh Atmosfer Bumi',
        date: new Date().toLocaleDateString('id-ID'),
        image: dataUrl,
        type: 'lunar'
      };
      capturedType = 'lunar';
      renderEvidenceSlot('lunar', STATE.evidence.lunar);
      showTickerToast('📸 FOTO BLOOD MOON TERVERIFIKASI! Bulan menyala merah tembaga karena hamburan Rayleigh.');

    } else if (metrics.eclipseState === 'ANNULAR') {
      STATE.evidence.bonus = {
        title: 'Gerhana Matahari Cincin',
        desc: 'Bulan di Apogee (Antumbra)',
        date: new Date().toLocaleDateString('id-ID'),
        image: dataUrl,
        type: 'bonus'
      };
      capturedType = 'bonus';
      renderEvidenceSlot('bonus', STATE.evidence.bonus);
      if (!STATE.evidence.solar) {
        STATE.evidence.solar = {
          title: 'Gerhana Matahari (Cincin Api)',
          desc: 'Piringan Bulan di Apogee',
          date: new Date().toLocaleDateString('id-ID'),
          image: dataUrl,
          type: 'solar'
        };
        renderEvidenceSlot('solar', STATE.evidence.solar);
      }
      showTickerToast('📸 FOTO GERHANA CINCIN API TERTANGKAP! Fenomena piringan bulan di titik Apogee.');

    } else if (metrics.eclipseState.includes('PARTIAL') || metrics.eclipseState.includes('PENUMBRAL')) {
      STATE.evidence.bonus = {
        title: metrics.eclipseState.includes('SOLAR') ? 'Gerhana Matahari Sebagian' : 'Gerhana Bulan Sebagian',
        desc: 'Daerah Penumbra Terverifikasi',
        date: new Date().toLocaleDateString('id-ID'),
        image: dataUrl,
        type: 'bonus'
      };
      capturedType = 'bonus';
      renderEvidenceSlot('bonus', STATE.evidence.bonus);
    }

    // Check completion condition
    checkEvidenceProgress();
  }

  function renderEvidenceSlot(slotKey, data) {
    let previewEl, badgeEl, slotEl;
    if (slotKey === 'solar') {
      previewEl = DOM.previewSolar; badgeEl = DOM.badgeSolar; slotEl = DOM.slotSolar;
    } else if (slotKey === 'lunar') {
      previewEl = DOM.previewLunar; badgeEl = DOM.badgeLunar; slotEl = DOM.slotLunar;
    } else {
      previewEl = DOM.previewBonus; badgeEl = DOM.badgeBonus; slotEl = DOM.slotBonus;
    }

    if (!slotEl || !data) return;

    slotEl.classList.add('unlocked');
    if (badgeEl) badgeEl.textContent = 'TERVERIFIKASI ✓';
    if (previewEl) {
      previewEl.innerHTML = `<img src="${data.image}" alt="${data.title}">`;
    }
  }

  function checkEvidenceProgress() {
    let count = 0;
    if (STATE.evidence.solar) count++;
    if (STATE.evidence.lunar) count++;

    if (DOM.edcCounter) DOM.edcCounter.textContent = `${count} / 2 Wajib`;

    // Unlock proceed to Quiz button if both main cases captured
    if (count >= 2) {
      if (DOM.btnProceedQuiz) {
        DOM.btnProceedQuiz.disabled = false;
        DOM.btnProceedQuiz.classList.add('pulse-radar');
      }
      audio.play('fanfare');
      showTickerToast('🎉 KEDUA BUKTI UTAMA LENGKAP! Silakan lanjut ke Uji Teori Detektif (Kuis).');
    }
  }

  function showTickerToast(msg) {
    if (DOM.tickerText) {
      DOM.tickerText.textContent = msg;
      DOM.tickerText.style.color = '#38ef7d';
      setTimeout(() => {
        if (DOM.tickerText) DOM.tickerText.style.color = '';
      }, 5000);
    }
  }

  /* ═══════════════════════════════════════════════════════════
     11. CASE SELECTION & PRESETS
     ═══════════════════════════════════════════════════════════ */
  function setCase(caseName) {
    STATE.activeCase = caseName;

    // Update active tab styles
    [DOM.tabSolar, DOM.tabLunar, DOM.tabSandbox].forEach(tab => {
      if (tab) tab.classList.remove('active');
    });

    if (caseName === 'solar') {
      if (DOM.tabSolar) DOM.tabSolar.classList.add('active');
      if (DOM.cbcBadge) { DOM.cbcBadge.textContent = 'KASUS 01'; DOM.cbcBadge.className = 'cbc-badge case-solar'; }
      if (DOM.cbcTitle) DOM.cbcTitle.textContent = 'Gerhana Matahari';
      if (DOM.cbcDesc) DOM.cbcDesc.innerHTML = 'Atur posisi Bulan di antara Matahari dan Bumi pada garis lurus. Luruskan kemiringan orbit agar bayangan <strong>Umbra</strong> tepat jatuh ke Bumi!';
      if (DOM.cbcTargetVal) DOM.cbcTargetVal.textContent = 'Foto Korona Matahari (Totalitas)';
      
      // Preset angles close to solar syzygy
      STATE.moonAngle = 0;
      STATE.inclination = 0;
      STATE.isPlaying = false;
      if (DOM.btnPlayPause) DOM.btnPlayPause.textContent = '▶️ Putar';
      updateSliderInputs();

    } else if (caseName === 'lunar') {
      if (DOM.tabLunar) DOM.tabLunar.classList.add('active');
      if (DOM.cbcBadge) { DOM.cbcBadge.textContent = 'KASUS 02'; DOM.cbcBadge.className = 'cbc-badge case-lunar'; }
      if (DOM.cbcTitle) DOM.cbcTitle.textContent = 'Gerhana Bulan (Blood Moon)';
      if (DOM.cbcDesc) DOM.cbcDesc.innerHTML = 'Atur Bumi berada tepat di antara Matahari dan Bulan. Amati Bulan memasuki kerucut bayangan <strong>Umbra Bumi</strong>!';
      if (DOM.cbcTargetVal) DOM.cbcTargetVal.textContent = 'Foto Blood Moon (Totalitas)';
      
      // Preset angles close to lunar syzygy
      STATE.moonAngle = 180;
      STATE.inclination = 0;
      STATE.isPlaying = false;
      if (DOM.btnPlayPause) DOM.btnPlayPause.textContent = '▶️ Putar';
      updateSliderInputs();

    } else {
      if (DOM.tabSandbox) DOM.tabSandbox.classList.add('active');
      if (DOM.cbcBadge) { DOM.cbcBadge.textContent = 'SANDBOX'; DOM.cbcBadge.className = 'cbc-badge case-theory'; }
      if (DOM.cbcTitle) DOM.cbcTitle.textContent = 'Eksplorasi Bebas Orbit';
      if (DOM.cbcDesc) DOM.cbcDesc.innerHTML = 'Bebas bereksperimen dengan sudut, jarak (Perigee/Apogee), dan kemiringan orbit 5.14° untuk memahami kenapa gerhana tidak terjadi setiap bulan.';
      if (DOM.cbcTargetVal) DOM.cbcTargetVal.textContent = 'Eksplorasi Gerhana Cincin & Parsial';
    }

    audio.play('click');
  }

  function updateSliderInputs() {
    if (DOM.sliderMoonAngle) DOM.sliderMoonAngle.value = STATE.moonAngle;
    if (DOM.valMoonDeg) DOM.valMoonDeg.textContent = `${STATE.moonAngle.toFixed(1)}° (${getPhaseName(STATE.moonAngle)})`;

    if (DOM.sliderMoonDist) DOM.sliderMoonDist.value = STATE.moonDistance;
    if (DOM.valMoonDist) {
      DOM.valMoonDist.textContent = STATE.moonDistance < 380000 ? 'Perigee (Terdekat)' : 'Apogee (Terjauh)';
    }

    if (DOM.sliderInclination) DOM.sliderInclination.value = STATE.inclination;
    if (DOM.valInclination) {
      DOM.valInclination.textContent = `${STATE.inclination.toFixed(1)}° ${STATE.inclination < 0.5 ? '(Simpul Node Sejajar)' : '(Miring)'}`;
    }
  }

  function getPhaseName(angle) {
    const a = ((angle % 360) + 360) % 360;
    if (a >= 340 || a <= 20) return 'Bulan Baru';
    if (a > 20 && a < 70) return 'Sabit Muda';
    if (a >= 70 && a <= 110) return 'Kuartir Pertama';
    if (a > 110 && a < 160) return 'Cembung Muda';
    if (a >= 160 && a <= 200) return 'Bulan Purnama';
    if (a > 200 && a < 250) return 'Cembung Tua';
    if (a >= 250 && a <= 290) return 'Kuartir Ketiga';
    return 'Sabit Tua';
  }

  /* ═══════════════════════════════════════════════════════════
     12. CANVAS INTERACTIVE DRAG (MOON POINTER CONTROL)
     ═══════════════════════════════════════════════════════════ */
  function setupCanvasDrag() {
    const wrapper = DOM.canvasWrapper;
    if (!wrapper) return;

    function handleStart(clientX, clientY) {
      const rect = DOM.simCanvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const x = clientX - rect.left - (rect.width / 2 + STATE.panX);
      const y = clientY - rect.top - (rect.height / 2 + STATE.panY);

      // Check distance to Moon
      const distToMoon = Math.hypot(x - STATE.moonScreenX, y - STATE.moonScreenY);
      if (distToMoon < 30) {
        STATE.isDraggingMoon = true;
        STATE.isPlaying = false;
        if (DOM.btnPlayPause) DOM.btnPlayPause.textContent = '▶️ Putar';
        wrapper.classList.add('dragging');
        audio.play('click');
      }
    }

    function handleMove(clientX, clientY) {
      if (!STATE.isDraggingMoon) return;
      const rect = DOM.simCanvas.getBoundingClientRect();
      const x = clientX - rect.left - (rect.width / 2 + STATE.panX);
      const y = clientY - rect.top - (rect.height / 2 + STATE.panY);

      // Vector from Earth to pointer
      const dx = -(x - STATE.earthScreenX); // invert because 0° is towards Sun (left)
      const dy = -(y - STATE.earthScreenY);

      let rad = Math.atan2(dy, dx);
      let deg = rad * 180 / Math.PI;
      if (deg < 0) deg += 360;

      STATE.moonAngle = Math.round(deg * 2) / 2; // snap to 0.5°
      updateSliderInputs();
    }

    function handleEnd() {
      if (STATE.isDraggingMoon) {
        STATE.isDraggingMoon = false;
        wrapper.classList.remove('dragging');
      }
    }

    // Mouse events
    wrapper.addEventListener('mousedown', e => handleStart(e.clientX, e.clientY));
    window.addEventListener('mousemove', e => handleMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', handleEnd);

    // Touch events
    wrapper.addEventListener('touchstart', e => {
      if (e.touches.length === 1) {
        handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', e => {
      if (STATE.isDraggingMoon && e.touches.length === 1) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', handleEnd);
  }

  /* ═══════════════════════════════════════════════════════════
     13. QUIZ SYSTEM
     ═══════════════════════════════════════════════════════════ */
  function renderQuizQuestion() {
    const qData = QUIZ_DATA[STATE.quizIndex];
    if (!qData) return;

    if (DOM.quizQuestionNum) {
      DOM.quizQuestionNum.textContent = `Pertanyaan ${STATE.quizIndex + 1} dari ${QUIZ_DATA.length}`;
    }
    if (DOM.quizProgressFill) {
      DOM.quizProgressFill.style.width = `${((STATE.quizIndex + 1) / QUIZ_DATA.length) * 100}%`;
    }
    if (DOM.quizScoreBadge) {
      DOM.quizScoreBadge.textContent = `Skor: ${STATE.quizScore} / ${QUIZ_DATA.length * 100}`;
    }
    if (DOM.quizQuestionText) {
      DOM.quizQuestionText.textContent = qData.q;
    }

    // Hide feedback & next button
    if (DOM.quizFeedbackBox) DOM.quizFeedbackBox.style.display = 'none';
    if (DOM.btnQuizNext) DOM.btnQuizNext.style.display = 'none';

    // Render Options
    if (DOM.quizOptionsList) {
      DOM.quizOptionsList.innerHTML = '';
      const letters = ['A', 'B', 'C', 'D'];
      qData.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt-btn';
        btn.innerHTML = `<span class="opt-prefix">${letters[idx]}</span><span>${optText}</span>`;
        btn.addEventListener('click', () => handleQuizAnswer(idx, qData));
        DOM.quizOptionsList.appendChild(btn);
      });
    }
  }

  function handleQuizAnswer(selectedIdx, qData) {
    const isCorrect = selectedIdx === qData.correct;
    const optButtons = DOM.quizOptionsList.querySelectorAll('.quiz-opt-btn');

    // Disable all options
    optButtons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === qData.correct) {
        btn.classList.add('correct');
      } else if (idx === selectedIdx) {
        btn.classList.add('wrong');
      }
    });

    if (isCorrect) {
      STATE.quizScore += 100;
      audio.play('correct');
    } else {
      audio.play('wrong');
    }

    // Show feedback
    if (DOM.quizFeedbackBox && DOM.qfbTitle && DOM.qfbDesc) {
      DOM.quizFeedbackBox.style.display = 'block';
      DOM.quizFeedbackBox.className = `quiz-feedback-box ${isCorrect ? 'correct' : 'wrong'}`;
      DOM.qfbTitle.textContent = isCorrect ? '🎉 JAWABAN TEPAT!' : '⚠️ KURANG TEPAT';
      DOM.qfbTitle.style.color = isCorrect ? '#38ef7d' : '#ff4455';
      DOM.qfbDesc.textContent = qData.explanation;
    }

    // Show next or finish button
    if (DOM.btnQuizNext) {
      DOM.btnQuizNext.style.display = 'inline-flex';
      DOM.btnQuizNext.textContent = (STATE.quizIndex < QUIZ_DATA.length - 1)
        ? 'Pertanyaan Berikutnya ▶'
        : 'Tuntaskan Misi & Buka Sertifikat 🏅';
    }
  }

  function proceedNextQuizStep() {
    if (STATE.quizIndex < QUIZ_DATA.length - 1) {
      STATE.quizIndex++;
      renderQuizQuestion();
    } else {
      // Completed!
      setScreen('complete');
      audio.play('fanfare');
    }
  }

  /* ═══════════════════════════════════════════════════════════
     14. COMPLETION SCREEN & CERTIFICATE
     ═══════════════════════════════════════════════════════════ */
  function renderCompletionScreen() {
    // Fill cadet name
    if (DOM.certRecipientName) {
      DOM.certRecipientName.textContent = STATE.cadetName.toUpperCase();
    }

    // Set date
    const today = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    if (DOM.certDateText) {
      DOM.certDateText.textContent = `Diterbitkan pada: ${today}`;
    }

    // Final Grade determination
    let grade = 'DETEKTIF KOSMIK UTAMA ★★★★★';
    if (STATE.quizScore >= 300) {
      grade = 'DETEKTIF KOSMIK BINTANG LIMA (SEMPURNA) ★★★★★';
    } else if (STATE.quizScore >= 200) {
      grade = 'DETEKTIF ASTRONOMI PERWIRA ★★★★☆';
    } else {
      grade = 'DETEKTIF KOSMIK TINGKAT MUDA ★★★☆☆';
    }
    if (DOM.certFinalGrade) DOM.certFinalGrade.textContent = grade;

    // Render Evidence Cards Gallery
    if (DOM.esGrid) {
      DOM.esGrid.innerHTML = '';
      const items = [
        STATE.evidence.solar || {
          title: 'Gerhana Matahari',
          desc: 'Simulasi Terverifikasi',
          image: DOM.telescopeCanvas.toDataURL()
        },
        STATE.evidence.lunar || {
          title: 'Gerhana Bulan',
          desc: 'Simulasi Terverifikasi',
          image: DOM.telescopeCanvas.toDataURL()
        },
        STATE.evidence.bonus || {
          title: 'Analisis Optik Syzygy',
          desc: 'Geometri Umbra & Penumbra',
          image: DOM.telescopeCanvas.toDataURL()
        }
      ];

      items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'es-card';
        card.innerHTML = `
          <div class="es-thumb">
            <img src="${item.image}" alt="${item.title}" style="width:100%;height:100%;object-fit:cover;">
            <div class="es-stamp">SKB VERIFIED</div>
          </div>
          <div class="es-meta">
            <div class="es-name">${item.title}</div>
            <div class="es-sub">${item.desc}</div>
          </div>
        `;
        DOM.esGrid.appendChild(card);
      });
    }
  }

  /* ── Tutorial Modal (Panduan Detektif Gerhana) ────────────── */
  function openTutorial() {
    const modal = document.getElementById('eclipse-tutorial-modal');
    if (!modal) return;
    const nameEl = document.getElementById('m3-tutorial-cadet-name');
    if (nameEl) nameEl.textContent = STATE.cadetName || 'Kadet';
    modal.classList.remove('hidden');
    audio.play('success');
  }

  function closeTutorial() {
    const modal = document.getElementById('eclipse-tutorial-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    STATE.hasSeenTutorial = true;
    audio.play('click');
  }

  function setupTutorial() {
    const btnOpen = document.getElementById('btn-tutorial-m3');
    const btnX = document.getElementById('btn-m3-tutorial-x');
    const btnStart = document.getElementById('btn-m3-tutorial-start');
    const backdrop = document.getElementById('m3-tutorial-backdrop');

    if (btnOpen) btnOpen.addEventListener('click', openTutorial);
    if (btnX) btnX.addEventListener('click', closeTutorial);
    if (btnStart) btnStart.addEventListener('click', closeTutorial);
    if (backdrop) backdrop.addEventListener('click', closeTutorial);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('eclipse-tutorial-modal');
        if (modal && !modal.classList.contains('hidden')) {
          closeTutorial();
        }
      }
    });
  }

  /* ═══════════════════════════════════════════════════════════
     15. EVENT BINDINGS
     ═══════════════════════════════════════════════════════════ */
  function bindEvents() {
    // Audio Toggle
    if (DOM.btnToggleAudio) {
      DOM.btnToggleAudio.addEventListener('click', () => {
        audio.init();
        const active = audio.toggleMute();
        if (DOM.audioIcon) DOM.audioIcon.textContent = active ? '🔊' : '🔇';
        if (DOM.btnToggleAudio) DOM.btnToggleAudio.classList.toggle('muted', !active);
      });
    }

    // Start Mission Button
    if (DOM.btnStartMission) {
      DOM.btnStartMission.addEventListener('click', () => {
        audio.init();
        if (DOM.cadetInput && DOM.cadetInput.value.trim()) {
          STATE.cadetName = DOM.cadetInput.value.trim();
          localStorage.setItem('skb_player_name', STATE.cadetName);
          localStorage.setItem('rbs_player_name', STATE.cadetName);
          updateCadetDisplay();
        }
        audio.play('click');
        setScreen('sim');

        // Auto-open tutorial on first arrival
        if (!STATE.hasSeenTutorial) {
          setTimeout(openTutorial, 400);
        }
      });
    }

    // Case Tabs
    if (DOM.tabSolar) DOM.tabSolar.addEventListener('click', () => setCase('solar'));
    if (DOM.tabLunar) DOM.tabLunar.addEventListener('click', () => setCase('lunar'));
    if (DOM.tabSandbox) DOM.tabSandbox.addEventListener('click', () => setCase('sandbox'));

    // Moon Angle Slider
    if (DOM.sliderMoonAngle) {
      DOM.sliderMoonAngle.addEventListener('input', e => {
        STATE.moonAngle = parseFloat(e.target.value);
        STATE.isPlaying = false;
        if (DOM.btnPlayPause) DOM.btnPlayPause.textContent = '▶️ Putar';
        if (DOM.valMoonDeg) {
          DOM.valMoonDeg.textContent = `${STATE.moonAngle.toFixed(1)}° (${getPhaseName(STATE.moonAngle)})`;
        }
      });
    }

    // Step buttons
    if (DOM.btnStepPrev) {
      DOM.btnStepPrev.addEventListener('click', () => {
        STATE.moonAngle = ((STATE.moonAngle - 15) % 360 + 360) % 360;
        STATE.isPlaying = false;
        if (DOM.btnPlayPause) DOM.btnPlayPause.textContent = '▶️ Putar';
        updateSliderInputs();
        audio.play('click');
      });
    }
    if (DOM.btnStepNext) {
      DOM.btnStepNext.addEventListener('click', () => {
        STATE.moonAngle = (STATE.moonAngle + 15) % 360;
        STATE.isPlaying = false;
        if (DOM.btnPlayPause) DOM.btnPlayPause.textContent = '▶️ Putar';
        updateSliderInputs();
        audio.play('click');
      });
    }
    if (DOM.btnQuickSolar) {
      DOM.btnQuickSolar.addEventListener('click', () => {
        STATE.moonAngle = 0;
        STATE.inclination = 0;
        STATE.isPlaying = false;
        if (DOM.btnPlayPause) DOM.btnPlayPause.textContent = '▶️ Putar';
        updateSliderInputs();
        audio.play('lock');
      });
    }
    if (DOM.btnQuickLunar) {
      DOM.btnQuickLunar.addEventListener('click', () => {
        STATE.moonAngle = 180;
        STATE.inclination = 0;
        STATE.isPlaying = false;
        if (DOM.btnPlayPause) DOM.btnPlayPause.textContent = '▶️ Putar';
        updateSliderInputs();
        audio.play('lock');
      });
    }

    // Distance Slider
    if (DOM.sliderMoonDist) {
      DOM.sliderMoonDist.addEventListener('input', e => {
        STATE.moonDistance = parseInt(e.target.value, 10);
        if (DOM.valMoonDist) {
          DOM.valMoonDist.textContent = STATE.moonDistance < 380000 ? 'Perigee (Terdekat)' : 'Apogee (Terjauh)';
        }
      });
    }

    // Inclination Slider
    if (DOM.sliderInclination) {
      DOM.sliderInclination.addEventListener('input', e => {
        STATE.inclination = parseFloat(e.target.value);
        if (DOM.valInclination) {
          DOM.valInclination.textContent = `${STATE.inclination.toFixed(1)}° ${STATE.inclination < 0.5 ? '(Simpul Node Sejajar)' : '(Miring)'}`;
        }
      });
    }

    // Play/Pause & Speed
    if (DOM.btnPlayPause) {
      DOM.btnPlayPause.addEventListener('click', () => {
        STATE.isPlaying = !STATE.isPlaying;
        DOM.btnPlayPause.textContent = STATE.isPlaying ? '⏸️ Jeda' : '▶️ Putar';
        audio.play('click');
      });
    }
    if (DOM.btnResetPos) {
      DOM.btnResetPos.addEventListener('click', () => {
        STATE.moonAngle = STATE.activeCase === 'solar' ? 0 : (STATE.activeCase === 'lunar' ? 180 : 0);
        STATE.inclination = 0;
        STATE.moonDistance = 362000;
        updateSliderInputs();
        audio.play('click');
      });
    }
    DOM.speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        STATE.simSpeed = parseFloat(btn.dataset.speed);
        audio.play('click');
      });
    });

    // Layer Checkboxes
    if (DOM.chkShowRays) DOM.chkShowRays.addEventListener('change', e => STATE.showRays = e.target.checked);
    if (DOM.chkShowCones) DOM.chkShowCones.addEventListener('change', e => STATE.showCones = e.target.checked);
    if (DOM.chkShowLabels) DOM.chkShowLabels.addEventListener('change', e => STATE.showLabels = e.target.checked);

    // Zoom Controls
    if (DOM.btnZoomIn) DOM.btnZoomIn.addEventListener('click', () => STATE.zoom = Math.min(2.0, STATE.zoom + 0.15));
    if (DOM.btnZoomOut) DOM.btnZoomOut.addEventListener('click', () => STATE.zoom = Math.max(0.6, STATE.zoom - 0.15));
    if (DOM.btnZoomReset) DOM.btnZoomReset.addEventListener('click', () => { STATE.zoom = 1.0; STATE.panX = 0; STATE.panY = 0; });

    // Capture Photo Button
    if (DOM.btnCapturePhoto) {
      DOM.btnCapturePhoto.addEventListener('click', () => {
        const metrics = getSimulationMetrics();
        captureEvidencePhoto(metrics);
      });
    }

    // Proceed to Quiz Button
    if (DOM.btnProceedQuiz) {
      DOM.btnProceedQuiz.addEventListener('click', () => {
        setScreen('quiz');
        audio.play('click');
      });
    }
    if (DOM.btnOpenQuizDirect) {
      DOM.btnOpenQuizDirect.addEventListener('click', () => {
        setScreen('quiz');
        audio.play('click');
      });
    }

    // Quiz Navigation
    if (DOM.btnQuizNext) {
      DOM.btnQuizNext.addEventListener('click', proceedNextQuizStep);
    }
    if (DOM.btnBackToSim) {
      DOM.btnBackToSim.addEventListener('click', () => setScreen('sim'));
    }

    // Certificate Print Button
    if (DOM.btnPrintCertificate) {
      DOM.btnPrintCertificate.addEventListener('click', () => {
        window.print();
      });
    }

    // Replay Misi 3
    if (DOM.btnReplayMisi3) {
      DOM.btnReplayMisi3.addEventListener('click', () => {
        STATE.quizIndex = 0;
        STATE.quizScore = 0;
        STATE.evidence = { solar: null, lunar: null, bonus: null };
        setScreen('sim');
      });
    }

    // Archive Modal
    if (DOM.btnOpenArchive) DOM.btnOpenArchive.addEventListener('click', () => DOM.modalArchive.classList.add('open'));
    if (DOM.btnCloseArchive) DOM.btnCloseArchive.addEventListener('click', () => DOM.modalArchive.classList.remove('open'));
    if (DOM.btnCloseArchive2) DOM.btnCloseArchive2.addEventListener('click', () => DOM.modalArchive.classList.remove('open'));

    // Tutorial Modal
    setupTutorial();

    // Canvas Dragging
    setupCanvasDrag();
  }

  /* ═══════════════════════════════════════════════════════════
     16. MAIN ANIMATION LOOP
     ═══════════════════════════════════════════════════════════ */
  let lastTime = performance.now();

  function renderLoop(now) {
    const dt = (now - lastTime) / 1000;
    lastTime = now;

    // Advance orbit if playing and not actively dragging
    if (STATE.isPlaying && !STATE.isDraggingMoon && STATE.screen === 'sim') {
      const orbitSpeed = 10 * STATE.simSpeed; // degrees per second
      STATE.moonAngle = (STATE.moonAngle + orbitSpeed * dt) % 360;

      // Update slider display if not dragging
      if (DOM.sliderMoonAngle && document.activeElement !== DOM.sliderMoonAngle) {
        DOM.sliderMoonAngle.value = STATE.moonAngle;
        if (DOM.valMoonDeg) {
          DOM.valMoonDeg.textContent = `${STATE.moonAngle.toFixed(1)}° (${getPhaseName(STATE.moonAngle)})`;
        }
      }
    }

    if (STATE.screen === 'sim') {
      const metrics = getSimulationMetrics();
      renderOrbitCanvas(metrics);
      renderTelescopeViewfinder(metrics);
      updateTelemetryAndUI(metrics);
    }

    requestAnimationFrame(renderLoop);
  }

  // Auto initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
