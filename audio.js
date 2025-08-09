// Garante que o contexto de áudio seja iniciado apenas uma vez, após interação do usuário.
let audioStarted = false;

async function startAudio() {
    if (audioStarted || Tone.context.state === 'running') return;
    await Tone.start();
    audioStarted = true;
    console.log("Contexto de áudio iniciado.");
}

// --- Sintetizadores para cada tipo de som ---

// Som de gota d'água ("bloop")
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

// Som de conquista desbloqueada (acorde brilhante)
const achievementSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: "fmsine",
        modulationType: "sine",
        modulationIndex: 3,
        harmonicity: 3.4
    },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.1, release: 0.4 }
}).toDestination();

// Som de clique de botão (sutil)
const clickSynth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
}).toDestination();


// --- Funções exportadas para tocar os sons ---

export async function playAddWaterSound() {
    await startAudio();
    // Toca uma nota grave para simular uma gota
    waterSynth.triggerAttackRelease("C2", "8n");
}

export async function playAchievementSound() {
    await startAudio();
    const now = Tone.now();
    // Toca um acorde de Dó Maior para celebrar
    achievementSynth.triggerAttackRelease(["C4", "E4", "G4", "C5"], "8n", now);
}

export async function playButtonClickSound() {
    await startAudio();
    // Toca uma nota aguda e curta para o clique
    clickSynth.triggerAttackRelease("C6", "50n");
}

