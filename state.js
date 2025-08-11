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
            widgetOrder: ['progress', 'stats', 'activity', 'achievements', 'tip']
        },
        dailyUserData: {
            currentAmount: 0,
            history: []
        },
        persistentUserData: {
            achievements: JSON.parse(JSON.stringify(allAchievements))
            // weeklyProgress foi removido
        }
    };

    if (savedStateJSON) {
        let savedState = JSON.parse(savedStateJSON);
        
        if (savedState.lastVisit !== today) {
            savedState.dailyUserData = { ...defaultState.dailyUserData };
            savedState.lastVisit = today;
        }

        const updatedAchievements = allAchievements.map(defaultAch => {
            const savedAch = savedState.persistentUserData.achievements.find(a => a.id === defaultAch.id);
            return savedAch ? { ...defaultAch, u: savedAch.u } : defaultAch;
        });
        savedState.persistentUserData.achievements = updatedAchievements;
        
        // Remove a propriedade legada se ela ainda existir no localStorage do usuário
        if (savedState.persistentUserData.weeklyProgress) {
            delete savedState.persistentUserData.weeklyProgress;
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

export function updateState(updates) {
    const newState = {
        ...state,
        ...updates,
        dailyUserData: { ...state.dailyUserData, ...(updates.dailyUserData || {}) },
        persistentUserData: { ...state.persistentUserData, ...(updates.persistentUserData || {}) },
        settings: { ...state.settings, ...(updates.settings || {}) },
    };
    
    state = newState;
    localStorage.setItem('acqua-state', JSON.stringify(state));
}

export function resetState() {
    localStorage.removeItem('acqua-state');
    setTimeout(() => {
        location.reload();
    }, 100);
}
