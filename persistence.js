const defaultState = {
    settings: {
        dailyGoal: 2500,
        reminders: false,
        theme: 'teal',
        widgetOrder: ['progress', 'stats', 'history', 'weekly', 'achievements', 'tip']
    },
    // Dados que persistem entre os dias
    persistentUserData: {
        weeklyProgress: [
            { day: 'S', p: 0 }, { day: 'T', p: 0 }, { day: 'Q', p: 0 }, { day: 'Q', p: 0 },
            { day: 'S', p: 0 }, { day: 'S', p: 0 }, { day: 'D', p: 0 }
        ],
        achievements: [
            { id: 'dias3', n: '3 Dias', u: false }, { id: 'meta5', n: '5 Metas', u: false },
            { id: 'perfeito', n: 'Perfeito', u: false }, { id: 'madrugador', n: 'Madrugador', u: false },
            { id: 'noturno', n: 'Noturno', u: false }, { id: 'super', n: 'Super Litro', u: false },
            { id: 'dobro', n: 'Meta em Dobro', u: false }, { id: 'semana', n: '1 Semana', u: false }
        ],
        lastResetDate: null
    },
    // Dados que são zerados diariamente
    dailyUserData: {
        currentAmount: 0,
        history: [],
    }
};

function getTodayKey() {
    const today = new Date();
    return `dailyUserData_${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

export function loadState() {
    const settings = JSON.parse(localStorage.getItem('settings')) || defaultState.settings;
    if (!settings.widgetOrder) {
        settings.widgetOrder = defaultState.settings.widgetOrder;
    }

    let persistentUserData = JSON.parse(localStorage.getItem('persistentUserData')) || defaultState.persistentUserData;
    
    // Lógica de Reset Diário
    const today = new Date().toDateString();
    if (persistentUserData.lastResetDate !== today) {
        // Zera o progresso do dia seguinte, se necessário
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (persistentUserData.lastResetDate !== yesterday.toDateString()) {
             const dayOfWeek = new Date().getDay();
             const dayIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
             persistentUserData.weeklyProgress[dayIndex].p = 0;
        }

        persistentUserData.lastResetDate = today;
        localStorage.setItem('persistentUserData', JSON.stringify(persistentUserData));
        localStorage.removeItem(getTodayKey()); // Garante que os dados do dia comecem do zero
    }

    const dailyUserData = JSON.parse(localStorage.getItem(getTodayKey())) || defaultState.dailyUserData;

    return { settings, persistentUserData, dailyUserData };
}

export function saveState(state) {
    localStorage.setItem('settings', JSON.stringify(state.settings));
    localStorage.setItem('persistentUserData', JSON.stringify(state.persistentUserData));
    localStorage.setItem(getTodayKey(), JSON.stringify(state.dailyUserData));
}
