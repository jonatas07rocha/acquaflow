// Variável para guardar a referência do nosso intervalo de verificação.
let reminderInterval = null;

/**
 * Verifica se um lembrete de hidratação precisa ser enviado.
 * Esta função é chamada a cada 30 minutos pelo serviço de lembretes.
 */
async function checkAndSendReminder() {
    try {
        // Importa a função para pegar o estado atual da aplicação.
        const { getState } = await import('./state.js');
        const state = getState();

        // Se os lembretes foram desativados nas configurações, não faz nada.
        if (!state.settings.reminders) {
            stopReminderService(); // Garante que o serviço pare se for desativado.
            return;
        }

        const now = new Date().getTime();
        // Pega o horário do último registro de água. Se não houver, considera 0.
        const lastDrinkTimestamp = state.dailyUserData.history[0]?.timestamp || 0;
        const oneHour = 60 * 60 * 1000;

        // Se já passou mais de uma hora desde o último gole...
        if (now - lastDrinkTimestamp > oneHour) {
            // ...e o Service Worker estiver ativo, envia uma mensagem para ele exibir a notificação.
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({
                    type: 'show-reminder'
                });
            }
        }
    } catch (e) {
        console.error("Erro ao verificar lembrete:", e);
        stopReminderService(); // Para o serviço em caso de erro.
    }
}

/**
 * Inicia o serviço de lembretes, que executa uma verificação a cada 30 minutos.
 */
export function startReminderService() {
    // Se o serviço já estiver rodando, não faz nada.
    if (reminderInterval) return;

    const thirtyMinutes = 30 * 60 * 1000;
    // Executa a verificação imediatamente e depois a cada 30 minutos.
    checkAndSendReminder();
    reminderInterval = setInterval(checkAndSendReminder, thirtyMinutes);
    console.log("Serviço de lembretes iniciado.");
}

/**
 * Para o serviço de lembretes e limpa o intervalo.
 */
export function stopReminderService() {
    if (reminderInterval) {
        clearInterval(reminderInterval);
        reminderInterval = null;
        console.log("Serviço de lembretes parado.");
    }
}
