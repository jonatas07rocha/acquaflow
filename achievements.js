import { getState, updateState } from './state.js';
import { showAchievementToast } from './ui.js';
import { playAchievementSound } from './audio.js';

// LÓGICA DE VERIFICAÇÃO PARA TODAS AS CONQUISTAS
const achievementChecks = {
    // Volume
    'FIRST_DRINK': (state) => state.dailyUserData.history.length > 0,
    'PERFECT_1000': (state) => state.dailyUserData.currentAmount >= 1000,
    'VOLUME_2L': (state) => state.dailyUserData.currentAmount >= 2000,
    'VOLUME_3L': (state) => state.dailyUserData.currentAmount >= 3000,
    
    // Meta
    'GOAL_REACHED': (state) => state.dailyUserData.currentAmount >= state.settings.dailyGoal,
    'OVERACHIEVER': (state) => state.dailyUserData.currentAmount >= state.settings.dailyGoal * 1.5,
    
    // Frequência e Horário
    'HYDRATION_PRO': (state) => state.dailyUserData.history.length >= 5,
    'MORNING_HYDRATION': (state) => state.dailyUserData.history.some(item => new Date(item.timestamp).getHours() < 12),
    'LATE_NIGHT_HYDRATION': (state) => state.dailyUserData.history.some(item => new Date(item.timestamp).getHours() >= 22),

    // Sequência (Streak)
    'STREAK_3': (state) => state.persistentUserData.consecutiveDays >= 3,
    'STREAK_7': (state) => state.persistentUserData.consecutiveDays >= 7,
    'PERFECT_WEEK': (state) => state.persistentUserData.goalStreak >= 7,

    // Interação
    'THEME_MASTER': () => true, // Desbloqueado diretamente pela ação de mudar tema
    'ORGANIZER': () => true,    // Desbloqueado diretamente pela ação de salvar layout
};

/**
 * Função principal que verifica e desbloqueia conquistas.
 * Pode ser chamada com um ID específico para checar uma única conquista.
 * @param {string|null} specificAchievementId - ID da conquista específica a ser verificada.
 */
export function checkAndUnlockAchievements(specificAchievementId = null) {
    const state = getState();
    let newAchievementsUnlocked = false;

    const achievementsToUpdate = state.persistentUserData.achievements.map(ach => {
        // Se já estiver desbloqueada, não faz nada.
        if (ach.u) return ach;
        
        // Se um ID específico foi passado, verifica apenas ele.
        if (specificAchievementId && ach.id !== specificAchievementId) return ach;

        // Se a lógica de verificação para esta conquista existe...
        if (achievementChecks[ach.id]) {
            // ...executa a verificação.
            const isUnlocked = achievementChecks[ach.id](state);
            
            if (isUnlocked) {
                newAchievementsUnlocked = true;
                showAchievementToast({ ...ach, u: true }); // Mostra o toast com o estado desbloqueado
                return { ...ach, u: true }; // Retorna o objeto da conquista atualizado
            }
        }
        
        return ach; // Retorna a conquista sem alterações
    });

    // Se alguma nova conquista foi desbloqueada, atualiza o estado.
    if (newAchievementsUnlocked) {
        updateState({
            persistentUserData: {
                ...state.persistentUserData,
                achievements: achievementsToUpdate
            }
        });
        
        // Redesenha o widget de conquistas na UI
        const achievementsWidget = document.querySelector('[data-widget-id="achievements"]');
        if (achievementsWidget) {
            const grid = achievementsWidget.querySelector('#achievements-grid');
            if(grid) {
                grid.innerHTML = getState().persistentUserData.achievements.map(ach => `
                    <div class="flex flex-col items-center">
                        <div class="w-12 h-12 rounded-full flex items-center justify-center ${ach.u ? 'bg-amber-500/30' : 'bg-gray-500/20'}">
                            <i data-lucide="${ach.u ? ach.icon : 'lock'}" class="w-6 h-6 ${ach.u ? 'text-amber-300' : 'text-gray-400'}"></i>
                        </div>
                        <span class="text-xs mt-1 opacity-80">${ach.n}</span>
                    </div>
                `).join('');
                lucide.createIcons();
            }
        }
    }
}

/**
 * Função específica para ser chamada quando a meta diária é atingida.
 */
export function onGoalReached() {
    const state = getState();
    const today = new Date().toISOString().slice(0, 10);

    // Evita múltiplos incrementos no mesmo dia
    if (state.persistentUserData.lastGoalDate !== today) {
        const newGoalStreak = (state.persistentUserData.goalStreak || 0) + 1;
        updateState({
            persistentUserData: {
                ...state.persistentUserData,
                goalStreak: newGoalStreak,
                lastGoalDate: today,
            }
        });
        // Após atualizar o streak, verifica se a conquista "Semana Perfeita" foi desbloqueada
        checkAndUnlockAchievements('PERFECT_WEEK');
    }
}
