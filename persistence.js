const defaultState = {
    settings: {
        dailyGoal: 2500,
        reminders: false,
        theme: 'teal',
        widgetOrder: ['progress', 'stats', 'history', 'weekly', 'achievements', 'tip']
    },
    userData: {
        currentAmount: 0,
        history: [],
        weeklyProgress: [
            { day: 'S', p: 0 }, { day: 'T', p: 0 }, { day: 'Q', p: 0 }, { day: 'Q', p: 0 },
            { day: 'S', p: 0 }, { day: 'S', p: 0 }, { day: 'D', p: 0 }
        ],
        achievements: [
            { id: 'dias3', n: '3 Dias', u: false }, { id: 'meta5', n: '5 Metas', u: false },
            { id: 'perfeito', n: 'Perfeito', u: false }, { id: 'madrugador', n: 'Madrugador', u: false },
            { id: 'noturno', n: 'Noturno', u: false }, { id: 'super', n: 'Super Litro', u: false },
            { id: 'dobro', n: 'Meta em Dobro', u: false }, { id: 'semana', n: '1 Semana', u: false }
        ]
    }
};

function getTodayKey() {
    const today = new Date();
    return `userData_${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

export function loadState() {
    const settings = JSON.parse(localStorage.getItem('settings')) || defaultState.settings;
    if (!settings.widgetOrder) {
        settings.widgetOrder = defaultState.settings.widgetOrder;
    }

    const todayKey = getTodayKey();
    const userData = JSON.parse(localStorage.getItem(todayKey)) || defaultState.userData;

    return { settings, userData };
}

export function saveState(state) {
    localStorage.setItem('settings', JSON.stringify(state.settings));
    localStorage.setItem(getTodayKey(), JSON.stringify(state.userData));
}
