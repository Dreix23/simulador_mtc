import { db, storage } from './firebase.js';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, Timestamp, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logInfo, logError } from '@/utils/logger.js';
import * as XLSX from 'xlsx';

const CACHE_KEY = 'users_cache';

export const userService = {
    async getUsers() {
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (cachedData) {
                logInfo('Usando datos de usuarios en caché');
                return JSON.parse(cachedData);
            }
            return await this.fetchAndCacheUsers();
        } catch (error) {
            logError('Error al obtener usuarios:', error);
            throw error;
        }
    },

    async fetchAndCacheUsers() {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        localStorage.setItem(CACHE_KEY, JSON.stringify(users));
        logInfo('Usuarios obtenidos y guardados en caché');
        return users;
    },

    async addUser(user) {
        try {
            const userToAdd = { ...user };
            delete userToAdd.imagen;
            userToAdd.createdAt = Timestamp.now();
            if (userToAdd.categoria) {
                userToAdd.categoria = userToAdd.categoria.replace('-', '');
            }
            if (user.imagen) {
                const imageUrl = await this.uploadUserImage(user.imagen);
                userToAdd.imagenUrl = imageUrl;
            }
            if (!userToAdd.numeroDocumento) {
                throw new Error('Número de documento es requerido');
            }
            const userRef = await addDoc(collection(db, 'users'), userToAdd);
            logInfo(`Usuario añadido con ID: ${userRef.id}`);
            return { id: userRef.id, ...userToAdd };
        } catch (error) {
            logError(`Error al añadir usuario: ${error.message}`);
            throw error;
        }
    },

    async updateUser(user) {
        try {
            const userToUpdate = { ...user };
            delete userToUpdate.imagen;
            if (userToUpdate.categoria) {
                userToUpdate.categoria = userToUpdate.categoria.replace('-', '');
            }
            if (user.imagen && user.imagen instanceof File) {
                const imageUrl = await this.uploadUserImage(user.imagen);
                userToUpdate.imagenUrl = imageUrl;
            }
            if (!userToUpdate.numeroDocumento) {
                throw new Error('Número de documento es requerido');
            }
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, userToUpdate);
            logInfo(`Usuario actualizado con ID: ${user.id}`);
            return { id: user.id, ...userToUpdate };
        } catch (error) {
            logError(`Error al actualizar usuario: ${error.message}`);
            throw error;
        }
    },

    async deleteUser(userId) {
        try {
            // Obtener el documento del usuario
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();

                // Si el usuario tiene una imagen, eliminarla del storage
                if (userData.imagenUrl) {
                    const imageRef = ref(storage, userData.imagenUrl);
                    await deleteObject(imageRef);
                    logInfo(`Imagen del usuario con ID: ${userId} eliminada`);
                }

                // Eliminar el documento del usuario
                await deleteDoc(userDocRef);
                logInfo(`Usuario con ID: ${userId} eliminado`);

                // Actualizar el caché local
                const cachedUsers = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
                const updatedUsers = cachedUsers.filter(user => user.id !== userId);
                localStorage.setItem(CACHE_KEY, JSON.stringify(updatedUsers));
            } else {
                logError(`Usuario con ID: ${userId} no encontrado`);
            }
        } catch (error) {
            logError(`Error al eliminar usuario: ${error.message}`);
            throw error;
        }
    },

    getUsersSnapshot(callback) {
        try {
            const q = collection(db, 'users');
            return onSnapshot(q, (querySnapshot) => {
                const users = [];
                querySnapshot.forEach((doc) => {
                    users.push({ id: doc.id, ...doc.data() });
                });
                localStorage.setItem(CACHE_KEY, JSON.stringify(users));
                logInfo('Caché de usuarios actualizado');
                callback(users);
            }, (error) => {
                logError(`Error al obtener snapshot de usuarios: ${error.message}`);
            });
        } catch (error) {
            logError(`Error al configurar snapshot de usuarios: ${error.message}`);
            throw error;
        }
    },

    async uploadUserImage(file) {
        try {
            const storageRef = ref(storage, `user_images/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            logInfo('Imagen de usuario subida correctamente');
            return downloadURL;
        } catch (error) {
            logError(`Error al subir imagen de usuario: ${error.message}`);
            throw error;
        }
    },

    async processExcelFile(file) {
        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false, dateNF: 'yyyy-mm-dd' });

            const addedUsers = [];
            for (const row of jsonData) {
                let fechaNacimiento = row['FECHA NACIMIENTO'];
                if (fechaNacimiento) {
                    const date = new Date(fechaNacimiento);
                    if (!isNaN(date.getTime())) {
                        fechaNacimiento = date.toISOString().split('T')[0];
                    } else {
                        console.warn(`Fecha no válida encontrada: ${fechaNacimiento}`);
                    }
                }

                const user = await this.addUser({
                    tipoDocumento: row['TIPO DOCUMENTO'] || 'DNI',
                    numeroDocumento: row['NUMERO DOCUMENTO'],
                    apellidos: row['APELLIDOS'] || '',
                    nombre: row['NOMBRE'] || '',
                    fechaNacimiento: fechaNacimiento || '',
                    categoria: (row['CATEGORIA'] || 'A-I').replace('-', ''),
                });
                addedUsers.push(user);
            }
            logInfo(`${addedUsers.length} usuarios importados desde Excel`);
            return addedUsers;
        } catch (error) {
            logError(`Error al procesar archivo Excel: ${error.message}`);
            throw error;
        }
    },

    async deleteOldUsers() {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

            const q = query(
                collection(db, 'users'),
                where('createdAt', '<=', Timestamp.fromDate(oneWeekAgo))
            );

            const querySnapshot = await getDocs(q);
            const deletedCount = querySnapshot.size;

            querySnapshot.forEach(async (doc) => {
                await deleteDoc(doc.ref);
            });

            logInfo(`${deletedCount} usuarios antiguos eliminados`);
            return deletedCount;
        } catch (error) {
            logError(`Error al eliminar usuarios antiguos: ${error.message}`);
            throw error;
        }
    }
};
