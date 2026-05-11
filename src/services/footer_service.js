import { dbSite as db } from './firebase';
import { doc, setDoc, updateDoc, onSnapshot, collection, addDoc, getDoc, getDocs, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { logInfo, logError, logDebug } from '@/utils/logger.js';

export const FooterService = {
    // Generar fingerprint único y consistente para cada PC
    generateDeviceFingerprint() {
        const navigator = window.navigator;
        const screen = window.screen;

        // Crear una huella digital más robusta
        let fingerprint = '';
        fingerprint += navigator.userAgent;
        fingerprint += navigator.language;
        fingerprint += navigator.platform;
        fingerprint += navigator.hardwareConcurrency || 'unknown';
        fingerprint += screen.colorDepth;
        fingerprint += screen.width + 'x' + screen.height;
        fingerprint += screen.pixelDepth || '';
        fingerprint += new Date().getTimezoneOffset();

        // Convertir a hash más corto y manejable
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        // Convertir a string base36 para que sea más corto
        return 'PC_' + Math.abs(hash).toString(36).toUpperCase();
    },

    async getOrCreateDeviceIdentifier() {
        try {
            // Siempre usar el mismo fingerprint para esta PC
            const deviceFingerprint = this.generateDeviceFingerprint();

            // Primero buscar si este fingerprint ya existe en Firebase
            const deviceRef = doc(db, 'devices', deviceFingerprint);
            const deviceDoc = await getDoc(deviceRef);

            if (deviceDoc.exists()) {
                // Si existe, recuperar los datos guardados
                const data = deviceDoc.data();
                logInfo(`Dispositivo recuperado: ${deviceFingerprint}`);
                return {
                    id: deviceFingerprint,
                    token: data.deviceToken,
                    ip: data.ip || 'No asignada',
                    mac: data.mac || 'No asignada'
                };
            } else {
                // Si no existe, crear nueva entrada
                const deviceToken = this.generateDeviceToken();
                await setDoc(deviceRef, {
                    deviceToken,
                    ip: 'No asignada',
                    mac: 'No asignada',
                    createdAt: new Date().toISOString(),
                    lastSignal: null
                });

                logInfo(`Nuevo dispositivo creado: ${deviceFingerprint}`);
                return {
                    id: deviceFingerprint,
                    token: deviceToken,
                    ip: 'No asignada',
                    mac: 'No asignada'
                };
            }
        } catch (error) {
            logError(`Error al obtener/crear identificador de dispositivo: ${error.message}`);
            return null;
        }
    },

    generateDeviceToken() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    async getAllDevices() {
        try {
            const devicesCollection = collection(db, 'devices');
            const q = query(devicesCollection, orderBy('lastSignal', 'desc'));
            const querySnapshot = await getDocs(q);
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

    // Suscripción para todos los dispositivos en tiempo real
    subscribeToAllDevices(callback) {
        const devicesCollection = collection(db, 'devices');
        const q = query(devicesCollection, orderBy('lastSignal', 'desc'));

        return onSnapshot(q, (snapshot) => {
            const devices = [];
            snapshot.forEach((doc) => {
                devices.push({ id: doc.id, ...doc.data() });
            });
            callback(devices);
        }, (error) => {
            logError(`Error en la suscripción de dispositivos: ${error.message}`);
        });
    },

    subscribeToDeviceInfo(deviceId, callback) {
        if (typeof callback !== 'function') {
            logError('El callback proporcionado no es una función');
            return () => {};
        }

        const docRef = doc(db, 'devices', deviceId);
        return onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data());
            } else {
                callback(null);
            }
        }, (error) => {
            logError(`Error en la suscripción del dispositivo: ${error.message}`);
        });
    },

    async updateDeviceInfo(deviceId, deviceToken, ip, mac) {
        try {
            const docRef = doc(db, 'devices', deviceId);
            await updateDoc(docRef, {
                ip,
                mac,
                lastUpdated: new Date().toISOString()
            });
            return true;
        } catch (error) {
            logError(`Error al actualizar la información del dispositivo: ${error.message}`);
            return false;
        }
    },

    // Enviar señal de identificación
    async sendSignal(deviceId) {
        try {
            const docRef = doc(db, 'devices', deviceId);
            await updateDoc(docRef, {
                lastSignal: new Date().toISOString()
            });
            logDebug(`Señal enviada desde dispositivo ${deviceId}`);
            return true;
        } catch (error) {
            logError(`Error al enviar señal: ${error.message}`);
            return false;
        }
    },

    async deleteDevice(deviceId) {
        try {
            const docRef = doc(db, 'devices', deviceId);
            await deleteDoc(docRef);
            logInfo(`Dispositivo ${deviceId} eliminado correctamente`);
            return true;
        } catch (error) {
            logError(`Error al eliminar el dispositivo ${deviceId}: ${error.message}`);
            return false;
        }
    }
};