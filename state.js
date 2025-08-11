// LISTA DE CONQUISTAS REFINADA E COM DESCRIÇÕES
const allAchievements = [
    { id: 'FIRST_DRINK',    n: 'Primeiro Gole',      desc: 'Beba água pela primeira vez para começar sua jornada.', u: false, icon: 'cup-soda' },
    { id: 'PERFECT_1000',   n: '1 Litro',            desc: 'Beba 1 litro de água em um único dia.', u: false, icon: 'award' },
    { id: 'VOLUME_2L',      n: '2 Litros',           desc: 'Beba 2 litros de água em um único dia.', u: false, icon: 'award' },
    { id: 'VOLUME_3L',      n: '3 Litros',           desc: 'Um verdadeiro atleta! Beba 3 litros de água em um dia.', u: false, icon: 'trophy' },
    { id: 'GOAL_REACHED',   n: 'Meta Atingida',      desc: 'Atinja sua meta diária de hidratação.', u: false, icon: 'target' },
    { id: 'OVERACHIEVER',   n: 'Super-Hidratado',    desc: 'Supere sua meta diária em pelo menos 50%.', u: false, icon: 'trending-up' },
    { id: 'HYDRATION_PRO',  n: 'Hidratação PRO',     desc: 'Beba água 5 ou mais vezes em um único dia.', u: false, icon: 'sparkles' },
    { id: 'MORNING_HYDRATION', n: 'Força Matinal',    desc: 'Beba água antes do meio-dia para começar bem.', u: false, icon: 'sunrise' },
    { id: 'LATE_NIGHT_HYDRATION', n: 'Guerreiro da Noite', desc: 'Faça seu último registro de água depois das 22h.', u: false, icon: 'moon' },
    { id: 'STREAK_3',       n: 'Embalado',           desc: 'Mantenha o ritmo e use o aplicativo por 3 dias seguidos.', u: false, icon: 'flame' },
    { id: 'THEME_MASTER',   n: 'Artista',            desc: 'Explore as configurações e aplique um novo tema.', u: false, icon: 'palette' },
    { id: 'ORGANIZER',      n: 'Organizador',        desc: 'Personalize seu dashboard reorganizando os widgets.', u: false, icon: 'layout-template' },
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
            consecutiveDays: 0,
        }
    };

    if (savedStateJSON) {
        let savedState = JSON.parse(savedStateJSON);
        
        if (savedState.lastVisit !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const lastVisitWasYesterday = savedState.lastVisit === yesterday.toISOString().slice(0, 10);

            if (lastVisitWasYesterday) {
                savedState.persistentUserData.consecutiveDays = (savedState.persistentUserData.consecutiveDays || 0) + 1;
            } else {
                savedState.persistentUserData.consecutiveDays = 1;
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
        if (savedState.persistentUserData.goalStreak) {
             delete savedState.persistentUserData.goalStreak;
        }
        if (savedState.persistentUserData.lastGoalDate) {
             delete savedState.persistentUserData.lastGoalDate;
        }

        return {
            ...defaultState,
            ...savedState,
            settings: { ...defaultState.settings, ...savedState.settings },
            persistentUserData: { ...defaultState.persistentUserData, ...savedState.persistentUserData }
        };
    }
    
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
