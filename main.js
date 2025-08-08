import { loadState, saveState } from './persistence.js';
import { renderDashboard, showAddWaterModal, showSettingsModal, enterReorderMode, saveLayout } from './ui.js';

function addWater(amount) {
    if (amount <= 0 || isNaN(amount)) return;
    
    const state = loadState();
    state.dailyUserData.currentAmount += amount;
    
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    state.dailyUserData.history.unshift({ amount, time });

    const dayOfWeek = now.getDay();
    const dayIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Ajusta para o array que começa na Segunda (0) e termina no Domingo (6)
    const dailyPercentage = Math.min(Math.round((state.dailyUserData.currentAmount / state.settings.dailyGoal) * 100), 100);
    state.persistentUserData.weeklyProgress[dayIndex].p = dailyPercentage;
    
    saveState(state);
    renderDashboard();
}

function handleReminderToggle(event) {
    const isEnabled = event.target.checked;
    if (isEnabled && Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Permissão para notificações concedida!');
                // Aqui você pode adicionar lógica para agendar notificações
            } else {
                console.log('Permissão para notificações negada.');
                event.target.checked = false; // Desfaz o toggle se a permissão for negada
            }
            const state = loadState();
            state.settings.reminders = event.target.checked;
            saveState(state);
        });
    } else {
        const state = loadState();
        state.settings.reminders = isEnabled;
        saveState(state);
    }
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
        const targetElement = event.target.closest('[data-action]');
        if (!targetElement) return;

        const action = targetElement.dataset.action;

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
                // A lógica do toggle é tratada em um evento 'change' separado
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

    // Evento separado para o toggle de lembretes
    document.body.addEventListener('change', (event) => {
        if (event.target.id === 'reminders-toggle') {
            handleReminderToggle(event);
        }
    });
}

document.addEventListener('DOMContentLoaded', initializeApp);
