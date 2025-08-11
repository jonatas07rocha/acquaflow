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
        
        // **LÓGICA DE RESET SEMANAL CORRIGIDA**
        // Verifica se a data da última visita é diferente da data de hoje.
        if (savedState.lastVisit !== today) {
            // É um novo dia.
            const lastVisitDate = new Date(savedState.lastVisit);
            const todayDate = new Date(today);

            // 1. Reseta os dados diários, mantendo o resto.
            savedState.dailyUserData = { ...defaultState.dailyUserData };
            savedState.lastVisit = today;

            // 2. Verifica se uma nova semana começou para resetar o progresso semanal.
            // Helper para converter o dia da semana para um índice (Seg=0, ..., Dom=6)
            const getDayIndex = (date) => (date.getDay() === 0 ? 6 : date.getDay() - 1);
            const lastDayIndex = getDayIndex(lastVisitDate);
            const todayDayIndex = getDayIndex(todayDate);
            
            // Calcula a diferença em dias entre a última visita e hoje.
            const daysDifference = (todayDate.getTime() - lastVisitDate.getTime()) / (1000 * 3600 * 24);

            // A semana reseta se o índice do dia de hoje for menor que o da última visita
            // (ex: pulou de Sábado[5] para Segunda[0]), ou se mais de 6 dias se passaram.
            if (todayDayIndex < lastDayIndex || daysDifference > 6) {
                console.log("Nova semana detectada. Resetando o progresso semanal.");
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

/**
 * Reseta todo o estado da aplicação para o padrão.
 * Remove os dados do localStorage e recarrega a página.
 */
export function resetState() {
    console.log("Resetando o estado da aplicação...");
    localStorage.removeItem('acqua-state');
    // Adiciona um pequeno delay para garantir que a operação de remoção seja concluída antes do reload.
    setTimeout(() => {
        location.reload();
    }, 100);
}
