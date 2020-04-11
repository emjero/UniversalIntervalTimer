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
            keyPath: 'id'
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


    /**
     * Open a connection to the datastore.
     */
    tDB.deleteDatastore = function(callback) {
      //var db = datastore;
      //var transaction = db.transaction(['uitexercise'], 'readwrite');
      //var objStore = transaction.objectStore('uitexercise');
      
      
      var DBDeleteRequest = window.indexedDB.deleteDatabase('uitexercises');

      DBDeleteRequest.onerror = function(event) {
        console.log("Error deleting database.");
      };
      
      DBDeleteRequest.onsuccess = function(event) {
        console.log("Database deleted successfully");
          
        console.log(event.result); // should be undefined
      }
  };


    /**
   * Fetch all of the items in the datastore.
   * @param {function} callback A function that will be executed once the items
   *                            have been retrieved. Will be passed a param with
   *                            an array of the todo items.
   */
  tDB.fetchExercises = function(callback) {
    var db = datastore;
    var transaction = db.transaction(['uitexercise'], 'readwrite');
    var objStore = transaction.objectStore('uitexercise');

    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = objStore.openCursor(keyRange);

    var exercises = [];

    transaction.oncomplete = function(e) {
      // Execute the callback function.
      callback(exercises);
    };

    //The cursorRequest.onsuccess event handler is triggered for each item that is returned from the database. 
    //if the result contains an exercise item and then if it does  add that item to the exercises array. 
    //The result.continue() method is then called which will move the cursor on to the next item in the database.
    cursorRequest.onsuccess = function(e) {
      var result = e.target.result;
      
      if (!!result == false) {
        return;
      }
      
      exercises.push(result.value);

      result.continue();
    };

    cursorRequest.onerror = tDB.onerror;
  };


    /**
   * Create a new item in the db
   * @param {object} exercise The exercise tobe saved
   */
  tDB.createExercise = function(exercise, callback) {
    // Get a reference to the db.
    var db = datastore;

    // Initiate a new transaction.
    var transaction = db.transaction(['uitexercise'], 'readwrite');

    // Get the datastore.
    var objStore = transaction.objectStore('uitexercise');

    // Create the datastore request.
    var request = objStore.put(exercise);

    // Handle a successful datastore put.
    request.onsuccess = function(e) {
      // Execute the callback function.
      callback(exercise);
    };

    // Handle errors.
    request.onerror = tDB.onerror;
  };

  /**
   * Delete an exercise.
   * @param {int} id The timestamp (id) of the exercise to be deleted.
   * @param {function} callback A callback function that will be executed if the 
   *                            delete is successful.
   */
  tDB.deleteExercise = function(id, callback) {
    var db = datastore;
    var transaction = db.transaction(['uitexercise'], 'readwrite');
    var objStore = transaction.objectStore('uitexercise');
    
    var request = objStore.delete(id);
    
    request.onsuccess = function(e) {
      callback();
    }
    
    request.onerror = function(e) {
      console.log(e);
    }
  };



    // Export the tDB object.
    return tDB;
  }());