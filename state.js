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
            widgetOrder: ['progress', 'stats', 'weekly', 'history', 'achievements', 'tip']
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
        let savedState = JSON.parse(savedStateJSON);
        
        // **A CORREÇÃO PRINCIPAL ESTÁ AQUI**
        // Verifica se a data da última visita é diferente da data de hoje.
        if (savedState.lastVisit !== today) {
            // É um novo dia! Mantém as configurações e dados persistentes,
            // mas reseta completamente os dados diários.
            savedState.dailyUserData = { ...defaultState.dailyUserData };
            savedState.lastVisit = today;
            
            const dayOfWeek = new Date().getDay();
            // Se for segunda-feira (getDay() === 1), reseta também o progresso semanal.
            if (dayOfWeek === 1) {
                savedState.persistentUserData.weeklyProgress = [ ...defaultState.persistentUserData.weeklyProgress ];
            }
        }

        // Garante que a lista de conquistas esteja sempre atualizada com as do código
        const updatedAchievements = allAchievements.map(defaultAch => {
            const savedAch = savedState.persistentUserData.achievements.find(a => a.id === defaultAch.id);
            return savedAch ? { ...defaultAch, u: savedAch.u } : defaultAch;
        });
        savedState.persistentUserData.achievements = updatedAchievements;

        // Mescla o estado salvo e corrigido com o padrão para garantir que
        // novas propriedades sejam adicionadas sem perder os dados do usuário.
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
    // console.log("Estado atualizado:", state); // Descomente para depurar
}
