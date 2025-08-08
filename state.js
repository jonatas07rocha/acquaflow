import { loadState as loadFromPersistence, saveState as saveToPersistence } from './persistence.js';

// Carrega o estado do localStorage APENAS UMA VEZ.
let currentState = loadFromPersistence();

/**
 * Retorna uma cópia do estado atual para evitar mutações diretas.
 * @returns {object} O estado atual da aplicação.
 */
export function getState() {
    // Retornar uma cópia profunda garante que o estado original não seja modificado acidentalmente.
    return JSON.parse(JSON.stringify(currentState));
}

/**
 * Atualiza uma parte do estado e salva no localStorage.
 * @param {object} newState - Um objeto com as chaves e valores a serem atualizados.
 */
export function updateState(newState) {
    // Mescla o novo estado com o estado existente de forma inteligente.
    currentState = {
        ...currentState,
        ...newState,
        settings: { ...currentState.settings, ...newState.settings },
        persistentUserData: { ...currentState.persistentUserData, ...newState.persistentUserData },
        dailyUserData: { ...currentState.dailyUserData, ...newState.dailyUserData },
    };
    saveToPersistence(currentState);
}

/**
 * Substitui todo o estado. Usado para operações maiores como resetar dados.
 * @param {object} fullState - O objeto de estado completo.
 */
export function setState(fullState) {
    currentState = fullState;
    saveToPersistence(currentState);
}
