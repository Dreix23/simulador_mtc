import { db, storage } from './firebase.js';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, Timestamp, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { logInfo, logError } from '@/utils/logger.js';
import * as XLSX from 'xlsx';

const CACHE_KEY = 'users_cache';

const documentTypes = ["DNI", "CE", "CSR", "PTP", "CID"];
const categories = ["AI", "BIIA", "BIIB", "AIIA", "AIIB", "AIIIA", "AIIIB", "AIIIC", "BIIC"];

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
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();

                if (userData.imagenUrl) {
                    const imageRef = ref(storage, userData.imagenUrl);
                    await deleteObject(imageRef);
                    logInfo(`Imagen del usuario con ID: ${userId} eliminada`);
                }

                await deleteDoc(userDocRef);
                logInfo(`Usuario con ID: ${userId} eliminado`);

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
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

            const addedUsers = [];
            const errors = [];

            for (let i = 0; i < jsonData.length; i++) {
                const row = jsonData[i];
                const rowNumber = i + 2; // Las filas de Excel comienzan en 1, y tenemos una fila de encabezado

                const tipoDocumento = row['TIP DOC'] || '';
                const categoria = row['CAT EXA'] || '';

                if (!documentTypes.includes(tipoDocumento)) {
                    errors.push(`Fila ${rowNumber}: Tipo de documento "${tipoDocumento}" no válido`);
                }

                if (!categories.includes(categoria)) {
                    errors.push(`Fila ${rowNumber}: Categoría "${categoria}" no válida`);
                }

                if (errors.length === 0) {
                    try {
                        const user = await this.addUser({
                            tipoDocumento: tipoDocumento,
                            numeroDocumento: row['NUM DOC'],
                            apellidos: row['APELLIDOS'] || '',
                            nombre: row['NOMBRES'] || '',
                            categoria: categoria,
                        });
                        addedUsers.push(user);
                    } catch (error) {
                        errors.push(`Fila ${rowNumber}: Error al añadir usuario - ${error.message}`);
                    }
                }
            }

            if (errors.length > 0) {
                const errorMessage = errors.join('\n');
                logError(`Errores en la carga de Excel:\n${errorMessage}`);
                throw new Error(errorMessage);
            }

            logInfo(`${addedUsers.length} usuarios importados desde Excel`);
            return addedUsers;
        } catch (error) {
            logError(`Error al procesar archivo Excel: ${error.message}`);
            throw error;
        }
    },

    async countUsersToDelete() {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 0);

            const q = query(
                collection(db, 'users'),
                where('createdAt', '<=', Timestamp.fromDate(oneWeekAgo))
            );

            const querySnapshot = await getDocs(q);
            const count = querySnapshot.size;

            logInfo(`Se encontraron ${count} usuarios para eliminar`);
            return count;
        } catch (error) {
            logError('Error al contar usuarios para eliminar:', error);
            throw error;
        }
    },

    async deleteOldUsers() {
        try {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 0);

            const usersQuery = query(
                collection(db, 'users'),
                where('createdAt', '<=', Timestamp.fromDate(oneWeekAgo))
            );

            const usersSnapshot = await getDocs(usersQuery);
            let deletedCount = 0;

            for (const userDoc of usersSnapshot.docs) {
                const userData = userDoc.data();

                // Eliminar resultados de exámenes
                const examResultsQuery = query(
                    collection(db, 'examResults'),
                    where('numeroDocumento', '==', userData.numeroDocumento)
                );
                const examResultsSnapshot = await getDocs(examResultsQuery);
                for (const examResultDoc of examResultsSnapshot.docs) {
                    await deleteDoc(examResultDoc.ref);
                }

                // Eliminar imagen del usuario si existe
                if (userData.imagenUrl) {
                    const imageRef = ref(storage, userData.imagenUrl);
                    await deleteObject(imageRef);
                }

                // Eliminar usuario
                await deleteDoc(userDoc.ref);
                deletedCount++;
            }

            // Actualizar caché local
            const cachedUsers = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
            const updatedUsers = cachedUsers.filter(user => {
                const userCreatedAt = user.createdAt.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
                return userCreatedAt > oneWeekAgo;
            });
            localStorage.setItem(CACHE_KEY, JSON.stringify(updatedUsers));

            logInfo(`${deletedCount} usuarios antiguos y sus exámenes han sido eliminados`);
            return deletedCount;
        } catch (error) {
            logError('Error al eliminar usuarios antiguos:', error);
            throw error;
        }
    }
};
