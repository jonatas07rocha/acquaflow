import { getState, updateState, resetState } from './state.js';
import { renderDashboard, showAddWaterModal, showSettingsModal, showCalendarReminderModal, showResetConfirmationModal, showAchievementInfoModal, showReminderConfirmationModal, enterReorderMode, saveLayout, applyTheme, closeAllModals } from './ui.js';
import { checkAndUnlockAchievements } from './achievements.js';
import { playAddWaterSound, playButtonClickSound } from './audio.js';
import { createHourlyReminder } from './calendar.js';
// Importa as novas funções do serviço de lembretes.
import { startReminderService, stopReminderService } from './reminders.js';

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

function addWater(amount) {
    if (amount <= 0 || isNaN(amount)) return;
    playAddWaterSound();

    const state = getState();
    const newAmount = state.dailyUserData.currentAmount + amount;
    
    const now = new Date();
    const time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    const newHistoryEntry = { amount, time, timestamp: now.getTime() };
    const newHistory = [newHistoryEntry, ...state.dailyUserData.history];

    updateState({
        dailyUserData: {
            currentAmount: newAmount,
            history: newHistory
        }
    });
    
    renderDashboard();
    checkAndUnlockAchievements();
}

/**
 * Lida com a ativação e desativação dos lembretes.
 * @param {Event} event - O evento do clique no toggle.
 */
function handleReminderToggle(event) {
    const isEnabled = event.target.checked;
    updateState({ settings: { reminders: isEnabled } });

    if (isIOS) {
        // Em dispositivos iOS, sempre mostra o modal do calendário.
        if (isEnabled) {
            showCalendarReminderModal();
        }
    } else {
        // Em outros dispositivos, usa o sistema de notificações do navegador.
        if (isEnabled) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    startReminderService();
                    showReminderConfirmationModal(); // Mostra o feedback para o usuário.
                } else {
                    // Se a permissão for negada, desfaz a ação.
                    event.target.checked = false;
                    updateState({ settings: { reminders: false } });
                }
            });
        } else {
            // Se desativado, para o serviço.
            stopReminderService();
        }
    }
}

function confirmAddWater() {
    const amountInput = document.getElementById('custom-amount');
    if (amountInput && amountInput.value) {
        const amount = parseInt(amountInput.value, 10);
        addWater(amount);
    }
    closeAllModals();
}

function setupEventListeners() {
    document.body.addEventListener('click', (event) => {
        const targetElement = event.target.closest('[data-action]');
        if (!targetElement) return;

        const action = targetElement.dataset.action;
        const actionsWithSound = ['showSettings', 'saveLayout', 'showAddWater', 'addCustomWater', 'closeModal', 'enterReorderMode', 'saveSettings', 'selectTheme', 'createCalendarReminder', 'showResetConfirmation', 'confirmReset', 'showAchievementInfo'];
        if (actionsWithSound.includes(action)) {
            playButtonClickSound();
        }

        switch(action) {
            case 'showSettings': showSettingsModal(); break;
            case 'saveLayout': 
                saveLayout(); 
                checkAndUnlockAchievements('ORGANIZER');
                break;
            case 'showAddWater': showAddWaterModal(); break;
            case 'addCustomWater': confirmAddWater(); break;
            case 'closeModal': closeAllModals(); break;
            case 'enterReorderMode': enterReorderMode(); break;
            case 'createCalendarReminder':
                createHourlyReminder();
                closeAllModals();
                break;
            case 'showResetConfirmation':
                closeAllModals(); 
                showResetConfirmationModal();
                break;
            case 'confirmReset':
                resetState();
                break;
            case 'showAchievementInfo':
                const achId = targetElement.dataset.id;
                const achievement = getState().persistentUserData.achievements.find(a => a.id === achId);
                if (achievement) {
                    showAchievementInfoModal(achievement);
                }
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
                checkAndUnlockAchievements();
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
                checkAndUnlockAchievements('THEME_MASTER');
                break;
        }
    });

    document.body.addEventListener('change', (event) => {
        if (event.target.id === 'reminders-toggle') {
            playButtonClickSound();
            handleReminderToggle(event);
        }
    });

    document.body.addEventListener('keyup', (event) => {
        const amountInput = document.getElementById('custom-amount');
        if (amountInput && document.activeElement === amountInput && event.key === 'Enter') {
            event.preventDefault();
            confirmAddWater();
        }
    });
}

function initializeApp() {
    renderDashboard();
    setupEventListeners();
    checkAndUnlockAchievements();
    
    // Se os lembretes já estavam ativados, inicia o serviço ao carregar o app.
    if (getState().settings.reminders && !isIOS && Notification.permission === 'granted') {
        startReminderService();
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => console.log('Service Worker registrado com sucesso:', registration))
            .catch(error => console.log('Falha ao registrar Service Worker:', error));
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);
