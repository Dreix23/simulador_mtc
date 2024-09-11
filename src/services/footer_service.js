import { db } from './firebase';
import { doc, setDoc, updateDoc, onSnapshot, collection, addDoc, getDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { logInfo, logError, logDebug } from '@/utils/logger.js';

export const FooterService = {
    clearDeviceCache() {
        localStorage.removeItem('deviceToken');
        localStorage.removeItem('deviceId');
        localStorage.removeItem('deviceInfo');
    },

    async getOrCreateDeviceIdentifier() {
        try {
            let deviceToken = localStorage.getItem('deviceToken');
            let deviceId = localStorage.getItem('deviceId');

            if (deviceToken && deviceId) {
                this.clearDeviceCache();
            }

            if (deviceId) {
                const deviceRef = doc(db, 'devices', deviceId);
                const deviceDoc = await getDoc(deviceRef);

                if (deviceDoc.exists()) {
                    deviceToken = deviceDoc.data().deviceToken;
                    this.updateLocalStorage(deviceId, deviceToken, 'No asignada', 'No asignada');
                    return { id: deviceId, token: deviceToken };
                }
            }

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
            }

            this.updateLocalStorage(deviceId, deviceToken, 'No asignada', 'No asignada');

            return { id: deviceId, token: deviceToken };
        } catch (error) {
            logError(`Error al obtener/crear identificador de dispositivo: ${error.message}`);
            return null;
        }
    },

    updateLocalStorage(deviceId, deviceToken, ip, mac) {
        localStorage.setItem('deviceToken', deviceToken);
        localStorage.setItem('deviceId', deviceId);
        localStorage.setItem('deviceInfo', JSON.stringify({ ip, mac, deviceId, deviceToken }));
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
            return [];
        }

        try {
            const devicesCollection = collection(db, 'devices');
            const querySnapshot = await getDocs(devicesCollection);
            const devices = [];
            querySnapshot.forEach((doc) => {
                devices.push({ id: doc.id, ...doc.data() });
            });
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
            return () => {};
        }

        const docRef = doc(db, 'devices', deviceId);
        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                this.updateLocalStorage(deviceId, deviceToken, data.ip, data.mac);
                callback(data);
            } else {
                callback(null);
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
            this.updateLocalStorage(deviceId, deviceToken, ip, mac);
            return true;
        }

        try {
            const docRef = doc(db, 'devices', deviceId);
            await updateDoc(docRef, updateData);
            this.updateLocalStorage(deviceId, deviceToken, ip, mac);
            return true;
        } catch (error) {
            logError(`Error al actualizar la información del dispositivo en Firebase: ${error.message}`);
            return false;
        }
    },

    async deleteDevice(deviceId) {
        if (this.isPrivateMode()) {
            this.clearDeviceCache();
            return true;
        }

        try {
            const docRef = doc(db, 'devices', deviceId);
            await deleteDoc(docRef);
            this.clearDeviceCache();
            logInfo(`Dispositivo ${deviceId} eliminado correctamente`);
            return true;
        } catch (error) {
            logError(`Error al eliminar el dispositivo ${deviceId}: ${error.message}`);
            return false;
        }
    },

    isPrivateMode() {
        return !window.indexedDB;
    }
};
