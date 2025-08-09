import { getState, updateState } from './state.js';
import { showAchievementToast } from './ui.js';

// Objeto que contém as regras de verificação para cada conquista.
const achievementChecks = {
    'FIRST_DRINK': (state) => state.dailyUserData.history.length > 0,
    
    'MORNING_HYDRATION': (state) => 
        state.dailyUserData.history.some(item => new Date(item.timestamp).getHours() < 12),

    'GOAL_REACHED': (state) => state.dailyUserData.currentAmount >= state.settings.dailyGoal,

    'OVERACHIEVER': (state) => state.dailyUserData.currentAmount >= state.settings.dailyGoal * 1.5,

    'LATE_NIGHT_HYDRATION': (state) =>
        state.dailyUserData.history.some(item => new Date(item.timestamp).getHours() >= 22),
    
    'PERFECT_1000': (state) => state.dailyUserData.currentAmount >= 1000,
};

/**
 * Verifica todas as conquistas e desbloqueia as que tiveram suas condições atendidas.
 */
export function checkAndUnlockAchievements() {
    const state = getState();
    let newAchievementsUnlocked = false;

    const updatedAchievements = state.persistentUserData.achievements.map(ach => {
        // Se a conquista já foi desbloqueada, não faz nada.
        if (ach.u) {
            return ach;
        }

        // Se existe uma regra de verificação para esta conquista...
        if (achievementChecks[ach.id]) {
            const isUnlocked = achievementChecks[ach.id](state);
            
            // Se a condição foi atendida...
            if (isUnlocked) {
                newAchievementsUnlocked = true;
                console.log(`Conquista desbloqueada: ${ach.n}`);
                showAchievementToast(ach); // Mostra a notificação na tela
                return { ...ach, u: true }; // Retorna a conquista com o status atualizado
            }
        }
        
        return ach; // Retorna a conquista sem alterações
    });

    // Se alguma nova conquista foi desbloqueada, atualiza o estado global.
    if (newAchievementsUnlocked) {
        updateState({
            persistentUserData: {
                achievements: updatedAchievements
            }
        });
        // Re-renderiza o widget de conquistas para refletir a mudança
        const achievementsWidget = document.querySelector('[data-widget-id="achievements"]');
        if (achievementsWidget) {
            // Esta é uma forma simples de atualizar. O ideal seria ter uma função de re-renderização.
            // Por enquanto, vamos apenas atualizar os ícones.
            const state = getState();
            const grid = achievementsWidget.querySelector('#achievements-grid');
            if(grid) {
                grid.innerHTML = state.persistentUserData.achievements.map(ach => `
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

