export default class AudioManager {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.musicGain = null;
    this.initialized = false;
    this.lastCollisionTime = 0;
    this.collisionThrottle = 50; // ms between collision sounds

    // Music state
    this.musicPlaying = false;
    this.musicLoop = null;
    this.currentLevel = 1;

    // Load settings
    this.settings = JSON.parse(localStorage.getItem('devilbox_settings') || '{}');
    this.sfxVolume = this.settings.sfxVolume ?? 0.7;
    this.musicVolume = this.settings.musicVolume ?? 0.5;
    this.sfxEnabled = this.settings.sfxEnabled ?? true;
    this.musicEnabled = this.settings.musicEnabled ?? true;
  }

  init() {
    if (this.initialized) return;

    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Master gain for SFX
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = this.sfxVolume;

      // Separate gain for music
      this.musicGain = this.audioContext.createGain();
      this.musicGain.connect(this.audioContext.destination);
      this.musicGain.gain.value = this.musicVolume;

      this.initialized = true;
    } catch (e) {
      console.warn('WebAudio not supported:', e);
    }
  }

  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setSfxVolume(volume) {
    this.sfxVolume = volume;
    if (this.masterGain) {
      this.masterGain.gain.value = volume;
    }
  }

  setMusicVolume(volume) {
    this.musicVolume = volume;
    if (this.musicGain) {
      this.musicGain.gain.value = volume;
    }
  }

  setSfxEnabled(enabled) {
    this.sfxEnabled = enabled;
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    }
  }

  // ==================== BACKGROUND MUSIC ====================
  // Mozart-inspired procedural compositions

  startMusic(level = 1) {
    if (!this.musicEnabled || !this.initialized || this.musicPlaying) return;
    this.resume();

    this.currentLevel = level;
    this.musicPlaying = true;
    this.currentBar = 0;
    this.currentSection = 0;

    // Start the music loop
    this.scheduleMusicLoop();
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicLoop) {
      clearTimeout(this.musicLoop);
      this.musicLoop = null;
    }
  }

  scheduleMusicLoop() {
    if (!this.musicPlaying || !this.musicEnabled) return;

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Tempo varies by level (Allegro: 120-140 BPM)
    const bpm = 120 + (this.currentLevel - 1) * 4;
    const beatDuration = 60 / bpm;
    const barDuration = beatDuration * 4;

    // Get the full composition for this level
    const composition = this.getComposition(this.currentLevel);
    const totalBars = composition.structure.length;

    // Play current bar
    const sectionType = composition.structure[this.currentBar];
    this.playCompositionBar(now, beatDuration, composition, sectionType, this.currentBar);

    // Advance to next bar
    this.currentBar = (this.currentBar + 1) % totalBars;

    // Schedule next bar
    this.musicLoop = setTimeout(() => {
      this.scheduleMusicLoop();
    }, barDuration * 1000);
  }

  getComposition(level) {
    // Note frequencies (equal temperament)
    const NOTE = {
      // Octave 3
      C3: 130.81, Cs3: 138.59, D3: 146.83, Eb3: 155.56, E3: 164.81,
      F3: 174.61, Fs3: 185.00, G3: 196.00, Ab3: 207.65, A3: 220.00,
      Bb3: 233.08, B3: 246.94,
      // Octave 4
      C4: 261.63, Cs4: 277.18, D4: 293.66, Eb4: 311.13, E4: 329.63,
      F4: 349.23, Fs4: 369.99, G4: 392.00, Ab4: 415.30, A4: 440.00,
      Bb4: 466.16, B4: 493.88,
      // Octave 5
      C5: 523.25, Cs5: 554.37, D5: 587.33, Eb5: 622.25, E5: 659.25,
      F5: 698.46, Fs5: 739.99, G5: 783.99, Ab5: 830.61, A5: 880.00,
      Bb5: 932.33, B5: 987.77,
      // Octave 6
      C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98
    };

    const R = 0; // Rest

    // Different compositions based on level
    const compositionIndex = (level - 1) % 5;

    const compositions = [
      // Level 1: Eine Kleine Nachtmusik inspired (G major, Allegro)
      {
        name: 'Serenade',
        key: 'G major',
        // Structure: A A B B' A A C C' (32 bars total)
        structure: ['A','A','A2','A2','B','B','B2','B2','A','A','A2','A2','C','C','C2','C2',
                   'A','A','A2','A2','B','B','B2','B2','D','D','D2','D2','A','A','A3','A3'],
        sections: {
          // Opening fanfare motif
          A: {
            melody: [NOTE.G4, NOTE.D5, NOTE.G4, NOTE.D5, NOTE.G4, NOTE.B4, NOTE.D5, NOTE.G5,
                    NOTE.Fs5, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.B4, NOTE.A4, NOTE.G4, R],
            bass: [NOTE.G3, R, NOTE.G3, R, NOTE.G3, R, NOTE.D3, R],
            harmony: [NOTE.B3, R, NOTE.B3, R, NOTE.B3, R, NOTE.Fs3, R]
          },
          A2: {
            melody: [NOTE.G4, NOTE.D5, NOTE.G4, NOTE.D5, NOTE.G4, NOTE.B4, NOTE.D5, NOTE.G5,
                    NOTE.A5, NOTE.G5, NOTE.Fs5, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.B4, NOTE.A4],
            bass: [NOTE.G3, R, NOTE.B3, R, NOTE.D3, R, NOTE.G3, R],
            harmony: [NOTE.D4, R, NOTE.D4, R, NOTE.Fs3, R, NOTE.B3, R]
          },
          A3: {
            melody: [NOTE.G5, NOTE.Fs5, NOTE.G5, NOTE.A5, NOTE.G5, NOTE.Fs5, NOTE.E5, NOTE.D5,
                    NOTE.D5, NOTE.C5, NOTE.B4, NOTE.A4, NOTE.G4, NOTE.Fs4, NOTE.G4, R],
            bass: [NOTE.G3, R, NOTE.D3, R, NOTE.G3, R, NOTE.D3, NOTE.G3],
            harmony: [NOTE.B3, R, NOTE.Fs3, R, NOTE.B3, R, NOTE.Fs3, NOTE.G3]
          },
          // Lyrical second theme
          B: {
            melody: [NOTE.D5, NOTE.D5, NOTE.E5, NOTE.Fs5, NOTE.G5, R, NOTE.G5, NOTE.A5,
                    NOTE.B5, NOTE.A5, NOTE.G5, NOTE.Fs5, NOTE.G5, NOTE.A5, NOTE.Fs5, NOTE.D5],
            bass: [NOTE.D3, R, NOTE.D3, R, NOTE.G3, R, NOTE.D3, R],
            harmony: [NOTE.Fs3, R, NOTE.A3, R, NOTE.B3, R, NOTE.A3, R]
          },
          B2: {
            melody: [NOTE.E5, NOTE.E5, NOTE.Fs5, NOTE.G5, NOTE.A5, R, NOTE.A5, NOTE.B5,
                    NOTE.C6, NOTE.B5, NOTE.A5, NOTE.G5, NOTE.Fs5, NOTE.E5, NOTE.D5, R],
            bass: [NOTE.C3, R, NOTE.G3, R, NOTE.D3, R, NOTE.A3, R],
            harmony: [NOTE.E3, R, NOTE.B3, R, NOTE.Fs3, R, NOTE.E3, R]
          },
          // Development section
          C: {
            melody: [NOTE.B4, NOTE.C5, NOTE.D5, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.B4, NOTE.A4,
                    NOTE.G4, NOTE.A4, NOTE.B4, NOTE.C5, NOTE.D5, NOTE.E5, NOTE.Fs5, NOTE.G5],
            bass: [NOTE.G3, R, NOTE.E3, R, NOTE.C3, R, NOTE.D3, R],
            harmony: [NOTE.B3, R, NOTE.G3, R, NOTE.E3, R, NOTE.Fs3, R]
          },
          C2: {
            melody: [NOTE.A5, NOTE.G5, NOTE.Fs5, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.B4, NOTE.A4,
                    NOTE.B4, NOTE.A4, NOTE.G4, NOTE.Fs4, NOTE.E4, NOTE.D4, NOTE.C4, NOTE.B3],
            bass: [NOTE.A3, R, NOTE.D3, R, NOTE.G3, R, NOTE.C3, R],
            harmony: [NOTE.E3, R, NOTE.Fs3, R, NOTE.B3, R, NOTE.E3, R]
          },
          // Coda/finale
          D: {
            melody: [NOTE.G5, NOTE.D5, NOTE.B4, NOTE.G4, NOTE.D5, NOTE.B4, NOTE.G4, NOTE.D4,
                    NOTE.G4, NOTE.B4, NOTE.D5, NOTE.G5, NOTE.B5, NOTE.D6, NOTE.G5, NOTE.D5],
            bass: [NOTE.G3, NOTE.G3, NOTE.G3, NOTE.G3, NOTE.D3, NOTE.D3, NOTE.G3, NOTE.G3],
            harmony: [NOTE.B3, NOTE.D4, NOTE.B3, NOTE.D4, NOTE.Fs3, NOTE.A3, NOTE.B3, NOTE.D4]
          },
          D2: {
            melody: [NOTE.G5, NOTE.Fs5, NOTE.G5, NOTE.A5, NOTE.B5, NOTE.A5, NOTE.G5, NOTE.Fs5,
                    NOTE.G5, R, NOTE.D5, R, NOTE.G4, R, R, R],
            bass: [NOTE.G3, R, NOTE.D3, R, NOTE.G3, NOTE.D3, NOTE.G3, R],
            harmony: [NOTE.B3, R, NOTE.Fs3, R, NOTE.B3, NOTE.Fs3, NOTE.G3, R]
          }
        }
      },

      // Level 2: Turkish March inspired (A minor, Allegretto)
      {
        name: 'Turkish March',
        key: 'A minor',
        structure: ['A','A','B','B','A','A','C','C','D','D','D2','D2','A','A','B','B',
                   'E','E','E2','E2','F','F','F2','F2','A','A','B','B','G','G','G2','G2'],
        sections: {
          // Main theme - characteristic ornamental melody
          A: {
            melody: [NOTE.B4, NOTE.A4, NOTE.Gs4, NOTE.A4, NOTE.C5, R, NOTE.D5, NOTE.C5,
                    NOTE.B4, NOTE.C5, NOTE.E5, R, NOTE.F5, NOTE.E5, NOTE.D5, NOTE.C5],
            bass: [NOTE.A3, R, NOTE.A3, R, NOTE.A3, R, NOTE.E3, R],
            harmony: [NOTE.C4, R, NOTE.E4, R, NOTE.A3, R, NOTE.Gs3, R]
          },
          B: {
            melody: [NOTE.B4, NOTE.A4, NOTE.Gs4, NOTE.A4, NOTE.C5, R, NOTE.B4, NOTE.A4,
                    NOTE.Gs4, NOTE.A4, NOTE.B4, R, NOTE.A4, R, R, R],
            bass: [NOTE.A3, R, NOTE.E3, R, NOTE.A3, R, NOTE.A3, R],
            harmony: [NOTE.C4, R, NOTE.Gs3, R, NOTE.E4, R, NOTE.A3, R]
          },
          // Contrasting major section
          C: {
            melody: [NOTE.A4, NOTE.B4, NOTE.C5, NOTE.D5, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.B4,
                    NOTE.C5, NOTE.D5, NOTE.E5, NOTE.F5, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.B4],
            bass: [NOTE.A3, R, NOTE.E3, R, NOTE.C3, R, NOTE.G3, R],
            harmony: [NOTE.E4, R, NOTE.A3, R, NOTE.G3, R, NOTE.E3, R]
          },
          D: {
            melody: [NOTE.A5, NOTE.Gs5, NOTE.A5, NOTE.B5, NOTE.C6, NOTE.B5, NOTE.A5, NOTE.Gs5,
                    NOTE.A5, NOTE.B5, NOTE.C6, NOTE.D6, NOTE.E6, NOTE.D6, NOTE.C6, NOTE.B5],
            bass: [NOTE.A3, R, NOTE.A3, R, NOTE.A3, R, NOTE.E3, R],
            harmony: [NOTE.E4, R, NOTE.C4, R, NOTE.A3, R, NOTE.Gs3, R]
          },
          D2: {
            melody: [NOTE.C6, NOTE.B5, NOTE.A5, NOTE.Gs5, NOTE.A5, NOTE.E5, NOTE.C5, NOTE.A4,
                    NOTE.B4, NOTE.C5, NOTE.D5, NOTE.E5, NOTE.A4, R, R, R],
            bass: [NOTE.A3, R, NOTE.C3, R, NOTE.E3, R, NOTE.A3, R],
            harmony: [NOTE.E4, R, NOTE.E3, R, NOTE.Gs3, R, NOTE.A3, R]
          },
          // Running sixteenths section
          E: {
            melody: [NOTE.A4, NOTE.B4, NOTE.C5, NOTE.D5, NOTE.E5, NOTE.F5, NOTE.E5, NOTE.D5,
                    NOTE.C5, NOTE.D5, NOTE.E5, NOTE.F5, NOTE.G5, NOTE.A5, NOTE.B5, NOTE.C6],
            bass: [NOTE.A3, R, NOTE.C3, R, NOTE.E3, R, NOTE.A3, R],
            harmony: [NOTE.E4, R, NOTE.E3, R, NOTE.G3, R, NOTE.C4, R]
          },
          E2: {
            melody: [NOTE.D6, NOTE.C6, NOTE.B5, NOTE.A5, NOTE.G5, NOTE.F5, NOTE.E5, NOTE.D5,
                    NOTE.C5, NOTE.B4, NOTE.A4, NOTE.Gs4, NOTE.A4, R, R, R],
            bass: [NOTE.D3, R, NOTE.E3, R, NOTE.A3, R, NOTE.A3, R],
            harmony: [NOTE.F3, R, NOTE.Gs3, R, NOTE.E4, R, NOTE.A3, R]
          },
          // Dramatic middle section
          F: {
            melody: [NOTE.E5, R, NOTE.E5, R, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.B4,
                    NOTE.A4, R, NOTE.A4, R, NOTE.A4, NOTE.B4, NOTE.C5, NOTE.D5],
            bass: [NOTE.A3, NOTE.E3, NOTE.A3, NOTE.E3, NOTE.A3, R, NOTE.A3, R],
            harmony: [NOTE.C4, NOTE.A3, NOTE.C4, NOTE.A3, NOTE.E4, R, NOTE.E4, R]
          },
          F2: {
            melody: [NOTE.E5, R, NOTE.F5, R, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.B4,
                    NOTE.C5, NOTE.D5, NOTE.E5, NOTE.F5, NOTE.E5, NOTE.D5, NOTE.C5, NOTE.B4],
            bass: [NOTE.C3, R, NOTE.D3, R, NOTE.E3, R, NOTE.E3, R],
            harmony: [NOTE.E3, R, NOTE.F3, R, NOTE.Gs3, R, NOTE.Gs3, R]
          },
          // Triumphant ending
          G: {
            melody: [NOTE.A5, NOTE.E5, NOTE.C5, NOTE.A4, NOTE.E5, NOTE.C5, NOTE.A4, NOTE.E4,
                    NOTE.A4, NOTE.C5, NOTE.E5, NOTE.A5, NOTE.C6, NOTE.E6, NOTE.A5, NOTE.E5],
            bass: [NOTE.A3, NOTE.A3, NOTE.A3, NOTE.A3, NOTE.E3, NOTE.E3, NOTE.A3, NOTE.A3],
            harmony: [NOTE.C4, NOTE.E4, NOTE.C4, NOTE.E4, NOTE.A3, NOTE.C4, NOTE.E4, NOTE.C4]
          },
          G2: {
            melody: [NOTE.A5, NOTE.Gs5, NOTE.A5, NOTE.B5, NOTE.C6, NOTE.B5, NOTE.A5, NOTE.Gs5,
                    NOTE.A5, R, NOTE.E5, R, NOTE.A4, R, R, R],
            bass: [NOTE.A3, R, NOTE.E3, R, NOTE.A3, NOTE.E3, NOTE.A3, R],
            harmony: [NOTE.C4, R, NOTE.Gs3, R, NOTE.C4, NOTE.Gs3, NOTE.A3, R]
          }
        }
      },

      // Level 3: Piano Sonata No. 11 inspired (A major, Andante grazioso)
      {
        name: 'Sonata',
        key: 'A major',
        structure: ['A','A','A2','A2','B','B','B2','B2','C','C','C2','C2','A','A','A2','A2',
                   'D','D','D2','D2','E','E','E2','E2','F','F','F2','F2','A','A','G','G'],
        sections: {
          A: {
            melody: [NOTE.Cs5, NOTE.E5, NOTE.A5, NOTE.Gs5, NOTE.A5, NOTE.Fs5, NOTE.E5, NOTE.D5,
                    NOTE.Cs5, NOTE.B4, NOTE.A4, NOTE.B4, NOTE.Cs5, NOTE.D5, NOTE.E5, NOTE.Fs5],
            bass: [NOTE.A3, R, NOTE.A3, R, NOTE.D3, R, NOTE.E3, R],
            harmony: [NOTE.E4, R, NOTE.Cs4, R, NOTE.Fs3, R, NOTE.Gs3, R]
          },
          A2: {
            melody: [NOTE.Gs5, NOTE.A5, NOTE.B5, NOTE.A5, NOTE.Gs5, NOTE.Fs5, NOTE.E5, NOTE.D5,
                    NOTE.Cs5, NOTE.D5, NOTE.E5, NOTE.D5, NOTE.Cs5, NOTE.B4, NOTE.A4, R],
            bass: [NOTE.E3, R, NOTE.Cs3, R, NOTE.A3, R, NOTE.A3, R],
            harmony: [NOTE.B3, R, NOTE.A3, R, NOTE.E4, R, NOTE.A3, R]
          },
          B: {
            melody: [NOTE.E5, NOTE.Fs5, NOTE.Gs5, NOTE.A5, NOTE.B5, NOTE.A5, NOTE.Gs5, NOTE.Fs5,
                    NOTE.E5, NOTE.D5, NOTE.Cs5, NOTE.D5, NOTE.E5, NOTE.Fs5, NOTE.Gs5, NOTE.A5],
            bass: [NOTE.E3, R, NOTE.E3, R, NOTE.A3, R, NOTE.E3, R],
            harmony: [NOTE.Gs3, R, NOTE.B3, R, NOTE.Cs4, R, NOTE.B3, R]
          },
          B2: {
            melody: [NOTE.B5, NOTE.A5, NOTE.Gs5, NOTE.A5, NOTE.Fs5, NOTE.E5, NOTE.D5, NOTE.Cs5,
                    NOTE.B4, NOTE.Cs5, NOTE.D5, NOTE.E5, NOTE.Fs5, NOTE.E5, NOTE.D5, NOTE.Cs5],
            bass: [NOTE.Gs3, R, NOTE.A3, R, NOTE.D3, R, NOTE.E3, R],
            harmony: [NOTE.B3, R, NOTE.E4, R, NOTE.Fs3, R, NOTE.Gs3, R]
          },
          C: {
            melody: [NOTE.A4, NOTE.Cs5, NOTE.E5, NOTE.A5, NOTE.Gs5, NOTE.Fs5, NOTE.E5, NOTE.D5,
                    NOTE.Cs5, NOTE.E5, NOTE.A5, NOTE.Cs6, NOTE.B5, NOTE.A5, NOTE.Gs5, NOTE.Fs5],
            bass: [NOTE.A3, R, NOTE.Cs3, R, NOTE.E3, R, NOTE.A3, R],
            harmony: [NOTE.E4, R, NOTE.A3, R, NOTE.B3, R, NOTE.Cs4, R]
          },
          C2: {
            melody: [NOTE.E5, NOTE.Fs5, NOTE.Gs5, NOTE.A5, NOTE.B5, NOTE.Cs6, NOTE.B5, NOTE.A5,
                    NOTE.Gs5, NOTE.Fs5, NOTE.E5, NOTE.D5, NOTE.Cs5, NOTE.B4, NOTE.A4, R],
            bass: [NOTE.E3, R, NOTE.Fs3, R, NOTE.Gs3, R, NOTE.A3, R],
            harmony: [NOTE.Gs3, R, NOTE.A3, R, NOTE.B3, R, NOTE.A3, R]
          },
          D: {
            melody: [NOTE.Fs5, NOTE.E5, NOTE.D5, NOTE.Cs5, NOTE.D5, NOTE.E5, NOTE.Fs5, NOTE.Gs5,
                    NOTE.A5, NOTE.B5, NOTE.A5, NOTE.Gs5, NOTE.Fs5, NOTE.E5, NOTE.D5, NOTE.Cs5],
            bass: [NOTE.D3, R, NOTE.A3, R, NOTE.E3, R, NOTE.A3, R],
            harmony: [NOTE.Fs3, R, NOTE.Cs4, R, NOTE.B3, R, NOTE.E4, R]
          },
          D2: {
            melody: [NOTE.D5, NOTE.E5, NOTE.Fs5, NOTE.Gs5, NOTE.A5, NOTE.Gs5, NOTE.Fs5, NOTE.E5,
                    NOTE.D5, NOTE.Cs5, NOTE.B4, NOTE.A4, NOTE.Gs4, NOTE.A4, NOTE.B4, NOTE.Cs5],
            bass: [NOTE.D3, R, NOTE.E3, R, NOTE.Fs3, R, NOTE.E3, R],
            harmony: [NOTE.Fs3, R, NOTE.Gs3, R, NOTE.A3, R, NOTE.Gs3, R]
          },
          E: {
            melody: [NOTE.A5, NOTE.Gs5, NOTE.A5, NOTE.B5, NOTE.A5, NOTE.Gs5, NOTE.Fs5, NOTE.E5,
                    NOTE.Fs5, NOTE.Gs5, NOTE.A5, NOTE.B5, NOTE.Cs6, NOTE.B5, NOTE.A5, NOTE.Gs5],
            bass: [NOTE.A3, R, NOTE.E3, R, NOTE.Fs3, R, NOTE.Cs3, R],
            harmony: [NOTE.Cs4, R, NOTE.B3, R, NOTE.A3, R, NOTE.E3, R]
          },
          E2: {
            melody: [NOTE.A5, NOTE.B5, NOTE.Cs6, NOTE.B5, NOTE.A5, NOTE.Gs5, NOTE.Fs5, NOTE.E5,
                    NOTE.D5, NOTE.Cs5, NOTE.B4, NOTE.A4, NOTE.Gs4, NOTE.Fs4, NOTE.E4, R],
            bass: [NOTE.A3, R, NOTE.Fs3, R, NOTE.D3, R, NOTE.E3, R],
            harmony: [NOTE.E4, R, NOTE.A3, R, NOTE.Fs3, R, NOTE.Gs3, R]
          },
          F: {
            melody: [NOTE.Cs5, NOTE.D5, NOTE.E5, NOTE.Fs5, NOTE.E5, NOTE.D5, NOTE.Cs5, NOTE.B4,
                    NOTE.A4, NOTE.B4, NOTE.Cs5, NOTE.D5, NOTE.E5, NOTE.Fs5, NOTE.Gs5, NOTE.A5],
            bass: [NOTE.A3, R, NOTE.D3, R, NOTE.A3, R, NOTE.E3, R],
            harmony: [NOTE.E4, R, NOTE.Fs3, R, NOTE.Cs4, R, NOTE.B3, R]
          },
          F2: {
            melody: [NOTE.B5, NOTE.A5, NOTE.Gs5, NOTE.Fs5, NOTE.E5, NOTE.D5, NOTE.Cs5, NOTE.B4,
                    NOTE.A4, NOTE.Gs4, NOTE.Fs4, NOTE.E4, NOTE.A4, R, R, R],
            bass: [NOTE.E3, R, NOTE.Cs3, R, NOTE.A3, R, NOTE.A3, R],
            harmony: [NOTE.Gs3, R, NOTE.E3, R, NOTE.E4, R, NOTE.A3, R]
          },
          G: {
            melody: [NOTE.A5, NOTE.E5, NOTE.Cs5, NOTE.A4, NOTE.E5, NOTE.Cs5, NOTE.A4, NOTE.E4,
                    NOTE.A4, NOTE.Cs5, NOTE.E5, NOTE.A5, NOTE.A4, R, R, R],
            bass: [NOTE.A3, NOTE.A3, NOTE.A3, NOTE.A3, NOTE.E3, NOTE.E3, NOTE.A3, NOTE.A3],
            harmony: [NOTE.Cs4, NOTE.E4, NOTE.Cs4, NOTE.E4, NOTE.A3, NOTE.Cs4, NOTE.E4, NOTE.A3]
          }
        }
      },

      // Level 4: Symphony No. 40 inspired (G minor, Molto allegro)
      {
        name: 'Symphony',
        key: 'G minor',
        structure: ['A','A','A2','A2','B','B','B2','B2','C','C','C2','C2','D','D','D2','D2',
                   'A','A','A2','A2','E','E','E2','E2','F','F','F2','F2','G','G','G2','G2'],
        sections: {
          // Famous opening motif
          A: {
            melody: [R, NOTE.D5, NOTE.D5, NOTE.Eb5, NOTE.D5, NOTE.D5, NOTE.D5, NOTE.G5,
                    NOTE.Fs5, R, R, NOTE.A4, NOTE.A4, NOTE.Bb4, NOTE.A4, NOTE.A4],
            bass: [NOTE.G3, R, NOTE.G3, R, NOTE.G3, R, NOTE.D3, R],
            harmony: [NOTE.Bb3, R, NOTE.D4, R, NOTE.Bb3, R, NOTE.Fs3, R]
          },
          A2: {
            melody: [NOTE.A4, NOTE.D5, NOTE.C5, R, R, NOTE.Bb4, NOTE.Bb4, NOTE.C5,
                    NOTE.Bb4, NOTE.Bb4, NOTE.Bb4, NOTE.Eb5, NOTE.D5, R, R, R],
            bass: [NOTE.D3, R, NOTE.Eb3, R, NOTE.Bb3, R, NOTE.G3, R],
            harmony: [NOTE.Fs3, R, NOTE.G3, R, NOTE.D4, R, NOTE.Bb3, R]
          },
          B: {
            melody: [NOTE.D5, NOTE.Eb5, NOTE.D5, NOTE.C5, NOTE.Bb4, NOTE.A4, NOTE.G4, NOTE.Fs4,
                    NOTE.G4, NOTE.A4, NOTE.Bb4, NOTE.C5, NOTE.D5, NOTE.Eb5, NOTE.F5, NOTE.G5],
            bass: [NOTE.G3, R, NOTE.Bb3, R, NOTE.C3, R, NOTE.D3, R],
            harmony: [NOTE.D4, R, NOTE.D4, R, NOTE.Eb3, R, NOTE.Fs3, R]
          },
          B2: {
            melody: [NOTE.G5, NOTE.F5, NOTE.Eb5, NOTE.D5, NOTE.C5, NOTE.Bb4, NOTE.A4, NOTE.G4,
                    NOTE.Fs4, NOTE.G4, NOTE.A4, NOTE.Bb4, NOTE.A4, NOTE.G4, NOTE.Fs4, R],
            bass: [NOTE.Eb3, R, NOTE.C3, R, NOTE.D3, R, NOTE.G3, R],
            harmony: [NOTE.G3, R, NOTE.Eb3, R, NOTE.Fs3, R, NOTE.G3, R]
          },
          C: {
            melody: [NOTE.Bb5, NOTE.A5, NOTE.Bb5, NOTE.G5, NOTE.Fs5, NOTE.G5, NOTE.Eb5, NOTE.D5,
                    NOTE.Eb5, NOTE.C5, NOTE.Bb4, NOTE.A4, NOTE.G4, NOTE.Fs4, NOTE.G4, NOTE.A4],
            bass: [NOTE.G3, R, NOTE.Eb3, R, NOTE.C3, R, NOTE.D3, R],
            harmony: [NOTE.D4, R, NOTE.G3, R, NOTE.Eb3, R, NOTE.Fs3, R]
          },
          C2: {
            melody: [NOTE.Bb4, NOTE.C5, NOTE.D5, NOTE.Eb5, NOTE.F5, NOTE.G5, NOTE.A5, NOTE.Bb5,
                    NOTE.A5, NOTE.G5, NOTE.Fs5, NOTE.G5, NOTE.D5, R, R, R],
            bass: [NOTE.Bb3, R, NOTE.C3, R, NOTE.D3, R, NOTE.G3, R],
            harmony: [NOTE.D4, R, NOTE.Eb3, R, NOTE.Fs3, R, NOTE.Bb3, R]
          },
          D: {
            melody: [NOTE.G5, NOTE.G5, NOTE.G5, NOTE.G5, NOTE.G5, NOTE.Fs5, NOTE.G5, NOTE.A5,
                    NOTE.Bb5, NOTE.A5, NOTE.G5, NOTE.Fs5, NOTE.Eb5, NOTE.D5, NOTE.C5, NOTE.Bb4],
            bass: [NOTE.G3, NOTE.G3, NOTE.Eb3, NOTE.Eb3, NOTE.D3, R, NOTE.Bb3, R],
            harmony: [NOTE.Bb3, NOTE.D4, NOTE.G3, NOTE.Bb3, NOTE.Fs3, R, NOTE.D4, R]
          },
          D2: {
            melody: [NOTE.A4, NOTE.Bb4, NOTE.C5, NOTE.D5, NOTE.Eb5, NOTE.F5, NOTE.Eb5, NOTE.D5,
                    NOTE.C5, NOTE.Bb4, NOTE.A4, NOTE.G4, NOTE.Fs4, NOTE.G4, R, R],
            bass: [NOTE.F3, R, NOTE.Eb3, R, NOTE.D3, R, NOTE.G3, R],
            harmony: [NOTE.A3, R, NOTE.G3, R, NOTE.Fs3, R, NOTE.G3, R]
          },
          E: {
            melody: [NOTE.D5, NOTE.D5, NOTE.D5, NOTE.Eb5, NOTE.D5, NOTE.C5, NOTE.Bb4, NOTE.A4,
                    NOTE.Bb4, NOTE.C5, NOTE.D5, NOTE.Eb5, NOTE.D5, NOTE.C5, NOTE.Bb4, NOTE.A4],
            bass: [NOTE.Bb3, R, NOTE.A3, R, NOTE.G3, R, NOTE.D3, R],
            harmony: [NOTE.D4, R, NOTE.C4, R, NOTE.Bb3, R, NOTE.Fs3, R]
          },
          E2: {
            melody: [NOTE.G4, NOTE.A4, NOTE.Bb4, NOTE.C5, NOTE.D5, NOTE.Eb5, NOTE.F5, NOTE.G5,
                    NOTE.F5, NOTE.Eb5, NOTE.D5, NOTE.C5, NOTE.Bb4, NOTE.A4, NOTE.G4, R],
            bass: [NOTE.G3, R, NOTE.Eb3, R, NOTE.Bb3, R, NOTE.G3, R],
            harmony: [NOTE.Bb3, R, NOTE.G3, R, NOTE.D4, R, NOTE.G3, R]
          },
          F: {
            melody: [NOTE.G5, NOTE.D5, NOTE.Bb4, NOTE.G4, NOTE.D5, NOTE.Bb4, NOTE.G4, NOTE.D4,
                    NOTE.G4, NOTE.Bb4, NOTE.D5, NOTE.G5, NOTE.Bb5, NOTE.G5, NOTE.D5, NOTE.Bb4],
            bass: [NOTE.G3, NOTE.G3, NOTE.G3, NOTE.G3, NOTE.D3, NOTE.D3, NOTE.G3, NOTE.G3],
            harmony: [NOTE.Bb3, NOTE.D4, NOTE.Bb3, NOTE.D4, NOTE.Fs3, NOTE.A3, NOTE.Bb3, NOTE.D4]
          },
          F2: {
            melody: [NOTE.G4, NOTE.Bb4, NOTE.D5, NOTE.G5, NOTE.Fs5, NOTE.G5, NOTE.A5, NOTE.Bb5,
                    NOTE.A5, NOTE.G5, NOTE.Fs5, NOTE.G5, NOTE.D5, R, R, R],
            bass: [NOTE.G3, R, NOTE.D3, R, NOTE.G3, NOTE.D3, NOTE.G3, R],
            harmony: [NOTE.Bb3, R, NOTE.Fs3, R, NOTE.Bb3, NOTE.Fs3, NOTE.G3, R]
          },
          G: {
            melody: [NOTE.G5, NOTE.Fs5, NOTE.G5, NOTE.A5, NOTE.Bb5, NOTE.A5, NOTE.G5, NOTE.Fs5,
                    NOTE.G5, NOTE.D5, NOTE.Bb4, NOTE.G4, NOTE.G4, R, R, R],
            bass: [NOTE.G3, R, NOTE.D3, R, NOTE.G3, NOTE.G3, NOTE.G3, R],
            harmony: [NOTE.Bb3, R, NOTE.Fs3, R, NOTE.Bb3, NOTE.D4, NOTE.G3, R]
          },
          G2: {
            melody: [R, NOTE.D5, NOTE.D5, NOTE.Eb5, NOTE.D5, NOTE.D5, NOTE.D5, NOTE.G5,
                    NOTE.G5, R, NOTE.D5, R, NOTE.G4, R, R, R],
            bass: [NOTE.G3, R, NOTE.G3, R, NOTE.G3, NOTE.D3, NOTE.G3, R],
            harmony: [NOTE.Bb3, R, NOTE.D4, R, NOTE.Bb3, NOTE.Fs3, NOTE.G3, R]
          }
        }
      },

      // Level 5: Magic Flute Overture inspired (Eb major, Adagio to Allegro)
      {
        name: 'Overture',
        key: 'Eb major',
        structure: ['A','A','A2','A2','B','B','B2','B2','C','C','C2','C2','D','D','D2','D2',
                   'E','E','E2','E2','F','F','F2','F2','G','G','G2','G2','H','H','H2','H2'],
        sections: {
          A: {
            melody: [NOTE.Eb5, NOTE.G5, NOTE.Bb5, NOTE.Eb6, NOTE.D6, NOTE.C6, NOTE.Bb5, NOTE.Ab5,
                    NOTE.G5, NOTE.F5, NOTE.Eb5, NOTE.D5, NOTE.Eb5, NOTE.F5, NOTE.G5, NOTE.Ab5],
            bass: [NOTE.Eb3, R, NOTE.Eb3, R, NOTE.Bb3, R, NOTE.Eb3, R],
            harmony: [NOTE.G3, R, NOTE.Bb3, R, NOTE.D4, R, NOTE.G3, R]
          },
          A2: {
            melody: [NOTE.Bb5, NOTE.Ab5, NOTE.G5, NOTE.F5, NOTE.Eb5, NOTE.D5, NOTE.C5, NOTE.Bb4,
                    NOTE.Ab4, NOTE.Bb4, NOTE.C5, NOTE.D5, NOTE.Eb5, R, R, R],
            bass: [NOTE.Eb3, R, NOTE.Ab3, R, NOTE.Bb3, R, NOTE.Eb3, R],
            harmony: [NOTE.G3, R, NOTE.C4, R, NOTE.D4, R, NOTE.Eb3, R]
          },
          B: {
            melody: [NOTE.G5, NOTE.Ab5, NOTE.Bb5, NOTE.C6, NOTE.Bb5, NOTE.Ab5, NOTE.G5, NOTE.F5,
                    NOTE.Eb5, NOTE.F5, NOTE.G5, NOTE.Ab5, NOTE.Bb5, NOTE.C6, NOTE.D6, NOTE.Eb6],
            bass: [NOTE.Eb3, R, NOTE.Ab3, R, NOTE.Eb3, R, NOTE.Bb3, R],
            harmony: [NOTE.Bb3, R, NOTE.C4, R, NOTE.G3, R, NOTE.D4, R]
          },
          B2: {
            melody: [NOTE.D6, NOTE.C6, NOTE.Bb5, NOTE.Ab5, NOTE.G5, NOTE.F5, NOTE.Eb5, NOTE.D5,
                    NOTE.C5, NOTE.D5, NOTE.Eb5, NOTE.F5, NOTE.G5, NOTE.Ab5, NOTE.Bb5, R],
            bass: [NOTE.F3, R, NOTE.Eb3, R, NOTE.Ab3, R, NOTE.Bb3, R],
            harmony: [NOTE.Ab3, R, NOTE.G3, R, NOTE.C4, R, NOTE.D4, R]
          },
          C: {
            melody: [NOTE.Eb5, NOTE.Eb5, NOTE.Eb5, NOTE.F5, NOTE.G5, NOTE.Ab5, NOTE.Bb5, NOTE.C6,
                    NOTE.Bb5, NOTE.Ab5, NOTE.G5, NOTE.F5, NOTE.Eb5, NOTE.D5, NOTE.C5, NOTE.Bb4],
            bass: [NOTE.Eb3, NOTE.Eb3, NOTE.C3, NOTE.C3, NOTE.Ab3, R, NOTE.Bb3, R],
            harmony: [NOTE.G3, NOTE.Bb3, NOTE.Eb3, NOTE.G3, NOTE.C4, R, NOTE.D4, R]
          },
          C2: {
            melody: [NOTE.Ab4, NOTE.Bb4, NOTE.C5, NOTE.D5, NOTE.Eb5, NOTE.F5, NOTE.G5, NOTE.Ab5,
                    NOTE.Bb5, NOTE.Ab5, NOTE.G5, NOTE.F5, NOTE.Eb5, R, R, R],
            bass: [NOTE.Ab3, R, NOTE.Eb3, R, NOTE.Bb3, R, NOTE.Eb3, R],
            harmony: [NOTE.C4, R, NOTE.G3, R, NOTE.D4, R, NOTE.Eb3, R]
          },
          D: {
            melody: [NOTE.Bb5, NOTE.C6, NOTE.D6, NOTE.Eb6, NOTE.D6, NOTE.C6, NOTE.Bb5, NOTE.Ab5,
                    NOTE.G5, NOTE.Ab5, NOTE.Bb5, NOTE.C6, NOTE.D6, NOTE.Eb6, NOTE.F6, NOTE.G6],
            bass: [NOTE.Bb3, R, NOTE.Ab3, R, NOTE.G3, R, NOTE.Bb3, R],
            harmony: [NOTE.D4, R, NOTE.C4, R, NOTE.Bb3, R, NOTE.D4, R]
          },
          D2: {
            melody: [NOTE.F6, NOTE.Eb6, NOTE.D6, NOTE.C6, NOTE.Bb5, NOTE.Ab5, NOTE.G5, NOTE.F5,
                    NOTE.Eb5, NOTE.F5, NOTE.G5, NOTE.Ab5, NOTE.Bb5, R, R, R],
            bass: [NOTE.F3, R, NOTE.G3, R, NOTE.Ab3, R, NOTE.Bb3, R],
            harmony: [NOTE.Ab3, R, NOTE.Bb3, R, NOTE.C4, R, NOTE.D4, R]
          },
          E: {
            melody: [NOTE.Eb5, NOTE.G5, NOTE.Bb5, NOTE.G5, NOTE.Eb5, NOTE.G5, NOTE.Bb5, NOTE.G5,
                    NOTE.F5, NOTE.Ab5, NOTE.C6, NOTE.Ab5, NOTE.F5, NOTE.Ab5, NOTE.C6, NOTE.Ab5],
            bass: [NOTE.Eb3, R, NOTE.Eb3, R, NOTE.F3, R, NOTE.F3, R],
            harmony: [NOTE.G3, R, NOTE.Bb3, R, NOTE.Ab3, R, NOTE.C4, R]
          },
          E2: {
            melody: [NOTE.G5, NOTE.Bb5, NOTE.D6, NOTE.Bb5, NOTE.G5, NOTE.Bb5, NOTE.D6, NOTE.Bb5,
                    NOTE.Eb5, NOTE.G5, NOTE.Bb5, NOTE.G5, NOTE.Eb5, R, R, R],
            bass: [NOTE.G3, R, NOTE.G3, R, NOTE.Eb3, R, NOTE.Eb3, R],
            harmony: [NOTE.Bb3, R, NOTE.D4, R, NOTE.G3, R, NOTE.Bb3, R]
          },
          F: {
            melody: [NOTE.Bb5, NOTE.Ab5, NOTE.G5, NOTE.F5, NOTE.Eb5, NOTE.F5, NOTE.G5, NOTE.Ab5,
                    NOTE.Bb5, NOTE.C6, NOTE.D6, NOTE.Eb6, NOTE.D6, NOTE.C6, NOTE.Bb5, NOTE.Ab5],
            bass: [NOTE.Bb3, R, NOTE.Eb3, R, NOTE.Bb3, R, NOTE.Ab3, R],
            harmony: [NOTE.D4, R, NOTE.G3, R, NOTE.D4, R, NOTE.C4, R]
          },
          F2: {
            melody: [NOTE.G5, NOTE.Ab5, NOTE.Bb5, NOTE.C6, NOTE.D6, NOTE.C6, NOTE.Bb5, NOTE.Ab5,
                    NOTE.G5, NOTE.F5, NOTE.Eb5, NOTE.D5, NOTE.Eb5, R, R, R],
            bass: [NOTE.G3, R, NOTE.Ab3, R, NOTE.Bb3, R, NOTE.Eb3, R],
            harmony: [NOTE.Bb3, R, NOTE.C4, R, NOTE.D4, R, NOTE.Eb3, R]
          },
          G: {
            melody: [NOTE.Eb6, NOTE.Bb5, NOTE.G5, NOTE.Eb5, NOTE.Bb5, NOTE.G5, NOTE.Eb5, NOTE.Bb4,
                    NOTE.Eb5, NOTE.G5, NOTE.Bb5, NOTE.Eb6, NOTE.G6, NOTE.Eb6, NOTE.Bb5, NOTE.G5],
            bass: [NOTE.Eb3, NOTE.Eb3, NOTE.Eb3, NOTE.Eb3, NOTE.Bb3, NOTE.Bb3, NOTE.Eb3, NOTE.Eb3],
            harmony: [NOTE.G3, NOTE.Bb3, NOTE.G3, NOTE.Bb3, NOTE.D4, NOTE.F4, NOTE.G3, NOTE.Bb3]
          },
          G2: {
            melody: [NOTE.Eb5, NOTE.F5, NOTE.G5, NOTE.Ab5, NOTE.Bb5, NOTE.C6, NOTE.D6, NOTE.Eb6,
                    NOTE.D6, NOTE.C6, NOTE.Bb5, NOTE.Ab5, NOTE.G5, NOTE.F5, NOTE.Eb5, R],
            bass: [NOTE.Eb3, R, NOTE.Ab3, R, NOTE.Bb3, R, NOTE.Eb3, R],
            harmony: [NOTE.G3, R, NOTE.C4, R, NOTE.D4, R, NOTE.Eb3, R]
          },
          H: {
            melody: [NOTE.Eb5, NOTE.G5, NOTE.Bb5, NOTE.Eb6, NOTE.Bb5, NOTE.G5, NOTE.Eb5, NOTE.Bb4,
                    NOTE.G4, NOTE.Bb4, NOTE.Eb5, NOTE.G5, NOTE.Bb5, NOTE.G5, NOTE.Eb5, NOTE.Bb4],
            bass: [NOTE.Eb3, R, NOTE.Eb3, R, NOTE.Eb3, R, NOTE.Eb3, R],
            harmony: [NOTE.G3, R, NOTE.Bb3, R, NOTE.G3, R, NOTE.Bb3, R]
          },
          H2: {
            melody: [NOTE.Eb5, NOTE.D5, NOTE.Eb5, NOTE.F5, NOTE.G5, NOTE.Ab5, NOTE.Bb5, NOTE.C6,
                    NOTE.Bb5, NOTE.Ab5, NOTE.G5, NOTE.F5, NOTE.Eb5, R, R, R],
            bass: [NOTE.Eb3, R, NOTE.Bb3, R, NOTE.Eb3, NOTE.Bb3, NOTE.Eb3, R],
            harmony: [NOTE.G3, R, NOTE.D4, R, NOTE.G3, NOTE.D4, NOTE.Eb3, R]
          }
        }
      }
    ];

    return compositions[compositionIndex];
  }

  playCompositionBar(startTime, beatDuration, composition, sectionType, barIndex) {
    const section = composition.sections[sectionType];
    if (!section) return;

    // Play melody (16 notes per bar = 16th notes)
    section.melody.forEach((note, i) => {
      if (note > 0) {
        this.playMelodyNote(startTime + i * beatDuration * 0.25, note, beatDuration * 0.22);
      }
    });

    // Play bass (8 notes per bar = 8th notes)
    section.bass.forEach((note, i) => {
      if (note > 0) {
        this.playBassNote(startTime + i * beatDuration * 0.5, note, beatDuration * 0.45);
      }
    });

    // Play harmony/counterpoint (8 notes per bar)
    if (section.harmony) {
      section.harmony.forEach((note, i) => {
        if (note > 0) {
          this.playHarmonyNote(startTime + i * beatDuration * 0.5, note, beatDuration * 0.4);
        }
      });
    }

    // Light percussion on beats (less intrusive for classical feel)
    for (let i = 0; i < 4; i++) {
      if (i === 0) {
        this.playLightKick(startTime + i * beatDuration);
      } else if (i === 2) {
        this.playLightSnare(startTime + i * beatDuration);
      }
      // Subtle hihat on off-beats
      this.playSubtleHihat(startTime + (i + 0.5) * beatDuration);
    }
  }

  playBassNote(time, freq, duration) {
    const ctx = this.audioContext;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Use triangle wave for warmer, more classical bass
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, time);

    // Low-pass filter for warmer bass
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    filter.Q.value = 1;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.18, time + 0.02);
    gain.gain.setValueAtTime(0.15, time + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  playMelodyNote(time, freq, duration) {
    const ctx = this.audioContext;

    // Main oscillator - sine for purer classical tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Add subtle harmonic for richness
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, time);

    const gain2 = ctx.createGain();
    gain2.gain.value = 0.02;

    // Piano-like envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.12, time + 0.01);
    gain.gain.setValueAtTime(0.08, time + duration * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    osc2.connect(gain2);
    gain.connect(this.musicGain);
    gain2.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
    osc2.start(time);
    osc2.stop(time + duration);
  }

  playHarmonyNote(time, freq, duration) {
    const ctx = this.audioContext;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Soft sine wave for harmony
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    // Gentle envelope
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.04, time + 0.02);
    gain.gain.setValueAtTime(0.03, time + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  playLightKick(time) {
    const ctx = this.audioContext;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(80, time);
    osc.frequency.exponentialRampToValueAtTime(50, time + 0.08);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  playLightSnare(time) {
    const ctx = this.audioContext;

    // Soft thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(120, time + 0.05);

    gain.gain.setValueAtTime(0.06, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + 0.08);

    // Subtle noise
    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 4000;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.03, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.musicGain);

    noise.start(time);
    noise.stop(time + 0.04);
  }

  playSubtleHihat(time) {
    const ctx = this.audioContext;

    // Very soft hihat
    const bufferSize = ctx.sampleRate * 0.03;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 9000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.025, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(time);
    noise.stop(time + 0.03);
  }

  // ==================== SOUND EFFECTS ====================

  // Door open sound - rising tone
  playDoorOpen() {
    if (!this.sfxEnabled || !this.initialized) return;
    this.resume();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.15);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.2);

    this.playNoise(0.1, 0.15, 2000, 4000);
  }

  // Door close sound - falling tone with thud
  playDoorClose() {
    if (!this.sfxEnabled || !this.initialized) return;
    this.resume();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.15);

    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();

    thud.type = 'sine';
    thud.frequency.setValueAtTime(60, now);
    thud.frequency.exponentialRampToValueAtTime(30, now + 0.1);

    thudGain.gain.setValueAtTime(0.5, now);
    thudGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    thud.connect(thudGain);
    thudGain.connect(this.masterGain);

    thud.start(now);
    thud.stop(now + 0.1);
  }

  // Particle-particle collision sound
  playParticleCollision(energyExchanged = 1) {
    if (!this.sfxEnabled || !this.initialized) return;

    const now = performance.now();
    if (now - this.lastCollisionTime < this.collisionThrottle) return;
    this.lastCollisionTime = now;

    this.resume();

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;

    const normalizedEnergy = Math.min(energyExchanged / 2, 1);
    const freq = 600 + normalizedEnergy * 1200;
    const vol = 0.08 + normalizedEnergy * 0.2;
    const duration = 0.04 + normalizedEnergy * 0.06;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, currentTime + duration);

    gain.gain.setValueAtTime(vol, currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(currentTime);
    osc.stop(currentTime + duration);

    if (normalizedEnergy > 0.5) {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.5, currentTime);
      osc2.frequency.exponentialRampToValueAtTime(freq, currentTime + duration * 0.5);

      gain2.gain.setValueAtTime(vol * 0.3, currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, currentTime + duration * 0.5);

      osc2.connect(gain2);
      gain2.connect(this.masterGain);

      osc2.start(currentTime);
      osc2.stop(currentTime + duration * 0.5);
    }
  }

  // Wall bounce sound - short low "boing"
  playWallBounce(velocity = 100) {
    if (!this.sfxEnabled || !this.initialized) return;

    const now = performance.now();
    if (now - this.lastCollisionTime < this.collisionThrottle) return;
    this.lastCollisionTime = now;

    this.resume();

    const ctx = this.audioContext;
    const currentTime = ctx.currentTime;

    const normalizedVel = Math.min(velocity / 300, 1);
    const vol = 0.12 + normalizedVel * 0.15;
    const baseFreq = 80 + normalizedVel * 40;
    const duration = 0.08;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 2, currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq, currentTime + duration);

    gain.gain.setValueAtTime(vol, currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, currentTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(currentTime);
    osc.stop(currentTime + duration);

    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();

    sub.type = 'sine';
    sub.frequency.setValueAtTime(baseFreq, currentTime);
    sub.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, currentTime + 0.05);

    subGain.gain.setValueAtTime(vol * 0.6, currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.05);

    sub.connect(subGain);
    subGain.connect(this.masterGain);

    sub.start(currentTime);
    sub.stop(currentTime + 0.05);
  }

  // Level complete fanfare
  playLevelComplete() {
    if (!this.sfxEnabled || !this.initialized) return;
    this.stopMusic(); // Stop background music
    this.resume();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      const startTime = now + i * 0.1;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  // Noise generator helper
  playNoise(volume, duration, lowFreq, highFreq) {
    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = (lowFreq + highFreq) / 2;
    bandpass.Q.value = 1;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  // Button click
  playClick() {
    if (!this.sfxEnabled || !this.initialized) return;
    this.resume();

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

// Singleton instance
export const audioManager = new AudioManager();
