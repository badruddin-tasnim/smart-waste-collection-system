import { getAll, getWhere, getById, addRecord, updateRecord, deleteRecord, nextCode } from './firestore';

const COLLECTION = 'routes';

export async function getRoutes() {
  return await getAll(COLLECTION);
}

export async function getRoute(id) {
  return await getById(COLLECTION, id);
}

export async function getRoutesByZone(zoneId) {
  return await getWhere(COLLECTION, 'zoneId', '==', zoneId);
}

export async function createRoute(data) {
  const code = await nextCode('RT');
  return await addRecord(COLLECTION, { ...data, code });
}

export async function updateRoute(id, updates) {
  return await updateRecord(COLLECTION, id, updates);
}

export async function deleteRoute(id) {
  return await deleteRecord(COLLECTION, id);
}
