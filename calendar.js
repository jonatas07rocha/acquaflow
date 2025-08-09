import { showInfoModal } from './ui.js';

/**
 * Gera e inicia o download de um arquivo de calendário (.ics) para criar
 * lembretes de hidratação. O evento criado se repete a cada hora até o final do dia.
 */
export function createHourlyReminder() {
    const now = new Date();
    const endOfDay = new Date();
    endOfDay.setHours(22, 0, 0, 0); // Define o fim dos lembretes para as 22h

    // Se já passou do horário, mostra o modal de aviso e não cria o evento.
    if (now > endOfDay) {
        showInfoModal("Aviso", "Já passou do horário de criar novos lembretes por hoje!");
        return;
    }

    /**
     * Converte um objeto Date para o formato de data/hora UTC exigido pelo padrão iCalendar.
     * @param {Date} date - O objeto de data a ser convertido.
     * @returns {string} - A data formatada como YYYYMMDDTHHMMSSZ.
     */
    const toICSFormat = (date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//AcquaApp//Lembrete de Hidratação//PT",
        "BEGIN:VEVENT",
        `UID:${Date.now()}@acqua.app`, // Identificador único para o evento
        `DTSTAMP:${toICSFormat(now)}`,
        `DTSTART:${toICSFormat(now)}`, // O evento começa agora
        `DTEND:${toICSFormat(endOfDay)}`, // E termina às 22h
        "SUMMARY:💧 Lembrete para Beber Água",
        "DESCRIPTION:Lembrete gerado pelo app Acqua para ajudar a manter sua hidratação.",
        // RRULE: Define a regra de repetição. FREQ=HOURLY significa "a cada hora".
        `RRULE:FREQ=HOURLY;UNTIL=${toICSFormat(endOfDay)}`,
        "BEGIN:VALARM", // Define o alarme do evento
        "ACTION:DISPLAY",
        "DESCRIPTION:💧 Hora de beber água!",
        // TRIGGER: Dispara o alarme 0 minutos antes de cada ocorrência.
        "TRIGGER:-PT0M", 
        "END:VALARM",
        "END:VEVENT",
        "END:VCALENDAR"
    ].join("\n");

    // Cria um "arquivo virtual" na memória do navegador (Blob).
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    
    // Cria um link de download invisível para o arquivo.
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "Lembrete_Acqua.ics";
    
    // Adiciona o link ao corpo do documento, clica nele para iniciar o download
    // e o remove em seguida.
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

