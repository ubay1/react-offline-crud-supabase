export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("offline_app", 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const addUser = async (user: unknown) => {
  const db = await openDB();
  const tx = db.transaction("users", "readwrite");
  tx.objectStore("users").put(user);
  return tx.oncomplete;
};

export const getAllUsers = async (): Promise<unknown[]> => {
  const db = await openDB();
  return new Promise((resolve) => {
    const tx = db.transaction("users", "readonly");
    const store = tx.objectStore("users");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
  });
};

export const bulkInsert = async (users: unknown[]) => {
  const db = await openDB();
  const tx = db.transaction("users", "readwrite");
  const store = tx.objectStore("users");
  users.forEach((u) => store.put(u));
  return tx.oncomplete;
};

export const deleteUser = async (id: string) => {
  const db = await openDB();
  const tx = db.transaction("users", "readwrite");
  tx.objectStore("users").delete(id);
  return tx.oncomplete;
};

export const updateUser = async (user: { id: string; name: string; email: string }) => {
  const db = await openDB();
  const tx = db.transaction("users", "readwrite");
  tx.objectStore("users").put(user); // put akan overwrite kalau id sudah ada
  return tx.oncomplete;
};
