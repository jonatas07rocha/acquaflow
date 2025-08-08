export const themes = {
    // ... (seu tema acqua_glass_light existente) ...

    acqua_vibrant: {
        name: 'Acqua Vibrante',
        '--color-bg-main': 'linear-gradient(-45deg, #03A9F4, #01579B, #0277BD, #4FC3F7)',
        '--color-text-base': '#FFFFFF',
        '--color-text-muted': 'rgba(230, 240, 255, 0.8)', // Um branco levemente azulado
        
        // --- A GRANDE MUDANÇA: CORES DE DESTAQUE ---
        '--color-primary': '#A7F3D0', // Verde-água claro para textos e ícones principais
        '--color-accent': '#34D399',  // Verde esmeralda vibrante para progresso e ações

        // --- REFINAMENTO DO GLASSMORPHISM ---
        '--glass-bg': 'rgba(255, 255, 255, 0.08)', // Um pouco menos branco, mais transparente
        '--glass-backdrop-filter': 'blur(24px)',
        '--glass-border': '1px solid rgba(255, 255, 255, 0.1)',
        '--glass-shadow': '0 4px 20px 0 rgba(0, 0, 0, 0.2)', // Sombra mais suave

        // --- BOTÕES COM MAIS PERSONALIDADE ---
        '--btn-primary-bg': 'linear-gradient(45deg, var(--color-accent), var(--color-primary))', // Botão principal em gradiente
        '--btn-primary-text': '#003d5b', // Texto do botão com alto contraste
    }
};

