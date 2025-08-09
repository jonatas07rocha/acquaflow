import { themes } from './themes.js';
import { getState, updateState } from './state.js';
import { playAchievementSound } from './audio.js';
import { tips } from './tips.js';

let sortableInstance = null;

function getDailyTip() {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now - startOfYear;
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const tipIndex = dayOfYear % tips.length;
    return tips[tipIndex];
}

const widgetTemplates = {
    progress: (state) => `<section data-widget-id="progress" class="widget glass-panel rounded-3xl p-6 my-4 flex flex-col items-center animate-on-scroll"><i data-lucide="grip-vertical" class="drag-handle"></i><div class="relative w-56 h-56"><svg class="w-full h-full" viewBox="0 0 120 120"><circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255, 255, 255, 0.15)" stroke-width="12"/><circle id="progress-circle" class="progress-ring__circle" cx="60" cy="60" r="54" fill="none" stroke-width="12" stroke-linecap="round"/></svg><div class="absolute inset-0 flex flex-col items-center justify-center text-center"><div id="current-amount-text" class="text-5xl font-bold">${state.dailyUserData.currentAmount}</div><div class="text-lg font-light -mt-1">ml</div><div id="percentage-text" class="text-sm opacity-80 mt-2">${Math.round((state.dailyUserData.currentAmount / state.settings.dailyGoal) * 100)}%</div></div></div><button data-action="showAddWater" class="main-add-button text-white font-bold py-4 w-full mt-6 rounded-full flex items-center justify-center mx-auto"><i data-lucide="droplet" class="w-5 h-5 mr-2"></i>Adicionar Água</button></section>`,
    stats: (state) => `<div data-widget-id="stats" class="widget grid grid-cols-2 gap-4 mb-4 animate-on-scroll"><i data-lucide="grip-vertical" class="drag-handle"></i><div class="glass-panel rounded-2xl p-4 flex items-center"><div class="p-3 rounded-full mr-4 bg-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]"><i data-lucide="target" class="w-5 h-5 text-[var(--color-accent-light)]"></i></div><div><div class="text-xs opacity-70">Meta Diária</div><div id="goal-text" class="text-lg font-semibold">${state.settings.dailyGoal} ml</div></div></div><div class="glass-panel rounded-2xl p-4 flex items-center"><div class="p-3 rounded-full mr-4 bg-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]"><i data-lucide="hourglass" class="w-5 h-5 text-[var(--color-accent-light)]"></i></div><div><div class="text-xs opacity-70">Restante</div><div id="remaining-text" class="text-lg font-semibold">${Math.max(0, state.settings.dailyGoal - state.dailyUserData.currentAmount)} ml</div></div></div></div>`,
    history: (state) => `<section data-widget-id="history" class="widget glass-panel rounded-2xl p-4 mb-4 animate-on-scroll relative"><i data-lucide="grip-vertical" class="drag-handle"></i><div class="flex items-center mb-3"><div class="p-2 rounded-full mr-3 bg-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]"><i data-lucide="history" class="w-4 h-4 text-[var(--color-accent-light)]"></i></div><h2 class="font-semibold">Histórico do Dia</h2></div><div id="history-list" class="space-y-2 max-h-40 overflow-y-auto pr-2">${state.dailyUserData.history.map(item => `<div class="glass-panel rounded-lg p-3 flex justify-between items-center text-sm hover:bg-white/20"><div class="flex items-center"><i data-lucide="droplet" class="w-4 h-4 mr-3 text-[var(--color-accent-light)]"></i><span class="font-semibold">+ ${item.amount} ml</span></div><span class="text-xs opacity-70">${item.time}</span></div>`).join('') || '<p class="text-sm text-center opacity-60 py-4">Nenhum registo hoje.</p>'}</div></section>`,
    // --- TEMPLATE DO WIDGET SEMANAL RESTAURADO ---
    weekly: (state) => `<section data-widget-id="weekly" class="widget glass-panel rounded-2xl p-4 mb-4 animate-on-scroll relative"><i data-lucide="grip-vertical" class="drag-handle"></i><div class="flex items-center mb-4"><div class="p-2 rounded-full mr-3 bg-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]"><i data-lucide="bar-chart-2" class="w-4 h-4 text-[var(--color-accent-light)]"></i></div><h2 class="font-semibold">Progresso Semanal</h2></div><div id="weekly-chart" class="flex justify-between items-end h-32 px-2">${state.persistentUserData.weeklyProgress.map(day => `<div class="flex flex-col items-center w-8"><div class="w-full h-full flex items-end"><div class="chart-bar-fill w-full rounded-t-sm" style="height: ${day.p}%"></div></div><span class="text-xs opacity-70 mt-1">${day.day}</span></div>`).join('')}</div></section>`,
    achievements: (state) => `<section data-widget-id="achievements" class="widget glass-panel rounded-2xl p-4 mb-4 animate-on-scroll relative"><i data-lucide="grip-vertical" class="drag-handle"></i><div class="flex items-center mb-4"><div class="p-2 rounded-full mr-3 bg-amber-500/30"><i data-lucide="award" class="w-4 h-4 text-amber-300"></i></div><h2 class="font-semibold">Conquistas</h2></div><div id="achievements-grid" class="grid grid-cols-4 gap-4 text-center">${state.persistentUserData.achievements.map(ach => `<div class="flex flex-col items-center"><div class="w-12 h-12 rounded-full flex items-center justify-center ${ach.u ? 'bg-amber-500/30' : 'bg-gray-500/20'}"><i data-lucide="${ach.u ? ach.icon : 'lock'}" class="w-6 h-6 ${ach.u ? 'text-amber-300' : 'text-gray-400'}"></i></div><span class="text-xs mt-1 opacity-80">${ach.n}</span></div>`).join('')}</div></section>`,
    tip: () => `<section data-widget-id="tip" class="widget glass-panel rounded-2xl p-4 mb-4 animate-on-scroll relative"><i data-lucide="grip-vertical" class="drag-handle"></i><div class="flex items-center mb-2"><div class="p-2 rounded-full mr-3 bg-lime-500/30"><i data-lucide="lightbulb" class="w-4 h-4 text-lime-300"></i></div><h2 class="font-semibold">Dica do Dia</h2></div><p class="text-sm opacity-80">${getDailyTip()}</p></section>`
};

const modalTemplates = {
    addWater: () => `<div id="add-water-modal" class="modal-container fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"><div class="glass-panel p-6 rounded-2xl shadow-xl w-11/12 max-w-xs text-center"><h2 class="text-xl font-bold mb-4">Adicionar Água</h2><p class="text-sm opacity-80 mb-4">Digite a quantidade em ml.</p><input type="number" id="custom-amount" class="w-full border-2 border-white/20 bg-white/10 rounded-lg p-3 text-center text-2xl text-white" placeholder="250"><div class="flex gap-3 mt-6"><button data-action="closeModal" class="w-full bg-white/10 font-semibold py-3 rounded-lg hover:bg-white/20 transition-colors">Cancelar</button><button data-action="addCustomWater" class="w-full main-add-button text-white font-bold py-3 rounded-lg">Confirmar</button></div></div></div>`,
    settings: (state) => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const reminderText = isIOS ? 'No iOS, os lembretes são criados no seu Calendário.' : 'Receber notificações para beber água.';
        return `<div id="settings-modal" class="modal-container fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"><div class="glass-panel p-6 rounded-2xl shadow-xl w-11/12 max-w-sm text-left"><div class="flex justify-between items-center mb-6"><h2 class="text-xl font-bold">Configurações</h2><button data-action="closeModal" class="p-1 rounded-full hover:bg-white/20"><i data-lucide="x" class="w-5 h-5"></i></button></div><div class="space-y-6"><div><button data-action="enterReorderMode" class="w-full bg-white/10 font-semibold py-3 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center"><i data-lucide="move" class="w-4 h-4 mr-2"></i>Reorganizar Widgets</button></div><div class="flex justify-between items-center"><div><label for="goal-input" class="font-semibold">Meta Diária (ml)</label><p class="text-xs opacity-70">Defina o seu objetivo de hidratação.</p></div><input type="number" id="goal-input" class="w-24 bg-white/10 border-2 border-white/20 rounded-lg p-2 text-center" value="${state.settings.dailyGoal}"></div><div class="flex justify-between items-center"><div><h3 class="font-semibold">Lembretes</h3><p class="text-xs opacity-70">${reminderText}</p></div><label class="switch"><input type="checkbox" id="reminders-toggle" ${state.settings.reminders ? 'checked' : ''}><span class="slider"></span></label></div><div><h3 class="font-semibold mb-2">Tema</h3><div class="flex gap-4">${Object.keys(themes).map(key => `<div data-action="selectTheme" data-theme="${key}" class="theme-selector-item cursor-pointer"><div class="w-10 h-10 rounded-full border-2 ${state.settings.theme === key ? 'border-white' : 'border-transparent'}" style="background: linear-gradient(135deg, ${themes[key].gradientFrom}, ${themes[key].gradientTo});"></div><p class="text-xs text-center mt-1 pointer-events-none">${themes[key].name}</p></div>`).join('')}</div></div></div><button data-action="saveSettings" class="w-full main-add-button text-white font-bold py-3 mt-8 rounded-lg">Salvar e Fechar</button></div></div>`;
    },
    calendarReminder: () => `<div id="calendar-modal" class="modal-container fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"><div class="glass-panel p-6 rounded-2xl shadow-xl w-11/12 max-w-xs text-center"><h2 class="text-xl font-bold mb-4">Lembretes no Calendário</h2><p class="text-sm opacity-80 mb-6">Para garantir os lembretes no seu iPhone, criaremos um evento no seu calendário que o notificará a cada hora. Deseja fazer isso agora?</p><div class="flex gap-3 mt-6"><button data-action="closeModal" class="w-full bg-white/10 font-semibold py-3 rounded-lg hover:bg-white/20 transition-colors">Agora Não</button><button data-action="createCalendarReminder" class="w-full main-add-button text-white font-bold py-3 rounded-lg">Sim, Criar</button></div></div></div>`,
    info: (title, message) => `<div id="info-modal" class="modal-container fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50"><div class="glass-panel p-6 rounded-2xl shadow-xl w-11/12 max-w-xs text-center"><h2 class="text-xl font-bold mb-4">${title}</h2><p class="text-sm opacity-80 mb-6">${message}</p><button data-action="closeModal" class="w-full main-add-button text-white font-bold py-3 rounded-lg">Fechar</button></div></div>`
};

export function renderDashboard() {
    const state = getState();
    const container = document.getElementById('widget-container');
    const header = document.getElementById('date-header');
    if (!container || !header) return;
    container.innerHTML = '';
    const today = new Date();
    header.textContent = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    applyTheme(state.settings.theme);
    state.settings.widgetOrder.forEach(widgetId => {
        if (widgetTemplates[widgetId]) {
            container.innerHTML += widgetTemplates[widgetId](state);
        }
    });
    updateProgressCircle();
    lucide.createIcons();
    setupScrollAnimations();
}

function updateProgressCircle() {
    const state = getState();
    const progressCircle = document.getElementById('progress-circle');
    if (!progressCircle) return;
    const radius = progressCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    const percentage = Math.min((state.dailyUserData.currentAmount / state.settings.dailyGoal) * 100, 100);
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = circumference - (percentage / 100) * circumference;
}

export function updateDynamicContent() {
    const state = getState();
    const currentAmountText = document.getElementById('current-amount-text');
    if (currentAmountText) currentAmountText.textContent = state.dailyUserData.currentAmount;
    const percentageText = document.getElementById('percentage-text');
    if (percentageText) percentageText.textContent = `${Math.round((state.dailyUserData.currentAmount / state.settings.dailyGoal) * 100)}%`;
    updateProgressCircle();
    const remainingText = document.getElementById('remaining-text');
    if (remainingText) remainingText.textContent = `${Math.max(0, state.settings.dailyGoal - state.dailyUserData.currentAmount)} ml`;
    const historyList = document.getElementById('history-list');
    if (historyList) {
        historyList.innerHTML = state.dailyUserData.history.map(item => `<div class="glass-panel rounded-lg p-3 flex justify-between items-center text-sm hover:bg-white/20"><div class="flex items-center"><i data-lucide="droplet" class="w-4 h-4 mr-3 text-[var(--color-accent-light)]"></i><span class="font-semibold">+ ${item.amount} ml</span></div><span class="text-xs opacity-70">${item.time}</span></div>`).join('') || '<p class="text-sm text-center opacity-60 py-4">Nenhum registo hoje.</p>';
        lucide.createIcons();
    }

    // --- LÓGICA DE ATUALIZAÇÃO DO GRÁFICO RESTAURADA ---
    const weeklyChart = document.getElementById('weekly-chart');
    if (weeklyChart) {
        state.persistentUserData.weeklyProgress.forEach((day, index) => {
            const dayBar = weeklyChart.children[index]?.querySelector('.chart-bar-fill');
            if (dayBar) {
                dayBar.style.height = `${day.p}%`;
            }
        });
    }
}

export function applyTheme(themeName) {
    const theme = themes[themeName] || themes.teal;
    const root = document.documentElement;
    Object.keys(theme).forEach(key => {
        if (key !== 'name') {
            const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVar, theme[key]);
        }
    });
}

export function showAddWaterModal() { closeAllModals(); document.body.insertAdjacentHTML('beforeend', modalTemplates.addWater()); lucide.createIcons(); }
export function showSettingsModal() { closeAllModals(); const state = getState(); document.body.insertAdjacentHTML('beforeend', modalTemplates.settings(state)); lucide.createIcons(); }
export function showCalendarReminderModal() { closeAllModals(); document.body.insertAdjacentHTML('beforeend', modalTemplates.calendarReminder()); lucide.createIcons(); }
export function showInfoModal(title, message) { closeAllModals(); document.body.insertAdjacentHTML('beforeend', modalTemplates.info(title, message)); lucide.createIcons(); }
export function closeAllModals() { document.querySelectorAll('.modal-container').forEach(modal => modal.remove()); }

export function enterReorderMode() {
    closeAllModals();
    document.body.classList.add('reorder-mode');
    document.getElementById('reorder-button-container').classList.remove('hidden');
    document.getElementById('settings-button').classList.add('hidden');
    const container = document.getElementById('widget-container');
    if (sortableInstance) sortableInstance.destroy();
    sortableInstance = new Sortable(container, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        handle: '.drag-handle',
    });
}

export function saveLayout() {
    const container = document.getElementById('widget-container');
    const newOrder = [...container.children].map(el => el.dataset.widgetId);
    updateState({ settings: { widgetOrder: newOrder } });
    document.body.classList.remove('reorder-mode');
    document.getElementById('reorder-button-container').classList.add('hidden');
    document.getElementById('settings-button').classList.remove('hidden');
    if (sortableInstance) {
        sortableInstance.destroy();
        sortableInstance = null;
    }
    renderDashboard();
}

function setupScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    animatedElements.forEach(el => observer.observe(el));
}

export function showAchievementToast(achievement) {
    const toastId = `toast-${Date.now()}`;
    const toastHTML = `<div id="${toastId}" class="achievement-toast fixed bottom-5 right-5 bg-amber-500 text-black p-4 rounded-xl shadow-lg flex items-center max-w-xs z-50"><i data-lucide="${achievement.icon}" class="w-6 h-6 mr-4"></i><div><p class="font-bold">Conquista Desbloqueada!</p><p class="text-sm">${achievement.n}</p></div></div>`;
    document.body.insertAdjacentHTML('beforeend', toastHTML);
    lucide.createIcons();
    playAchievementSound();
    const toastElement = document.getElementById(toastId);
    setTimeout(() => {
        toastElement.style.animation = 'fadeOutRight 0.5s ease forwards';
        setTimeout(() => toastElement.remove(), 500);
    }, 5000);
}



