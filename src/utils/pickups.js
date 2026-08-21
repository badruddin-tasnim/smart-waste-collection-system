import {
  getAll, getWhere, addRecord, updateRecord, deleteRecord, nextCode, serverTimestamp,
} from "./firestore";

const COLLECTION_NAME = "pickups";

/**
 * Safe code generator wrapper around nextCode to fallback gracefully
 * if Firestore counters permissions fail for non-admin users or network issues.
 */
async function generatePickupCode() {
  try {
    return await nextCode("PU");
  } catch (err) {
    console.warn("Failed to generate counter code via transaction, using fallback:", err);
    const rand = Math.floor(100 + Math.random() * 900);
    return `PU-${rand}`;
  }
}

/**
 * Fetch all pickups from Firestore.
 */
export async function getAllPickups() {
  return await getAll(COLLECTION_NAME);
}

/**
 * Fetch pickups filtered by zone ID.
 */
export async function getPickupsByZone(zoneId) {
  if (!zoneId) return [];
  return await getWhere(COLLECTION_NAME, "zoneId", "==", zoneId);
}

/**
 * Fetch pickups filtered by route ID.
 */
export async function getPickupsByRoute(routeId) {
  if (!routeId) return [];
  return await getWhere(COLLECTION_NAME, "routeId", "==", routeId);
}

/**
 * Create a new pickup document.
 */
export async function addPickup(pickupData) {
  const code = pickupData.code || await generatePickupCode();
  const data = {
    code,
    routeId: pickupData.routeId || "",
    routeCode: pickupData.routeCode || "",
    zoneId: pickupData.zoneId || "",
    zoneName: pickupData.zoneName || "",
    date: pickupData.date || new Date().toISOString().split("T")[0],
    time: pickupData.time || "08:00 AM",
    status: pickupData.status || "Scheduled",
    createdAt: serverTimestamp(),
  };
  return await addRecord(COLLECTION_NAME, data);
}

/**
 * Update pickup status (Scheduled, Collected, Missed).
 */
export async function updatePickupStatus(pickupId, status) {
  return await updateRecord(COLLECTION_NAME, pickupId, {
    status,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a pickup record.
 */
export async function deletePickup(pickupId) {
  return await deleteRecord(COLLECTION_NAME, pickupId);
}

/**
 * Utility to generate next N scheduled pickups for a given route based on its schedule.
 * @param {Object} route - Route object containing { id, code, zoneId, zoneName, days, time }
 * @param {number} count - Number of upcoming pickup occurrences to generate (default 4)
 */
export async function generateRoutePickups(route, count = 4) {
  if (!route || !route.id) throw new Error("Valid route is required to generate pickups");

  // Standardize day parsing (supports "Monday", "Mon", 0-6, etc.)
  const dayNameMap = {
    sun: 0, sunday: 0,
    mon: 1, monday: 1,
    tue: 2, tuesday: 2,
    wed: 3, wednesday: 3,
    thu: 4, thursday: 4,
    fri: 5, friday: 5,
    sat: 6, saturday: 6,
  };

  let targetDays = [];
  if (Array.isArray(route.days)) {
    targetDays = route.days.map(d => {
      if (typeof d === "number") return d;
      const key = String(d).trim().toLowerCase();
      return dayNameMap[key] !== undefined ? dayNameMap[key] : null;
    }).filter(d => d !== null);
  } else if (typeof route.days === "string") {
    targetDays = route.days.split(",").map(d => {
      const key = d.trim().toLowerCase();
      return dayNameMap[key] !== undefined ? dayNameMap[key] : null;
    }).filter(d => d !== null);
  }

  // Default to Mon/Wed/Fri if no days specified
  if (targetDays.length === 0) {
    targetDays = [1, 3, 5];
  }

  const generated = [];
  const curr = new Date();
  curr.setDate(curr.getDate() + 1); // Start from tomorrow

  let attempts = 0;
  while (generated.length < count && attempts < 60) {
    attempts++;
    const dayOfWeek = curr.getDay();
    if (targetDays.includes(dayOfWeek)) {
      const dateStr = curr.toISOString().split("T")[0];
      const code = await generatePickupCode();
      const newPickup = await addRecord(COLLECTION_NAME, {
        code,
        routeId: route.id,
        routeCode: route.code || route.name || "RT-N/A",
        zoneId: route.zoneId || "",
        zoneName: route.zoneName || "Zone",
        date: dateStr,
        time: route.time || "08:00 AM",
        status: "Scheduled",
        createdAt: serverTimestamp(),
      });
      generated.push(newPickup);
    }
    curr.setDate(curr.getDate() + 1);
  }

  return generated;
}
