// O estado inicial da aplicação.
// Carregado a partir do localStorage ou definido com valores padrão.
export const state = {
    currentWater: 0,
    goalWater: 2500,
    waterHistory: [0, 0, 0, 0, 0, 0, 0],
    shortcutHistory: { '150': 0, '250': 0, '500': 0 },
    lastUpdateDate: new Date().toDateString(),
    userWeight: 70,
    notificationsEnabled: false,
    streakCount: 0,
    lastStreakDate: null,
    lastDrinkTime: null,
    lastDrinkAmount: 0,
};
