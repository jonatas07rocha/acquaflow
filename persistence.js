const defaultState = {
    settings: {
        dailyGoal: 2500,
        reminders: false,
        theme: 'teal',
        widgetOrder: ['progress', 'stats', 'history', 'weekly', 'achievements', 'tip']
    },
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
    
    const today = new Date().toDateString();
    if (persistentUserData.lastResetDate !== today) {
        const lastDate = persistentUserData.lastResetDate ? new Date(persistentUserData.lastResetDate) : new Date(0);
        const todayDate = new Date();
        const diffTime = Math.abs(todayDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
            const dayOfWeek = todayDate.getDay();
            const dayIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
            if (persistentUserData.weeklyProgress[dayIndex].p > 0) {
                 persistentUserData.weeklyProgress[dayIndex].p = 0;
            }
        }
        
        persistentUserData.lastResetDate = today;
        localStorage.setItem('persistentUserData', JSON.stringify(persistentUserData));
        localStorage.removeItem(getTodayKey());
    }

    const dailyUserData = JSON.parse(localStorage.getItem(getTodayKey())) || defaultState.dailyUserData;

    return { settings, persistentUserData, dailyUserData };
}

export function saveState(state) {
    localStorage.setItem('settings', JSON.stringify(state.settings));
    localStorage.setItem('persistentUserData', JSON.stringify(state.persistentUserData));
    localStorage.setItem(getTodayKey(), JSON.stringify(state.dailyUserData));
}
