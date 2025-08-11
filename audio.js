let audioStarted = false;

async function startAudio() {
    if (audioStarted || (Tone.context && Tone.context.state === 'running')) return;
    await Tone.start();
    audioStarted = true;
    console.log("Contexto de áudio iniciado.");
}

const waterSynth = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 10,
    oscillator: { type: "sine" },
    envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 1.4,
        attackCurve: "exponential"
    }
}).toDestination();

// SOM DE CONQUISTA MODIFICADO
const achievementSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: "sine" // Usa uma onda senoidal pura, que é muito mais suave.
    },
    envelope: {
        attack: 0.02, // Ataque mais lento para evitar estalos.
        decay: 0.3,
        sustain: 0.1,
        release: 0.3,
    },
    volume: -9 // Volume reduzido para ser mais agradável.
}).toDestination();

const clickSynth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
}).toDestination();

export async function playAddWaterSound() {
    await startAudio();
    waterSynth.triggerAttackRelease("C2", "8n");
}

export async function playAchievementSound() {
    await startAudio();
    const now = Tone.now();
    // Toca um acorde maior, mais aberto e agradável.
    achievementSynth.triggerAttackRelease(["C4", "G4", "C5", "E5"], "4n", now);
}

export async function playButtonClickSound() {
    await startAudio();
    clickSynth.triggerAttackRelease("C6", "50n");
}
