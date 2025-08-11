/**
 * progress.js
 * Módulo dedicado para lidar com os cálculos de progresso da aplicação.
 */

/**
 * Atualiza o array de progresso semanal com base na nova quantidade de água diária.
 * @param {object} state - O objeto de estado atual da aplicação.
 * @param {number} newDailyAmount - A nova quantidade total de água consumida no dia (em ml).
 * @returns {Array} O novo array de progresso semanal atualizado.
 */
export function updateWeeklyProgress(state, newDailyAmount) {
    console.group("📊 Calculando Progresso Semanal");
    console.log(`Total diário para cálculo: ${newDailyAmount}ml`);
    console.log(`Meta diária: ${state.settings.dailyGoal}ml`);
    
    const now = new Date();
    const dayOfWeek = now.getDay();
    const dayIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;

    const dailyPercentage = Math.min(
        Math.round((newDailyAmount / state.settings.dailyGoal) * 100),
        100
    );

    const newWeeklyProgress = [...state.persistentUserData.weeklyProgress];
    
    if (newWeeklyProgress[dayIndex]) {
        console.log(`Índice do dia da semana: ${dayIndex} (${newWeeklyProgress[dayIndex].day})`);
        console.log(`Porcentagem calculada: ${dailyPercentage}%`);
        newWeeklyProgress[dayIndex].p = dailyPercentage;
    } else {
        console.warn(`Índice de dia inválido: ${dayIndex}`);
    }
    
    console.log("Resultado do cálculo:", newWeeklyProgress);
    console.groupEnd();
    return newWeeklyProgress;
}
