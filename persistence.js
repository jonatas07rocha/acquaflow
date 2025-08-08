export const defaultState = {
    settings: {
        dailyGoal: 2500,
        reminders: false,
        theme: 'teal',
        widgetOrder: ['progress', 'stats', 'history', 'weekly', 'achievements', 'tip']
    },
    persistentUserData: {
        weeklyProgress: [
            { day: 'Seg', p: 0 }, { day: 'Ter', p: 0 }, { day: 'Qua', p: 0 }, { day: 'Qui', p: 0 },
            { day: 'Sex', p: 0 }, { day: 'Sáb', p: 0 }, { day: 'Dom', p: 0 }
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
    try {
        const settings = JSON.parse(localStorage.getItem('settings')) || defaultState.settings;
        if (!settings.widgetOrder || settings.widgetOrder.length === 0) {
            settings.widgetOrder = defaultState.settings.widgetOrder;
        }

        let persistentUserData = JSON.parse(localStorage.getItem('persistentUserData')) || defaultState.persistentUserData;
        
        const today = new Date();
        const todayString = today.toDateString();

        if (persistentUserData.lastResetDate !== todayString) {
            const lastDate = persistentUserData.lastResetDate ? new Date(persistentUserData.lastResetDate) : new Date(0);
            
            const isMonday = today.getDay() === 1;
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            if (isMonday && lastDate.toDateString() !== yesterday.toDateString()) {
                 persistentUserData.weeklyProgress = defaultState.persistentUserData.weeklyProgress;
            }
            
            persistentUserData.lastResetDate = todayString;
        }

        const dailyUserData = JSON.parse(localStorage.getItem(getTodayKey())) || defaultState.dailyUserData;

        return { 
            settings: { ...defaultState.settings, ...settings },
            persistentUserData: { ...defaultState.persistentUserData, ...persistentUserData },
            dailyUserData: { ...defaultState.dailyUserData, ...dailyUserData }
        };
    } catch (e) {
        console.error("Erro ao carregar o estado, usando valores padrão.", e);
        localStorage.clear();
        return JSON.parse(JSON.stringify(defaultState)); // Retorna uma cópia profunda
    }
}

export function saveState(state) {
    try {
        localStorage.setItem('settings', JSON.stringify(state.settings));
        localStorage.setItem('persistentUserData', JSON.stringify(state.persistentUserData));
        localStorage.setItem(getTodayKey(), JSON.stringify(state.dailyUserData));
    } catch (e) {
        console.error("Erro ao salvar o estado:", e);
    }
}
