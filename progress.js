/**
 * progress.js
 * * Módulo dedicado para lidar com os cálculos de progresso da aplicação.
 */

/**
 * Atualiza o array de progresso semanal com base na nova quantidade de água diária.
 * @param {object} state - O objeto de estado atual da aplicação.
 * @param {number} newDailyAmount - A nova quantidade total de água consumida no dia (em ml).
 * @returns {Array} O novo array de progresso semanal atualizado.
 */
export function updateWeeklyProgress(state, newDailyAmount) {
    const now = new Date();
    
    // Converte o dia da semana para o nosso índice (Segunda = 0, ..., Domingo = 6)
    const dayOfWeek = now.getDay();
    const dayIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;

    // Calcula a porcentagem da meta diária, com um teto de 100%
    const dailyPercentage = Math.min(
        Math.round((newDailyAmount / state.settings.dailyGoal) * 100),
        100
    );

    // Cria uma cópia do array de progresso para garantir a imutabilidade do estado
    const newWeeklyProgress = [...state.persistentUserData.weeklyProgress];
    
    // Atualiza a porcentagem do dia atual
    if (newWeeklyProgress[dayIndex]) {
        newWeeklyProgress[dayIndex].p = dailyPercentage;
    }

    return newWeeklyProgress;
}
