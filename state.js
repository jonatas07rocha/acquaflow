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
            widgetOrder: ['progress', 'stats', 'activity', 'achievements', 'tip']
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
        
        if (savedState.lastVisit !== today) {
            const lastVisitDate = new Date(savedState.lastVisit);
            const todayDate = new Date(today);

            savedState.dailyUserData = { ...defaultState.dailyUserData };
            savedState.lastVisit = today;

            const getDayIndex = (date) => (date.getDay() === 0 ? 6 : date.getDay() - 1);
            const lastDayIndex = getDayIndex(lastVisitDate);
            const todayDayIndex = getDayIndex(todayDate);
            
            const daysDifference = (todayDate.getTime() - lastVisitDate.getTime()) / (1000 * 3600 * 24);

            if (todayDayIndex < lastDayIndex || daysDifference > 6) {
                console.log("Nova semana detectada. Resetando o progresso semanal.");
                savedState.persistentUserData.weeklyProgress = [ ...defaultState.persistentUserData.weeklyProgress ];
            }
        }

        const updatedAchievements = allAchievements.map(defaultAch => {
            const savedAch = savedState.persistentUserData.achievements.find(a => a.id === defaultAch.id);
            return savedAch ? { ...defaultAch, u: savedAch.u } : defaultAch;
        });
        savedState.persistentUserData.achievements = updatedAchievements;

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

/**
 * Atualiza o estado global da aplicação com base nas novas informações.
 * Esta versão é mais simples e robusta para evitar a perda de dados em objetos aninhados.
 * @param {object} updates - Um objeto contendo as chaves do estado a serem atualizadas.
 */
export function updateState(updates) {
    // Começa com uma cópia do estado atual
    const newState = { ...state };

    // Itera sobre as chaves do objeto de atualização
    for (const key in updates) {
        // Se a chave existe e é um objeto (mas não um array), faz um merge profundo.
        // Isso garante que dados aninhados como em 'persistentUserData' sejam combinados corretamente.
        if (typeof updates[key] === 'object' && !Array.isArray(updates[key]) && state[key]) {
            newState[key] = { ...state[key], ...updates[key] };
        } else {
            // Para outras chaves (valores primitivos ou arrays), simplesmente substitui.
            newState[key] = updates[key];
        }
    }
    
    // Atualiza a variável de estado global e o localStorage
    state = newState;
    localStorage.setItem('acqua-state', JSON.stringify(state));
}

export function resetState() {
    console.log("Resetando o estado da aplicação...");
    localStorage.removeItem('acqua-state');
    setTimeout(() => {
        location.reload();
    }, 100);
}
