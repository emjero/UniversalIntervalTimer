(function() {
  'use strict';

  var app = {
    isLoading: true,
    //spinner: document.querySelector('.loader'),
    //container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    settingsDialog: document.querySelector('.settingsdialog-container')
  };

  //Timer management
  var timeinterval;
  var timesToTick = 0;
  var timesTicked = 0;
  
  var timerState = [
    "Stopped",
    "Running",
    "Paused"    
  ];
  var runPageStatus = timerState[0];

  var btnActionLabel = [
    "Start",
    "Pause",
    "Resume"    
  ];
  var btnActionCurrentLabel = btnActionLabel[0];

  var exerciceState = [
    "Ready",
    "WarmUp",
    "Work",
    "Rest"    
  ];           
  var currentExerciceState = exerciceState[0];
  var currentRound = 0;
  var isEditInProgress = false;
        
  
  //Data
  var exercisesArray = [];
  var selectedExercise = null;
  var defaultExercise = {
    id: 0,
    nom: "7 min workout default",
    nbrounds: "12",
    tpsEchauffement: "5",
    intervalTravail: "30",
    intervalRepos: "10",
    movements: [
            "Jumping Jacks",
            "Wall Sit",
            "Push-up",
            "Abdominal Crunch",
            "Step Up Onto Chair",
            "Squat",
            "Triceps Dip on Chair",
            "Front Plank",
            "High Knees",
            "Lunge",
            "Push-Up and Rotation",
            "Side Plank Left/Right"
        ],
        isDeleted: false,
        isSelected: false,
        isModified: false,
        isSaved: false,
        editionEnCours: false
  };

  var defaultExercise2 = {
      id: 1,
      nom: "Corde et abdos",
      nbrounds: "5",
      tpsEchauffement: "5",
      intervalTravail: "30",
      intervalRepos: "10",
      movements: [
          "Corde",
          "Abdos"
      ],
      isDeleted: "False",
      isSelected: "False",
      isModified: "False",
      isSaved: "False",
      editionEnCours: "False"    
  };
  
//Load exercices from file in JSON format
function loadExercices(){
  var xmlhttp = new XMLHttpRequest();
  
  xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          var myObj = JSON.parse(this.responseText);
          //document.getElementById("divtest").innerHTML = myObj.exercices[1].nom;
          
          //selectedExercise = myObj.exercices[0];
          //alert(selectedExercise.nom);
          exercisesArray = myObj;

          var i;
          var selectExercicesList = document.getElementById("lstExercices");
          
          for(i = 0; i < myObj.exercices.length; i++) {
              
              var option = document.createElement("option");
              option.value = myObj.exercices[i].id;
              option.text = myObj.exercices[i].nom;
              selectExercicesList.appendChild(option);
          }
          //alert(myObj);
          //return myObj;
      }
  };
  //specify false for synchronous load --> a revoir car call synchrone plus supporté
  xmlhttp.open("GET", "./assets/listeExercices.json", false);
  xmlhttp.send();
    
}

  //Open the datastore and refresh exercises when done
  if(uitDB != null)
    uitDB.open(refreshExercises);
  else
    return;

  //Hide add and settings dialog
  app.addDialog.setAttribute('hidden', true);
  app.settingsDialog.setAttribute('hidden', true);

  //Initialisation des valeurs
  //loadExercices();
  //uitDB.createExercise(defaultExercise, );
  
  //by default select the first exercice
  //var selectedExercise = objExercices.exercices[0];
 
  
  //updatePageElements();

  //alert(objExercices.exercices.length);
  //var selectedExercise = objExercices[0];
  

  /************* Main Page Update *********************************************************************/
 
  function refreshExercises(){
    uitDB.fetchExercises(function(exercises) {

      //if there are no exercises in the DB, polpulate it with default one
      if(exercises.length == 0){
        uitDB.createExercise(defaultExercise, refreshExercises);        
      }
      else {        
        //by default select the first exercise
        if(selectedExercise == null)
          selectedExercise = exercises[0];
        
        //just a test
        //if(exercises.length == 1){
        //  uitDB.createExercise(defaultExercise2, refreshExercises);        
        //}
        
        //Update the select list to display the excercises and store the exercises in exercisesArray
        var i;
        var selectExercicesList = document.getElementById("lstExercices");

        //clear values, if any
        /*var length = selectExercicesList.options.length;
        for (i = length-1; i >= 0; i--) {
          selectExercicesList.options[i] = null;
        }*/
        
        for(i = 0; i < exercises.length; i++) {
            
            var option = document.createElement("option");
            option.value = exercises[i].id;
            option.text = exercises[i].nom;
            selectExercicesList.appendChild(option);

            //copy to exercisesArray
            exercisesArray.push(exercises[i]);

        }
      }

      updatePageElements();
    }
    
    )
  }

  function initGlobalVariables(){
    runPageStatus = timerState[0];
    btnActionCurrentLabel = btnActionLabel[0];
    currentExerciceState = exerciceState[0];
    //currentRound = 0;
    //timesTicked = 0;    
    document.getElementById("progressBar").value = 0;
    changeTimerBackGroundColor("black");
    document.getElementById('timerDisplaySpan').innerHTML = "...";
    //document.getElementById('movementSpan').innerHTML = "..."; 
     
    updateNbRoundsSpan();
    updateExerciseStateSpans()
    updateMvtsSpans();     
    
  }
  
  function updatePageElements(){
    //document.getElementById('exerciceTitleDiv').querySelector('.titleDiv1').innerHTML = exercice1.nom;
    if(selectedExercise != null)
    {
      document.getElementById('exerciceTitleSpan').innerHTML = selectedExercise.nom;
      updateNbRoundsSpan();
    }
      
    //alert("test2");
    //var nbRoundsSpan = rounds.querySelector('.nbRounds');
    //nbRoundsSpan.innerHTML = exercice1.nbrounds;
    document.getElementById('exerciceStateSpan').innerHTML = exerciceState[0];
    //document.getElementById('timerDisplaySpan').innerHTML = "...";
    //document.getElementById('movementSpan').innerHTML = "...";

    var t = getFormattedTime(getTotalExerciceTime());
    //document.getElementById('divtest').innerHTML = ('0' + t.minutes).slice(-2) + ':' + ('0' + t.seconds).slice(-2);^
    document.getElementById('elapsedTimeSpan').innerHTML = "Elapsed: " + ('00').slice(-2) + ':' + ('00').slice(-2);
    document.getElementById('remainingTimeSpan').innerHTML = "Remaining: " +  ('0' + t.minutes).slice(-2) + ':' + ('0' + t.seconds).slice(-2);
    
    //set progressbar max value
    document.getElementById("progressBar").max = getTotalExerciceTime();
        
    //changeTimerBackGroundColor("black");
   
    //document.getElementById('divtest').innerHTML = runPageStatus;
  }
  
  
  function updateNbRoundsSpan(){
    var strRounds = "Round " + currentRound.toString() + " of " + selectedExercise.nbrounds;
    document.getElementById('roundsDisplaySpan').innerHTML = strRounds;
  }

  function updateMvtsSpans(){
    var mvts = getMvtFromRoundAndExerciseState();
    document.getElementById('movementSpan').innerHTML = mvts;
  }

  function updateExerciseStateSpans(){
    //document.getElementById('divtest').innerHTML = runPageStatus;
    document.getElementById('exerciceStateSpan').innerHTML = currentExerciceState;    
    document.getElementById('btnActionTimer').innerHTML = btnActionCurrentLabel;
  }

  function updateTimerSpans(t){
    var timerValueSpan = document.getElementById('timerDisplaySpan');
    timerValueSpan.innerHTML = ('0' + t.minutes).slice(-2) + ':' + ('0' + t.seconds).slice(-2);
    //alert(getElapsedTime());

    var elapsedt = getElapsedTime();
    document.getElementById('elapsedTimeSpan').innerHTML = "Elapsed: " + ('0' + elapsedt.minutes).slice(-2) + ':' + ('0' + elapsedt.seconds).slice(-2);
    
    var remainingt = getRemainingTime();
    document.getElementById('remainingTimeSpan').innerHTML = "Remaining: " + ('0' + remainingt.minutes).slice(-2) + ':' + ('0' + remainingt.seconds).slice(-2);

    //Update progressbar
    document.getElementById("progressBar").value = timesTicked;
  }

  function isInt(value) {
    var x;
    if (isNaN(value)) {
      return false;
    }
    x = parseFloat(value);
    return (x | 0) === x;
  }

  function DisplayExerciseDetails(){
    var selectedExerciseIndex = document.getElementById("lstExercices").selectedIndex;

    //if(selectedExerciseIndex < objExercices.exercices.length)
    if(selectedExerciseIndex < exercisesArray.length)
    {
        
        selectedExercise = exercisesArray[selectedExerciseIndex];
        
        //Load Exercise details
        document.getElementById("inpExerciseName").value = selectedExercise.nom;
        document.getElementById("inpNbRounds").value = selectedExercise.nbrounds;
        document.getElementById("inpWarmUp").value = selectedExercise.tpsEchauffement;
        document.getElementById("inpWorkTime").value = selectedExercise.intervalTravail;
        document.getElementById("inpRestTime").value = selectedExercise.intervalRepos;

        document.getElementById("inpMovmentList").value = "";
        for(var i = 0; i <= selectedExercise.movements.length - 1; i++){
          document.getElementById("inpMovmentList").value = document.getElementById("inpMovmentList").value + selectedExercise.movements[i] + "\n";
        }

    }
  }

  

  function ValidateExercise(id){
    
    //if function is called without paramter --> it is a new exercise and a new ID has to be generated
    if(id == null)
    {
      //Create the exercise ID equals to the length of exercises already in the array
      id = exercisesArray.length;
    }    
    
    var nom = document.getElementById("inpExerciseName").value;
    if(nom == "")    
    {
      alert("Exercise name can't be blank");
      return null;
    }    
    
    var nbrounds = document.getElementById("inpNbRounds").value;
    if(!isInt(nbrounds))
    {
      alert("Number of rounds should be a number");
      return null;
    }      
    
    var tpsEchauffement = document.getElementById("inpWarmUp").value;
    if(!isInt(tpsEchauffement))
    {
      alert("Warm up time should be a number");
      return null;
    } 

    var intervalTravail = document.getElementById("inpWorkTime").value;
    if(!isInt(intervalTravail))
    {
      alert("Warm up time should be a number");
      return null;
    } 
    
    var intervalRepos = document.getElementById("inpRestTime").value;
    if(!isInt(intervalRepos))
    {
      alert("Warm up time should be a number");
      return null;
    }
    
    
    var res = document.getElementById("inpMovmentList").value.trim();
    
    //var movements = res.replace(/\n/g, ",");
    var movements = res.replace(/\n/g, "\n").split("\n");
    //alert(movements.toString());

    
    return {
      id: id,
      nom: nom,
      nbrounds: nbrounds,
      tpsEchauffement: tpsEchauffement,
      intervalTravail: intervalTravail,
      intervalRepos: intervalRepos,
      movements: movements,
          isDeleted: false,
          isSelected: false,
          isModified: false,
          isSaved: false,
          editionEnCours: false
    };
  }

  function SaveEditedExercice(){
    var selectedExerciseIndex = document.getElementById("lstExercices").selectedIndex;

    //if(selectedExerciseIndex < objExercices.exercices.length)
    if(selectedExerciseIndex < exercisesArray.length)
    {
        
      var editedExercise = ValidateExercise(selectedExerciseIndex);
      //alert(editedExercise.id);
        
      if(editedExercise != null)
      {
        //to make the update delete the old exercise and recreate it with the updated values
        uitDB.deleteExercise(editedExercise.id, refreshExercises);
        uitDB.createExercise(editedExercise, refreshExercises);
        //updatePageElements();
        return true;
      }
      else
        return false;
    }
  }

  function AddExercise(){
    /*    
    var newExercise = {
      id: id,
      nom: nom,
      nbrounds: nbrounds,
      tpsEchauffement: tpsEchauffement,
      intervalTravail: intervalTravail,
      intervalRepos: intervalRepos,
      movements: movements,
          isDeleted: false,
          isSelected: false,
          isModified: false,
          isSaved: false,
          editionEnCours: false
    };
    */

        
    /*
    alert(
      "Id: " + newExercise.id.toString() + "\n" + 
      "Nom: " + newExercise.nom.toString() + "\n" + 
      "NbRounds: " + newExercise.nbrounds.toString() + "\n" +
      "tpsEchauffement: " + newExercise.tpsEchauffement.toString() + "\n" +
      "intervalTravail: " + newExercise.intervalTravail.toString() + "\n" + 
      "intervalRepos: " + newExercise.intervalRepos.toString() + "\n" +
      "movements: " + newExercise.movements.toString() 
      );
      */
      
      //Add the new exercise to the DB
      //copy to exercisesArray
      //exercisesArray.push(newExercise);

      var newExercise = ValidateExercise(null);
      
      if(newExercise != null)
      {
        uitDB.createExercise(newExercise, refreshExercises);
        //updatePageElements();
        return true;
      }
      else
         return false;
      
  }

  /*****************************************************************************
   *
   * Timer management
   *
   ****************************************************************************/

  //Return total exercice time in Msec
   function getTotalExerciceTime(){
    var totalExerciceSec = 0;
    
    if (selectedExercise.nbrounds == 0 || selectedExercise.intervalTravail == 0)
        totalExerciceSec = selectedExercise.tpsEchauffement;
    else
        totalExerciceSec = parseInt(selectedExercise.tpsEchauffement) + parseInt(selectedExercise.nbrounds) * (parseInt(selectedExercise.intervalTravail) + parseInt(selectedExercise.intervalRepos)) - parseInt(selectedExercise.intervalRepos);

    return totalExerciceSec * 1000;
    //return parseInt(exercice1.nbrounds) * parseInt(exercice1.intervalTravail);
  };

  function getElapsedTime(){
    //alert(timesTicked);
    return getFormattedTime(timesTicked);
  }

  function getRemainingTime(){
    return getFormattedTime(getTotalExerciceTime() - timesTicked);
  }

  function getFormattedTime(timeInMs) {
    
    //var t = Date.parse(endtime) - Date.parse(new Date());  
    //var t = Date.parse(endtime);
    var t = parseInt(timeInMs);
    
    var seconds = Math.floor((t / 1000) % 60);
    var minutes = Math.floor((t / 1000 / 60) % 60);
    var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    var days = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
      'total': t,
      'days': days,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds
    };
  }

  function initializeTimer() {
    //var timer = document.getElementById(id);

    //Reference vers les spans
    //var daysSpan = timer.querySelector('.days');
    //var hoursSpan = timer.querySelector('.hours');
    //var minutesSpan = timer.querySelector('.minutes');
    //var secondsSpan = timer.querySelector('.seconds');
    if(timesToTick > 0){
      updateTimer();
      timeinterval = setInterval(updateTimer, 1000);
    }
    
  }

  function updateTimer() {
      
    //alert('timesToTick: ' + timesToTick);
    var t = getFormattedTime(timesToTick);
    //alert(('0' + t.seconds).slice(-2));

    //daysSpan.innerHTML = t.days;
    //hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
    
    //minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
    //secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);
    //var timerValueSpan = timer.querySelector('.spanTimerDisplay');
    updateTimerSpans(t);    

    if (t.total <= 0) {
      clearInterval(timeinterval);
      checkExerciceState();   
    }

    //Le temps est exprimé en ms
    timesToTick = timesToTick - 1000;
    timesTicked = timesTicked + 1000;
  }

  /*****************************************************************************
   *
   * Run page management
   *
   ****************************************************************************/
  

  /** Return the name of the movement to be displayed according to the round number and Exercice state */
  function getMvtFromRoundAndExerciseState(){

    var nbMovements = selectedExercise.movements.length;

    if(currentExerciceState == exerciceState[0])
      return "";
  
    if (nbMovements> 0 && currentRound > 0){
      
      var indexToReturn = 0;

      if(currentRound < nbMovements){

        //If we are in Work mode display the current move otherwise display the next one
        if(currentExerciceState == exerciceState[2])
          return selectedExercise.movements[currentRound - 1];
        else
          return "Next: " + selectedExercise.movements[currentRound];        
      }
      else if(currentRound == nbMovements){
        //If we are in Work mode display the current move otherwise display the next one
        if(currentExerciceState == exerciceState[2])
          return selectedExercise.movements[currentRound - 1];
        else{
          indexToReturn = (currentRound) % nbMovements;
          return "Next: " + selectedExercise.movements[indexToReturn];
        }          
      }
      else{
        if(currentExerciceState == exerciceState[2]){
          indexToReturn = (currentRound - 1) % nbMovements;
          return selectedExercise.movements[indexToReturn];
        }          
        else{
          indexToReturn = (currentRound) % nbMovements;
          return "Next: " + selectedExercise.movements[indexToReturn];
        }  
      }
    }   
  }

  // Function that handles the behaviour of the run page
  //"Ready",  "WarmUp",  "Work",  "Rest"
  function checkExerciceState(){

    if(currentRound <= parseInt(selectedExercise.nbrounds))
    {
      switch(currentExerciceState) {
        //Ready to WarmUp
        case "Ready":
          if(parseInt(selectedExercise.tpsEchauffement) > 0) {
            //warmup  
            currentExerciceState = exerciceState[1];
            timesToTick = parseInt(selectedExercise.tpsEchauffement) * 1000;
            timesTicked = 0;
            initializeTimer();
            playBell(1);
            //changeTimerBackGroundColor("green");
          }
          
          break;
        
        //WarmUp to Work
        case "WarmUp":
          if(parseInt(selectedExercise.intervalTravail) > 0) {  
            //Work
            currentExerciceState = exerciceState[2];
            currentRound++;
            timesToTick = parseInt(selectedExercise.intervalTravail) * 1000;
            initializeTimer();
            playBell(1);
            changeTimerBackGroundColor("green");
            updateNbRoundsSpan();
            updateMvtsSpans();
          }
          break; 

        //Work to Rest
        case "Work":
          if(currentRound == parseInt(selectedExercise.nbrounds)){
            //End of the exercise
            runPageStatus = timerState[0];
            btnActionCurrentLabel = btnActionLabel[0];  
            currentExerciceState = exerciceState[0];                  
            playBell(3);
            changeTimerBackGroundColor("black");
            updateMvtsSpans();
          }
          else {
            if(parseInt(selectedExercise.intervalRepos) > 0) {
              //Rest
              currentExerciceState = exerciceState[3];
              
              timesToTick = parseInt(selectedExercise.intervalRepos) * 1000;
              initializeTimer();
              playBell(3);
              changeTimerBackGroundColor("red");
              updateMvtsSpans();
            }

          }   
          break; 
          
          //Rest to work
          case "Rest":
            if(parseInt(selectedExercise.intervalTravail) > 0) {
              //Rest
              currentExerciceState = exerciceState[2];
              currentRound++;
              timesToTick = parseInt(selectedExercise.intervalTravail) * 1000;
              initializeTimer();
              playBell(1);
              changeTimerBackGroundColor("green");
              updateNbRoundsSpan();
              updateMvtsSpans();
            }
              
          break; 

      }

      //runPageStatus = timerState[0];
      //btnActionCurrentLabel = btnActionLabel[0];

      //To do: a mettre dans une fonction
      //document.getElementById('divtest').innerHTML = runPageStatus;
      //document.getElementById('btnActionTimer').innerHTML = btnActionCurrentLabel;
      //document.getElementById('exerciceStateSpan').innerHTML = currentExerciceState;
      updateExerciseStateSpans();
    }    
  }

  function playBell(type){
    if(type == 1)
      document.getElementById("audioBoxingBell1").play();
    else if(type == 3)
      document.getElementById("audioBoxingBell3").play();
    else
      retrun;
  }

  /* Mangement of the page status
  timerState: 0 --> Stopped , 1 -> Running, 2 --> paused
  btnActionLabel: 0 --> Start , 1 -> Pause, 2 --> Resume
  */
  function toggleRunPageState() {

    switch(runPageStatus) {

      //Stopped to Running
      case timerState[0]: 

        //if(timesToTick > 0){
        currentRound = 0;
        currentExerciceState = exerciceState[0];
        runPageStatus = timerState[1];
        btnActionCurrentLabel = btnActionLabel[1];
        updateNbRoundsSpan();
        checkExerciceState();
        //initializeTimer();
        //playBell(1);
        //changeTimerBackGroundColor("green");
        //}
        break;

      //Running to Pause
      case timerState[1]: 
        runPageStatus = timerState[2];
        btnActionCurrentLabel = btnActionLabel[2];
        //stop the timer
        clearInterval(timeinterval);
        
        break;

      //Pause to Running
      case timerState[2]: 
        runPageStatus = timerState[1];
        btnActionCurrentLabel = btnActionLabel[1];
        //Relaunch the timer
        timeinterval = setInterval(updateTimer, 1000);
        break;    
    }

    updateExerciseStateSpans();
  }

  function changeTimerBackGroundColor(color){
    var x = document.getElementsByClassName("timerSpanStyle1");
    var i;
    for (i = 0; i < x.length; i++) {
        x[i].style.backgroundColor = color;
    }
  }
  

  function lstExercicesChanged(){
    var selectedExerciseIndex = document.getElementById("lstExercices").selectedIndex;

    //if(selectedExerciseIndex < objExercices.exercices.length)
    if(selectedExerciseIndex < exercisesArray.length)
    {
        //change the selected Exercice from the collection
        initGlobalVariables();
        selectedExercise = exercisesArray[selectedExerciseIndex];       
       
        //updateNbRoundsSpan();
        
        //var t = getFormattedTime(0);    
        //updateTimerSpans(t); 
        //updateExerciseStateSpans();
    
        //alert(selectedExercise.nom);
        updatePageElements();
    }
    

    //alert(selectedExerciseIndex);
  }

  
  /*****************************************************************************
   *
   * Event listeners for UI elements - Main page
   *
   ****************************************************************************/

  document.getElementById('btnActionTimer').addEventListener('click', function() {
    toggleRunPageState();            
  });

  document.getElementById('lstExercices').addEventListener('change', function() {
    lstExercicesChanged();            
  });  
 

   /*****************************************************************************
   *
   * Methods to update/refresh the UI - Add and Edit exercise
   *
   ****************************************************************************/

  document.getElementById('butAdd').addEventListener('click', function() {
    // Open/show the add new exercise dialog
    app.toggleAddDialog(true);
  });  

  document.getElementById('linkEditExercise').addEventListener('click', function() {
    isEditInProgress = true;
    app.toggleAddDialog(true);
    DisplayExerciseDetails();
    //alert("Click!");
  });

  document.getElementById('butAddEditExercise').addEventListener('click', function() {
    //alert('test add');

    if(isEditInProgress)
    {
      SaveEditedExercice();
      isEditInProgress = false;
      app.toggleAddDialog(false);
      location.reload();
    }
    else
    {
      //if exercise creation is sucessfull, close the add screen
      if (AddExercise())
      {
        app.toggleAddDialog(false);
        location.reload();
      }
    }    
      
  });

  document.getElementById('butAddCancel').addEventListener('click', function() {
    // Close the add new dialog
    //alert('test cancel');
    isEditInProgress = false;
    app.toggleAddDialog(false);
  });


 /*****************************************************************************
   *
   * Methods to update/refresh the UI - Settings
   *
   ****************************************************************************/

  document.getElementById('butSettings').addEventListener('click', function() {
    // Open/show the add new exercise dialog
    app.toggleSettingsDialog(true);
  });

  document.getElementById('butOkSettings').addEventListener('click', function() {
    // Close the settings dialog
    app.toggleSettingsDialog(false);
  });

  document.getElementById('butCancelSettings').addEventListener('click', function() {
    // Close the settings dialog
    app.toggleSettingsDialog(false);
  });

  document.getElementById('linkDeleteDB').addEventListener('click', function() {
    var strconfirm = confirm("Are you sure you want to delete?");
    if (strconfirm == true) {
      uitDB.deleteDatabase();
      app.toggleSettingsDialog(false);
      location.reload();
    }      
    
  });

   
  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  document.getElementById('butRefresh').addEventListener('click', function() {
    location.reload();
  });

  // Toggles the visibility 
  app.toggleAddDialog = function(visible) {
    if (visible) {
      //app.addDialog.classList.add('dialog-container--visible');
      //alert('visible to invisible');
      app.addDialog.removeAttribute('hidden');   
    } else {
      //app.addDialog.classList.remove('dialog-container--visible');
      //alert('invisible to visible');
      app.addDialog.setAttribute('hidden', true);
    }
  };

   // Toggles the visibility 
   app.toggleSettingsDialog = function(visible) {
    if (visible) {
      //app.addDialog.classList.add('dialog-container--visible');
      //alert('visible to invisible');
      app.settingsDialog.removeAttribute('hidden');   
    } else {
      //app.addDialog.classList.remove('dialog-container--visible');
      //alert('invisible to visible');
      app.settingsDialog.setAttribute('hidden', true);
    }
  };


  // TODO add service worker code here
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./uit-worker.js')
             .then(function(result) { 
               console.log('UIT Service Worker Registered');
               console.log('Scope: ' + result.scope);
              });
  }
})();
