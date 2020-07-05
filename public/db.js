//universal variables
let db, tx, store;
let databaseName = "budget";
let storeName = "offlineStore";

//create a new request for a budget database
const request = indexedDB.open(databaseName, 1);

request.onupgradeneeded = function (e) {
  //create object storage that goes under offlineStore
  //and set it to autoIncrement
  const db = request.result;
  db.createObjectStore(storeName, { autoIncrement: true });
};

request.onerror = function (e) {
  console.log("There was an error" + this.result);
};

request.onsuccess = function (e) {
  db = request.result;
  db.onerror = function (e) {
    console.log("error:");
  };
  //check if app is online before running function back online
  if (navigator.onLine) {
    backOnline();
  }
};

function saveRecord(record) {
  //create a transation with offlineStore database
  //include readWrite access
  const tx = db.transaction(storeName, "readwrite");

  //access your offlineStore object store
  const store = tx.objectStore(storeName);

  //add transaction to store using a put method
  store.put(record);
}

function backOnline() {
  //open a transaction on the database
  const tx = db.transaction(storeName, "readwrite");
  //access offlineStore object store
  const store = tx.objectStore(storeName);
  //get all records
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
          //if successful open a transaction on the database
          const tx = db.transaction(storeName, "readwrite");

          //access offlineStore object store
          const store = tx.objectStore(storeName);
          //clear storage
          store.clear();
        });
    }
  };
}

//adds a listener for when the app comes back online
window.addEventListener("online", backOnline);
