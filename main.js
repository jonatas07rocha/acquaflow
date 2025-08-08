import { themes } from './themes.js';
import { state } from './state.js';
import { dom } from './ui.js';
import { renderUI, updateUI, showModal, hideModal } from './ui_controller.js';
import { loadState, saveState } from './persistence.js';

// --- LÓGICA PRINCIPAL ---
function addWater(amount) {
    if (isNaN(amount) || amount <= 0) return;
    
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

// --- INICIALIZAÇÃO ---
function initializeApp() {
    applyTheme(themes.acqua_vibrant);
    loadState();
    renderUI();
    setupEventListeners();
    
    // --- MUDANÇA AQUI ---
    // Garante que os ícones sejam criados DEPOIS que o HTML deles existir.
    lucide.createIcons(); 
}

function applyTheme(themeObject) {
    const root = document.documentElement;
    Object.keys(themeObject).forEach(key => {
        if (key !== 'name') {
            root.style.setProperty(key, themeObject[key]);
        }
    });
    document.body.style.animation = 'water-flow 15s ease infinite';
}

function setupEventListeners() {
    // Navegação e Modais
    dom.statsNavBtn.addEventListener('click', () => showModal(dom.statsModal));
    dom.addWaterNavBtn.addEventListener('click', () => showModal(dom.addWaterModal));
    dom.settingsNavBtn.addEventListener('click', () => showModal(dom.settingsModal));

    dom.closeStatsModalBtn.addEventListener('click', () => hideModal(dom.statsModal));
    dom.closeAddModalBtn.addEventListener('click', () => hideModal(dom.addWaterModal));
    dom.closeSettingsModalBtn.addEventListener('click', () => hideModal(dom.settingsModal));

    // Ações
    dom.quickAddButtons.forEach(btn => {
        btn.addEventListener('click', () => addWater(parseInt(btn.dataset.amount)));
    });
    dom.addShortcutButtons.forEach(btn => {
        btn.addEventListener('click', () => addWater(parseInt(btn.dataset.amount)));
    });
    dom.confirmAddBtn.addEventListener('click', () => {
        const amount = parseInt(dom.customAmountInput.value);
        addWater(amount);
        dom.customAmountInput.value = '';
    });
    dom.saveManualGoalBtn.addEventListener('click', () => {
        const newGoal = parseInt(dom.manualGoalInput.value);
        if (!isNaN(newGoal) && newGoal > 0) {
            state.goalWater = newGoal;
            saveState();
            updateUI();
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);

