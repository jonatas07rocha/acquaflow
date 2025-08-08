import { themes } from './themes.js';
import { state } from './state.js';
import { dom } from './ui.js';
import { renderUI, updateUI, showModal, hideModal } from './ui_controller.js';
import { loadState, saveState } from './persistence.js';

// --- FUNÇÕES DE LÓGICA PRINCIPAL ---
function addWater(amount) {
    if (isNaN(amount) || amount <= 0) {
        // showToast("Valor inválido", true); // Futura implementação de toast
        return;
    }
    
    state.currentWater += amount;
    state.waterHistory[state.waterHistory.length - 1] += amount;

    if (state.shortcutHistory.hasOwnProperty(amount)) {
        state.shortcutHistory[amount] = (state.shortcutHistory[amount] || 0) + 1;
    }

    const now = new Date();
    state.lastDrinkTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    state.lastDrinkAmount = amount;
    
    dom.currentWaterDisplay.classList.add('animate-pop');
    setTimeout(() => dom.currentWaterDisplay.classList.remove('animate-pop'), 300);

    saveState();
    updateUI();
    hideModal(dom.addWaterModal);
}

// --- FUNÇÃO PRINCIPAL DE INICIALIZAÇÃO ---
function initializeApp() {
    applyTheme(themes.acqua_glass_light);
    loadState();
    renderUI();
    setupEventListeners();
    lucide.createIcons();
}

function applyTheme(themeObject) {
    const root = document.documentElement;
    for (const property in themeObject) {
        if (property !== 'name') {
            root.style.setProperty(property, themeObject[property]);
        }
    }
    document.body.style.animation = 'water-flow 15s ease infinite';
}

function setupEventListeners() {
    // Navegação Principal
    dom.statsNavBtn.addEventListener('click', () => showModal(dom.statsModal));
    dom.addWaterNavBtn.addEventListener('click', () => showModal(dom.addWaterModal));
    dom.settingsNavBtn.addEventListener('click', () => showModal(dom.settingsModal));

    // Botões de Fechar Modais
    dom.closeStatsModalBtn.addEventListener('click', () => hideModal(dom.statsModal));
    dom.closeAddModalBtn.addEventListener('click', () => hideModal(dom.addWaterModal));
    dom.closeSettingsModalBtn.addEventListener('click', () => hideModal(dom.settingsModal));

    // Atalhos Rápidos
    dom.quickAddButtons.forEach(btn => {
        btn.addEventListener('click', () => addWater(parseInt(btn.dataset.amount)));
    });

    // Lógica do Modal "Adicionar Água"
    dom.addShortcutButtons.forEach(btn => {
        btn.addEventListener('click', () => addWater(parseInt(btn.dataset.amount)));
    });
    dom.confirmAddBtn.addEventListener('click', () => {
        const amount = parseInt(dom.customAmountInput.value);
        addWater(amount);
        dom.customAmountInput.value = '';
    });

    // Lógica do Modal "Configurações"
    dom.saveManualGoalBtn.addEventListener('click', () => {
        const newGoal = parseInt(dom.manualGoalInput.value);
        if (!isNaN(newGoal) && newGoal > 0) {
            state.goalWater = newGoal;
            saveState();
            updateUI();
            // showToast("Meta salva com sucesso!");
        }
    });
}

// --- PONTO DE ENTRADA ---
document.addEventListener('DOMContentLoaded', initializeApp);

