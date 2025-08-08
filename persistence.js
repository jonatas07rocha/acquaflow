import { state } from './state.js';

export function saveState() {
    try {
        Object.keys(state).forEach(key => {
            localStorage.setItem(key, JSON.stringify(state[key]));
        });
    } catch (error) {
        console.error("Erro ao salvar o estado:", error);
    }
}

export function loadState() {
    try {
        const today = new Date().toDateString();
        const lastUpdateDate = JSON.parse(localStorage.getItem('lastUpdateDate')) || today;

        Object.keys(state).forEach(key => {
            const savedValue = localStorage.getItem(key);
            if (savedValue !== null) {
                state[key] = JSON.parse(savedValue);
            }
        });

        // Lógica de reset diário
        if (today !== lastUpdateDate) {
            state.waterHistory.shift();
            state.waterHistory.push(0);
            state.currentWater = 0;
            state.lastDrinkTime = null;
            state.lastDrinkAmount = 0;
            state.lastUpdateDate = today;
            // Lógica de Streak (simplificada)
            // Uma lógica mais robusta verificaria a data de ontem
            state.streakCount = 0; 
            saveState();
        }

    } catch (error) {
        console.error("Erro ao carregar o estado:", error);
    }
}