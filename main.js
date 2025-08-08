import { updateState } from './state.js';
import { renderDashboard, showAddWaterModal, showSettingsModal, enterReorderMode, saveLayout, applyTheme, updateDynamicContent, closeAllModals } from './ui.js';

function addWater(amount) {
    if (amount <= 0 || isNaN(amount)) return;

    // A lógica de manipulação do estado foi movida para o módulo 'state'
    // Aqui, apenas disparamos a atualização.
    const state = getState();
    const newAmount = state.dailyUserData.currentAmount + amount;
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const newHistory = [{ amount, time }, ...state.dailyUserData.history];
    const dayOfWeek = now.getDay();
    const dayIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
    const dailyPercentage = Math.min(Math.round((newAmount / state.settings.dailyGoal) * 100), 100);
    const newWeeklyProgress = [...state.persistentUserData.weeklyProgress];
    newWeeklyProgress[dayIndex].p = dailyPercentage;

    updateState({
        dailyUserData: {
            currentAmount: newAmount,
            history: newHistory
        },
        persistentUserData: {
            weeklyProgress: newWeeklyProgress
        }
    });
    
    updateDynamicContent();
}

function handleReminderToggle(event) {
    const isEnabled = event.target.checked;
    updateState({ settings: { reminders: isEnabled } });

    if (isEnabled && Notification.permission !== 'granted') {
        Notification.requestPermission().then(permission => {
            if (permission !== 'granted') {
                event.target.checked = false;
                updateState({ settings: { reminders: false } });
            }
        });
    }
}

function setupEventListeners() {
    document.body.addEventListener('click', (event) => {
        const targetElement = event.target.closest('[data-action]');
        if (!targetElement) return;

        const action = targetElement.dataset.action;

        switch(action) {
            case 'showSettings': showSettingsModal(); break;
            case 'saveLayout': saveLayout(); break;
            case 'showAddWater': showAddWaterModal(); break;
            case 'addCustomWater':
                const amountInput = document.getElementById('custom-amount');
                if (amountInput && amountInput.value) {
                    const amount = parseInt(amountInput.value, 10);
                    addWater(amount);
                }
                closeAllModals();
                break;
            case 'closeModal':
                closeAllModals();
                break;
            case 'enterReorderMode':
                enterReorderMode();
                break;
            case 'saveSettings':
                const newGoal = parseInt(document.getElementById('goal-input').value, 10);
                const reminders = document.getElementById('reminders-toggle').checked;
                
                const settingsToUpdate = { reminders };
                if (!isNaN(newGoal) && newGoal > 0) {
                    settingsToUpdate.dailyGoal = newGoal;
                }
                
                updateState({ settings: settingsToUpdate });
                renderDashboard();
                closeAllModals();
                break;
            case 'selectTheme':
                const themeName = targetElement.dataset.theme;
                updateState({ settings: { theme: themeName } });
                applyTheme(themeName);
                
                document.querySelectorAll('.theme-selector-item .w-10').forEach(el => {
                    el.classList.remove('border-white');
                    el.classList.add('border-transparent');
                });
                targetElement.querySelector('.w-10').classList.add('border-white');
                targetElement.querySelector('.w-10').classList.remove('border-transparent');
                break;
        }
    });

    document.body.addEventListener('change', (event) => {
        if (event.target.id === 'reminders-toggle') {
            handleReminderToggle(event);
        }
    });
}

function initializeApp() {
    renderDashboard();
    setupEventListeners();

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => console.log('Service Worker registrado com sucesso:', registration))
            .catch(error => console.log('Falha ao registrar Service Worker:', error));
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);
