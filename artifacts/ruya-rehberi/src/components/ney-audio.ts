export type NeyAudioEngine = {
  mediaStream: MediaStream;
  setEnabled: (enabled: boolean) => Promise<void>;
  dispose: () => Promise<void>;
};

const hijazPhrase = [146.83, 155.56, 185, 220, 196, 233.08, 185, 146.83];
const rastPhrase = [130.81, 146.83, 164.81, 174.61, 196, 220, 196, 130.81];

function createReverbImpulse(context: AudioContext) {
  const duration = 2.6;
  const length = Math.floor(context.sampleRate * duration);
  const impulse = context.createBuffer(2, length, context.sampleRate);

  for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
    const samples = impulse.getChannelData(channel);
    for (let index = 0; index < length; index += 1) {
      const fade = Math.pow(1 - index / length, 3.1);
      samples[index] = (Math.random() * 2 - 1) * fade;
    }
  }

  return impulse;
}

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
  const reverbSend = context.createGain();
  reverbSend.gain.value = 0.22;
  const convolver = context.createConvolver();
  convolver.buffer = createReverbImpulse(context);
  const reverbReturn = context.createGain();
  reverbReturn.gain.value = 0.18;

  const delay = context.createDelay(1.2);
  delay.delayTime.value = 0.34;
  const delayDamp = context.createBiquadFilter();
  delayDamp.type = 'lowpass';
  delayDamp.frequency.value = 1450;
  const delayFeedback = context.createGain();
  delayFeedback.gain.value = 0.16;
  const delayReturn = context.createGain();
  delayReturn.gain.value = 0.12;
  const delaySend = context.createGain();
  delaySend.gain.value = 0.14;

  const mediaDestination = context.createMediaStreamDestination();
  dryBus.connect(masterGain);
  reverbSend.connect(convolver);
  convolver.connect(reverbReturn);
  reverbReturn.connect(masterGain);
  delay.connect(delayDamp);
  delayDamp.connect(delayFeedback);
  delayFeedback.connect(delay);
  delayDamp.connect(delayReturn);
  delayReturn.connect(masterGain);
  delaySend.connect(delay);
  masterGain.connect(context.destination);
  masterGain.connect(mediaDestination);

  let scheduleTimer = 0;
  let noiseSource: AudioBufferSourceNode | null = null;
  let isRunning = false;
  let disposed = false;
  let startPromise: Promise<void> | null = null;
  let nextNoteTime = 0;
  let noteIndex = 0;

  const playNeyNote = (frequency: number, startTime: number) => {
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1250;
    filter.Q.value = 0.55;

    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency * 0.996, startTime);
    oscillator.frequency.linearRampToValueAtTime(frequency, startTime + 0.18);

    const harmonic = context.createOscillator();
    harmonic.type = 'triangle';
    harmonic.frequency.setValueAtTime(frequency * 2, startTime);
    const harmonicGain = context.createGain();
    harmonicGain.gain.value = 0.018;

    const envelope = context.createGain();
    envelope.gain.setValueAtTime(0.0001, startTime);
    envelope.gain.linearRampToValueAtTime(0.13, startTime + 0.2);
    envelope.gain.setValueAtTime(0.095, startTime + 0.66);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.91);

    oscillator.connect(filter);
    harmonic.connect(harmonicGain);
    harmonicGain.connect(filter);
    filter.connect(envelope);
    envelope.connect(dryBus);
    envelope.connect(reverbSend);
    envelope.connect(delaySend);

    oscillator.start(startTime);
    harmonic.start(startTime);
    oscillator.stop(startTime + 0.94);
    harmonic.stop(startTime + 0.94);
    oscillator.onended = () => {
      oscillator.disconnect();
      harmonic.disconnect();
      harmonicGain.disconnect();
      filter.disconnect();
      envelope.disconnect();
    };
  };

  const scheduleNotes = () => {
    const scheduleUntil = context.currentTime + 0.45;
    while (nextNoteTime < scheduleUntil) {
      const phrase = Math.floor(noteIndex / hijazPhrase.length) % 2 === 0
        ? hijazPhrase
        : rastPhrase;
      const frequency = phrase[noteIndex % phrase.length];
      playNeyNote(frequency, nextNoteTime);
      nextNoteTime += 1;
      noteIndex += 1;
    }
  };

  const start = async () => {
    if (disposed) throw new Error('Ney ses motoru kapatılmış.');
    if (isRunning) return;
    if (startPromise) return startPromise;

    startPromise = (async () => {
      if (context.state !== 'running') await context.resume();

      const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
      const noiseSamples = noiseBuffer.getChannelData(0);
      for (let index = 0; index < noiseSamples.length; index += 1) {
        noiseSamples[index] = (Math.random() * 2 - 1) * 0.45;
      }

      noiseSource = context.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      const breathFilter = context.createBiquadFilter();
      breathFilter.type = 'bandpass';
      breathFilter.frequency.value = 850;
      breathFilter.Q.value = 0.42;
      const breathGain = context.createGain();
      breathGain.gain.value = 0.013;
      noiseSource.connect(breathFilter);
      breathFilter.connect(breathGain);
      breathGain.connect(dryBus);
      noiseSource.start();

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
      masterGain.gain.setTargetAtTime(enabled ? 0.24 : 0, now, 0.18);
    },
    async dispose() {
      if (disposed) return;
      disposed = true;
      window.clearInterval(scheduleTimer);
      if (noiseSource) {
        try {
          noiseSource.stop();
        } catch {
          // The source may already have stopped while the context was closing.
        }
      }
      mediaDestination.stream.getTracks().forEach((track) => track.stop());
      if (context.state !== 'closed') await context.close();
    },
  };
}
