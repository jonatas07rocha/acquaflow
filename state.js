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
    console.group("🏁 Inicialização do Estado");
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
        console.log("💾 Estado carregado do localStorage.");
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
                console.log("🗓️ Nova semana detectada. Resetando o progresso semanal.");
                savedState.persistentUserData.weeklyProgress = [ ...defaultState.persistentUserData.weeklyProgress ];
            }
        }

        const updatedAchievements = allAchievements.map(defaultAch => {
            const savedAch = savedState.persistentUserData.achievements.find(a => a.id === defaultAch.id);
            return savedAch ? { ...defaultAch, u: savedAch.u } : defaultAch;
        });
        savedState.persistentUserData.achievements = updatedAchievements;
        
        const finalState = {
            ...defaultState,
            ...savedState,
            settings: { ...defaultState.settings, ...savedState.settings },
            persistentUserData: { ...defaultState.persistentUserData, ...savedState.persistentUserData }
        };
        console.log("✅ Estado final inicializado:", finalState);
        console.groupEnd();
        return finalState;
    }
    
    console.log("✨ Criando estado inicial padrão.");
    console.log("✅ Estado final inicializado:", defaultState);
    console.groupEnd();
    return defaultState;
}

let state = getInitialState();

export function getState() {
    return state;
}

/**
 * Atualiza o estado global da aplicação.
 * Esta versão simplificada garante que todos os dados aninhados sejam mesclados corretamente.
 * @param {object} updates - Objeto com as chaves de estado a serem atualizadas.
 */
export function updateState(updates) {
    console.group(`🔄 [CORRIGIDO] Atualizando Estado`);
    console.log("📦 Objeto de atualização recebido:", updates);
    console.log("🧠 Estado ANTES:", JSON.parse(JSON.stringify(state))); // Cópia profunda para log preciso

    // Lógica de merge robusta e explícita
    const newState = {
        ...state,
        ...updates,
        dailyUserData: { ...state.dailyUserData, ...(updates.dailyUserData || {}) },
        persistentUserData: { ...state.persistentUserData, ...(updates.persistentUserData || {}) },
        settings: { ...state.settings, ...(updates.settings || {}) },
    };
    
    state = newState;
    localStorage.setItem('acqua-state', JSON.stringify(state));
    console.log("🚀 Estado DEPOIS:", JSON.parse(JSON.stringify(state)));
    console.groupEnd();
}

export function resetState() {
    console.log("🗑️ Resetando o estado da aplicação...");
    localStorage.removeItem('acqua-state');
    setTimeout(() => {
        location.reload();
    }, 100);
}
