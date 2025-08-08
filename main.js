import { loadState, saveState } from './persistence.js';
import { renderDashboard, showAddWaterModal, showSettingsModal, enterReorderMode, saveLayout } from './ui.js';

function addWater(amount) {
    if (amount <= 0 || isNaN(amount)) return;
    
    const state = loadState();
    state.userData.currentAmount += amount;
    
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    state.userData.history.unshift({ amount, time });

    // --- CORREÇÃO APLICADA AQUI ---
    // Atualiza o progresso do dia atual na barra semanal
    const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const dayIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Ajusta para o array que começa na Segunda
    const dailyPercentage = Math.min(Math.round((state.userData.currentAmount / state.settings.dailyGoal) * 100), 100);
    state.userData.weeklyProgress[dayIndex].p = dailyPercentage;
    // --- FIM DA CORREÇÃO ---
    
    saveState(state);
    renderDashboard();
}

function initializeApp() {
    const today = new Date();
    document.getElementById('date-header').textContent = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    
    renderDashboard();
    setupEventListeners();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('Service Worker registrado com sucesso:', registration))
            .catch(error => console.log('Falha ao registrar Service Worker:', error));
    }
}

function setupEventListeners() {
    document.body.addEventListener('click', (event) => {
        // --- CORREÇÃO APLICADA AQUI ---
        // Alvo agora é qualquer elemento com data-action, não apenas botões
        const targetElement = event.target.closest('[data-action]');
        if (!targetElement) return;

        const action = targetElement.dataset.action;
        // --- FIM DA CORREÇÃO ---

        switch(action) {
            case 'showSettings':
                showSettingsModal();
                break;
            case 'saveLayout':
                saveLayout();
                break;
            case 'showAddWater':
                showAddWaterModal();
                break;
            case 'addCustomWater':
                const amount = parseInt(document.getElementById('custom-amount').value, 10);
                addWater(amount);
                targetElement.closest('.modal-container')?.remove();
                break;
            case 'closeModal':
                targetElement.closest('.modal-container')?.remove();
                break;
            case 'enterReorderMode':
                enterReorderMode();
                break;
            case 'saveSettings':
                const state = loadState();
                const newGoal = parseInt(document.getElementById('goal-input').value, 10);
                if (!isNaN(newGoal) && newGoal > 0) {
                    state.settings.dailyGoal = newGoal;
                }
                state.settings.reminders = document.getElementById('reminders-toggle').checked;
                saveState(state);
                renderDashboard();
                targetElement.closest('.modal-container')?.remove();
                break;
            case 'selectTheme':
                const themeName = targetElement.dataset.theme;
                const themeState = loadState();
                themeState.settings.theme = themeName;
                saveState(themeState);
                renderDashboard();
                document.getElementById('settings-modal')?.remove();
                showSettingsModal();
                break;
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);
