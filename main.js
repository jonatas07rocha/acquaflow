import { themes } from './themes.js';
import { state } from './state.js';
// Futuramente, importaremos as funções de UI de um 'ui_controller.js'

// --- FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---
function initializeApp() {
    console.log("Acqua Flow Iniciado!");

    // 1. Aplica o tema visual
    applyTheme(themes.acqua_glass_light);

    // 2. Carrega o estado salvo (do localStorage)
    // loadState(); // (Função a ser criada em 'persistence.js')

    // 3. Renderiza a interface inicial
    // renderUI(); // (Função a ser criada em 'ui_controller.js')

    // 4. Configura os event listeners
    // setupEventListeners(); // (Função a ser criada aqui)
    
    // Inicia os ícones
    lucide.createIcons();
}

/**
 * Aplica um tema à aplicação, definindo as variáveis CSS no elemento root.
 * @param {object} themeObject - O objeto de tema de themes.js.
 */
function applyTheme(themeObject) {
    const root = document.documentElement;
    for (const property in themeObject) {
        if (property !== 'name') {
            root.style.setProperty(property, themeObject[property]);
        }
    }
    // Anima o fundo para a transição ser suave
    root.style.animation = 'water-flow 15s ease infinite';
}


// --- PONTO DE ENTRADA ---
document.addEventListener('DOMContentLoaded', initializeApp);
