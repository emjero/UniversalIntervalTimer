(function() {
  'use strict';

  var app = {
    isLoading: true,
    spinner: document.querySelector('.loader'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container')
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
        
  
  //Data
  var objExercices;
  /*var selectedExercice = {
    id: "1",
    nom: "7 min workout",
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
  */
//Load exercices from file in JSON format
function loadExercices(){
  var xmlhttp = new XMLHttpRequest();
  
  xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          var myObj = JSON.parse(this.responseText);
          //document.getElementById("divtest").innerHTML = myObj.exercices[1].nom;
          
          //selectedExercice = myObj.exercices[0];
          //alert(selectedExercice.nom);
          objExercices = myObj;

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

  //Initialisation des valeurs
  loadExercices();
  
  //by default select the first exercice
  var selectedExercice = objExercices.exercices[0];

  updatePageElements();

  //alert(objExercices.exercices.length);
  //var selectedExercice = objExercices[0];
  

  /************* Main Page Update *********************************************************************/
 
  function updatePageElements(){
    //document.getElementById('exerciceTitleDiv').querySelector('.titleDiv1').innerHTML = exercice1.nom;
    document.getElementById('exerciceTitleSpan').innerHTML = selectedExercice.nom;
    updateNbRoundsSpan();
    
    //var nbRoundsSpan = rounds.querySelector('.nbRounds');
    //nbRoundsSpan.innerHTML = exercice1.nbrounds;
    document.getElementById('exerciceStateSpan').innerHTML = exerciceState[0];
    //document.getElementById('timerDisplaySpan').innerHTML = "...";
    //document.getElementById('movementSpan').innerHTML = "...";

    var t = getFormattedTime(getTotalExerciceTime());
    document.getElementById('divtest').innerHTML = ('0' + t.minutes).slice(-2) + ':' + ('0' + t.seconds).slice(-2);
    
    //set progressbar max value
    document.getElementById("progressBar").max = getTotalExerciceTime();

    //document.getElementById('divtest').innerHTML = runPageStatus;
  }
  
  
  function updateNbRoundsSpan(){
    var strRounds = "Round " + currentRound.toString() + " of " + selectedExercice.nbrounds;
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

  /*****************************************************************************
   *
   * Timer management
   *
   ****************************************************************************/

  //Return total exercice time in Msec
   function getTotalExerciceTime(){
    var totalExerciceSec = 0;
    
    if (selectedExercice.nbrounds == 0 || selectedExercice.intervalTravail == 0)
        totalExerciceSec = selectedExercice.tpsEchauffement;
    else
        totalExerciceSec = parseInt(selectedExercice.tpsEchauffement) + parseInt(selectedExercice.nbrounds) * (parseInt(selectedExercice.intervalTravail) + parseInt(selectedExercice.intervalRepos)) - parseInt(selectedExercice.intervalRepos);

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

    var nbMovements = selectedExercice.movements.length;

    if(currentExerciceState == exerciceState[0])
      return "";
  
    if (nbMovements> 0 && currentRound > 0){
      
      var indexToReturn = 0;

      if(currentRound < nbMovements){

        //If we are in Work mode display the current move otherwise display the next one
        if(currentExerciceState == exerciceState[2])
          return selectedExercice.movements[currentRound - 1];
        else
          return "Next: " + selectedExercice.movements[currentRound];        
      }
      else if(currentRound == nbMovements){
        //If we are in Work mode display the current move otherwise display the next one
        if(currentExerciceState == exerciceState[2])
          return selectedExercice.movements[currentRound - 1];
        else{
          indexToReturn = (currentRound) % nbMovements;
          return "Next: " + selectedExercice.movements[indexToReturn];
        }          
      }
      else{
        if(currentExerciceState == exerciceState[2]){
          indexToReturn = (currentRound - 1) % nbMovements;
          return selectedExercice.movements[indexToReturn];
        }          
        else{
          indexToReturn = (currentRound) % nbMovements;
          return "Next: " + selectedExercice.movements[indexToReturn];
        }  
      }
    }   
  }

  // Function that handles the behaviour of the run page
  //"Ready",  "WarmUp",  "Work",  "Rest"
  function checkExerciceState(){

    if(currentRound <= parseInt(selectedExercice.nbrounds))
    {
      switch(currentExerciceState) {
        //Ready to WarmUp
        case "Ready":
          if(parseInt(selectedExercice.tpsEchauffement) > 0) {
            //warmup  
            currentExerciceState = exerciceState[1];
            timesToTick = parseInt(selectedExercice.tpsEchauffement) * 1000;
            timesTicked = 0;
            initializeTimer();
            playBell(1);
            //changeTimerBackGroundColor("green");
          }
          
          break;
        
        //WarmUp to Work
        case "WarmUp":
          if(parseInt(selectedExercice.intervalTravail) > 0) {  
            //Work
            currentExerciceState = exerciceState[2];
            currentRound++;
            timesToTick = parseInt(selectedExercice.intervalTravail) * 1000;
            initializeTimer();
            playBell(1);
            changeTimerBackGroundColor("green");
            updateNbRoundsSpan();
            updateMvtsSpans();
          }
          break; 

        //Work to Rest
        case "Work":
          if(currentRound == parseInt(selectedExercice.nbrounds)){
            //End of the exercise
            runPageStatus = timerState[0];
            btnActionCurrentLabel = btnActionLabel[0];  
            currentExerciceState = exerciceState[0];                  
            playBell(3);
            changeTimerBackGroundColor("black");
            updateMvtsSpans();
          }
          else {
            if(parseInt(selectedExercice.intervalRepos) > 0) {
              //Rest
              currentExerciceState = exerciceState[3];
              
              timesToTick = parseInt(selectedExercice.intervalRepos) * 1000;
              initializeTimer();
              playBell(3);
              changeTimerBackGroundColor("red");
              updateMvtsSpans();
            }

          }   
          break; 
          
          //Rest to work
          case "Rest":
            if(parseInt(selectedExercice.intervalTravail) > 0) {
              //Rest
              currentExerciceState = exerciceState[2];
              currentRound++;
              timesToTick = parseInt(selectedExercice.intervalTravail) * 1000;
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
    var selectedExerciceIndex = document.getElementById("lstExercices").selectedIndex;

    if(selectedExerciceIndex < objExercices.exercices.length)
    {
        //change the selected Exercice from the collection
        selectedExercice = objExercices.exercices[selectedExerciceIndex];
        //alert(selectedExercice.nom);
        updatePageElements();
    }
    

    //alert(selectedExerciceIndex);
  }

  /*****************************************************************************
   *
   * Event listeners for UI elements
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
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function(visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible');
    } else {
      app.addDialog.classList.remove('dialog-container--visible');
    }
  };


  // TODO add service worker code here
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('./uit-worker.js')
             .then(function() { console.log('UIT Service Worker Registered'); });
  }
})();
