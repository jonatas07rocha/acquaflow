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
}

// Configura todos os ouvintes de eventos
function setupEventListeners() {
    // Usa delegação de eventos para botões que são criados dinamicamente
    document.body.addEventListener('click', (event) => {
        const target = event.target.closest('button');
        if (!target) return;

        // Botões do Cabeçalho
        if (target.closest('#settings-button')) showSettingsModal();
        if (target.id === 'save-layout-btn') saveLayout();
        
        // Ações dos Widgets
        if (target.closest('.main-add-button')) showAddWaterModal();

        // Ações dos Modais
        if (target.dataset.action === 'addCustomWater') {
            const amount = parseInt(document.getElementById('custom-amount').value, 10);
            addWater(amount);
            document.getElementById('add-water-modal').remove();
        }
        if (target.dataset.action === 'closeModal') {
            target.closest('.modal-container').remove();
        }
        if (target.dataset.action === 'enterReorderMode') enterReorderMode();
        if (target.dataset.action === 'saveSettings') {
            const state = loadState();
            const newGoal = parseInt(document.getElementById('goal-input').value, 10);
            if (!isNaN(newGoal) && newGoal > 0) {
                state.settings.dailyGoal = newGoal;
            }
            state.settings.reminders = document.getElementById('reminders-toggle').checked;
            saveState(state);
            renderDashboard();
            document.getElementById('settings-modal').remove();
        }
        if (target.closest('.theme-selector-item')) {
            const themeName = target.closest('.theme-selector-item').dataset.theme;
            const state = loadState();
            state.settings.theme = themeName;
            saveState(state);
            renderDashboard(); // Re-renderiza para aplicar o tema
            document.getElementById('settings-modal').remove();
            showSettingsModal(); // Reabre o modal para mostrar a seleção
        }
    });
}

// Inicia tudo quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeApp);
