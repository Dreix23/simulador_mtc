import { db, storage } from './firebase.js';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc, Timestamp, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logInfo, logError } from '@/utils/logger.js';
import * as XLSX from 'xlsx';

export const userService = {
    async addUser(user) {
        try {
            const userToAdd = { ...user };
            delete userToAdd.imagen;

            // Auto-agregar createdAt
            userToAdd.createdAt = Timestamp.now();

            // Quitar el guión de la categoría
            if (userToAdd.categoria) {
                userToAdd.categoria = userToAdd.categoria.replace('-', '');
            }

            if (user.imagen) {
                const imageUrl = await this.uploadUserImage(user.imagen);
                userToAdd.imagenUrl = imageUrl;
            }

            // Validar campo requerido
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
                    // Intentar convertir la fecha a un objeto Date
                    const date = new Date(fechaNacimiento);
                    if (!isNaN(date.getTime())) {
                        // Si es una fecha válida, formatearla como yyyy-mm-dd
                        fechaNacimiento = date.toISOString().split('T')[0];
                    } else {
                        // Si no es una fecha válida, dejarla como está
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

    async deleteUser(userId) {
        try {
            const userDocRef = doc(db, 'users', userId);
            await deleteDoc(userDocRef);
            logInfo(`Usuario con ID: ${userId} eliminado`);
        } catch (error) {
            logError(`Error al eliminar usuario: ${error.message}`);
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
    },

    getUsersSnapshot(callback) {
        try {
            const q = collection(db, 'users');
            return onSnapshot(q, (querySnapshot) => {
                const users = [];
                querySnapshot.forEach((doc) => {
                    users.push({ id: doc.id, ...doc.data() });
                });
                callback(users);
            }, (error) => {
                logError(`Error al obtener snapshot de usuarios: ${error.message}`);
            });
        } catch (error) {
            logError(`Error al configurar snapshot de usuarios: ${error.message}`);
            throw error;
        }
    }
};