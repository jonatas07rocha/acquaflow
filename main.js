import { getState, updateState, resetState } from './state.js';
import { renderDashboard, showAddWaterModal, showSettingsModal, showCalendarReminderModal, showResetConfirmationModal, enterReorderMode, saveLayout, applyTheme, updateDynamicContent, closeAllModals } from './ui.js';
import { checkAndUnlockAchievements } from './achievements.js';
import { playAddWaterSound, playButtonClickSound } from './audio.js';
import { createHourlyReminder } from './calendar.js';

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
            ...state.persistentUserData,
            weeklyProgress: newWeeklyProgress
        }
    });
    
    updateDynamicContent();
    checkAndUnlockAchievements();
}

function handleReminderToggle(event) {
    const isEnabled = event.target.checked;
    updateState({ settings: { reminders: isEnabled } });

    if (!isEnabled) return;

    if (isIOS) {
        showCalendarReminderModal();
    } else {
        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission !== 'granted') {
                    event.target.checked = false;
                    updateState({ settings: { reminders: false } });
                }
            });
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
        const actionsWithSound = ['showSettings', 'saveLayout', 'showAddWater', 'addCustomWater', 'closeModal', 'enterReorderMode', 'saveSettings', 'selectTheme', 'createCalendarReminder', 'showResetConfirmation', 'confirmReset'];
        if (actionsWithSound.includes(action)) {
            playButtonClickSound();
        }

        switch(action) {
            case 'showSettings': showSettingsModal(); break;
            case 'saveLayout': saveLayout(); break;
            case 'showAddWater': showAddWaterModal(); break;
            case 'addCustomWater': confirmAddWater(); break;
            case 'closeModal': closeAllModals(); break;
            case 'enterReorderMode': enterReorderMode(); break;
            case 'createCalendarReminder':
                createHourlyReminder();
                closeAllModals();
                break;
            case 'showResetConfirmation':
                showResetConfirmationModal();
                break;
            case 'confirmReset':
                resetState();
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
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => console.log('Service Worker registrado com sucesso:', registration))
            .catch(error => console.log('Falha ao registrar Service Worker:', error));
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);
