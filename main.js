import { loadState, saveState } from './persistence.js';
import { renderDashboard, showAddWaterModal, showSettingsModal, enterReorderMode, saveLayout } from './ui.js';

// Função para adicionar água, agora no módulo principal
function addWater(amount) {
    if (amount <= 0 || isNaN(amount)) return;
    
    const state = loadState();
    state.userData.currentAmount += amount;
    
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    state.userData.history.unshift({ amount, time });
    
    saveState(state);
    renderDashboard(); // Re-renderiza o dashboard para refletir a mudança
}

// Inicialização da Aplicação
function initializeApp() {
    const today = new Date();
    document.getElementById('date-header').textContent = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    
    renderDashboard();
    setupEventListeners();

    // Registra o Service Worker para funcionalidade PWA
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('Service Worker registrado com sucesso:', registration))
            .catch(error => console.log('Falha ao registrar Service Worker:', error));
    }
}

// Configura todos os ouvintes de eventos
function setupEventListeners() {
    // Usa delegação de eventos para botões que são criados dinamicamente
    document.body.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) {
             // Permite que o clique no seletor de tema funcione
            if (event.target.closest('.theme-selector-item')) {
                const themeName = event.target.closest('.theme-selector-item').dataset.theme;
                const state = loadState();
                state.settings.theme = themeName;
                saveState(state);
                renderDashboard();
                document.getElementById('settings-modal')?.remove();
                showSettingsModal();
            }
            return;
        }

        const action = target.dataset.action;

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
                target.closest('.modal-container')?.remove();
                break;
            case 'closeModal':
                target.closest('.modal-container')?.remove();
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
                target.closest('.modal-container')?.remove();
                break;
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);
