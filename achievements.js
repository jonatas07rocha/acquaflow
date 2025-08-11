// jonatas07rocha/acquaflow/acquaflow-4adf3ba6a047c14f9c16629e39fadb26cd705eb7/achievements.js

import { getState, updateState } from './state.js';
import { showAchievementToast } from './ui.js';

// LÓGICA DE VERIFICAÇÃO AJUSTADA PARA A LISTA FINAL DE CONQUISTAS
const achievementChecks = {
    'FIRST_DRINK': (state) => state.dailyUserData.history.length > 0,
    'PERFECT_1000': (state) => state.dailyUserData.currentAmount >= 1000,
    'VOLUME_2L': (state) => state.dailyUserData.currentAmount >= 2000,
    'VOLUME_3L': (state) => state.dailyUserData.currentAmount >= 3000,
    'GOAL_REACHED': (state) => state.dailyUserData.currentAmount >= state.settings.dailyGoal,
    'OVERACHIEVER': (state) => state.dailyUserData.currentAmount >= state.settings.dailyGoal * 1.5,
    'HYDRATION_PRO': (state) => state.dailyUserData.history.length >= 5,
    'MORNING_HYDRATION': (state) => state.dailyUserData.history.some(item => new Date(item.timestamp).getHours() < 12),
    'LATE_NIGHT_HYDRATION': (state) => state.dailyUserData.history.some(item => new Date(item.timestamp).getHours() >= 22),
    'STREAK_3': (state) => state.persistentUserData.consecutiveDays >= 3,
    'THEME_MASTER': () => true, // Desbloqueado por ação direta do usuário
    'ORGANIZER': () => true,    // Desbloqueado por ação direta do usuário
};

/**
 * Verifica e desbloqueia conquistas.
 * Se um ID específico for passado, verifica apenas essa conquista (usado para ações diretas).
 * Se nenhum ID for passado, verifica todas as conquistas relacionadas à hidratação.
 * @param {string|null} specificAchievementId - O ID da conquista a ser verificada.
 */
export function checkAndUnlockAchievements(specificAchievementId = null) {
    const state = getState();
    let newAchievementsUnlocked = false;

    const achievementsToUpdate = state.persistentUserData.achievements.map(ach => {
        if (ach.u) return ach;
        
        if (specificAchievementId && ach.id !== specificAchievementId) return ach;

        if (achievementChecks[ach.id]) {
            const isUnlocked = achievementChecks[ach.id](state);
            
            if (isUnlocked) {
                newAchievementsUnlocked = true;
                showAchievementToast({ ...ach, u: true });
                return { ...ach, u: true };
            }
        }
        
        return ach;
    });

    if (newAchievementsUnlocked) {
        updateState({
            persistentUserData: {
                ...state.persistentUserData,
                achievements: achievementsToUpdate
            }
        });
        
        // Redesenha o widget de conquistas para refletir o novo estado
        const achievementsWidget = document.querySelector('[data-widget-id="achievements"]');
        if (achievementsWidget) {
            const grid = achievementsWidget.querySelector('#achievements-grid');
            if(grid) {
                grid.innerHTML = getState().persistentUserData.achievements.map(ach => `
                    <div data-action="showAchievementInfo" data-id="${ach.id}" class="flex flex-col items-center cursor-pointer group">
                        <div class="w-12 h-12 rounded-full flex items-center justify-center ${ach.u ? 'bg-amber-500/30' : 'bg-gray-500/20'} pointer-events-none transition-transform group-hover:scale-110">
                            <i data-lucide="${ach.u ? ach.icon : 'lock'}" class="w-6 h-6 ${ach.u ? 'text-amber-300' : 'text-gray-400'}"></i>
                        </div>
                        <span class="text-xs mt-1 opacity-80 pointer-events-none">${ach.n}</span>
                    </div>
                `).join('');
                lucide.createIcons();
            }
        }
    }
}
