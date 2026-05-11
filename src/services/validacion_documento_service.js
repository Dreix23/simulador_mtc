import { dbSite as db } from './firebase.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { logInfo, logError } from '@/utils/logger.js';

export const validacionDocumentoService = {
    async validarDocumento(tipoDocumento, numeroDocumento) {
        try {
            const q = query(
                collection(db, 'users'),
                where('tipoDocumento', '==', tipoDocumento),
                where('numeroDocumento', '==', numeroDocumento)
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                logInfo(`No se encontró documento: ${tipoDocumento} - ${numeroDocumento}`);
                return false;
            }

            const userData = querySnapshot.docs[0].data();

            // Verificar si el usuario ya no tiene intentos disponibles
            if (userData.hasAttempt === false) {
                logInfo(`Usuario ${numeroDocumento} ya no tiene intentos disponibles`);
                return 'no_attempts';
            }

            logInfo(`Documento encontrado y con intentos disponibles: ${tipoDocumento} - ${numeroDocumento}`);
            return true;
        } catch (error) {
            logError(`Error al validar documento: ${error.message}`);
            throw error;
        }
    },

    async obtenerDatosUsuario(tipoDocumento, numeroDocumento) {
        try {
            const q = query(
                collection(db, 'users'),
                where('tipoDocumento', '==', tipoDocumento),
                where('numeroDocumento', '==', numeroDocumento)
            );

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                logInfo(`No se encontró usuario: ${tipoDocumento} - ${numeroDocumento}`);
                return null;
            }

            const userData = querySnapshot.docs[0].data();
            const userWithId = {
                id: querySnapshot.docs[0].id,
                tipoDocumento: userData.tipoDocumento,
                numeroDocumento: userData.numeroDocumento,
                nombre: userData.nombre,
                apellidos: userData.apellidos,
                categoria: userData.categoria,
                imagenUrl: userData.imagenUrl,
                fechaNacimiento: userData.fechaNacimiento,
                hasAttempt: userData.hasAttempt !== false // Si no existe, se considera true
            };

            logInfo(`Datos de usuario obtenidos para: ${tipoDocumento} - ${numeroDocumento}`);
            return userWithId;
        } catch (error) {
            logError(`Error al obtener datos del usuario: ${error.message}`);
            throw error;
        }
    }
};