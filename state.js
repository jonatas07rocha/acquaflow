// Lista mestre de todas as conquistas disponíveis no aplicativo.
// n = nome, u = unlocked (desbloqueada), icon = ícone do Lucide
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
            widgetOrder: ['progress', 'stats', 'history', 'weekly', 'achievements', 'tip']
        },
        dailyUserData: {
            currentAmount: 0,
            history: []
        },
        persistentUserData: {
            achievements: JSON.parse(JSON.stringify(allAchievements)), // Cria uma cópia limpa
            weeklyProgress: [
                { day: 'S', p: 0 }, { day: 'T', p: 0 }, { day: 'Q', p: 0 }, 
                { day: 'Q', p: 0 }, { day: 'S', p: 0 }, { day: 'S', p: 0 }, { day: 'D', p: 0 }
            ]
        }
    };

    if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        
        // Se for um novo dia, reseta os dados diários
        if (savedState.lastVisit !== today) {
            savedState.lastVisit = today;
            savedState.dailyUserData = defaultState.dailyUserData;
            
            const dayOfWeek = new Date().getDay();
            // Se for segunda-feira (1), reseta o progresso semanal
            if (dayOfWeek === 1) {
                savedState.persistentUserData.weeklyProgress = defaultState.persistentUserData.weeklyProgress;
            }
        }

        // Garante que a lista de conquistas esteja sempre atualizada
        // sem perder o progresso do usuário.
        const updatedAchievements = allAchievements.map(defaultAch => {
            const savedAch = savedState.persistentUserData.achievements.find(a => a.id === defaultAch.id);
            return savedAch ? { ...defaultAch, u: savedAch.u } : defaultAch;
        });
        savedState.persistentUserData.achievements = updatedAchievements;

        // Mescla o estado salvo com o padrão para garantir que novas propriedades sejam adicionadas
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

