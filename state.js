// jonatas07rocha/acquaflow/acquaflow-4adf3ba6a047c14f9c16629e39fadb26cd705eb7/state.js

// LISTA DE CONQUISTAS EXPANDIDA
const allAchievements = [
    // Conquistas de Início e Volume
    { id: 'FIRST_DRINK',    n: 'Primeiro Gole',      u: false, icon: 'cup-soda' },
    { id: 'PERFECT_1000',   n: '1 Litro!',           u: false, icon: 'award' },
    { id: 'VOLUME_2L',      n: '2 Litros!',          u: false, icon: 'award' },
    { id: 'VOLUME_3L',      n: '3 Litros!',          u: false, icon: 'trophy' },
    
    // Conquistas de Meta
    { id: 'GOAL_REACHED',   n: 'Meta Atingida!',     u: false, icon: 'target' },
    { id: 'OVERACHIEVER',   n: 'Super-Hidratado',    u: false, icon: 'trending-up' },
    
    // Conquistas de Frequência e Horário
    { id: 'HYDRATION_PRO',  n: 'Hidratação PRO',     u: false, icon: 'sparkles' },
    { id: 'MORNING_HYDRATION', n: 'Força Matinal',    u: false, icon: 'sunrise' },
    { id: 'LATE_NIGHT_HYDRATION', n: 'Guerreiro da Noite', u: false, icon: 'moon' },

    // Conquistas de Sequência (Streak)
    { id: 'STREAK_3',       n: 'Embalado!',          u: false, icon: 'flame' },
    { id: 'STREAK_7',       n: 'Implacável',         u: false, icon: 'gem' },
    { id: 'PERFECT_WEEK',   n: 'Semana Perfeita',    u: false, icon: 'shield-check' },

    // Conquistas de Interação com o App
    { id: 'THEME_MASTER',   n: 'Artista',            u: false, icon: 'palette' },
    { id: 'ORGANIZER',      n: 'Organizador',        u: false, icon: 'layout-template' },
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
            achievements: JSON.parse(JSON.stringify(allAchievements)),
            // NOVAS PROPRIEDADES PARA RASTREAR SEQUÊNCIAS
            consecutiveDays: 0,
            goalStreak: 0,
            lastGoalDate: null,
        }
    };

    if (savedStateJSON) {
        let savedState = JSON.parse(savedStateJSON);
        
        if (savedState.lastVisit !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const lastVisitWasYesterday = savedState.lastVisit === yesterday.toISOString().slice(0, 10);

            // Lógica de sequência de dias de uso
            if (lastVisitWasYesterday) {
                savedState.persistentUserData.consecutiveDays = (savedState.persistentUserData.consecutiveDays || 0) + 1;
            } else {
                savedState.persistentUserData.consecutiveDays = 1; // Reset se pulou um dia
            }

            // Lógica de sequência de metas atingidas
            const lastGoalDate = savedState.persistentUserData.lastGoalDate ? new Date(savedState.persistentUserData.lastGoalDate) : null;
            if (!lastGoalDate || lastGoalDate.toISOString().slice(0,10) !== yesterday.toISOString().slice(0,10)) {
                 savedState.persistentUserData.goalStreak = 0; // Reseta se a última meta não foi ontem
            }

            savedState.dailyUserData = { ...defaultState.dailyUserData };
            savedState.lastVisit = today;
        }

        const updatedAchievements = allAchievements.map(defaultAch => {
            const savedAch = savedState.persistentUserData.achievements.find(a => a.id === defaultAch.id);
            return savedAch ? { ...defaultAch, u: savedAch.u } : defaultAch;
        });
        savedState.persistentUserData.achievements = updatedAchievements;
        
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
    
    // Se for a primeira vez, a sequência começa em 1
    defaultState.persistentUserData.consecutiveDays = 1;
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
