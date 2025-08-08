export const themes = {
    // ... (seu tema acqua_glass_light existente) ...

    acqua_vibrant: {
        name: 'Acqua Vibrante',
        '--color-bg-main': 'linear-gradient(-45deg, #03A9F4, #01579B, #0277BD, #4FC3F7)',
        '--color-text-base': '#FFFFFF',
        '--color-text-muted': 'rgba(230, 240, 255, 0.8)',
        
        // Cores de Destaque
        '--color-primary': '#A7F3D0',
        '--color-accent': '#34D399',
        // --- ADICIONAR ESTAS DUAS LINHAS ---
        '--color-primary-rgb': '167, 243, 208', // RGB correspondente a #A7F3D0
        '--color-accent-rgb': '52, 211, 153',   // RGB correspondente a #34D399

        // Refinamento do Glassmorphism
        '--glass-bg': 'rgba(255, 255, 255, 0.08)',
        '--glass-backdrop-filter': 'blur(24px)',
        '--glass-border': '1px solid rgba(255, 255, 255, 0.1)',
        '--glass-shadow': '0 4px 20px 0 rgba(0, 0, 0, 0.2)',

        // Botões
        '--btn-primary-bg': 'linear-gradient(45deg, var(--color-accent), var(--color-primary))',
        '--btn-primary-text': '#003d5b',
    }
};

