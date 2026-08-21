import {
  getAll, getWhere, addRecord, updateRecord, deleteRecord, nextCode, serverTimestamp,
} from "./firestore";

const COLLECTION_NAME = "requests";

/**
 * Safe code generator wrapper around nextCode to fallback gracefully
 * if Firestore counters permissions fail for non-admin users.
 */
async function generateRequestCode() {
  try {
    return await nextCode("RQ");
  } catch (err) {
    console.warn("Failed to generate counter code via transaction, using fallback:", err);
    const rand = Math.floor(100 + Math.random() * 900);
    return `RQ-${rand}`;
  }
}

/**
 * Fetch all requests from Firestore.
 */
export async function getAllRequests() {
  return await getAll(COLLECTION_NAME);
}

/**
 * Fetch requests submitted by a specific resident.
 */
export async function getRequestsByResident(residentId) {
  if (!residentId) return [];
  return await getWhere(COLLECTION_NAME, "residentId", "==", residentId);
}

/**
 * Create a new request record.
 */
export async function addRequest(requestData) {
  const code = requestData.code || await generateRequestCode();
  const data = {
    code,
    type: requestData.type || "missed_pickup", // "missed_pickup" or "special_pickup"
    residentId: requestData.residentId || "",
    residentName: requestData.residentName || "Resident",
    zoneId: requestData.zoneId || "",
    pickupId: requestData.pickupId || null,
    description: requestData.description || "",
    preferredDate: requestData.preferredDate || null,
    status: requestData.status || "Pending", // "Pending" or "Resolved"
    createdAt: serverTimestamp(),
  };
  return await addRecord(COLLECTION_NAME, data);
}

/**
 * Convenience helper to report a missed pickup.
 */
export async function createMissedPickupRequest({ residentId, residentName, zoneId, pickupId, description }) {
  return await addRequest({
    type: "missed_pickup",
    residentId,
    residentName,
    zoneId,
    pickupId,
    description: description || "Reported missed scheduled waste collection.",
  });
}

/**
 * Convenience helper to request a special pickup.
 */
export async function createSpecialPickupRequest({ residentId, residentName, zoneId, description, preferredDate }) {
  return await addRequest({
    type: "special_pickup",
    residentId,
    residentName,
    zoneId,
    description,
    preferredDate,
  });
}

/**
 * Update request status (Pending, Resolved).
 */
export async function updateRequestStatus(requestId, status) {
  return await updateRecord(COLLECTION_NAME, requestId, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a request record.
 */
export async function deleteRequest(requestId) {
  return await deleteRecord(COLLECTION_NAME, requestId);
}
