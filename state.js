// Lista mestre de todas as conquistas disponíveis no aplicativo.
const allAchievements = [
    { id: 'FIRST_DRINK',    n: 'Primeiro Gole',      u: false, icon: 'cup-soda' },
    { id: 'MORNING_HYDRATION', n: 'Força Matinal',    u: false, icon: 'sunrise' },
    { id: 'GOAL_REACHED',   n: 'Meta Atingida!',     u: false, icon: 'target' },
    { id: 'OVERACHIEVER',   n: 'Super-Hidratado',    u: false, icon: 'trending-up' },
    { id: 'LATE_NIGHT_HYDRATION', n: 'Guerreiro da Noite', u: false, icon: 'moon' },
    { id: 'PERFECT_1000',   n: '1 Litro!',           u: false, icon: 'award' }
];

function getInitialState() {
    const today = new Date().toISOString().slice(0, 10);
    const savedStateJSON = localStorage.getItem('acqua-state');
    
    const defaultState = {
        lastVisit: today,
        settings: {
            dailyGoal: 2000,
            reminders: false,
            theme: 'teal',
            // 'weekly' foi removido da ordem padrão dos widgets.
            widgetOrder: ['progress', 'stats', 'history', 'achievements', 'tip']
        },
        dailyUserData: {
            currentAmount: 0,
            history: []
        },
        persistentUserData: {
            achievements: JSON.parse(JSON.stringify(allAchievements)),
            weeklyProgress: [
                { day: 'Seg', p: 0 }, { day: 'Ter', p: 0 }, { day: 'Qua', p: 0 }, 
                { day: 'Qui', p: 0 }, { day: 'Sex', p: 0 }, { day: 'Sáb', p: 0 }, { day: 'Dom', p: 0 }
            ]
        }
    };

    if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        
        if (savedState.lastVisit !== today) {
            savedState.lastVisit = today;
            savedState.dailyUserData = defaultState.dailyUserData;
            
            const dayOfWeek = new Date().getDay();
            if (dayOfWeek === 1) {
                savedState.persistentUserData.weeklyProgress = defaultState.persistentUserData.weeklyProgress;
            }
        }

        const updatedAchievements = allAchievements.map(defaultAch => {
            const savedAch = savedState.persistentUserData.achievements.find(a => a.id === defaultAch.id);
            return savedAch ? { ...defaultAch, u: savedAch.u } : defaultAch;
        });
        savedState.persistentUserData.achievements = updatedAchievements;

        // Garante que a ordem dos widgets não inclua 'weekly' se não estiver definido
        if (savedState.settings && savedState.settings.widgetOrder) {
            savedState.settings.widgetOrder = savedState.settings.widgetOrder.filter(id => id !== 'weekly');
        }


        return {
            ...defaultState,
            ...savedState,
            settings: { ...defaultState.settings, ...savedState.settings },
            persistentUserData: { ...defaultState.persistentUserData, ...savedState.persistentUserData }
        };
    }
    
    return defaultState;
}

let state = getInitialState();

export function getState() {
    return state;
}

export function updateState(newState) {
    state = {
        ...state,
        ...newState,
        settings: { ...state.settings, ...newState.settings },
        dailyUserData: { ...state.dailyUserData, ...newState.dailyUserData },
        persistentUserData: { ...state.persistentUserData, ...newState.persistentUserData }
    };
    localStorage.setItem('acqua-state', JSON.stringify(state));
    console.log("Estado atualizado:", state);
}

