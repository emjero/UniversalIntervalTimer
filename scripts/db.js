var uitDB = (function() {
    var tDB = {};
    var datastore = null;
  
    // TODO: Add methods for interacting with the database here.
    /**
     * Open a connection to the datastore.
     */
    tDB.open = function(callback) {
        // Database version.
        var version = 1;
    
        // Open a connection to the datastore.
        var request = indexedDB.open('uitexercises', version);
    
        // Handle datastore upgrades.
        request.onupgradeneeded = function(e) {
        var db = e.target.result;
    
        e.target.transaction.onerror = tDB.onerror;
    
        // Delete the old datastore.
        if (db.objectStoreNames.contains('uitexercise')) {
            db.deleteObjectStore('uitexercise');
        }
    
        // Create a new datastore.
        var store = db.createObjectStore('uitexercise', {
            keyPath: 'timestamp'
        });
        };
    
        // Handle successful datastore access.
        request.onsuccess = function(e) {
        // Get a reference to the DB.
        datastore = e.target.result;
    
        // Execute the callback.
        callback();
        };
    
        // Handle errors when opening the datastore.
        request.onerror = tDB.onerror;
    };


    // Export the tDB object.
    return tDB;
  }());