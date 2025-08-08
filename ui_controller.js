import { state } from './state.js';
import { dom } from './ui.js';

/**
 * Renderiza toda a interface principal do aplicativo.
 */
export function renderUI() {
    renderMainContent();
    renderModals();
    collectDOMReferences();
    updateUI();
}

/**
 * Cria e injeta o conteúdo principal (círculo, cards, etc.) na tag <main>.
 */
function renderMainContent() {
    const main = document.querySelector('main');
    if (!main) return;

    main.innerHTML = `
        <!-- Círculo de Progresso -->
        <div id="dashboard-container" class="flex flex-col items-center justify-center text-center animate-fade-in w-full my-4">
            <div id="progress-circle-container" class="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255, 255, 255, 0.1)" stroke-width="12" />
                    <circle id="progress-ring" cx="60" cy="60" r="54" fill="none" stroke="url(#progress-gradient)" stroke-width="12" stroke-linecap="round" style="transition: stroke-dashoffset 0.8s cubic-bezier(0.65, 0, 0.35, 1); filter: drop-shadow(0 0 5px rgba(255,255,255,0.5));"></circle>
                    <defs>
                        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:var(--color-primary);stop-opacity:1" />
                            <stop offset="100%" style="stop-color:var(--color-accent);stop-opacity:1" />
                        </linearGradient>
                    </defs>
                </svg>
                <div id="progress-text" class="absolute flex flex-col items-center justify-center text-center">
                    <span id="current-water-display" class="text-5xl font-extrabold">0</span>
                    <span class="text-lg opacity-80 -mt-1">ml</span>
                    <span id="percentage-display" class="text-sm font-medium opacity-60 mt-1">0% da meta</span>
                </div>
            </div>
            <p id="motivational-message" class="text-base opacity-90 mt-4 h-6"></p>
        </div>

        <!-- Cards de Informação Rápida -->
        <div class="grid grid-cols-2 gap-4 w-full animate-fade-in my-4" style="animation-delay: 0.2s;">
            <div class="glass-effect rounded-2xl p-4 text-center">
                <h3 class="text-sm opacity-70 mb-1">Meta Diária</h3>
                <p id="goal-card-value" class="font-bold text-2xl">2500 ml</p>
            </div>
            <div class="glass-effect rounded-2xl p-4 text-center">
                <h3 class="text-sm opacity-70 mb-1">Último Gole</h3>
                <p id="last-drink-card-value" class="font-bold text-xl">--:--</p>
            </div>
        </div>

        <!-- Atalhos Rápidos para Adicionar Água -->
        <div class="w-full animate-fade-in my-4" style="animation-delay: 0.4s;">
            <p class="text-center text-sm opacity-70 mb-3">Adicionar rápido</p>
            <div class="grid grid-cols-3 gap-4">
                <button class="glass-effect rounded-xl p-3 text-center text-lg font-bold hover:bg-white/20 transition-all duration-300 hover:scale-105 quick-add-btn" data-amount="150">150ml</button>
                <button class="glass-effect rounded-xl p-3 text-center text-lg font-bold hover:bg-white/20 transition-all duration-300 hover:scale-105 quick-add-btn" data-amount="250">250ml</button>
                <button class="glass-effect rounded-xl p-3 text-center text-lg font-bold hover:bg-white/20 transition-all duration-300 hover:scale-105 quick-add-btn" data-amount="500">500ml</button>
            </div>
        </div>
    `;
}

/**
 * Cria e injeta os modais no corpo do documento.
 */
function renderModals() {
    // Implementação futura para criar os modais dinamicamente
}

/**
 * Coleta as referências dos elementos do DOM recém-criados.
 */
function collectDOMReferences() {
    dom.progressCircle = document.getElementById('progress-ring');
    dom.currentWaterDisplay = document.getElementById('current-water-display');
    dom.percentageDisplay = document.getElementById('percentage-display');
    dom.motivationalMessage = document.getElementById('motivational-message');
    dom.goalCardValue = document.getElementById('goal-card-value');
    dom.lastDrinkCardValue = document.getElementById('last-drink-card-value');
    dom.quickAddButtons = document.querySelectorAll('.quick-add-btn');
}

/**
 * Atualiza todas as partes dinâmicas da UI com base no estado atual.
 */
export function updateUI() {
    if (!dom.progressCircle) return;

    const radius = dom.progressCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    dom.progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;

    let progress = state.currentWater / state.goalWater;
    if (isNaN(progress) || !isFinite(progress)) progress = 0;
    
    const visualProgress = Math.min(progress, 1);
    const offset = circumference - visualProgress * circumference;
    dom.progressCircle.style.strokeDashoffset = offset;

    dom.currentWaterDisplay.textContent = state.currentWater;
    
    const percentage = Math.floor(progress * 100);
    dom.percentageDisplay.textContent = `${isNaN(percentage) ? 0 : percentage}% da meta`;

    // Atualiza a mensagem motivacional
    if (progress >= 1) {
        dom.motivationalMessage.textContent = "Parabéns, meta atingida! 🎉";
    } else if (progress > 0.7) {
        dom.motivationalMessage.textContent = "Você está quase lá!";
    } else if (progress > 0) {
        dom.motivationalMessage.textContent = "Continue assim!";
    } else {
        dom.motivationalMessage.textContent = "Vamos começar a hidratar?";
    }

    // Atualiza outros elementos
    document.getElementById('header-streak-count').textContent = state.streakCount;
    dom.goalCardValue.textContent = `${state.goalWater} ml`;
    if(state.lastDrinkTime && state.lastDrinkAmount > 0) {
        dom.lastDrinkCardValue.textContent = `${state.lastDrinkAmount}ml às ${state.lastDrinkTime}`;
    } else {
        dom.lastDrinkCardValue.textContent = "--:--";
    }
}