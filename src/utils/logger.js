// Variable para controlar si se muestran los logs o no
export const enableLogs = true;

// Función para loguear información
export function logInfo(message) {
    if (enableLogs) {
        console.log(`[INFO] ${message}`);
    }
}

// Función para loguear errores
export function logError(message) {
    if (enableLogs) {
        console.error(`[ERROR] ${message}`);
    }
}

// Función para loguear mensajes de debug
export function logDebug(message) {
    if (enableLogs) {
        console.debug(`[DEBUG] ${message}`);
    }
}
