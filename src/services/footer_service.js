import { db } from './firebase';
import { doc, setDoc, updateDoc, onSnapshot, collection, addDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { logInfo, logError, logDebug } from '@/utils/logger.js';

export const FooterService = {
    // Limpia el localStorage de todos los dispositivos registrados
    clearDeviceCache() {
        logInfo('Limpiando cache de dispositivos en localStorage...');
        localStorage.removeItem('deviceToken');
        localStorage.removeItem('deviceId');
        logInfo('Cache de dispositivos eliminada.');
    },

    // Obtiene o crea un identificador de dispositivo
    async getOrCreateDeviceIdentifier() {
        try {
            let deviceToken = localStorage.getItem('deviceToken');
            let deviceId = localStorage.getItem('deviceId');

            // Si existe en localStorage, verificamos en Firebase si existe realmente
            if (deviceToken && deviceId) {
                const deviceRef = doc(db, 'devices', deviceId);
                const deviceDoc = await getDoc(deviceRef);

                if (deviceDoc.exists()) {
                    logInfo(`Dispositivo encontrado en Firebase: ${deviceId}`);
                    // Limpiamos otros dispositivos de localStorage si es necesario
                    this.ensureSingleDeviceInCache(deviceId, deviceToken);
                    return { id: deviceId, token: deviceToken };
                } else {
                    logInfo(`Dispositivo no encontrado en Firebase, creando uno nuevo: ${deviceId}`);
                }
            }

            // Generar nuevos datos si no existen
            deviceToken = this.generateDeviceToken();
            deviceId = this.generateDeviceId();

            if (!this.isPrivateMode()) {
                const devicesCollection = collection(db, 'devices');
                const newDeviceRef = await addDoc(devicesCollection, {
                    deviceToken,
                    ip: 'No asignada',
                    mac: 'No asignada',
                    createdAt: new Date().toISOString()
                });
                deviceId = newDeviceRef.id;
                logInfo(`Nuevo dispositivo registrado en Firebase: ${deviceId}`);
            } else {
                logInfo(`Modo privado: Nuevo dispositivo no registrado en Firebase: ${deviceId}`);
            }

            // Guardamos los nuevos datos en localStorage
            localStorage.setItem('deviceToken', deviceToken);
            localStorage.setItem('deviceId', deviceId);
            logInfo(`Nuevo token y ID de dispositivo generados: ${deviceToken}, ${deviceId}`);

            // Limpiar cualquier otro dispositivo existente
            this.ensureSingleDeviceInCache(deviceId, deviceToken);

            return { id: deviceId, token: deviceToken };
        } catch (error) {
            logError(`Error al obtener/crear identificador de dispositivo: ${error.message}`);
            return null;
        }
    },

    // Asegura que solo un dispositivo exista en localStorage
    ensureSingleDeviceInCache(currentDeviceId, currentDeviceToken) {
        const storedDeviceId = localStorage.getItem('deviceId');
        const storedDeviceToken = localStorage.getItem('deviceToken');

        // Si los datos en localStorage no coinciden con los actuales, se eliminan
        if (storedDeviceId && storedDeviceId !== currentDeviceId) {
            logInfo(`Eliminando dispositivo previo de la cache: ${storedDeviceId}`);
            this.clearDeviceCache();  // Limpiar cache previa
            // Volver a almacenar solo los datos actuales
            localStorage.setItem('deviceToken', currentDeviceToken);
            localStorage.setItem('deviceId', currentDeviceId);
            logInfo(`Dispositivo actualizado en la cache: ${currentDeviceId}`);
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

    generateDeviceToken() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    async getAllDevices() {
        if (this.isPrivateMode()) {
            logDebug('Modo privado: No se pueden obtener todos los dispositivos');
            return [];
        }

        try {
            const devicesCollection = collection(db, 'devices');
            const querySnapshot = await getDocs(devicesCollection);
            const devices = [];
            querySnapshot.forEach((doc) => {
                devices.push({ id: doc.id, ...doc.data() });
            });
            logInfo(`Se obtuvieron ${devices.length} dispositivos`);
            return devices;
        } catch (error) {
            logError(`Error al obtener todos los dispositivos: ${error.message}`);
            return [];
        }
    },

    subscribeToDeviceInfo(deviceId, deviceToken, callback) {
        if (typeof callback !== 'function') {
            logError('El callback proporcionado no es una función');
            return () => {};
        }

        if (this.isPrivateMode()) {
            logDebug('Modo privado: No se suscribe a cambios en Firebase');
            return () => {};
        }

        const docRef = doc(db, 'devices', deviceId);
        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
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

    async updateDeviceInfo(deviceId, deviceToken, ip, mac) {
        const updateData = {
            ip,
            mac,
            lastUpdated: new Date().toISOString()
        };

        if (this.isPrivateMode()) {
            logInfo(`Modo privado: Información del dispositivo actualizada localmente: IP=${ip}, MAC=${mac}`);
            return true;
        }

        try {
            const docRef = doc(db, 'devices', deviceId);
            await updateDoc(docRef, updateData);
            logInfo(`Información del dispositivo actualizada en Firebase: IP=${ip}, MAC=${mac}`);
            return true;
        } catch (error) {
            logError(`Error al actualizar la información del dispositivo en Firebase: ${error.message}`);
            return false;
        }
    },

    isPrivateMode() {
        return !window.indexedDB;
    }
};
