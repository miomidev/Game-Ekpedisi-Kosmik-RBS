// ============================================================
// script.js — Ekspedisi Kosmik: Misi Penjelajah Tata Surya
// Engine permainan logika, navigasi luar angkasa, dan minigame
// ============================================================

(function () {
  'use strict';

  // ── Web Audio Synthesizer (BGM Kosmik & SFX Interaktif) ───
  const AudioEngine = {
    ctx: null,
    masterGain: null,
    bgmGain: null,
    sfxGain: null,
    isMuted: false,
    bgmStarted: false,
    bgmTimer: null,
    starlightTimer: null,
    currentChordIndex: 0,
    droneOsc: null,
    droneHarmonic: null,
    noiseBuffer: null,

    // Progresi akor ambient kosmik (Frekuensi dalam Hz)
    // 1: Am9, 2: Fmaj7#11, 3: Dm9, 4: Cmaj9, 5: Gsus4, 6: Em7
    bgmChords: [
      [110.00, 164.81, 261.63, 392.00, 493.88], // Am9
      [87.31, 130.81, 220.00, 329.63, 493.88],  // Fmaj7#11
      [73.42, 110.00, 174.61, 261.63, 329.63],  // Dm9
      [65.41, 98.00, 164.81, 246.94, 293.66],   // Cmaj9
      [98.00, 146.83, 196.00, 261.63, 293.66],  // Gsus4
      [82.41, 123.47, 196.00, 293.66, 392.00]   // Em7
    ],

    // Tangga nada starlight bell kosmik (C Pentatonic / Lydian)
    starlightNotes: [
      523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51
    ],

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();

        // Master Gain
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // BGM Gain (volume terdengar jelas, megah & atmosferik)
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.65, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);

        // SFX Gain
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        // Buat buffer white noise sintetis (3 detik)
        this.createNoiseBuffer();
      }

      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      if (!this.bgmStarted && !this.isMuted) {
        this.startBGM();
      }
    },

    createNoiseBuffer() {
      if (!this.ctx) return;
      const rate = this.ctx.sampleRate || 44100;
      const length = rate * 3;
      const buf = this.ctx.createBuffer(1, length, rate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < length; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buf;
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.ctx && this.masterGain) {
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(this.isMuted ? 0 : 1, now + 0.15);
      }

      if (!this.isMuted && !this.bgmStarted) {
        this.startBGM();
      }

      this.updateUI();
    },

    updateUI() {
      const btn = document.getElementById('btn-toggle-audio');
      const icon = document.getElementById('audio-icon');
      const label = document.getElementById('audio-label');
      if (btn) {
        btn.classList.toggle('muted', this.isMuted);
        btn.setAttribute('title', this.isMuted ? 'Nyalakan Musik & Efek Suara' : 'Matikan Suara (Hening)');
        btn.setAttribute('aria-label', this.isMuted ? 'Nyalakan Musik & Efek Suara' : 'Matikan Suara');
      }
      if (icon) icon.textContent = this.isMuted ? '🔇' : '🔊';
      if (label) label.textContent = this.isMuted ? 'Hening' : 'Musik';
    },

    startBGM() {
      if (this.bgmStarted || !this.ctx) return;
      this.bgmStarted = true;

      // 1. Dual-Tone Reactor Drone (65.4Hz C2 fundamen + 130.8Hz C3 harmoni pad)
      try {
        const now = this.ctx.currentTime;
        const droneOsc = this.ctx.createOscillator();
        const droneHarmonic = this.ctx.createOscillator();
        const droneGain = this.ctx.createGain();
        const droneFilter = this.ctx.createBiquadFilter();

        droneOsc.type = 'sine';
        droneOsc.frequency.setValueAtTime(65.41, now);

        droneHarmonic.type = 'triangle';
        droneHarmonic.frequency.setValueAtTime(130.81, now);
        droneHarmonic.detune.setValueAtTime(4, now);

        droneFilter.type = 'lowpass';
        droneFilter.frequency.setValueAtTime(260, now);

        droneGain.gain.setValueAtTime(0.12, now);

        droneOsc.connect(droneFilter);
        droneHarmonic.connect(droneFilter);
        droneFilter.connect(droneGain);
        droneGain.connect(this.bgmGain);

        droneOsc.start(now);
        droneHarmonic.start(now);
        this.droneOsc = droneOsc;
        this.droneHarmonic = droneHarmonic;
      } catch (e) {}

      // 2. Play initial chord & loop
      this.playNextBGMChord();
      this.bgmTimer = setInterval(() => {
        if (!this.isMuted && this.bgmStarted) {
          this.playNextBGMChord();
        }
      }, 7000);

      // 3. Shimmering Starlight Bells (arpeggio bintang kosmik)
      this.scheduleStarlightBell();
    },

    playNextBGMChord() {
      if (!this.ctx || !this.bgmGain) return;
      try {
        const now = this.ctx.currentTime;
        const chord = this.bgmChords[this.currentChordIndex];
        this.currentChordIndex = (this.currentChordIndex + 1) % this.bgmChords.length;

        // Shared Lowpass Filter dengan LFO untuk sensasi bernapas antariksa yang megah & jernih
        const padFilter = this.ctx.createBiquadFilter();
        padFilter.type = 'lowpass';
        padFilter.frequency.setValueAtTime(800, now);
        padFilter.frequency.linearRampToValueAtTime(1400, now + 3.5);
        padFilter.frequency.linearRampToValueAtTime(750, now + 7.5);
        padFilter.Q.setValueAtTime(1.6, now);
        padFilter.connect(this.bgmGain);

        // Buat oscillator per nada akor (2 oscillator detuned untuk chorus tebal & megah)
        chord.forEach((freq, idx) => {
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const noteGain = this.ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(freq, now);
          osc1.detune.setValueAtTime(-6, now);

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(freq, now);
          osc2.detune.setValueAtTime(6, now);

          // Envelope lembut namun terdengar jelas dan megah
          const targetGain = 0.085 / (idx === 0 ? 1 : 1.15);
          noteGain.gain.setValueAtTime(0.0001, now);
          noteGain.gain.exponentialRampToValueAtTime(targetGain, now + 2.0);
          noteGain.gain.setValueAtTime(targetGain, now + 5.2);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 7.6);

          osc1.connect(noteGain);
          osc2.connect(noteGain);
          noteGain.connect(padFilter);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 7.7);
          osc2.stop(now + 7.7);

          setTimeout(() => {
            try {
              osc1.disconnect();
              osc2.disconnect();
              noteGain.disconnect();
            } catch (e) {}
          }, 8000);
        });

        setTimeout(() => {
          try {
            padFilter.disconnect();
          } catch (e) {}
        }, 8000);
      } catch (e) {}
    },

    scheduleStarlightBell() {
      if (this.starlightTimer) clearTimeout(this.starlightTimer);
      const nextDelay = 1800 + Math.random() * 2200; // setiap 1.8 - 4.0 detik

      this.starlightTimer = setTimeout(() => {
        if (!this.isMuted && this.bgmStarted && this.ctx) {
          this.playStarlightBell();
        }
        this.scheduleStarlightBell();
      }, nextDelay);
    },

    playStarlightBell() {
      if (!this.ctx || !this.bgmGain) return;
      try {
        const now = this.ctx.currentTime;
        const note = this.starlightNotes[Math.floor(Math.random() * this.starlightNotes.length)];

        // Pure Crystal Sine Wave
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Delay effect untuk gema kosmik
        const delay = this.ctx.createDelay();
        delay.delayTime.setValueAtTime(0.32, now);
        const feedback = this.ctx.createGain();
        feedback.gain.setValueAtTime(0.32, now);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

        osc.connect(gain);
        gain.connect(this.bgmGain);

        // Feed to delay
        gain.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(this.bgmGain);

        osc.start(now);
        osc.stop(now + 2.2);

        setTimeout(() => {
          try {
            osc.disconnect();
            gain.disconnect();
            delay.disconnect();
            feedback.disconnect();
          } catch (e) {}
        }, 2200);
      } catch (e) {}
    },

    // ── EFEK SUARA (SFX) ──────────────────────────────────
    playBeep(freq = 440, type = 'sine', duration = 0.1, gainVal = 0.15) {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(gainVal, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
        osc.connect(gain);
        gain.connect(this.sfxGain || this.masterGain);
        osc.start(now);
        osc.stop(now + duration);
      } catch (e) {}
    },

    // UI Click futuristik
    click() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(720, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.sfxGain || this.masterGain);
        osc.start(now);
        osc.stop(now + 0.055);
      } catch (e) {}
    },

    // Peluncuran Roket (Ignition, Sub-bass Rumble & Supersonic Roar)
    launch() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;

        // 1. Noise Generator untuk semburan plasma & gas roket
        if (this.noiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const noiseFilter = this.ctx.createBiquadFilter();
          const noiseGain = this.ctx.createGain();

          noiseFilter.type = 'bandpass';
          noiseFilter.frequency.setValueAtTime(160, now);
          noiseFilter.frequency.exponentialRampToValueAtTime(800, now + 1.2);
          noiseFilter.frequency.exponentialRampToValueAtTime(260, now + 2.5);
          noiseFilter.Q.setValueAtTime(1.5, now);

          noiseGain.gain.setValueAtTime(0.01, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.35, now + 0.4);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

          noise.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(this.sfxGain || this.masterGain);

          noise.start(now);
          noise.stop(now + 2.6);
        }

        // 2. Sub-bass booster pendorong fusi
        const rumbleOsc = this.ctx.createOscillator();
        const rumbleGain = this.ctx.createGain();
        rumbleOsc.type = 'sawtooth';
        rumbleOsc.frequency.setValueAtTime(55, now);
        rumbleOsc.frequency.linearRampToValueAtTime(150, now + 1.8);
        rumbleGain.gain.setValueAtTime(0.3, now);
        rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
        rumbleOsc.connect(rumbleGain);
        rumbleGain.connect(this.sfxGain || this.masterGain);
        rumbleOsc.start(now);
        rumbleOsc.stop(now + 2.5);

        // 3. Supersonic whoosh sweep
        const jetOsc = this.ctx.createOscillator();
        const jetGain = this.ctx.createGain();
        jetOsc.type = 'triangle';
        jetOsc.frequency.setValueAtTime(130, now);
        jetOsc.frequency.exponentialRampToValueAtTime(620, now + 1.6);
        jetGain.gain.setValueAtTime(0.18, now);
        jetGain.gain.exponentialRampToValueAtTime(0.001, now + 2.3);
        jetOsc.connect(jetGain);
        jetGain.connect(this.sfxGain || this.masterGain);
        jetOsc.start(now);
        jetOsc.stop(now + 2.4);
      } catch (e) {}
    },

    // Perjalanan Warp Antarbintang
    warp() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.9);
        osc.frequency.exponentialRampToValueAtTime(450, now + 1.8);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.2, now + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(gain);
        gain.connect(this.sfxGain || this.masterGain);
        osc.start(now);
        osc.stop(now + 1.85);

        // Whispering warp noise
        if (this.noiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          const nGain = this.ctx.createGain();

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(400, now);
          filter.frequency.exponentialRampToValueAtTime(1400, now + 0.9);
          filter.frequency.exponentialRampToValueAtTime(300, now + 1.8);
          filter.Q.setValueAtTime(2.0, now);

          nGain.gain.setValueAtTime(0.01, now);
          nGain.gain.linearRampToValueAtTime(0.18, now + 0.8);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

          noise.connect(filter);
          filter.connect(nGain);
          nGain.connect(this.sfxGain || this.masterGain);
          noise.start(now);
          noise.stop(now + 1.85);
        }
      } catch (e) {}
    },

    // Tiba di Planet (Airlock & Celestial Chime)
    arrive() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        // Airlock Hiss
        if (this.noiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(1200, now);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.sfxGain || this.masterGain);
          noise.start(now);
          noise.stop(now + 0.55);
        }
        // Arrival Celestial Triad: E5, G#5, B5
        const notes = [659.25, 830.61, 987.77];
        notes.forEach((freq, idx) => {
          setTimeout(() => {
            this.playBeep(freq, 'sine', 0.6, 0.12);
          }, 150 + idx * 110);
        });
      } catch (e) {}
    },

    // Jawaban Kuis Benar (Ascending Sparkle Chime)
    correct() {
      if (!this.ctx || this.isMuted) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playBeep(freq, 'triangle', 0.35, 0.18), idx * 80);
      });
    },

    // Jawaban Kuis Salah / Peringatan
    wrong() {
      if (!this.ctx || this.isMuted) return;
      this.playBeep(180, 'sawtooth', 0.22, 0.22);
      setTimeout(() => this.playBeep(135, 'sawtooth', 0.3, 0.22), 140);
    },

    // Peringatan Sabuk Asteroid (Radar Klaxon)
    asteroidAlert() {
      if (!this.ctx || this.isMuted) return;
      const playPulse = (delay) => {
        setTimeout(() => {
          try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(640, now);
            osc.frequency.linearRampToValueAtTime(460, now + 0.18);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
            osc.connect(gain);
            gain.connect(this.sfxGain || this.masterGain);
            osc.start(now);
            osc.stop(now + 0.22);
          } catch (e) {}
        }, delay);
      };
      playPulse(0);
      playPulse(250);
    },

    // Sensor Telemetri Scan (Venus & Jupiter)
    scan() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
        osc.connect(gain);
        gain.connect(this.sfxGain || this.masterGain);
        osc.start(now);
        osc.stop(now + 0.3);
      } catch (e) {}
    },

    // Rover Gali Tanah Mars
    roverDig() {
      if (!this.ctx || this.isMuted) return;
      this.playBeep(95, 'square', 0.08, 0.1);
      setTimeout(() => this.click(), 60);
    },

    // Sampel / Objek Ditemukan (Magic Discovery Chime)
    sampleFound() {
      if (!this.ctx || this.isMuted) return;
      const notes = [783.99, 987.77, 1174.66, 1567.98]; // G5, B5, D6, G6
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playBeep(freq, 'sine', 0.45, 0.16), idx * 85);
      });
    },

    // Rotasi Poros Uranus (Servo Micro-clicks)
    servo() {
      if (!this.ctx || this.isMuted) return;
      [220, 260, 240, 280].forEach((freq, idx) => {
        setTimeout(() => this.playBeep(freq, 'triangle', 0.05, 0.12), idx * 45);
      });
    },

    // Angin Supersonik Neptunus
    wind() {
      if (!this.ctx || this.isMuted) return;
      if (this.noiseBuffer) {
        try {
          const now = this.ctx.currentTime;
          const noise = this.ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          const gain = this.ctx.createGain();

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(380, now);
          filter.frequency.linearRampToValueAtTime(850, now + 0.5);
          filter.frequency.linearRampToValueAtTime(320, now + 1.2);
          filter.Q.setValueAtTime(2.5, now);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.25, now + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(this.sfxGain || this.masterGain);
          noise.start(now);
          noise.stop(now + 1.25);
        } catch (e) {}
      }
    },

    // Peringatan Bahan Bakar Rendah
    lowFuel() {
      if (!this.ctx || this.isMuted) return;
      this.playBeep(520, 'sine', 0.1, 0.12);
      setTimeout(() => this.playBeep(390, 'sine', 0.15, 0.12), 120);
    },

    // Fanfare Kemenangan Misi Selesai (Sertifikat)
    fanfare() {
      if (!this.ctx || this.isMuted) return;
      const melody = [
        { f: 261.63, d: 180, delay: 0 },    // C4
        { f: 329.63, d: 180, delay: 180 },  // E4
        { f: 392.00, d: 180, delay: 360 },  // G4
        { f: 523.25, d: 350, delay: 540 },  // C5
        { f: 392.00, d: 160, delay: 920 },  // G4
        { f: 523.25, d: 600, delay: 1100 }  // C5 sustain
      ];
      melody.forEach(m => {
        setTimeout(() => {
          this.playBeep(m.f, 'triangle', m.d / 1000, 0.25);
          this.playBeep(m.f * 1.002, 'sine', m.d / 1000, 0.15);
        }, m.delay);
      });
      // Efek kilau perayaan di akhir fanfare
      setTimeout(() => {
        this.sampleFound();
      }, 1600);
    },

    // Notifikasi Panduan / Onboarding Kokpit (Arpeggio Bersahabat)
    tutorial() {
      if (!this.ctx || this.isMuted) return;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5 major arpeggio
      notes.forEach((freq, idx) => {
        setTimeout(() => this.playBeep(freq, 'sine', 0.22, 0.14), idx * 65);
      });
    },

    // Radio walkie-talkie / comms chirp transmisi luar angkasa
    radioChirp() {
      if (!this.ctx || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        // Dual beep radio tone
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1760, now); // A6
        osc1.frequency.setValueAtTime(2349, now + 0.045); // D7
        gain1.gain.setValueAtTime(0.09, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
        osc1.connect(gain1);
        gain1.connect(this.sfxGain || this.masterGain);
        osc1.start(now);
        osc1.stop(now + 0.1);

        // Radio static burst
        if (this.noiseBuffer) {
          const noise = this.ctx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const filter = this.ctx.createBiquadFilter();
          const nGain = this.ctx.createGain();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(2200, now + 0.04);
          filter.Q.setValueAtTime(3.0, now + 0.04);
          nGain.gain.setValueAtTime(0.001, now);
          nGain.gain.setValueAtTime(0.065, now + 0.04);
          nGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.13);
          noise.connect(filter);
          filter.connect(nGain);
          nGain.connect(this.sfxGain || this.masterGain);
          noise.start(now + 0.04);
          noise.stop(now + 0.14);
        }
      } catch (e) {}
    },

    // Dengungan mesin reaktor kokpit roket (Ambient Cockpit Hum)
    cockpitHumOsc: null,
    cockpitHumGain: null,
    startCockpitHum() {
      if (!this.ctx || this.cockpitHumOsc || this.isMuted) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(58.0, now); // 58 Hz deep hum

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(150, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.045, now + 2.0); // Ambient halus

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        this.cockpitHumOsc = osc;
        this.cockpitHumGain = gain;
      } catch (e) {}
    },

    stopCockpitHum() {
      if (!this.cockpitHumOsc || !this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        if (this.cockpitHumGain) {
          this.cockpitHumGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
        }
        setTimeout(() => {
          try {
            if (this.cockpitHumOsc) {
              this.cockpitHumOsc.stop();
              this.cockpitHumOsc.disconnect();
              this.cockpitHumOsc = null;
              this.cockpitHumGain = null;
            }
          } catch (e) {}
        }, 700);
      } catch (e) {}
    }
  };

  // ── Web Speech API & Streaming Audio: Narator Suara Bahasa Indonesia ──
  const VoiceEngine = {
    synth: null,
    voice: null,
    isMuted: false,
    isPlaying: false,
    currentUtterance: null,
    currentAudio: null,
    audioElement: null,
    activeToken: 0,

    init() {
      this.audioElement = document.getElementById('narration-audio-player');
      if (!this.audioElement) {
        this.audioElement = document.createElement('audio');
        this.audioElement.id = 'narration-audio-player';
        this.audioElement.style.display = 'none';
        document.body.appendChild(this.audioElement);
      }
      this.audioElement.referrerPolicy = 'no-referrer';

      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
      this.updateUI();
    },

    loadVoices() {
      if (!this.synth) return;
      try {
        const voices = this.synth.getVoices() || [];
        if (!voices || voices.length === 0) return;

        // 1. Cari suara penutur Bahasa Indonesia resmi (id-ID, id, in-ID)
        let matched = voices.find(v => {
          const l = (v.lang || '').toLowerCase().replace(/_/g, '-');
          return l === 'id-id' || l === 'id' || l.startsWith('id-') || l === 'in-id' || l === 'in';
        });

        // 2. Cari berdasarkan nama voice sistem (Microsoft Gadis, Ardi, Google Bahasa Indonesia, Apple Damayanti)
        if (!matched) {
          matched = voices.find(v => {
            const n = (v.name || '').toLowerCase();
            return n.includes('indonesia') || n.includes('bahasa') || n.includes('gadis') || n.includes('ardi') || n.includes('damayanti');
          });
        }

        this.voice = matched || null;
      } catch (e) {
        this.voice = null;
      }
    },

    cleanSpeechText(text) {
      if (!text) return '';
      return text
        // Hapus karakter emoji antariksa/simbol yang mengganggu TTS
        .replace(/[\u{1F300}-\u{1FAFF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/[*_#~`]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    },

    // Memecah teks narasi menjadi potongan kalimat alami (maks ~120 karakter)
    chunkText(text, maxLen = 120) {
      const clean = this.cleanSpeechText(text);
      if (!clean) return [];
      const rawSentences = clean.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [clean];
      const chunks = [];
      for (const raw of rawSentences) {
        const s = raw.trim();
        if (!s) continue;
        if (s.length <= maxLen) {
          chunks.push(s);
        } else {
          // Bagi per koma jika kalimat panjang
          const commaSplit = s.split(/,\s*/);
          let temp = '';
          for (const part of commaSplit) {
            const nextCandidate = temp ? `${temp}, ${part}` : part;
            if (nextCandidate.length <= maxLen) {
              temp = nextCandidate;
            } else {
              if (temp) chunks.push(temp.trim());
              temp = part;
            }
          }
          if (temp) chunks.push(temp.trim());
        }
      }
      return chunks.length > 0 ? chunks : [clean];
    },

    speak(text, onStartCallback, onEndCallback) {
      if (this.isMuted || !text) {
        if (onEndCallback) onEndCallback();
        return;
      }

      const cleanText = this.cleanSpeechText(text);
      if (!cleanText) {
        if (onEndCallback) onEndCallback();
        return;
      }

      this.stop();
      this.isPlaying = true;
      const myToken = ++this.activeToken;

      // Bunyikan efek radio chirp sebelum transmisi suara
      AudioEngine.radioChirp();

      // Selalu muat ulang voice agar mendeteksi voice yang baru siap di background
      this.loadVoices();

      // Beri sedikit jeda 140ms agar radio chirp terdengar sebelum transmisi suara
      setTimeout(() => {
        if (this.activeToken !== myToken || !this.isPlaying || this.isMuted) return;

        // METODE 1: Jika browser memiliki voice native Bahasa Indonesia, gunakan SpeechSynthesis
        if (this.synth && this.voice) {
          this.speakWithSynth(cleanText, myToken, onStartCallback, onEndCallback);
          return;
        }

        // METODE 2: Streaming TTS Bahasa Indonesia Natural (no-referrer agar tidak dicegat ORB browser)
        this.speakWithAudioStream(cleanText, myToken, onStartCallback, () => {
          if (onEndCallback) onEndCallback();
        }, () => {
          // Fallback darurat jika streaming offline/terkendala:
          // Gunakan SpeechSynthesis browser dengan lang id-ID agar kadet tetap mendengar suara
          if (this.synth && this.activeToken === myToken && this.isPlaying) {
            this.speakWithSynth(cleanText, myToken, onStartCallback, onEndCallback);
          } else {
            this.isPlaying = false;
            if (onEndCallback) onEndCallback();
          }
        });
      }, 140);
    },

    speakWithSynth(text, token, onStartCallback, onEndCallback) {
      if (!this.synth) {
        this.isPlaying = false;
        if (onEndCallback) onEndCallback();
        return;
      }
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        if (this.voice) {
          utterance.voice = this.voice;
          utterance.lang = this.voice.lang || 'id-ID';
        } else {
          utterance.lang = 'id-ID';
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
          if (this.activeToken !== token) return;
          if (onStartCallback) onStartCallback();
        };

        utterance.onend = () => {
          if (this.activeToken !== token) return;
          this.isPlaying = false;
          this.currentUtterance = null;
          if (onEndCallback) onEndCallback();
        };

        utterance.onerror = () => {
          if (this.activeToken !== token) return;
          this.isPlaying = false;
          this.currentUtterance = null;
          if (onEndCallback) onEndCallback();
        };

        this.currentUtterance = utterance;
        this.synth.speak(utterance);
      } catch (err) {
        this.isPlaying = false;
        if (onEndCallback) onEndCallback();
      }
    },

    speakWithAudioStream(text, token, onStartCallback, onEndCallback, onErrorFallback) {
      const chunks = this.chunkText(text, 120);
      let idx = 0;
      let hasStarted = false;

      const player = this.audioElement || new Audio();
      player.referrerPolicy = 'no-referrer';
      this.currentAudio = player;

      const playNextChunk = () => {
        if (this.activeToken !== token || !this.isPlaying || this.isMuted) {
          this.isPlaying = false;
          this.currentAudio = null;
          if (onEndCallback) onEndCallback();
          return;
        }

        if (idx >= chunks.length) {
          this.isPlaying = false;
          this.currentAudio = null;
          if (onEndCallback) onEndCallback();
          return;
        }

        const chunk = chunks[idx++];
        const url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl=id&client=tw-ob&q=' + encodeURIComponent(chunk);

        player.oncanplay = () => {
          if (this.activeToken !== token) return;
          if (!hasStarted) {
            hasStarted = true;
            if (onStartCallback) onStartCallback();
          }
        };

        player.onended = () => {
          if (this.activeToken !== token) return;
          playNextChunk();
        };

        player.onerror = () => {
          if (this.activeToken !== token) return;
          if (idx === 1 && onErrorFallback) {
            onErrorFallback();
          } else {
            playNextChunk();
          }
        };

        player.src = url;
        const playPromise = player.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            if (this.activeToken !== token) return;
            if (idx === 1 && onErrorFallback) {
              onErrorFallback();
            } else {
              playNextChunk();
            }
          });
        }
      };

      playNextChunk();
    },

    stop() {
      this.activeToken++;
      if (this.synth) {
        try {
          this.synth.cancel();
        } catch (e) {}
      }
      if (this.currentAudio) {
        try {
          this.currentAudio.pause();
          this.currentAudio.src = '';
        } catch (e) {}
        this.currentAudio = null;
      }
      this.isPlaying = false;
      this.currentUtterance = null;
    },

    toggleMute() {
      this.isMuted = !this.isMuted;
      if (this.isMuted) {
        this.stop();
      }
      this.updateUI();
    },

    updateUI() {
      const btn = document.getElementById('btn-toggle-voice');
      const icon = document.getElementById('voice-icon');
      const label = document.getElementById('voice-label');
      if (btn) {
        btn.classList.toggle('muted', this.isMuted);
        btn.setAttribute('title', this.isMuted ? 'Nyalakan Narasi Suara' : 'Matikan Narasi Suara');
        btn.setAttribute('aria-label', this.isMuted ? 'Nyalakan Narasi Suara' : 'Matikan Narasi Suara');
      }
      if (icon) icon.textContent = this.isMuted ? '🔇' : '🎙️';
      if (label) label.textContent = this.isMuted ? 'Suara: Off' : 'Suara: Aktif';
    }
  };

  // ── State Permainan ────────────────────────────────────────
  const state = {
    playerName: '',
    fuel: GAME_DATA.config.startingFuel,
    visitedPlanets: new Set(),
    answeredQuizzes: new Set(),
    correctQuizzesCount: 0,
    currentPlanetId: null,
    targetPlanetId: null,
    hasEncounteredAsteroids: false,
    hasSeenTutorial: false,
    introIndex: 0,
    asteroidQuizIndex: 0,
    selectedPlanetId: null,
    roverFoundSamples: 0,
    uranusAngle: 0,
    planetAngles: {},
    canvasScale: 1
  };

  // Inisialisasi sudut awal orbit planet
  GAME_DATA.planets.forEach((p, idx) => {
    state.planetAngles[p.id] = (idx * (Math.PI * 2 / 8));
  });

  // ── Elemen DOM ─────────────────────────────────────────────
  const dom = {
    screens: {
      title: document.getElementById('screen-title'),
      intro: document.getElementById('screen-intro'),
      map: document.getElementById('screen-map'),
      travel: document.getElementById('screen-travel'),
      planet: document.getElementById('screen-planet'),
      asteroid: document.getElementById('screen-asteroid'),
      logbook: document.getElementById('screen-logbook'),
      ending: document.getElementById('screen-ending'),
      gameover: document.getElementById('screen-gameover')
    },
    title: {
      input: document.getElementById('player-name'),
      btnStart: document.getElementById('btn-start')
    },
    intro: {
      text: document.getElementById('intro-text'),
      btnNext: document.getElementById('btn-intro-next'),
      rocket: document.getElementById('rocket-launch')
    },
    map: {
      canvas: document.getElementById('solar-canvas'),
      hudName: document.getElementById('hud-name'),
      fuelBar: document.getElementById('fuel-bar'),
      fuelText: document.getElementById('fuel-text'),
      hudProgress: document.getElementById('hud-progress'),
      hudMessage: document.getElementById('hud-message'),
      selector: document.getElementById('hud-planet-selector'),
      tooltip: document.getElementById('planet-tooltip'),
      tooltipName: document.getElementById('tooltip-name'),
      tooltipTagline: document.getElementById('tooltip-tagline'),
      btnVisit: document.getElementById('btn-visit'),
      btnLogbook: document.getElementById('btn-logbook'),
      btnFinish: document.getElementById('btn-finish')
    },
    travel: {
      text: document.getElementById('travel-text')
    },
    planet: {
      bg: document.getElementById('planet-visit-bg'),
      iconLarge: document.getElementById('planet-icon-large'),
      realGlobe: document.getElementById('planet-real-globe'),
      globeSphere: document.getElementById('planet-globe-sphere'),
      orderBadge: document.getElementById('planet-order-badge'),
      categoryBadge: document.getElementById('planet-category-badge'),
      solarStripTrack: document.getElementById('solar-strip-track'),
      solarStripActiveInfo: document.getElementById('solar-strip-active-info'),
      telemDistance: document.getElementById('telemetry-distance'),
      telemRevolution: document.getElementById('telemetry-revolution'),
      telemRotation: document.getElementById('telemetry-rotation'),
      telemTemp: document.getElementById('telemetry-temp'),
      name: document.getElementById('planet-visit-name'),
      tagline: document.getElementById('planet-visit-tagline'),
      desc: document.getElementById('planet-visit-desc'),
      facts: document.getElementById('planet-facts'),
      observatorySection: document.getElementById('nasa-observatory-section'),
      nasaDualGrid: document.getElementById('nasa-dual-grid'),
      btnTabDual: document.getElementById('btn-tab-dual'),
      btnTabPlanet: document.getElementById('btn-tab-planet'),
      btnTabSurface: document.getElementById('btn-tab-surface'),
      nasaMonitorOrbit: document.getElementById('nasa-monitor-orbit'),
      nasaOrbitImg: document.getElementById('nasa-photo-img-orbit') || document.getElementById('nasa-orbit-img'),
      nasaOrbitCaption: document.getElementById('nasa-photo-caption-orbit') || document.getElementById('nasa-orbit-caption'),
      nasaOrbitCredit: document.getElementById('nasa-photo-credit-orbit') || document.getElementById('nasa-orbit-credit'),
      nasaMonitorSurface: document.getElementById('nasa-monitor-surface'),
      nasaSurfaceImg: document.getElementById('nasa-photo-img-surface') || document.getElementById('nasa-surface-img'),
      nasaSurfaceCaption: document.getElementById('nasa-photo-caption-surface') || document.getElementById('nasa-surface-caption'),
      nasaSurfaceCredit: document.getElementById('nasa-photo-credit-surface') || document.getElementById('nasa-surface-credit'),
      nasaPhotoImg: document.getElementById('nasa-photo-img') || document.getElementById('nasa-photo-img-orbit'),
      nasaPhotoCaption: document.getElementById('nasa-photo-caption') || document.getElementById('nasa-photo-caption-orbit'),
      nasaPhotoCredit: document.getElementById('nasa-photo-credit') || document.getElementById('nasa-photo-credit-orbit'),
      btnSpeakPlanet: document.getElementById('btn-speak-planet'),
      voiceStatus: document.getElementById('planet-voice-status'),
      interactionSection: document.getElementById('interaction-section'),
      interactionTitle: document.getElementById('interaction-title'),
      interactionDesc: document.getElementById('interaction-desc'),
      interactionArea: document.getElementById('interaction-area'),
      gravityPlanetName: document.getElementById('gravity-planet-name'),
      gravityPlanetBar: document.getElementById('gravity-planet-bar'),
      gravityExplanation: document.getElementById('gravity-explanation'),
      quizSection: document.getElementById('quiz-section'),
      quizMedia: document.getElementById('quiz-media'),
      quizMediaImg: document.getElementById('quiz-media-img'),
      quizMediaCaption: document.getElementById('quiz-media-caption'),
      quizPrompt: document.getElementById('quiz-prompt'),
      quizOptions: document.getElementById('quiz-options'),
      quizFeedback: document.getElementById('quiz-feedback'),
      btnBackMap: document.getElementById('btn-back-map'),
      badge: document.getElementById('planet-badge')
    },
    asteroid: {
      field: document.getElementById('asteroid-field'),
      question: document.getElementById('asteroid-question'),
      options: document.getElementById('asteroid-options'),
      feedback: document.getElementById('asteroid-feedback'),
      btnNext: document.getElementById('btn-asteroid-next')
    },
    logbook: {
      grid: document.getElementById('logbook-grid'),
      btnClose: document.getElementById('btn-close-logbook')
    },
    ending: {
      text: document.getElementById('ending-text'),
      statPlanets: document.getElementById('stat-planets'),
      statQuizzes: document.getElementById('stat-quizzes'),
      statFuel: document.getElementById('stat-fuel'),
      scoreTotal: document.getElementById('final-score-val'),
      scoreGrade: document.getElementById('final-grade-badge'),
      scoreGradeTitle: document.getElementById('final-grade-title'),
      scoreExplore: document.getElementById('score-planet-points'),
      scoreQuiz: document.getElementById('score-quiz-points'),
      scoreFuel: document.getElementById('score-fuel-points'),
      evalNotes: document.getElementById('instructor-note-text'),
      certName: document.getElementById('cert-name'),
      certFinalScore: document.getElementById('cert-score-display'),
      certFinalGrade: document.getElementById('cert-grade-display'),
      certRegNumber: document.getElementById('cert-id-number'),
      certDate: document.getElementById('cert-flight-date'),
      btnPrintCert: document.getElementById('btn-print-cert'),
      btnReplay: document.getElementById('btn-replay')
    },
    gameover: {
      count: document.getElementById('gameover-count'),
      btnRetry: document.getElementById('btn-retry')
    },
    audio: {
      btnToggle: document.getElementById('btn-toggle-audio'),
      icon: document.getElementById('audio-icon'),
      label: document.getElementById('audio-label'),
      btnToggleVoice: document.getElementById('btn-toggle-voice'),
      voiceIcon: document.getElementById('voice-icon'),
      voiceLabel: document.getElementById('voice-label')
    },
    tutorial: {
      modal: document.getElementById('cockpit-tutorial-modal'),
      btnOpen: document.getElementById('btn-tutorial'),
      btnStart: document.getElementById('btn-tutorial-start'),
      btnX: document.getElementById('btn-tutorial-x'),
      backdrop: document.getElementById('tutorial-backdrop'),
      cadetName: document.getElementById('tutorial-cadet-name')
    }
  };

  // ── Navigasi Screen ────────────────────────────────────────
  function showScreen(screenKey) {
    Object.values(dom.screens).forEach(screen => {
      if (screen) screen.classList.remove('active');
    });
    if (dom.screens[screenKey]) {
      dom.screens[screenKey].classList.add('active');
    }

    // Kelola dengungan ambient mesin reaktor kokpit
    if (screenKey === 'map' || screenKey === 'planet' || screenKey === 'asteroid') {
      AudioEngine.startCockpitHum();
    } else {
      AudioEngine.stopCockpitHum();
    }

    // Jika pindah ke peta, resize canvas
    if (screenKey === 'map') {
      resizeCanvas();
      // Munculkan panduan otomatis jika kadet baru pertama kali tiba di kokpit
      if (!state.hasSeenTutorial) {
        setTimeout(() => {
          openTutorial();
        }, 400);
      }
    }
  }

  // ── Update Bahan Bakar (Fuel HUD) ──────────────────────────
  function updateFuel(delta = 0) {
    state.fuel = Math.max(0, Math.min(GAME_DATA.config.maxFuel, state.fuel + delta));
    const pct = state.fuel + '%';
    dom.map.fuelBar.style.width = pct;
    dom.map.fuelText.textContent = pct;

    dom.map.fuelBar.classList.remove('low', 'medium');
    if (state.fuel <= 25) {
      dom.map.fuelBar.classList.add('low');
      if (delta < 0 && state.fuel > 0) {
        AudioEngine.lowFuel();
      }
    } else if (state.fuel <= 55) {
      dom.map.fuelBar.classList.add('medium');
    }

    if (state.fuel <= 0) {
      setTimeout(() => {
        triggerGameOver();
      }, 500);
    }
  }

  // ── Helper SVG Scoper (Mencegah konflik duplicate clipPath ID antar screen) ──
  let svgInstanceCounter = 0;
  function getScopedSvg(svgString, prefix = 'planet') {
    if (!svgString) return '';
    svgInstanceCounter++;
    const uid = `${prefix}-${svgInstanceCounter}`;

    const idMap = new Map();
    const replaced = svgString.replace(/\bid=(["'])([^"']+)\1/g, (match, quote, id) => {
      const uniqueId = `${id}_${uid}`;
      idMap.set(id, uniqueId);
      return `id=${quote}${uniqueId}${quote}`;
    });

    if (idMap.size === 0) return svgString;

    let result = replaced;
    idMap.forEach((newId, oldId) => {
      const urlRegex = new RegExp(`url\\(#${oldId}\\)`, 'g');
      result = result.replace(urlRegex, `url(#${newId})`);

      const hrefRegex = new RegExp(`(xlink:)?href=(["'])#${oldId}\\2`, 'g');
      result = result.replace(hrefRegex, `$1href=$2#${newId}$2`);
    });

    return result;
  }

  function renderPlanetSelector() {
    if (!dom.map.selector) return;
    dom.map.selector.innerHTML = '';

    GAME_DATA.planets.forEach((planet, idx) => {
      // Pembatas Sabuk Asteroid di antara Mars (idx 3) dan Jupiter (idx 4)
      if (idx === 4) {
        const divider = document.createElement('span');
        divider.className = 'sector-divider';
        divider.textContent = '⚡ Sabuk Asteroid ⚡';
        dom.map.selector.appendChild(divider);
      }

      const pill = document.createElement('button');
      pill.className = 'planet-pill';
      if (state.visitedPlanets.has(planet.id)) {
        pill.classList.add('visited');
      }
      if (state.selectedPlanetId === planet.id) {
        pill.classList.add('active');
        setTimeout(() => {
          pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }, 50);
      }

      const check = state.visitedPlanets.has(planet.id) ? '✓ ' : '';
      if (planet.iconSvg) {
        pill.innerHTML = `${check}<span class="planet-pill-svg">${getScopedSvg(planet.iconSvg, 'pill-' + planet.id)}</span> <span>${planet.name}</span>`;
      } else {
        pill.textContent = `${check}${planet.icon} ${planet.name}`;
      }

      pill.addEventListener('click', () => {
        AudioEngine.init();
        AudioEngine.click();
        startTravelToPlanet(planet);
      });

      dom.map.selector.appendChild(pill);
    });
  }

  function updateHUDProgress() {
    dom.map.hudProgress.textContent = `${state.visitedPlanets.size} / 8`;
    if (state.visitedPlanets.size === 8) {
      dom.map.btnFinish.classList.remove('hidden');
      dom.map.hudMessage.textContent = '🌟 Misi Lengkap! Tekan tombol Kembali ke Bumi!';
    } else {
      dom.map.hudMessage.textContent = `Pilih planet tujuan di peta! (${8 - state.visitedPlanets.size} tersisa)`;
    }
    renderPlanetSelector();
  }

  // ── SCREEN 1: TITLE & INPUT NAMA ───────────────────────────
  dom.title.input.addEventListener('input', () => {
    const val = dom.title.input.value.trim();
    dom.title.btnStart.disabled = val.length === 0;
  });

  dom.title.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !dom.title.btnStart.disabled) {
      startGame();
    }
  });

  dom.title.btnStart.addEventListener('click', () => {
    AudioEngine.init();
    AudioEngine.click();
    startGame();
  });

  function startGame() {
    state.playerName = dom.title.input.value.trim() || 'Kadet Antariksa';
    dom.map.hudName.textContent = state.playerName;
    state.introIndex = 0;
    showScreen('intro');
    renderIntroStep();
  }

  // ── SCREEN 2: INTRO NARRATION ──────────────────────────────
  function renderIntroStep() {
    const lines = GAME_DATA.narration.intro;
    if (state.introIndex < lines.length) {
      const lineText = lines[state.introIndex];
      dom.intro.text.textContent = lineText;
      if (state.introIndex === lines.length - 1) {
        dom.intro.btnNext.textContent = 'Luncurkan Roket! 🚀';
      } else {
        dom.intro.btnNext.textContent = 'Lanjut ▶';
      }

      // Suarakan narasi kokpit intro jika audio aktif
      VoiceEngine.speak(lineText);
    }
  }

  dom.intro.btnNext.addEventListener('click', () => {
    AudioEngine.init();
    AudioEngine.click();
    VoiceEngine.stop();
    state.introIndex++;
    if (state.introIndex < GAME_DATA.narration.intro.length) {
      renderIntroStep();
    } else {
      // Sequence Peluncuran Roket RBS-01
      dom.intro.btnNext.disabled = true;
      const screenIntro = dom.screens.intro;
      screenIntro.classList.add('launch-active');

      AudioEngine.launch();

      // Tahap 1: Ignition & Tremor (getaran mesin menyala di gantry pad)
      setTimeout(() => {
        screenIntro.classList.add('screen-shaking');
        dom.intro.rocket.classList.add('launching');
      }, 350);

      // Tahap 2: Selesai meluncur menembus atmosfer menuju ruang kokpit
      setTimeout(() => {
        dom.intro.rocket.classList.remove('launching');
        screenIntro.classList.remove('screen-shaking', 'launch-active');
        dom.intro.btnNext.disabled = false;
        showScreen('map');
        updateHUDProgress();
      }, 2500);
    }
  });

  // ── SCREEN 3: PETA TATA SURYA (CANVAS KOKPIT) ───────────────
  const canvas = dom.map.canvas;
  const ctx = canvas.getContext('2d');
  let animationFrameId = null;
  let canvasCenter = { x: 0, y: 0 };
  let hoveredPlanet = null;

  // Preload citra asli NASA untuk canvas peta
  const nasaPlanetImages = {};
  GAME_DATA.planets.forEach(p => {
    if (p.image) {
      const img = new Image();
      img.src = p.image;
      nasaPlanetImages[p.id] = img;
    }
  });

  // Sudut orbit Bulan mini mengitari Bumi
  let moonOrbitAngle = 0;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    canvasCenter.x = rect.width / 2;
    canvasCenter.y = rect.height / 2;

    // Skalakan radius orbit agar muat di layar
    const maxRadius = Math.min(rect.width, rect.height) * 0.44;
    state.canvasScale = maxRadius / 430;
  }

  window.addEventListener('resize', () => {
    if (dom.screens.map.classList.contains('active')) {
      resizeCanvas();
    }
  });

  // Render loop canvas peta luar angkasa
  function renderSolarSystem() {
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);

    const cx = canvasCenter.x;
    const cy = canvasCenter.y;

    // 1. Gambar Matahari di pusat tata surya
    const sunGlow = ctx.createRadialGradient(cx, cy, 8, cx, cy, 48);
    sunGlow.addColorStop(0, '#ffffff');
    sunGlow.addColorStop(0.2, '#ffdd44');
    sunGlow.addColorStop(0.55, '#ff8800');
    sunGlow.addColorStop(0.85, 'rgba(255, 68, 0, 0.35)');
    sunGlow.addColorStop(1, 'rgba(255, 68, 0, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 48, 0, Math.PI * 2);
    ctx.fill();

    const sunCore = ctx.createRadialGradient(cx - 3, cy - 3, 2, cx, cy, 18);
    sunCore.addColorStop(0, '#ffffff');
    sunCore.addColorStop(0.4, '#ffee55');
    sunCore.addColorStop(1, '#ff7700');
    ctx.fillStyle = sunCore;
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9.5px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Matahari', cx, cy + 30);

    // 2. Gambar Sabuk Asteroid (Pemisah Planet Dalam vs Planet Luar: ~225 scaled)
    const asteroidR = 225 * state.canvasScale;
    ctx.strokeStyle = 'rgba(255, 190, 100, 0.22)';
    ctx.setLineDash([3, 7]);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, asteroidR, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Partikel asteroid batuan 3D berputar di jalurnya
    const asteroidCount = 56;
    for (let i = 0; i < asteroidCount; i++) {
      const angle = (i * (Math.PI * 2 / asteroidCount)) + (Date.now() * 0.00008);
      const rOffset = ((i % 7) - 3) * 3.5;
      const ax = cx + Math.cos(angle) * (asteroidR + rOffset);
      const ay = cy + Math.sin(angle) * (asteroidR + rOffset);
      const size = (i % 3 === 0) ? 2.2 : (i % 2 === 0 ? 1.6 : 1.2);

      ctx.fillStyle = i % 2 === 0 ? 'rgba(195, 175, 150, 0.65)' : 'rgba(150, 135, 120, 0.5)';
      ctx.beginPath();
      ctx.arc(ax, ay, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Label Penanda Zona Astronomis di Sabuk Asteroid
    ctx.fillStyle = 'rgba(255, 200, 120, 0.45)';
    ctx.font = '8.5px "Consolas", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ SABUK ASTEROID (PEMISAH PLANET DALAM & LUAR)', cx, cy - asteroidR - 6);

    // 3. Update sudut orbit & render setiap planet
    moonOrbitAngle += 0.035;

    GAME_DATA.planets.forEach((planet) => {
      // Update pergerakan orbit
      state.planetAngles[planet.id] += planet.orbitSpeed * 0.38;
      const angle = state.planetAngles[planet.id];
      const r = planet.orbitRadius * state.canvasScale;

      // Gambar garis lintasan orbit
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Koordinat planet
      const px = cx + Math.cos(angle) * r;
      const py = cy + Math.sin(angle) * r;
      planet.currX = px;
      planet.currY = py;

      const isVisited = state.visitedPlanets.has(planet.id);
      const isHovered = hoveredPlanet && hoveredPlanet.id === planet.id;
      const isSelected = state.selectedPlanetId === planet.id;
      const renderR = Math.max(7, planet.size * 0.44);

      // Cincin Belakang Saturnus (Digambar sebelum bola planet)
      if (planet.id === 'saturnus') {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(0.35);
        ctx.strokeStyle = 'rgba(215, 195, 140, 0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, renderR * 2.2, renderR * 0.75, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(160, 140, 95, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, renderR * 2.5, renderR * 0.88, 0, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Aura highlight jika dihover/dipilih
      if (isHovered || isSelected) {
        ctx.fillStyle = 'rgba(0, 212, 255, 0.32)';
        ctx.beginPath();
        ctx.arc(px, py, renderR + 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(0, 212, 255, 0.75)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(px, py, renderR + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // ── Render Bola Planet Fotorealistik NASA ──
      const img = nasaPlanetImages[planet.id];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, renderR, 0, Math.PI * 2);
        ctx.clip();

        // Gambar tekstur asli NASA
        ctx.drawImage(img, px - renderR, py - renderR, renderR * 2, renderR * 2);

        // Pencahayaan 3D Terminator (Matahari di pusat cx, cy)
        const dxToSun = cx - px;
        const dyToSun = cy - py;
        const distToSun = Math.hypot(dxToSun, dyToSun) || 1;
        const nx = dxToSun / distToSun;
        const ny = dyToSun / distToSun;

        const shadowGrad = ctx.createRadialGradient(
          px + nx * renderR * 0.45,
          py + ny * renderR * 0.45,
          renderR * 0.2,
          px - nx * renderR * 0.35,
          py - ny * renderR * 0.35,
          renderR * 1.05
        );
        shadowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        shadowGrad.addColorStop(0.35, 'rgba(0, 0, 0, 0)');
        shadowGrad.addColorStop(0.75, 'rgba(0, 0, 0, 0.6)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0.94)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(px, py, renderR, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else {
        // Fallback gradien bola jika gambar sedang memuat
        const planetGrad = ctx.createRadialGradient(
          px - (planet.size * 0.1),
          py - (planet.size * 0.1),
          2,
          px,
          py,
          renderR
        );
        planetGrad.addColorStop(0, '#ffffff');
        planetGrad.addColorStop(0.35, planet.color);
        planetGrad.addColorStop(1, '#0c1020');
        ctx.fillStyle = planetGrad;
        ctx.beginPath();
        ctx.arc(px, py, renderR, 0, Math.PI * 2);
        ctx.fill();
      }

      // Lapisan glow atmosfer tipis
      ctx.save();
      ctx.strokeStyle = planet.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(px, py, renderR + 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Cincin Depan Saturnus (Digambar setelah bola planet)
      if (planet.id === 'saturnus') {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(0.35);
        ctx.strokeStyle = 'rgba(215, 195, 140, 0.75)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(0, 0, renderR * 2.2, renderR * 0.75, 0, 0, Math.PI);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(160, 140, 95, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, renderR * 2.5, renderR * 0.88, 0, 0, Math.PI);
        ctx.stroke();
        ctx.restore();
      }

      // Khusus Bumi: Gambar Bulan (Luna) yang mengorbit Bumi
      if (planet.id === 'bumi') {
        const moonDist = renderR + 11;
        const mx = px + Math.cos(moonOrbitAngle) * moonDist;
        const my = py + Math.sin(moonOrbitAngle) * moonDist;

        // Lintasan mini orbit Bulan
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.setLineDash([1, 2]);
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.arc(px, py, moonDist, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Bola Bulan Luna
        ctx.fillStyle = '#e8e8e8';
        ctx.beginPath();
        ctx.arc(mx, my, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Cincin Vertikal Uranus
      if (planet.id === 'uranus') {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(1.52); // Miring vertikal ~87 derajat
        ctx.strokeStyle = 'rgba(140, 210, 220, 0.45)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(0, 0, renderR * 1.7, renderR * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Indikator Lencana Centang Hijau jika sudah dikunjungi
      if (isVisited) {
        ctx.fillStyle = '#44dd88';
        ctx.beginPath();
        ctx.arc(px + (renderR * 0.8), py - (renderR * 0.8), 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#030712';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(px + (renderR * 0.8), py - (renderR * 0.8), 4.5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Label Susunan: Nomor Urut (1-8), Nama, dan Jarak AU
      ctx.fillStyle = isHovered || isSelected ? '#00d4ff' : '#e2ecf5';
      ctx.font = `${isHovered ? 'bold ' : ''}11px "Segoe UI", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(`${planet.order}. ${planet.name}`, px, py + renderR + 12);

      // Sub-label Jarak AU
      ctx.fillStyle = isHovered || isSelected ? '#aaffee' : 'rgba(165, 185, 210, 0.7)';
      ctx.font = '9px "Consolas", monospace';
      ctx.fillText(planet.distanceAU || '', px, py + renderR + 22);
    });

    animationFrameId = requestAnimationFrame(renderSolarSystem);
  }

  // Mulai render loop
  animationFrameId = requestAnimationFrame(renderSolarSystem);

  // Deteksi klik & hover pada planet di canvas
  function getPlanetAtPosition(mx, my) {
    for (let i = GAME_DATA.planets.length - 1; i >= 0; i--) {
      const p = GAME_DATA.planets[i];
      if (p.currX !== undefined) {
        const dist = Math.hypot(mx - p.currX, my - p.currY);
        const hitR = Math.max(26, p.size * 0.65);
        if (dist <= hitR) return p;
      }
    }
    return null;
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    hoveredPlanet = getPlanetAtPosition(mx, my);
    canvas.style.cursor = hoveredPlanet ? 'pointer' : 'default';
  });

  canvas.addEventListener('click', (e) => {
    AudioEngine.init();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const clicked = getPlanetAtPosition(mx, my);

    if (clicked) {
      AudioEngine.click();
      selectPlanet(clicked, rect);
    } else {
      hideTooltip();
    }
  });

  function selectPlanet(planet, rect) {
    state.selectedPlanetId = planet.id;
    if (planet.iconSvg) {
      dom.map.tooltipName.innerHTML = `<span class="tooltip-icon-svg">${getScopedSvg(planet.iconSvg, 'tooltip-' + planet.id)}</span> <span>${planet.name}</span>`;
    } else {
      dom.map.tooltipName.textContent = `${planet.icon} ${planet.name}`;
    }
    dom.map.tooltipTagline.textContent = planet.tagline;
    dom.map.tooltip.classList.remove('hidden');

    // Tempatkan tooltip di dekat posisi planet
    const tipX = Math.max(10, Math.min(rect.width - 200, planet.currX - 90));
    const tipY = Math.max(60, Math.min(rect.height - 120, planet.currY - 80));
    dom.map.tooltip.style.left = `${tipX}px`;
    dom.map.tooltip.style.top = `${tipY}px`;
  }

  function hideTooltip() {
    state.selectedPlanetId = null;
    dom.map.tooltip.classList.add('hidden');
  }

  // Tombol "Kunjungi" di Tooltip
  dom.map.btnVisit.addEventListener('click', () => {
    if (!state.selectedPlanetId) return;
    const targetPlanet = GAME_DATA.planets.find(p => p.id === state.selectedPlanetId);
    if (!targetPlanet) return;

    AudioEngine.click();
    hideTooltip();
    startTravelToPlanet(targetPlanet);
  });

  // ── LOGIKA PERJALANAN (TRAVEL & SABUK ASTEROID) ────────────
  function startTravelToPlanet(planet) {
    state.targetPlanetId = planet.id;

    // Periksa konsumsi bahan bakar
    updateFuel(-GAME_DATA.config.fuelPerTravel);
    if (state.fuel <= 0) return;

    // Cek apakah menembus Sabuk Asteroid (antara planet dalam [1..4] dan luar [5..8])
    const currentOrder = state.currentPlanetId
      ? GAME_DATA.planets.find(p => p.id === state.currentPlanetId)?.order || 3
      : 3; // Mulai dari Bumi (order 3)
    const targetOrder = planet.order;

    const crossesAsteroidBelt =
      (currentOrder <= 4 && targetOrder >= 5) ||
      (currentOrder >= 5 && targetOrder <= 4);

    if (crossesAsteroidBelt && !state.hasEncounteredAsteroids) {
      // Trigger Rintangan Sabuk Asteroid!
      startAsteroidEncounter();
    } else {
      // Langsung menuju ke planet
      performRocketTravel(planet);
    }
  }

  function performRocketTravel(planet) {
    dom.travel.text.textContent = `Modul Roket Meluncur Menuju ${planet.name}...`;
    showScreen('travel');
    AudioEngine.warp();

    setTimeout(() => {
      state.currentPlanetId = planet.id;
      openPlanetScreen(planet);
    }, 1800);
  }

  // ── SCREEN 4: SABUK ASTEROID (MINIGAME REFLEKS & KUIS) ──────
  function startAsteroidEncounter() {
    showScreen('asteroid');
    AudioEngine.asteroidAlert(); // Alert bunyi radar & benturan sabuk asteroid

    // Render asteroid melayang
    dom.asteroid.field.innerHTML = '';
    const rocks = ['🪨', '☄️', '🌑', '🪨', '☄️', '🌑'];
    rocks.forEach((rock, idx) => {
      const el = document.createElement('div');
      el.className = 'asteroid-rock';
      el.textContent = rock;
      el.style.top = `${15 + (idx * 16)}px`;
      el.style.animationDuration = `${2.5 + (idx * 0.4)}s`;
      el.style.animationDelay = `${idx * 0.3}s`;
      dom.asteroid.field.appendChild(el);
    });

    // Ambil pertanyaan sabuk asteroid
    state.asteroidQuizIndex = (state.asteroidQuizIndex || 0) % GAME_DATA.asteroidQuiz.length;
    const q = GAME_DATA.asteroidQuiz[state.asteroidQuizIndex];

    dom.asteroid.question.textContent = `🚨 PROTOKOL NAVIGASI: ${q.question}`;
    dom.asteroid.options.innerHTML = '';
    dom.asteroid.feedback.classList.add('hidden');
    dom.asteroid.btnNext.classList.add('hidden');

    // Suarakan peringatan radar sabuk asteroid
    VoiceEngine.speak("Peringatan! Radar mendeteksi pecahan batuan padat di antara orbit Mars dan Jupiter. Jawab protokol navigasi untuk membuka jalur aman!");

    q.options.forEach((optText, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = `${String.fromCharCode(65 + optIdx)}. ${optText}`;

      btn.addEventListener('click', () => {
        AudioEngine.init();
        const allOpts = dom.asteroid.options.querySelectorAll('.quiz-option');
        allOpts.forEach(o => o.classList.add('disabled'));

        if (optIdx === q.correctIndex) {
          AudioEngine.correct();
          btn.classList.add('correct');
          dom.asteroid.feedback.className = 'quiz-feedback correct-fb';
          dom.asteroid.feedback.textContent = `✅ Berhasil! Perisai energi stabil. ${q.explanation}`;
          dom.asteroid.feedback.classList.remove('hidden');
          dom.asteroid.btnNext.classList.remove('hidden');
          state.hasEncounteredAsteroids = true;
          updateFuel(GAME_DATA.config.fuelBonusCorrect);
        } else {
          AudioEngine.wrong();
          btn.classList.add('wrong');
          dom.asteroid.feedback.className = 'quiz-feedback wrong-fb';
          dom.asteroid.feedback.textContent = `⚠️ Peringatan benturan asteroid! Bahan bakar berkurang -${GAME_DATA.config.fuelPerWrongAnswer}%. Coba lagi!`;
          dom.asteroid.feedback.classList.remove('hidden');
          updateFuel(-GAME_DATA.config.fuelPerWrongAnswer);

          // Boleh coba lagi jika bahan bakar masih cukup
          setTimeout(() => {
            if (state.fuel > 0) {
              allOpts.forEach(o => {
                o.classList.remove('disabled', 'wrong');
              });
            }
          }, 1200);
        }
      });

      dom.asteroid.options.appendChild(btn);
    });
  }

  dom.asteroid.btnNext.addEventListener('click', () => {
    AudioEngine.click();
    VoiceEngine.stop();
    const targetPlanet = GAME_DATA.planets.find(p => p.id === state.targetPlanetId);
    if (targetPlanet) {
      performRocketTravel(targetPlanet);
    } else {
      showScreen('map');
    }
  });

  // ── SCREEN 5: DETAIL & EKSPLORASI PLANET ────────────────────
  function openPlanetScreen(planet) {
    showScreen('planet');
    AudioEngine.arrive();

    // Header & Tampilan visual planet
    if (planet.image) {
      dom.planet.bg.style.backgroundImage = `radial-gradient(circle at center, rgba(3, 7, 18, 0.45) 0%, rgba(3, 7, 18, 0.9) 100%), url("${encodeURI(planet.image)}")`;
      dom.planet.bg.style.opacity = '0.4';
    } else {
      dom.planet.bg.style.backgroundImage = 'none';
      dom.planet.bg.style.background = `radial-gradient(circle at center, ${planet.color} 0%, transparent 70%)`;
      dom.planet.bg.style.opacity = '0.15';
    }
    if (planet.iconSvg) {
      dom.planet.iconLarge.innerHTML = getScopedSvg(planet.iconSvg, 'large-' + planet.id);
    } else {
      dom.planet.iconLarge.textContent = planet.icon;
    }

    // NASA 3D Real Globe di Header Kokpit
    if (dom.planet.globeSphere) {
      dom.planet.globeSphere.style.backgroundImage = `url("${encodeURI(planet.image || '')}")`;
    }
    if (dom.planet.realGlobe) {
      if (planet.hasRings) {
        dom.planet.realGlobe.classList.add('has-ring');
      } else {
        dom.planet.realGlobe.classList.remove('has-ring');
      }
    }

    // Badges astronomis resmi
    if (dom.planet.orderBadge) {
      dom.planet.orderBadge.textContent = `Orbit #${planet.order} dari Matahari`;
    }
    if (dom.planet.categoryBadge) {
      dom.planet.categoryBadge.textContent = planet.category || (planet.isGasGiant ? 'Raksasa Gas' : 'Planet Terestrial');
    }

    // Grid Telemetri Data Fisik & Orbit Astronomis
    if (dom.planet.solarStripActiveInfo) {
      dom.planet.solarStripActiveInfo.textContent = `Target: #${planet.order} ${planet.name} (${planet.distanceAU || '-'})`;
    }
    if (dom.planet.telemDistance) {
      dom.planet.telemDistance.textContent = `${planet.distanceAU || ''} (${planet.distanceKm || '-'})`;
    }
    if (dom.planet.telemRevolution) {
      dom.planet.telemRevolution.textContent = planet.revolutionPeriod || '-';
    }
    if (dom.planet.telemRotation) {
      dom.planet.telemRotation.textContent = planet.rotationPeriod || '-';
    }
    if (dom.planet.telemTemp) {
      dom.planet.telemTemp.textContent = planet.temp || '-';
    }

    // Pita Navigasi Susunan 8 Planet Tata Surya
    setupCockpitSolarStrip(planet);

    dom.planet.name.textContent = planet.name;
    dom.planet.tagline.textContent = planet.tagline;
    dom.planet.desc.textContent = planet.description;

    // Fakta ilmiah
    dom.planet.facts.innerHTML = '';
    planet.facts.forEach(fact => {
      const li = document.createElement('li');
      li.textContent = fact;
      dom.planet.facts.appendChild(li);
    });

    // Perbandingan gravitasi
    dom.planet.gravityPlanetName.textContent = planet.name;
    const gPct = Math.min(180, (planet.gravity / 9.8) * 100);
    dom.planet.gravityPlanetBar.style.width = `${gPct}%`;
    dom.planet.gravityPlanetBar.textContent = `${planet.gravity} m/s²`;

    const weightSample = 50; // astronot 50 kg
    const localWeight = ((weightSample * planet.gravity) / 9.8).toFixed(1);
    dom.planet.gravityExplanation.innerHTML =
      `Jika bobotmu di Bumi adalah <strong>${weightSample} kg</strong>, di ${planet.name} bobotmu akan terasa setara <strong>${localWeight} kg</strong>!`;

    // Interaktivitas unik sesuai planet
    setupPlanetInteraction(planet);

    // Observatorium Citra Asli NASA (Dual Viewport Console)
    setupNasaObservatory(planet);

    // Narasi Suara Komputer Penerbangan
    setupPlanetVoice(planet);

    // Kuis checkpoint jika ada
    setupPlanetQuiz(planet);

    // Tandai planet sudah dikunjungi
    state.visitedPlanets.add(planet.id);
    dom.planet.badge.classList.remove('hidden');
    updateHUDProgress();
  }

  // ── MODUL PITA SUSUNAN TATA SURYA KOKPIT ───────────────────
  function setupCockpitSolarStrip(activePlanet) {
    if (!dom.planet.solarStripTrack) return;
    dom.planet.solarStripTrack.innerHTML = '';

    // Matahari (Sol) di titik orbit pusat
    const sunNode = document.createElement('div');
    sunNode.className = 'strip-sun-node';
    sunNode.title = 'Matahari (Pusat Tata Surya)';
    sunNode.innerHTML = `
      <span class="strip-sun-icon">☀️</span>
      <span class="strip-sun-label">SOL</span>
    `;
    dom.planet.solarStripTrack.appendChild(sunNode);

    GAME_DATA.planets.forEach((p, index) => {
      // Sisipkan pembatas Sabuk Asteroid antara Mars (#4) dan Jupiter (#5)
      if (index === 4) {
        const beltDiv = document.createElement('div');
        beltDiv.className = 'strip-asteroid-divider';
        beltDiv.title = 'Zona Sabuk Asteroid Utama (Pemisah Planet Dalam Terestrial & Planet Luar Jovian)';
        beltDiv.innerHTML = `
          <span class="strip-asteroid-icon">☄️</span>
          <span class="strip-asteroid-text">SABUK ASTEROID</span>
        `;
        dom.planet.solarStripTrack.appendChild(beltDiv);
      }

      const item = document.createElement('div');
      item.className = 'strip-item-planet' + (p.id === activePlanet.id ? ' active' : '');
      item.title = `${p.order}. ${p.name} (${p.distanceAU || ''}) - ${p.category || ''}`;

      const isVisited = state.visitedPlanets.has(p.id);
      item.innerHTML = `
        <div class="strip-planet-disc" style="background-image: url('${encodeURI(p.image || '')}');"></div>
        <span class="strip-planet-order">${p.order}.</span>
        <span class="strip-planet-name">${p.name}</span>
        <span class="strip-planet-au">${p.distanceAU || ''}</span>
        ${isVisited ? '<span class="strip-visited-dot" title="Sudah dieksplorasi"></span>' : ''}
      `;

      item.addEventListener('click', () => {
        AudioEngine.click();
        if (p.id === activePlanet.id) return;
        VoiceEngine.stop();
        startTravelToPlanet(p);
      });

      dom.planet.solarStripTrack.appendChild(item);
    });

    // Auto-scroll track agar planet aktif berada di tengah pita
    setTimeout(() => {
      const activeEl = dom.planet.solarStripTrack.querySelector('.strip-item-planet.active');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 120);
  }

  // ── MODUL OBSERVATORIUM CITRA NASA (DUAL MONITOR CONSOLE) ──
  let activeObservatoryPlanet = null;

  function setupNasaObservatory(planet) {
    activeObservatoryPlanet = planet;
    if (!dom.planet.observatorySection) return;

    // Monitor 1: Teleskop Orbit Global NASA
    if (dom.planet.nasaOrbitImg) {
      dom.planet.nasaOrbitImg.src = planet.image || '';
      dom.planet.nasaOrbitImg.alt = `Citra Orbit ${planet.name} NASA`;
    }
    if (dom.planet.nasaOrbitCaption) {
      dom.planet.nasaOrbitCaption.textContent = planet.imageCaption || `Citra Teleskopik Spektral ${planet.name}`;
    }
    if (dom.planet.nasaOrbitCredit) {
      dom.planet.nasaOrbitCredit.textContent = planet.nasaCredit || 'NASA / JPL-Caltech';
    }

    // Monitor 2: Pemindaian Permukaan Nyata / Atmosfer Eksplorasi NASA
    const surfaceSrc = planet.surfaceImage || planet.image || '';
    if (dom.planet.nasaSurfaceImg) {
      dom.planet.nasaSurfaceImg.src = surfaceSrc;
      dom.planet.nasaSurfaceImg.alt = `Citra Permukaan Nyata ${planet.name} NASA`;
    }
    if (dom.planet.nasaSurfaceCaption) {
      dom.planet.nasaSurfaceCaption.textContent = planet.surfaceImageCaption || `Pemindaian Resolusi Tinggi ${planet.name}`;
    }
    if (dom.planet.nasaSurfaceCredit) {
      dom.planet.nasaSurfaceCredit.textContent = planet.nasaCredit || 'NASA / JPL-Caltech';
    }

    // Update label tab permukaan dinamis
    if (dom.planet.btnTabSurface) {
      dom.planet.btnTabSurface.textContent = planet.surfaceTabTitle || '🌋 Permukaan Nyata';
    }

    // Default ke tampilan monitor ganda (Dual Viewport)
    setNasaMonitorMode('dual');
  }

  function setNasaMonitorMode(mode) {
    if (!dom.planet.nasaDualGrid) return;

    if (mode === 'orbit') {
      dom.planet.nasaDualGrid.className = 'nasa-dual-grid focus-orbit';
      if (dom.planet.btnTabDual) dom.planet.btnTabDual.classList.remove('active');
      if (dom.planet.btnTabPlanet) dom.planet.btnTabPlanet.classList.add('active');
      if (dom.planet.btnTabSurface) dom.planet.btnTabSurface.classList.remove('active');
    } else if (mode === 'surface') {
      dom.planet.nasaDualGrid.className = 'nasa-dual-grid focus-surface';
      if (dom.planet.btnTabDual) dom.planet.btnTabDual.classList.remove('active');
      if (dom.planet.btnTabPlanet) dom.planet.btnTabPlanet.classList.remove('active');
      if (dom.planet.btnTabSurface) dom.planet.btnTabSurface.classList.add('active');
    } else {
      // dual mode
      dom.planet.nasaDualGrid.className = 'nasa-dual-grid';
      if (dom.planet.btnTabDual) dom.planet.btnTabDual.classList.add('active');
      if (dom.planet.btnTabPlanet) dom.planet.btnTabPlanet.classList.remove('active');
      if (dom.planet.btnTabSurface) dom.planet.btnTabSurface.classList.remove('active');
    }
  }

  if (dom.planet.btnTabDual) {
    dom.planet.btnTabDual.addEventListener('click', () => {
      AudioEngine.click();
      setNasaMonitorMode('dual');
    });
  }

  if (dom.planet.btnTabPlanet) {
    dom.planet.btnTabPlanet.addEventListener('click', () => {
      AudioEngine.click();
      setNasaMonitorMode('orbit');
    });
  }

  if (dom.planet.btnTabSurface) {
    dom.planet.btnTabSurface.addEventListener('click', () => {
      AudioEngine.click();
      setNasaMonitorMode('surface');
    });
  }

  // ── MODUL NARATOR SUARA KOMPUTER PENERBANGAN ───────────────
  let activePlanetForVoice = null;

  function setupPlanetVoice(planet) {
    activePlanetForVoice = planet;
    updatePlanetVoiceUI(false, 'Klik untuk mendengarkan');

    // Auto-narration jika suara aktif
    if (!VoiceEngine.isMuted && planet.narrationSpeech) {
      setTimeout(() => {
        // Pastikan masih berada di layar planet yang sama
        if (dom.screens.planet.classList.contains('active') && activePlanetForVoice?.id === planet.id) {
          playPlanetVoice();
        }
      }, 700);
    }
  }

  function updatePlanetVoiceUI(isSpeaking, statusText) {
    const btn = dom.planet.btnSpeakPlanet || document.getElementById('btn-speak-planet');
    const label = document.getElementById('voice-play-text');
    const icon = document.getElementById('voice-play-icon');
    const indicator = document.getElementById('voice-playing-indicator');
    const statusEl = indicator ? indicator.querySelector('.voice-status-text') : null;

    if (btn) {
      btn.classList.toggle('speaking', isSpeaking);
    }
    if (label) {
      label.textContent = isSpeaking ? 'Hentikan Narasi' : 'Dengarkan Narasi Planet';
    }
    if (icon) {
      icon.textContent = isSpeaking ? '⏹️' : '🔊';
    }
    if (indicator) {
      indicator.classList.toggle('hidden', !isSpeaking);
      indicator.querySelectorAll('.voice-wave').forEach(w => w.classList.toggle('active', isSpeaking));
      if (statusEl && statusText) {
        statusEl.textContent = statusText;
      }
    }
  }

  function playPlanetVoice() {
    if (!activePlanetForVoice || !activePlanetForVoice.narrationSpeech) return;

    if (VoiceEngine.isPlaying) {
      VoiceEngine.stop();
      updatePlanetVoiceUI(false, 'Narasi dihentikan');
      return;
    }

    updatePlanetVoiceUI(true, '🎙️ Komputer transmisi sedang berbicara...');
    VoiceEngine.speak(
      activePlanetForVoice.narrationSpeech,
      () => {
        updatePlanetVoiceUI(true, '🎙️ Komputer transmisi sedang berbicara...');
      },
      () => {
        updatePlanetVoiceUI(false, '✅ Transmisi selesai');
      }
    );
  }

  if (dom.planet.btnSpeakPlanet) {
    dom.planet.btnSpeakPlanet.addEventListener('click', () => {
      AudioEngine.click();
      playPlanetVoice();
    });
  }

  // Interaktivitas unik untuk masing-masing dari 8 planet
  function setupPlanetInteraction(planet) {
    dom.planet.interactionTitle.textContent = planet.interactionTitle;
    dom.planet.interactionDesc.textContent = planet.interactionDesc;
    const area = dom.planet.interactionArea;
    area.innerHTML = '';

    switch (planet.interactionType) {
      case 'temperature': {
        // Merkurius: Pengaturan Pelindung Suhu Siang vs Malam
        area.innerHTML = `
          <div class="temp-gauge">
            <span>Malam (-180°C)</span>
            <div class="temp-bar">
              <div id="temp-marker" class="temp-marker" style="left: 50%;"></div>
            </div>
            <span>Siang (+430°C)</span>
          </div>
          <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
            <button class="interaction-btn" data-mode="night">❄️ Pelindung Dingin Ekstrem</button>
            <button class="interaction-btn" data-mode="balanced">⚖️ Mode Transisi Stabil</button>
            <button class="interaction-btn" data-mode="day">🔥 Perisai Reflektor Panas</button>
          </div>
          <div id="temp-result" class="interaction-result">Pilih mode pelindung suhu roket untuk mengantisipasi suhu tanpa atmosfer!</div>
        `;
        const marker = area.querySelector('#temp-marker');
        const res = area.querySelector('#temp-result');
        area.querySelectorAll('.interaction-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            AudioEngine.click();
            const mode = btn.getAttribute('data-mode');
            if (mode === 'day') {
              marker.style.left = '85%';
              res.className = 'interaction-result success';
              res.textContent = '🛡️ Berhasil! Perisai panas memantulkan radiasi ekstrem Matahari hingga 430°C.';
            } else if (mode === 'night') {
              marker.style.left = '15%';
              res.className = 'interaction-result success';
              res.textContent = '❄️ Berhasil! Isolasi pemanas termal melindungi modul dari kedinginan -180°C.';
            } else {
              marker.style.left = '50%';
              res.className = 'interaction-result success';
              res.textContent = '⚖️ Roket meluncur di garis terminator (batas siang & malam) Merkurius dengan stabil!';
            }
          });
        });
        break;
      }

      case 'atmosphere': {
        // Venus: Mengaktifkan 3 Sensor Asam & Tekanan
        area.innerHTML = `
          <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
            <button class="interaction-btn" id="sensor-co2">💨 Sensor CO₂</button>
            <button class="interaction-btn" id="sensor-press">⚠️ Sensor Tekanan</button>
            <button class="interaction-btn" id="sensor-acid">🧪 Sensor Asam Sulfat</button>
          </div>
          <div id="sensor-result" class="interaction-result">Klik tombol sensor untuk memindai atmosfer tebal Venus.</div>
        `;
        const res = area.querySelector('#sensor-result');
        let activated = new Set();
        area.querySelectorAll('.interaction-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            AudioEngine.scan();
            btn.classList.add('active');
            activated.add(btn.id);
            if (btn.id === 'sensor-co2') {
              res.textContent = '📊 Data CO₂: Terdeteksi 96,5% Karbon Dioksida! Terjadi efek rumah kaca dahsyat (465°C).';
            } else if (btn.id === 'sensor-press') {
              res.textContent = '📊 Data Barometer: Tekanan 92 Bar (90x lebih berat dari permukaan Bumi)!';
            } else if (btn.id === 'sensor-acid') {
              res.textContent = '📊 Data Spektrometer: Awan tebal tersusun dari asam sulfat korosif!';
            }
            if (activated.size === 3) {
              setTimeout(() => AudioEngine.correct(), 300);
              res.className = 'interaction-result success';
              res.textContent = '🎉 Semua sensor aktif! Terkonfirmasi: Venus adalah neraka efek rumah kaca terpanas di Tata Surya!';
            }
          });
        });
        break;
      }

      case 'habitable': {
        // Bumi: Zona Laik Huni (Goldilocks Zone)
        area.innerHTML = `
          <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
            <button class="interaction-btn" id="hab-water">💧 Air Permukaan</button>
            <button class="interaction-btn" id="hab-air">🌬️ Atmosfer Oksigen</button>
            <button class="interaction-btn" id="hab-mag">🛡️ Medan Magnet</button>
          </div>
          <div id="hab-result" class="interaction-result">Periksa 3 syarat utama penopang kehidupan di Bumi!</div>
        `;
        const res = area.querySelector('#hab-result');
        let habCount = 0;
        area.querySelectorAll('.interaction-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            AudioEngine.click();
            if (!btn.classList.contains('active')) {
              btn.classList.add('active');
              habCount++;
              if (habCount === 3) {
                res.className = 'interaction-result success';
                res.textContent = '🌟 Sempurna! Bumi berada di Zona Goldilocks (tidak terlalu panas, tidak terlalu dingin) dengan air cair dan pelindung radiasi!';
              } else {
                res.textContent = `✅ Syarat ${habCount}/3 terverifikasi! Klik syarat lainnya.`;
              }
            }
          });
        });
        break;
      }

      case 'rover': {
        // Mars: Menjalankan Rover Virtual mencari Oksida Besi
        state.roverFoundSamples = 0;
        area.innerHTML = `
          <p style="font-size:0.9rem; text-align:center; color:#ff8866; margin-bottom:8px;">
            Kadet, klik petak tanah Mars untuk mengambil sampel oksida besi (karat)! Temukan 3 sampel:
          </p>
          <div class="rover-grid" id="rover-grid"></div>
          <div id="rover-result" class="interaction-result">Sampel ditemukan: 0 / 3</div>
        `;
        const grid = area.querySelector('#rover-grid');
        const res = area.querySelector('#rover-result');
        // Buat 15 petak tanah merah
        const targetIndices = [2, 7, 11];
        for (let i = 0; i < 15; i++) {
          const cell = document.createElement('div');
          cell.className = 'rover-cell';
          cell.textContent = '❓';
          cell.addEventListener('click', () => {
            AudioEngine.init();
            if (cell.classList.contains('revealed')) return;
            cell.classList.add('revealed');
            if (targetIndices.includes(i)) {
              AudioEngine.sampleFound();
              cell.textContent = '🔴';
              state.roverFoundSamples++;
              res.textContent = `🔬 Sampel oksida besi ditemukan: ${state.roverFoundSamples} / 3!`;
              if (state.roverFoundSamples >= 3) {
                setTimeout(() => AudioEngine.correct(), 350);
                res.className = 'interaction-result success';
                res.textContent = '🎉 Misi Rover Selesai! Terbukti tanah Mars berwarna merah karena kaya mineral besi berkarat (Fe₂O₃).';
              }
            } else {
              AudioEngine.roverDig();
              cell.textContent = '🪨';
            }
          });
          grid.appendChild(cell);
        }
        break;
      }

      case 'storm': {
        // Jupiter: Menerobos Bintik Merah Raksasa
        area.innerHTML = `
          <p style="font-size:0.9rem; text-align:center; color:#ffaa77; margin-bottom:8px;">
            Jupiter adalah raksasa gas tanpa daratan! Tembus badai Bintik Merah untuk mengambil data gas:
          </p>
          <div style="display:flex; justify-content:center; gap:8px;">
            <button class="interaction-btn" id="storm-top">🌀 Lapisan Luar</button>
            <button class="interaction-btn" id="storm-mid">🌪️ Pusaran Bintik Merah</button>
            <button class="interaction-btn" id="storm-deep">⚡ Atmosfer Dalam</button>
          </div>
          <div id="storm-result" class="interaction-result">Pilih lapisan badai gas raksasa untuk dianalisis!</div>
        `;
        const res = area.querySelector('#storm-result');
        area.querySelectorAll('.interaction-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            AudioEngine.click();
            btn.classList.add('active');
            res.className = 'interaction-result success';
            if (btn.id === 'storm-mid') {
              res.textContent = '🌀 Analisis Bintik Merah: Badai antisiklon raksasa ini telah berlangsung ratusan tahun dan berukuran lebih besar dari Bumi!';
            } else {
              res.textContent = '💨 Analisis Gas: Spektrometer mendeteksi 90% Hidrogen dan 10% Helium tanpa permukaan padat!';
            }
          });
        });
        break;
      }

      case 'rings': {
        // Saturnus: Mengurai partikel cincin
        area.innerHTML = `
          <p style="font-size:0.9rem; text-align:center; color:#ffdd88; margin-bottom:8px;">
            Sentuh partikel cincin Saturnus untuk menganalisis kandungannya:
          </p>
          <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap;">
            <button class="interaction-btn" id="ring-ice">❄️ Bongkahan Es Air</button>
            <button class="interaction-btn" id="ring-dust">🌫️ Debu Kosmik</button>
            <button class="interaction-btn" id="ring-float">⚖️ Tes Densitas Air</button>
          </div>
          <div id="ring-result" class="interaction-result">Klik salah satu materi cincin!</div>
        `;
        const res = area.querySelector('#ring-result');
        area.querySelectorAll('.interaction-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            AudioEngine.click();
            btn.classList.add('active');
            res.className = 'interaction-result success';
            if (btn.id === 'ring-ice') {
              res.textContent = '❄️ Komposisi Es: 99% cincin terdiri dari es air murni yang berkilau memantulkan cahaya Matahari!';
            } else if (btn.id === 'ring-dust') {
              res.textContent = '🌫️ Debu & Batu: Berukuran dari sebutir pasir hingga seukuran rumah!';
            } else {
              res.textContent = '🌊 Fakta Menakjubkan: Rata-rata densitas Saturnus lebih kecil dari air (0,687 g/cm³). Jika ada bak air raksasa, Saturnus akan mengapung!';
            }
          });
        });
        break;
      }

      case 'tilt': {
        // Uranus: Menyesuaikan kemiringan poros rotasi yang rebah ~98°
        state.uranusAngle = 0;
        area.innerHTML = `
          <div class="tilt-visual">
            <div id="tilt-planet" class="tilt-planet">⛢</div>
            <div class="tilt-controls">
              <button class="interaction-btn" id="btn-tilt-98">📐 Putar ke 98° (Rebah)</button>
              <button class="interaction-btn" id="btn-tilt-reset">🔄 Reset ke 0°</button>
            </div>
          </div>
          <div id="tilt-result" class="interaction-result">Poros rotasi Uranus sangat ekstrem (~98°). Sejajarkan roket dengan rotasi Uranus!</div>
        `;
        const pIcon = area.querySelector('#tilt-planet');
        const res = area.querySelector('#tilt-result');
        area.querySelector('#btn-tilt-98').addEventListener('click', () => {
          AudioEngine.servo();
          pIcon.style.transform = 'rotate(98deg)';
          res.className = 'interaction-result success';
          res.textContent = '✅ Poros Terkunci (98°)! Uranus berputar seolah menggelinding di bidang orbitnya dengan kutub bergantian menghadap Matahari!';
          setTimeout(() => AudioEngine.correct(), 350);
        });
        area.querySelector('#btn-tilt-reset').addEventListener('click', () => {
          AudioEngine.servo();
          pIcon.style.transform = 'rotate(0deg)';
          res.className = 'interaction-result';
          res.textContent = 'Poros kembali tegak. Tekan tombol 98° untuk melihat orientasi unik Uranus!';
        });
        break;
      }

      case 'wind': {
        // Neptunus: Menghadapi Turbulensi Angin Tercepat
        area.innerHTML = `
          <p style="font-size:0.9rem; text-align:center; color:#66aaff; margin-bottom:8px;">
            Kecepatan angin Neptunus mencapai 2.100 km/jam! Aktifkan pendorong stabilitas:
          </p>
          <div style="display:flex; justify-content:center; gap:8px;">
            <button class="interaction-btn" id="wind-stabilizer">⚡ Aktifkan Pendorong Reaktif</button>
          </div>
          <div id="wind-result" class="interaction-result">Tekan tombol pendorong untuk menstabilkan modul roket di atmosfer Neptunus!</div>
        `;
        const res = area.querySelector('#wind-result');
        area.querySelector('#wind-stabilizer').addEventListener('click', function () {
          AudioEngine.wind();
          this.classList.add('active');
          res.className = 'interaction-result success';
          res.textContent = '💨 Modul Stabil! Kecepatan angin supersonik hingga 2.100 km/jam dan suhu beku metana (-214°C) berhasil dipetakan!';
          setTimeout(() => AudioEngine.correct(), 500);
        });
        break;
      }

      default:
        area.innerHTML = '<p>Data lingkungan tercatat otomatis di komputer roket.</p>';
    }
  }

  // Setup Kuis / Mission Checkpoint pada Planet
  function setupPlanetQuiz(planet) {
    const quizData = GAME_DATA.quizzes[planet.id];
    if (!quizData) {
      dom.planet.quizSection.classList.add('hidden');
      return;
    }

    dom.planet.quizSection.classList.remove('hidden');

    // Tampilkan gambar media kuis jika tersedia
    const quizImg = quizData.image || planet.image;
    if (quizImg) {
      dom.planet.quizMediaImg.src = quizImg;
      dom.planet.quizMediaCaption.textContent = quizData.imageCaption || planet.imageCaption || `📸 Ilustrasi Permukaan ${planet.name}`;
      dom.planet.quizMedia.classList.remove('hidden');
    } else {
      dom.planet.quizMedia.classList.add('hidden');
    }

    dom.planet.quizPrompt.textContent = quizData.prompt;
    dom.planet.quizOptions.innerHTML = '';
    dom.planet.quizFeedback.classList.add('hidden');

    const alreadyAnswered = state.answeredQuizzes.has(planet.id);

    quizData.options.forEach((opt, optIdx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-option';
      btn.textContent = `${String.fromCharCode(65 + optIdx)}. ${opt.text}`;

      if (alreadyAnswered) {
        btn.classList.add('disabled');
        if (opt.correct) btn.classList.add('correct');
      } else {
        btn.addEventListener('click', () => {
          AudioEngine.init();
          const allBtns = dom.planet.quizOptions.querySelectorAll('.quiz-option');
          allBtns.forEach(b => b.classList.add('disabled'));

          if (opt.correct) {
            AudioEngine.correct();
            btn.classList.add('correct');
            dom.planet.quizFeedback.className = 'quiz-feedback correct-fb';
            dom.planet.quizFeedback.textContent = quizData.feedback;
            state.correctQuizzesCount++;
            updateFuel(GAME_DATA.config.fuelBonusCorrect);
          } else {
            AudioEngine.wrong();
            btn.classList.add('wrong');
            dom.planet.quizFeedback.className = 'quiz-feedback wrong-fb';
            dom.planet.quizFeedback.textContent = `❌ Kurang tepat. ${quizData.feedback} (Bahan bakar -${GAME_DATA.config.fuelPerWrongAnswer}%)`;
            updateFuel(-GAME_DATA.config.fuelPerWrongAnswer);

            // Sorot jawaban yang benar
            allBtns.forEach((b, i) => {
              if (quizData.options[i].correct) b.classList.add('correct');
            });
          }

          dom.planet.quizFeedback.classList.remove('hidden');
          state.answeredQuizzes.add(planet.id);
        });
      }

      dom.planet.quizOptions.appendChild(btn);
    });

    if (alreadyAnswered) {
      dom.planet.quizFeedback.className = 'quiz-feedback correct-fb';
      dom.planet.quizFeedback.textContent = quizData.feedback;
      dom.planet.quizFeedback.classList.remove('hidden');
    }
  }

  // Kembali ke Peta Kokpit dari Halaman Planet
  dom.planet.btnBackMap.addEventListener('click', () => {
    AudioEngine.click();
    VoiceEngine.stop();
    updatePlanetVoiceUI(false, 'Siap menerima transmisi');
    showScreen('map');
  });

  // ── SCREEN 6: LOGBOOK NAVIGASI ANTARIKSA ────────────────────
  dom.map.btnLogbook.addEventListener('click', () => {
    AudioEngine.click();
    renderLogbook();
    showScreen('logbook');
  });

  dom.logbook.btnClose.addEventListener('click', () => {
    AudioEngine.click();
    showScreen('map');
  });

  function renderLogbook() {
    dom.logbook.grid.innerHTML = '';
    GAME_DATA.planets.forEach(p => {
      const visited = state.visitedPlanets.has(p.id);
      const card = document.createElement('div');
      card.className = `logbook-card ${visited ? 'visited' : 'locked'}`;

      const iconHtml = p.iconSvg ? getScopedSvg(p.iconSvg, 'logbook-' + p.id) : p.icon;

      card.innerHTML = `
        <div class="logbook-card-icon">${iconHtml}</div>
        <div class="logbook-card-name">${p.name}</div>
        <div class="logbook-card-status ${visited ? 'done' : 'pending'}">
          ${visited ? '✅ Data Lengkap' : '🔒 Belum Dikunjungi'}
        </div>
        ${visited ? `<p style="font-size:0.75rem; color:#8899aa; margin-top:6px;">${p.tagline}</p>` : ''}
      `;

      if (visited) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
          AudioEngine.click();
          openPlanetScreen(p);
        });
      }

      dom.logbook.grid.appendChild(card);
    });
  }

  // ── SCREEN 7: SELESAI MISI & SERTIFIKAT KADET ──────────────
  dom.map.btnFinish.addEventListener('click', () => {
    AudioEngine.fanfare();
    showEndingScreen();
  });

  function showEndingScreen() {
    showScreen('ending');

    // 1. Perhitungan Skor Transparan (0 - 100)
    const scoring = (GAME_DATA.config && GAME_DATA.config.scoring) || {};
    const pointsPerPlanet = scoring.planetPoints || scoring.pointsPerPlanet || 5;
    const pointsPerQuiz = scoring.quizPoints || scoring.pointsPerQuiz || 8;
    const maxFuelPoints = scoring.maxFuelPoints || scoring.fuelEfficiencyMax || 20;

    const visitedCount = state.visitedPlanets ? state.visitedPlanets.size : 0;
    const quizzesCount = state.correctQuizzesCount || 0;
    const currentFuel = typeof state.fuel === 'number' ? state.fuel : 100;

    const exploreScore = Math.min(40, visitedCount * pointsPerPlanet);
    const quizScore = Math.min(40, quizzesCount * pointsPerQuiz);
    const fuelScore = Math.round(Math.min(20, Math.max(0, (currentFuel / 100) * maxFuelPoints)));
    const totalScore = Math.min(100, Math.max(0, exploreScore + quizScore + fuelScore));

    // 2. Tentukan Predikat Akademik & Catatan Evaluasi Ibu Linda
    let grade = 'B';
    let gradeLabel = 'Baik (Lulus)';
    let evalNote = 'Penerbangan berhasil menyelesaikan misi dasar penjelajahan tata surya. Disarankan untuk lebih teliti mempelajari sifat atmosfer gas dan komposisi cincin pada modul kuis.';

    if (totalScore >= 95) {
      grade = 'A+';
      gradeLabel = 'Istimewa / Magna Cum Laude';
      evalNote = 'Luar biasa! Kadet menunjukkan pemahaman sains antariksa yang sempurna, navigasi orbit yang sangat hemat bahan bakar, dan ketelitian tinggi dalam pengamatan citra NASA.';
    } else if (totalScore >= 85) {
      grade = 'A';
      gradeLabel = 'Sangat Baik / Cum Laude';
      evalNote = 'Sangat mengagumkan! Semua instrumen observatorium berhasil dipelajari dengan sangat baik. Kadet menguasai konsep dasar gravitasi dan perbedaan planet terestrial vs Jovian.';
    } else if (totalScore >= 75) {
      grade = 'B+';
      gradeLabel = 'Baik Sekali';
      evalNote = 'Kinerja penerbangan yang memuaskan. Misi eksplorasi 8 planet tercapai dengan aman. Tingkatkan lagi akurasi pada tantangan kuis atmosfer ekstrem.';
    }

    // 3. Tampilkan Data Statistik & Evaluasi Nilai di Layar Akhir
    if (dom.ending.statPlanets) dom.ending.statPlanets.textContent = `${state.visitedPlanets.size} / 8`;
    if (dom.ending.statQuizzes) dom.ending.statQuizzes.textContent = `${state.correctQuizzesCount} Benar`;
    if (dom.ending.statFuel) dom.ending.statFuel.textContent = `${state.fuel}%`;

    if (dom.ending.scoreTotal) dom.ending.scoreTotal.textContent = totalScore;
    if (dom.ending.scoreGrade) {
      dom.ending.scoreGrade.textContent = grade;
      dom.ending.scoreGrade.className = `final-grade-badge grade-${grade.toLowerCase().replace('+', '-plus')}`;
    }
    if (dom.ending.scoreGradeTitle) dom.ending.scoreGradeTitle.textContent = `Predikat: ${grade} (${gradeLabel})`;
    if (dom.ending.scoreExplore) dom.ending.scoreExplore.textContent = `${exploreScore} / 40 Poin`;
    if (dom.ending.scoreQuiz) dom.ending.scoreQuiz.textContent = `${quizScore} / 40 Poin`;
    if (dom.ending.scoreFuel) dom.ending.scoreFuel.textContent = `${fuelScore} / 20 Poin`;
    if (dom.ending.evalNotes) dom.ending.evalNotes.textContent = `"${evalNote}"`;

    // 4. Update Data Sertifikat Cetak Resmi Bimbel RBS
    if (dom.ending.certName) dom.ending.certName.textContent = state.playerName;
    if (dom.ending.certCadetName) dom.ending.certCadetName.textContent = state.playerName;
    if (dom.ending.certFinalScore) dom.ending.certFinalScore.textContent = `${totalScore} / 100`;
    if (dom.ending.certFinalGrade) dom.ending.certFinalGrade.textContent = `${grade} (${gradeLabel})`;

    // Generate Nomor Registrasi Misi Unik & Tanggal
    const today = new Date();
    const dateFormatted = today.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const regCode = `RBS-ASTRO-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (dom.ending.certDate) dom.ending.certDate.textContent = dateFormatted;
    if (dom.ending.certRegNumber) dom.ending.certRegNumber.textContent = regCode;

    if (dom.ending.text) {
      dom.ending.text.textContent = GAME_DATA.narration.outro.join(' ');
    }

    // 5. Suarakan Outro Narasi Komputer Penerbangan
    VoiceEngine.speak(GAME_DATA.narration.outro.join(' '));
  }

  if (dom.ending.btnPrintCert) {
    dom.ending.btnPrintCert.addEventListener('click', () => {
      AudioEngine.click();
      window.print();
    });
  }

  dom.ending.btnReplay.addEventListener('click', () => {
    AudioEngine.click();
    resetGame();
  });

  // ── SCREEN 8: GAME OVER (BAHAN BAKAR HABIS) ────────────────
  function triggerGameOver() {
    AudioEngine.wrong();
    dom.gameover.count.textContent = state.visitedPlanets.size;
    showScreen('gameover');
  }

  dom.gameover.btnRetry.addEventListener('click', () => {
    AudioEngine.click();
    // Beri bahan bakar darurat untuk melanjutkan ekspedisi
    state.fuel = 70;
    updateFuel(0);
    showScreen('map');
  });

  // ── PANDUAN / TUTORIAL KOKPIT (ONBOARDING KADET) ────────────
  function openTutorial() {
    if (!dom.tutorial || !dom.tutorial.modal) return;
    if (dom.tutorial.cadetName) {
      dom.tutorial.cadetName.textContent = state.playerName || 'Astronot';
    }
    dom.tutorial.modal.classList.remove('hidden');
    AudioEngine.tutorial();
  }

  function closeTutorial() {
    if (!dom.tutorial || !dom.tutorial.modal) return;
    dom.tutorial.modal.classList.add('hidden');
    state.hasSeenTutorial = true;
    AudioEngine.click();
  }

  if (dom.tutorial.btnOpen) {
    dom.tutorial.btnOpen.addEventListener('click', () => {
      AudioEngine.click();
      openTutorial();
    });
  }

  if (dom.tutorial.btnStart) {
    dom.tutorial.btnStart.addEventListener('click', () => {
      closeTutorial();
    });
  }

  if (dom.tutorial.btnX) {
    dom.tutorial.btnX.addEventListener('click', () => {
      closeTutorial();
    });
  }

  if (dom.tutorial.backdrop) {
    dom.tutorial.backdrop.addEventListener('click', () => {
      closeTutorial();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dom.tutorial && dom.tutorial.modal && !dom.tutorial.modal.classList.contains('hidden')) {
      closeTutorial();
    }
  });

  // ── RESET STATE ────────────────────────────────────────────
  function resetGame() {
    VoiceEngine.stop();
    state.fuel = GAME_DATA.config.startingFuel;
    state.visitedPlanets.clear();
    state.answeredQuizzes.clear();
    state.correctQuizzesCount = 0;
    state.currentPlanetId = null;
    state.targetPlanetId = null;
    state.hasEncounteredAsteroids = false;
    state.hasSeenTutorial = false;
    state.selectedPlanetId = null;

    dom.title.input.value = '';
    dom.title.btnStart.disabled = true;
    updateFuel(0);
    updateHUDProgress();
    dom.map.btnFinish.classList.add('hidden');
    showScreen('title');
  }

  // ── KONTROL AUDIO (BGM & SFX) ─────────────────────────────
  if (dom.audio.btnToggle) {
    dom.audio.btnToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      AudioEngine.init();
      AudioEngine.toggleMute();
    });
  }

  // ── KONTROL NARASI SUARA ──────────────────────────────────
  if (dom.audio.btnToggleVoice) {
    dom.audio.btnToggleVoice.addEventListener('click', (e) => {
      e.stopPropagation();
      VoiceEngine.toggleMute();
      AudioEngine.click();
    });
  }

  // Buka AudioContext & Web Speech otomatis pada interaksi pertama kadet (syarat browser Web Audio)
  const unlockAudio = () => {
    AudioEngine.init();
    VoiceEngine.init();
    // Resume speechSynthesis if in paused state
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      try { window.speechSynthesis.resume(); } catch (e) {}
    }
    ['click', 'touchstart', 'keydown'].forEach(evt => {
      document.removeEventListener(evt, unlockAudio);
    });
  };
  ['click', 'touchstart', 'keydown'].forEach(evt => {
    document.addEventListener(evt, unlockAudio, { passive: true });
  });

  // Inisialisasi awal saat load
  VoiceEngine.init();
  updateFuel(0);
  showScreen('title');

})();
