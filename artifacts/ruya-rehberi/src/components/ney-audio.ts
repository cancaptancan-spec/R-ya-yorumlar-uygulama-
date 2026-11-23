export type NeyAudioEngine = {
  mediaStream: MediaStream;
  setEnabled: (enabled: boolean) => Promise<void>;
  dispose: () => Promise<void>;
};

// D, Eb, F#, G, A, Bb, C, D: a simple Turkish Hicaz phrase.
const hicazPhrase = [293.66, 311.13, 369.99, 392, 440, 466.16, 523.25, 587.33];
const noteInterval = 1.04;

export function createNeyAudioEngine(): NeyAudioEngine {
  const windowWithWebkit = window as Window & { webkitAudioContext?: typeof AudioContext };
  const AudioContextConstructor = window.AudioContext || windowWithWebkit.webkitAudioContext;
  if (!AudioContextConstructor) {
    throw new Error('Tarayıcınız Web Audio ses üretimini desteklemiyor.');
  }

  const context = new AudioContextConstructor();
  const masterGain = context.createGain();
  masterGain.gain.setValueAtTime(0, context.currentTime);

  const dryBus = context.createGain();
  const delaySend = context.createGain();
  delaySend.gain.value = 0.2;
  const mediaDestination = context.createMediaStreamDestination();
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 18;
  compressor.ratio.value = 4.5;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.24;

  dryBus.connect(masterGain);
  masterGain.connect(compressor);
  compressor.connect(context.destination);
  compressor.connect(mediaDestination);

  // Filtered, panned delay taps create a clean stereo ambience without noise samples.
  const addDelayTap = (seconds: number, pan: number, level: number) => {
    const delay = context.createDelay(1.2);
    delay.delayTime.value = seconds;
    const lowpass = context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 800;
    const feedback = context.createGain();
    feedback.gain.value = 0.12;
    const returnGain = context.createGain();
    returnGain.gain.value = level;
    const panner = context.createStereoPanner();
    panner.pan.value = pan;

    delaySend.connect(delay);
    delay.connect(lowpass);
    lowpass.connect(feedback);
    feedback.connect(delay);
    lowpass.connect(returnGain);
    returnGain.connect(panner);
    panner.connect(masterGain);
  };

  addDelayTap(0.21, -0.72, 0.16);
  addDelayTap(0.31, 0.72, 0.14);
  addDelayTap(0.43, -0.18, 0.1);

  let scheduleTimer = 0;
  let isRunning = false;
  let disposed = false;
  let startPromise: Promise<void> | null = null;
  let nextNoteTime = 0;
  let noteIndex = 0;
  const persistentOscillators: OscillatorNode[] = [];

  const startDrone = (frequency: number, type: OscillatorType, volume: number) => {
    const oscillator = context.createOscillator();
    oscillator.type = type;
    oscillator.frequency.value = frequency;

    const lowpass = context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 800;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.linearRampToValueAtTime(volume, context.currentTime + 1.8);

    oscillator.connect(lowpass);
    lowpass.connect(gain);
    gain.connect(dryBus);
    gain.connect(delaySend);
    oscillator.start();
    persistentOscillators.push(oscillator);
  };

  const playTone = (
    frequency: number,
    startTime: number,
    duration: number,
    peak: number,
    attack: number,
    decay: number,
    sustain: number,
    release: number,
    harmonicLevel: number,
  ) => {
    const lowpass = context.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 800;
    lowpass.Q.value = 0.65;

    const fundamental = context.createOscillator();
    fundamental.type = 'sine';
    fundamental.frequency.setValueAtTime(frequency * 0.998, startTime);
    fundamental.frequency.linearRampToValueAtTime(frequency, startTime + attack);

    const harmonic = context.createOscillator();
    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(frequency * 2, startTime);
    const harmonicGain = context.createGain();
    harmonicGain.gain.value = harmonicLevel;

    const envelope = context.createGain();
    const sustainTime = startTime + duration - release;
    envelope.gain.setValueAtTime(0.0001, startTime);
    envelope.gain.linearRampToValueAtTime(peak, startTime + attack);
    envelope.gain.exponentialRampToValueAtTime(
      Math.max(sustain, 0.0002),
      startTime + attack + decay,
    );
    envelope.gain.setValueAtTime(Math.max(sustain, 0.0002), sustainTime);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    fundamental.connect(lowpass);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(lowpass);
    lowpass.connect(envelope);
    envelope.connect(dryBus);
    envelope.connect(delaySend);

    fundamental.start(startTime);
    harmonic.start(startTime);
    fundamental.stop(startTime + duration + 0.04);
    harmonic.stop(startTime + duration + 0.04);
    fundamental.onended = () => {
      fundamental.disconnect();
      harmonic.disconnect();
      harmonicGain.disconnect();
      lowpass.disconnect();
      envelope.disconnect();
    };
  };

  const playOudNote = (frequency: number, startTime: number) => {
    playTone(frequency, startTime, 0.98, 0.078, 0.05, 0.31, 0.028, 0.4, 0.07);
  };

  const playNeyNote = (frequency: number, startTime: number) => {
    playTone(frequency, startTime, 1.9, 0.038, 0.28, 0.32, 0.028, 0.55, 0.035);
  };

  const scheduleNotes = () => {
    const scheduleUntil = context.currentTime + 0.45;
    while (nextNoteTime < scheduleUntil) {
      const frequency = hicazPhrase[noteIndex % hicazPhrase.length];
      playOudNote(frequency, nextNoteTime);
      if (noteIndex % 2 === 0) {
        playNeyNote(frequency, nextNoteTime + 0.1);
      }
      nextNoteTime += noteInterval;
      noteIndex += 1;
    }
  };

  const start = async () => {
    if (disposed) throw new Error('Ney ses motoru kapatılmış.');
    if (isRunning) return;
    if (startPromise) return startPromise;

    startPromise = (async () => {
      if (context.state !== 'running') await context.resume();

      // A soft D2/A2 drone grounds the melody; all voices use pitched oscillators.
      startDrone(73.42, 'sine', 0.026);
      startDrone(110, 'sine', 0.016);
      startDrone(73.42, 'triangle', 0.004);
      nextNoteTime = context.currentTime + 0.06;
      noteIndex = 0;
      scheduleNotes();
      scheduleTimer = window.setInterval(scheduleNotes, 100);
      isRunning = true;
    })();

    try {
      await startPromise;
    } catch (error) {
      isRunning = false;
      throw error;
    } finally {
      startPromise = null;
    }
  };

  return {
    mediaStream: mediaDestination.stream,
    async setEnabled(enabled) {
      if (enabled) await start();
      if (context.state === 'closed') throw new Error('Ses motoru kullanılamıyor.');
      const now = context.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setTargetAtTime(enabled ? 0.9 : 0, now, 0.18);
    },
    async dispose() {
      if (disposed) return;
      disposed = true;
      window.clearInterval(scheduleTimer);
      persistentOscillators.forEach((oscillator) => {
        try {
          oscillator.stop();
        } catch {
          // The oscillator may already have stopped while the context is closing.
        }
      });
      mediaDestination.stream.getTracks().forEach((track) => track.stop());
      if (context.state !== 'closed') await context.close();
    },
  };
}
