import { themes } from './themes.js';
import { state } from './state.js';
import { dom } from './ui.js';
import { renderUI, updateUI } from './ui_controller.js';
import { loadState, saveState } from './persistence.js';

// --- FUNÇÕES DE LÓGICA PRINCIPAL ---

/**
 * Adiciona uma quantidade de água ao estado atual.
 * @param {number} amount - A quantidade de água em ml.
 */
function addWater(amount) {
    // Lógica de áudio (a ser criada)
    // playWaterPour(); 
    
    state.currentWater += amount;
    state.waterHistory[state.waterHistory.length - 1] += amount;

    if (state.shortcutHistory.hasOwnProperty(amount)) {
        state.shortcutHistory[amount] += amount;
    }

    const now = new Date();
    state.lastDrinkTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    state.lastDrinkAmount = amount;

    // showToast(`Adicionado ${amount}ml de água.`); // (Função a ser criada)
    
    dom.currentWaterDisplay.classList.add('animate-pop');
    setTimeout(() => {
        dom.currentWaterDisplay.classList.remove('animate-pop');
    }, 300);

    saveState();
    updateUI();
}


// --- FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---
function initializeApp() {
    console.log("Acqua Flow Iniciado!");

    applyTheme(themes.acqua_glass_light);
    loadState();
    renderUI();
    setupEventListeners();
    
    lucide.createIcons();
}

/**
 * Aplica um tema à aplicação.
 * @param {object} themeObject - O objeto de tema de themes.js.
 */
function applyTheme(themeObject) {
    const root = document.documentElement;
    for (const property in themeObject) {
        if (property !== 'name') {
            root.style.setProperty(property, themeObject[property]);
        }
    }
    document.body.style.animation = 'water-flow 15s ease infinite';
}

/**
 * Configura todos os event listeners da aplicação.
 */
function setupEventListeners() {
    if (dom.quickAddButtons) {
        dom.quickAddButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const amount = parseInt(btn.dataset.amount);
                addWater(amount);
            });
        });
    }

    // Adicionar listeners para os botões de navegação (stats, add, settings) aqui
}


// --- PONTO DE ENTRADA ---
document.addEventListener('DOMContentLoaded', initializeApp);