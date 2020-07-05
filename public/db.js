let db, tx, store;
let databaseName = "budget";
let storeName = "offlineStore";
const request = indexedDB.open(databaseName, 1);
request.onupgradeneeded = function (e) {
  const db = request.result;
  db.createObjectStore(storeName, { autoIncrement: true });
};
request.onerror = function (e) {
  console.log("There was an error");
};
request.onsuccess = function (e) {
  db = request.result;
  db.onerror = function (e) {
    console.log("error:");
  };
};
function saveRecord(record) {
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  store.put(record);
}
function backOnline() {
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  const all = store.getAll();
  all.onsuccess = function () {
    if (all.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(all.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const tx = db.transaction(storeName, "readwrite");
          const store = tx.objectStore(storeName);
          store.clear();
        });
    }
  };
}
window.addEventListener("online", backOnline);
