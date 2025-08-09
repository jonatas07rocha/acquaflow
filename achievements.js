import { getState, updateState } from './state.js';
import { showAchievementToast } from './ui.js';
import { playAchievementSound } from './audio.js'; // Importa o som

// Objeto que contém as regras de verificação para cada conquista.
const achievementChecks = {
    'FIRST_DRINK': (state) => state.dailyUserData.history.length > 0,
    'MORNING_HYDRATION': (state) => state.dailyUserData.history.some(item => new Date(item.timestamp).getHours() < 12),
    'GOAL_REACHED': (state) => state.dailyUserData.currentAmount >= state.settings.dailyGoal,
    'OVERACHIEVER': (state) => state.dailyUserData.currentAmount >= state.settings.dailyGoal * 1.5,
    'LATE_NIGHT_HYDRATION': (state) => state.dailyUserData.history.some(item => new Date(item.timestamp).getHours() >= 22),
    'PERFECT_1000': (state) => state.dailyUserData.currentAmount >= 1000,
};

/**
 * Verifica todas as conquistas e desbloqueia as que tiveram suas condições atendidas.
 */
export function checkAndUnlockAchievements() {
    const state = getState();
    let newAchievementsUnlocked = false;

    const updatedAchievements = state.persistentUserData.achievements.map(ach => {
        if (ach.u) return ach;

        if (achievementChecks[ach.id]) {
            const isUnlocked = achievementChecks[ach.id](state);
            
            if (isUnlocked) {
                newAchievementsUnlocked = true;
                console.log(`Conquista desbloqueada: ${ach.n}`);
                showAchievementToast(ach);
                playAchievementSound(); // TOCA O SOM DE CONQUISTA
                return { ...ach, u: true };
            }
        }
        
        return ach;
    });

    if (newAchievementsUnlocked) {
        updateState({
            persistentUserData: {
                achievements: updatedAchievements
            }
        });
        
        // Atualiza a UI do widget de conquistas
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

