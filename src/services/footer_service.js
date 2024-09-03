import { db } from './firebase';
import { doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { logInfo, logError, logDebug } from '@/utils/logger.js';

export const FooterService = {
    async getOrCreateDeviceIdentifier() {
        try {
            const deviceId = this.generateDeviceId();
            const docRef = doc(db, 'devices', deviceId);
            await setDoc(docRef, {}, { merge: true });
            logInfo(`Dispositivo registrado/actualizado: ${deviceId}`);
            return deviceId;
        } catch (error) {
            logError(`Error al obtener/crear identificador de dispositivo: ${error.message}`);
            return null;
        }
    },

    generateDeviceId() {
        const navigator = window.navigator;
        const screen = window.screen;
        let deviceId = '';

        deviceId += navigator.userAgent.replace(/\D+/g, '');
        deviceId += navigator.language;
        deviceId += screen.colorDepth;
        deviceId += screen.width + 'x' + screen.height;

        return btoa(deviceId).slice(0, 20);
    },

    subscribeToDeviceInfo(deviceId, callback) {
        const docRef = doc(db, 'devices', deviceId);

        // Primero, intentamos obtener los datos del localStorage
        const cachedData = localStorage.getItem('deviceInfo');
        if (cachedData) {
            callback(JSON.parse(cachedData));
        }

        // Luego, nos suscribimos a los cambios en Firebase
        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                localStorage.setItem('deviceInfo', JSON.stringify(data));
                callback(data);
                logDebug('Datos del dispositivo actualizados desde Firebase');
            } else {
                localStorage.removeItem('deviceInfo');
                callback(null);
                logDebug('No se encontraron datos del dispositivo en Firebase');
            }
        }, (error) => {
            logError(`Error en la suscripción del dispositivo: ${error.message}`);
        });
    },

    async updateDeviceInfo(deviceId, ip, mac) {
        try {
            const docRef = doc(db, 'devices', deviceId);
            const updateData = {
                ip,
                mac,
                lastUpdated: new Date().toISOString()
            };

            // Actualizamos primero el localStorage
            const cachedData = localStorage.getItem('deviceInfo');
            if (cachedData) {
                const updatedData = { ...JSON.parse(cachedData), ...updateData };
                localStorage.setItem('deviceInfo', JSON.stringify(updatedData));
            }

            // Luego actualizamos Firebase
            await updateDoc(docRef, updateData);
            logInfo(`Información del dispositivo actualizada: IP=${ip}, MAC=${mac}`);
            return true;
        } catch (error) {
            logError(`Error al actualizar la información del dispositivo: ${error.message}`);
            return false;
        }
    }
};
