import { db } from './firebase';
import { doc, setDoc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { logInfo, logError, logDebug } from '@/utils/logger.js';

export const FooterService = {
    async getOrCreateDeviceIdentifier() {
        try {
            const deviceId = this.generateDeviceId();
            const cachedData = localStorage.getItem('deviceInfo');

            if (!cachedData) {
                const docRef = doc(db, 'devices', deviceId);
                const docSnap = await getDoc(docRef);

                if (!docSnap.exists()) {
                    const defaultData = {
                        ip: 'No asignada',
                        mac: 'No asignada',
                        createdAt: new Date().toISOString()
                    };
                    await setDoc(docRef, defaultData);
                    localStorage.setItem('deviceInfo', JSON.stringify(defaultData));
                    logInfo(`Nuevo dispositivo registrado: ${deviceId}`);
                } else {
                    localStorage.setItem('deviceInfo', JSON.stringify(docSnap.data()));
                }
            }

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
        if (!deviceId) {
            logError('DeviceId no proporcionado para la suscripción');
            return () => {};
        }

        const cachedData = localStorage.getItem('deviceInfo');
        if (cachedData) {
            callback(JSON.parse(cachedData));
        }

        const docRef = doc(db, 'devices', deviceId);

        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                localStorage.setItem('deviceInfo', JSON.stringify(data));
                callback(data);
                logDebug('Datos del dispositivo actualizados desde Firebase');
            } else {
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

            await updateDoc(docRef, updateData);
            localStorage.setItem('deviceInfo', JSON.stringify(updateData));
            logInfo(`Información del dispositivo actualizada: IP=${ip}, MAC=${mac}`);
            return true;
        } catch (error) {
            logError(`Error al actualizar la información del dispositivo: ${error.message}`);
            return false;
        }
    }
};