import { getAll, getById, addRecord, updateRecord, deleteRecord, nextCode } from './firestore';

const COLLECTION = 'zones';

export async function getZones() {
  return await getAll(COLLECTION);
}

export async function getZone(id) {
  return await getById(COLLECTION, id);
}

export async function createZone(data) {
  const code = await nextCode('Z');
  return await addRecord(COLLECTION, { ...data, code });
}

export async function updateZone(id, updates) {
  return await updateRecord(COLLECTION, id, updates);
}

export async function deleteZone(id) {
  return await deleteRecord(COLLECTION, id);
}
