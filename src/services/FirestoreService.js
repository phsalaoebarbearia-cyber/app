import { db } from '../config/firebaseConfig';
import {
  collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc,
  query, where, onSnapshot
} from 'firebase/firestore';

const ADMIN_USER = {
  id: 'admin',
  name: 'Administrador PH',
  email: 'ph@barbearia.com',
  phone: '(74) 99925-8772',
  password: '123456',
  role: 'admin',
};

export const loadUsers = async () => {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const loadBarbers = async () => {
  const snap = await getDocs(collection(db, 'barbers'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const loadServices = async () => {
  const snap = await getDocs(collection(db, 'services'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const loadHours = async () => {
  const docRef = doc(db, 'settings', 'hours');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const saveHours = async (hours) => {
  await setDoc(doc(db, 'settings', 'hours'), hours);
};

export const loadAppointments = async () => {
  const snap = await getDocs(collection(db, 'appointments'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const loadAppointmentsByUser = async (userId) => {
  const q = query(collection(db, 'appointments'), where('userId', '==', userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const loadAppointmentsByBarber = async (barberName) => {
  const q = query(collection(db, 'appointments'), where('barber.name', '==', barberName));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const createAppointment = async (appointment) => {
  const docRef = doc(db, 'appointments', appointment.id);
  await setDoc(docRef, appointment);
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  const docRef = doc(db, 'appointments', appointmentId);
  await updateDoc(docRef, { status });
};

export const deleteAppointment = async (appointmentId) => {
  await deleteDoc(doc(db, 'appointments', appointmentId));
};

export const createUser = async (user) => {
  const docRef = doc(db, 'users', user.id);
  await setDoc(docRef, user);
};

export const updateUser = async (userId, updates) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, updates);
};

export const createBarber = async (barber) => {
  const docRef = doc(db, 'barbers', barber.id);
  await setDoc(docRef, barber);
};

export const updateBarber = async (barberId, updates) => {
  const docRef = doc(db, 'barbers', barberId);
  await updateDoc(docRef, updates);
};

export const deleteBarber = async (barberId) => {
  await deleteDoc(doc(db, 'barbers', barberId));
};

export const createService = async (service) => {
  const docRef = doc(db, 'services', service.id);
  await setDoc(docRef, service);
};

export const updateService = async (serviceId, updates) => {
  const docRef = doc(db, 'services', serviceId);
  await updateDoc(docRef, updates);
};

export const deleteService = async (serviceId) => {
  await deleteDoc(doc(db, 'services', serviceId));
};

export const loadFavorites = async (userId) => {
  const docRef = doc(db, 'favorites', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data().barberIds || []) : [];
};

export const saveFavorites = async (userId, barberIds) => {
  const docRef = doc(db, 'favorites', userId);
  await setDoc(docRef, { barberIds });
};

export const findUserByEmailPassword = async (email, password) => {
  if (email === ADMIN_USER.email && password === ADMIN_USER.password) return ADMIN_USER;
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const userData = snap.docs[0].data();
  if (userData.password !== password) return null;
  return { id: snap.docs[0].id, ...userData };
};

export const getClients = async () => {
  const q = query(collection(db, 'users'), where('role', '==', 'client'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
