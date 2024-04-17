import { ref, set, get, Database } from 'firebase/database';

export const saveWasteItemToFirebase = async (database: Database, date: string, wasteItems: { [itemName: string]: number }) => {
  const tablePath = `wasteItems/${date}`;

  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve('Timeout');
    }, 5000);
  });

  const databasePromise = new Promise(async (resolve, reject) => {
    try {
      const snapshot = await get(ref(database, tablePath));
      const existingItems = snapshot.val() || {};
      const updatedItems = { ...existingItems };

      for (const [itemName, amount] of Object.entries(wasteItems)) {
        updatedItems[itemName] = (updatedItems[itemName] || 0) + amount;
      }

      await set(ref(database, tablePath), updatedItems);
      resolve('Success');
    } catch (error) {
      reject(error);
    }
  });

  const result = await Promise.race([
    databasePromise,
    timeoutPromise
  ]);

  if (result === 'Timeout') {
    throw new Error('Timeout: Saving to database took too long.');
  } else if (result === 'Success') {
    console.log('Waste items saved to Firebase successfully');
  }
};
