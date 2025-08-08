import { state } from './state.js';
import { dom } from './ui.js';

let charts = { stats: null };

/**
 * Renderiza toda a interface do aplicativo.
 */
export function renderUI() {
    renderMainContent();
    renderNavigation();
    renderModals();
    collectDOMReferences();
    updateUI();
}

function renderMainContent() {
    const main = document.querySelector('main');
    if (!main) return;
    main.innerHTML = `
        <div class="flex flex-col items-center justify-center text-center w-full my-4">
            <div class="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="12" />
                    <circle id="progress-ring" cx="60" cy="60" r="54" fill="none" stroke="url(#progress-gradient)" stroke-width="12" stroke-linecap="round" style="transition: stroke-dashoffset 0.8s cubic-bezier(0.65, 0, 0.35, 1); filter: drop-shadow(0 0 8px rgba(var(--color-accent-rgb, 52, 211, 153), 0.5));"></circle>
                    <defs>
                        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:var(--color-primary);" />
                            <stop offset="100%" style="stop-color:var(--color-accent);" />
                        </linearGradient>
                    </defs>
                </svg>
                <div class="absolute flex flex-col items-center justify-center text-center">
                    <span id="current-water-display" class="text-5xl font-extrabold" style="color: var(--color-primary);">0</span>
                    <span class="text-lg opacity-80 -mt-1">ml</span>
                    <span id="percentage-display" class="text-sm font-medium" style="color: var(--color-text-muted);">0% da meta</span>
                </div>
            </div>
            <p id="motivational-message" class="text-base opacity-90 mt-4 h-6"></p>
        </div>
        <div class="grid grid-cols-2 gap-4 w-full my-4">
            <div class="glass-effect rounded-2xl p-4 text-center"><h3 class="text-sm opacity-70 mb-1">Meta Diária</h3><p id="goal-card-value" class="font-bold text-2xl">2500 ml</p></div>
            <div class="glass-effect rounded-2xl p-4 text-center"><h3 class="text-sm opacity-70 mb-1">Último Gole</h3><p id="last-drink-card-value" class="font-bold text-xl">--:--</p></div>
        </div>
        <div class="w-full my-4">
            <p class="text-center text-sm opacity-70 mb-3">Adicionar rápido</p>
            <div class="grid grid-cols-3 gap-4">
                <button class="glass-effect rounded-xl p-3 text-center text-lg font-bold hover:bg-white/20 transition-all duration-300 hover:scale-105 quick-add-btn" data-amount="150">150ml</button>
                <button class="glass-effect rounded-xl p-3 text-center text-lg font-bold hover:bg-white/20 transition-all duration-300 hover:scale-105 quick-add-btn" data-amount="250">250ml</button>
                <button class="glass-effect rounded-xl p-3 text-center text-lg font-bold hover:bg-white/20 transition-all duration-300 hover:scale-105 quick-add-btn" data-amount="500">500ml</button>
            </div>
        </div>
    `;
}

function renderNavigation() {
    const nav = document.getElementById('bottom-nav');
    if (!nav) return;
    nav.innerHTML = `
        <button id="stats-nav-btn" class="p-3 rounded-full transition-colors hover:bg-white/10"><i data-lucide="layout-dashboard" class="w-7 h-7"></i></button>
        <button id="add-water-nav-btn" class="w-16 h-16 rounded-full flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform duration-300" style="background: var(--btn-primary-bg); color: var(--btn-primary-text);"><i data-lucide="plus" class="w-8 h-8"></i></button>
        <button id="settings-nav-btn" class="p-3 rounded-full transition-colors hover:bg-white/10"><i data-lucide="settings" class="w-7 h-7"></i></button>
    `;
}

function renderModals() {
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = `
        <div id="add-water-modal" class="modal-container modal-overlay">
            <div class="w-full max-w-xs glass-effect rounded-3xl p-6 text-white flex flex-col items-center relative modal-content">
                <div class="flex justify-between items-center w-full mb-6"><h2 class="text-xl font-bold">Adicionar Água</h2><button id="close-add-modal-btn" class="p-2 rounded-full hover:bg-white/20 transition-colors"><i data-lucide="x" class="w-6 h-6"></i></button></div>
                <div class="grid grid-cols-3 gap-4 w-full mb-6">
                    <button class="glass-effect rounded-xl p-4 text-center text-lg font-medium hover:bg-white/20 transition-colors add-shortcut-btn" data-amount="150">150ml</button>
                    <button class="glass-effect rounded-xl p-4 text-center text-lg font-medium hover:bg-white/20 transition-colors add-shortcut-btn" data-amount="250">250ml</button>
                    <button class="glass-effect rounded-xl p-4 text-center text-lg font-medium hover:bg-white/20 transition-colors add-shortcut-btn" data-amount="500">500ml</button>
                </div>
                <div class="w-full mb-6"><input id="custom-amount-input" type="number" placeholder="Ou digite um valor (ml)" class="glass-effect w-full rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none" /></div>
                <button id="confirm-add-btn" class="w-full rounded-xl py-3 font-bold transition-colors" style="background: var(--btn-primary-bg); color: var(--btn-primary-text);">Adicionar</button>
            </div>
        </div>
        <div id="stats-modal" class="modal-container modal-overlay">
            <div class="w-full max-w-sm h-[80%] max-h-[600px] glass-effect rounded-3xl p-6 text-white flex flex-col relative modal-content">
                <div class="flex justify-between items-center w-full mb-6 flex-shrink-0"><h2 class="text-2xl font-bold">Dashboard</h2><button id="close-stats-modal-btn" class="p-2 rounded-full hover:bg-white/20 transition-colors"><i data-lucide="x" class="w-6 h-6"></i></button></div>
                <div class="flex flex-col gap-6 w-full overflow-y-auto app-container-inner">
                    <div class="glass-effect rounded-2xl p-4"><h3 class="text-lg font-bold mb-3">Consumo diário (ml)</h3><div class="w-full h-40"><canvas id="stats-chart"></canvas></div></div>
                    <div class="glass-effect rounded-2xl p-4"><h3 class="text-lg font-bold mb-3">Sua performance</h3><div class="flex items-center justify-around text-center mt-4"><div><span id="streak-count" class="text-3xl font-bold">0</span><p class="text-sm opacity-70">dias</p></div><div><span id="average-daily" class="text-3xl font-bold">0</span><p class="text-sm opacity-70">ml média</p></div></div></div>
                </div>
            </div>
        </div>
        <div id="settings-modal" class="modal-container modal-overlay">
             <div class="w-full max-w-sm h-[80%] max-h-[600px] glass-effect rounded-3xl p-6 text-white flex flex-col relative modal-content">
                <div class="flex justify-between items-center w-full mb-8 flex-shrink-0"><h2 class="text-2xl font-bold">Configurações</h2><button id="close-settings-modal-btn" class="p-2 rounded-full hover:bg-white/20 transition-colors"><i data-lucide="x" class="w-6 h-6"></i></button></div>
                <div class="flex flex-col gap-6 w-full overflow-y-auto app-container-inner">
                    <div class="glass-effect rounded-2xl p-4"><h3 class="text-lg font-bold mb-3">Ajuste da Meta Diária</h3><input id="manual-goal-input" type="number" class="w-full glass-effect rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none" /><button id="save-manual-goal-btn" class="flex items-center justify-center gap-2 p-3 rounded-xl font-bold transition-colors mt-4 w-full" style="background: var(--btn-primary-bg); color: var(--btn-primary-text);"><i data-lucide="save" class="w-5 h-5"></i><span>Salvar Meta</span></button></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modalContainer);
}

function collectDOMReferences() {
    Object.assign(dom, {
        progressCircle: document.getElementById('progress-ring'), currentWaterDisplay: document.getElementById('current-water-display'), percentageDisplay: document.getElementById('percentage-display'), motivationalMessage: document.getElementById('motivational-message'), goalCardValue: document.getElementById('goal-card-value'), lastDrinkCardValue: document.getElementById('last-drink-card-value'), quickAddButtons: document.querySelectorAll('.quick-add-btn'), headerStreak: document.getElementById('header-streak-count'), statsNavBtn: document.getElementById('stats-nav-btn'), addWaterNavBtn: document.getElementById('add-water-nav-btn'), settingsNavBtn: document.getElementById('settings-nav-btn'), statsModal: document.getElementById('stats-modal'), addWaterModal: document.getElementById('add-water-modal'), settingsModal: document.getElementById('settings-modal'), closeStatsModalBtn: document.getElementById('close-stats-modal-btn'), closeAddModalBtn: document.getElementById('close-add-modal-btn'), closeSettingsModalBtn: document.getElementById('close-settings-modal-btn'), streakCountDisplay: document.getElementById('streak-count'), averageDailyDisplay: document.getElementById('average-daily'), addShortcutButtons: document.querySelectorAll('.add-shortcut-btn'), customAmountInput: document.getElementById('custom-amount-input'), confirmAddBtn: document.getElementById('confirm-add-btn'), manualGoalInput: document.getElementById('manual-goal-input'), saveManualGoalBtn: document.getElementById('save-manual-goal-btn'),
    });
}

export function updateUI() {
    if (!dom.progressCircle) return;
    const radius = dom.progressCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    dom.progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    let progress = state.currentWater / state.goalWater;
    progress = isNaN(progress) || !isFinite(progress) ? 0 : progress;
    const offset = circumference - Math.min(progress, 1) * circumference;
    dom.progressCircle.style.strokeDashoffset = offset;
    dom.currentWaterDisplay.textContent = state.currentWater;
    dom.percentageDisplay.textContent = `${Math.floor(progress * 100)}% da meta`;
    dom.motivationalMessage.textContent = progress >= 1 ? "Parabéns, meta atingida! 🎉" : progress > 0.7 ? "Você está quase lá!" : progress > 0 ? "Continue assim!" : "Vamos começar a hidratar?";
    dom.headerStreak.textContent = state.streakCount;
    dom.goalCardValue.textContent = `${state.goalWater} ml`;
    dom.lastDrinkCardValue.textContent = (state.lastDrinkTime && state.lastDrinkAmount > 0) ? `${state.lastDrinkAmount}ml às ${state.lastDrinkTime}` : "--:--";
    if (dom.streakCountDisplay) dom.streakCountDisplay.textContent = state.streakCount;
    if (dom.averageDailyDisplay) {
        const dailyAverage = state.waterHistory.reduce((a, b) => a + b, 0) / state.waterHistory.length;
        dom.averageDailyDisplay.textContent = Math.round(dailyAverage) || 0;
    }
    if (dom.manualGoalInput) dom.manualGoalInput.value = state.goalWater;
    updateCharts();
}

function updateCharts() {
    if (charts.stats) {
        charts.stats.data.datasets[0].data = state.waterHistory;
        charts.stats.data.datasets[1].data = Array(7).fill(state.goalWater);
        charts.stats.update();
    }
}

export function showModal(modalElement) {
    if (modalElement) {
        modalElement.classList.add('is-visible');
        if (modalElement.id === 'stats-modal' && !charts.stats) {
            initializeStatsChart();
        }
        updateUI();
    }
}

export function hideModal(modalElement) {
    if (modalElement) modalElement.classList.remove('is-visible');
}

function initializeStatsChart() {
    const ctx = document.getElementById('stats-chart').getContext('2d');
    charts.stats = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['D', 'S', 'T', 'Q', 'Q', 'S', 'Hoje'],
            datasets: [{
                label: 'Consumo (ml)',
                data: state.waterHistory,
                backgroundColor: 'var(--color-accent)',
                borderColor: 'var(--color-primary)',
                borderWidth: 1,
                borderRadius: 8,
            }, {
                label: 'Meta',
                data: Array(7).fill(state.goalWater),
                type: 'line',
                borderColor: 'var(--color-text-muted)',
                borderWidth: 2,
                pointRadius: 0,
                fill: false,
                borderDash: [5, 5],
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
            scales: { x: { grid: { display: false }, ticks: { color: 'white' } }, y: { beginAtZero: true, grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: 'white' } } }
        }
    });
}

