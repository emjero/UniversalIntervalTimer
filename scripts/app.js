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
    "None",
    "WarmUp",
    "Work",
    "Rest"    
  ];           
  var currentRound = 0;
        

  //Data
  var exercice1 = {
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


  //Initialisation des valeurs
  //document.getElementById('exerciceTitleDiv').querySelector('.titleDiv1').innerHTML = exercice1.nom;
  document.getElementById('exerciceTitleSpan').innerHTML = exercice1.nom;

  var strRounds = "Round " + currentRound.toString() + " of " + exercice1.nbrounds;
  var rounds = document.getElementById('roundsDisplaySpan').innerHTML = strRounds;
  //var nbRoundsSpan = rounds.querySelector('.nbRounds');
  //nbRoundsSpan.innerHTML = exercice1.nbrounds;
  document.getElementById('exerciceStateSpan').innerHTML = exerciceState[0];

  /*******************************************************************************/
 
  

  /*****************************************************************************
   *
   * Timer management
   *
   ****************************************************************************/

  function getTotalExerciceTime(){
    return parseInt(exercice1.nbrounds) * parseInt(exercice1.intervalTravail);
  };

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
    var timerValueSpan = document.getElementById('timerDisplaySpan');

    timerValueSpan.innerHTML = ('0' + t.minutes).slice(-2) + ':' + ('0' + t.seconds).slice(-2);

    if (t.total <= 0) {
      clearInterval(timeinterval);
      checkExerciceState();

      runPageStatus = timerState[0];
      btnActionCurrentLabel = btnActionLabel[0];

      //To do: a mettre dans une fonction
      document.getElementById('divtest').innerHTML = runPageStatus;
      document.getElementById('btnActionTimer').innerHTML = btnActionCurrentLabel;

    }

    //Le temps est exprimé en ms
    timesToTick = timesToTick - 1000;
  }

  /*****************************************************************************
     *
     * Run page management
     *
     ****************************************************************************/
  //var deadline = new Date(Date.parse(new Date()) + 15 * 24 * 60 * 60 * 1000);


 // Function that handles the behaviour of the run page
  //"None",  "WarmUp",  "Work",  "Rest"
  function checkExerciceState(){

    if(currentRound <= parseInt(exercice1.nbrounds))
    {
      switch(exerciceState) {
        case "WarmUp":
  
          break;
  
        //None to WarmUp
        case "None":

          break;
      }
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

        if(timesToTick > 0){
          runPageStatus = timerState[1];
          btnActionCurrentLabel = btnActionLabel[1];
          initializeTimer();
          playBell(1);
          changeTimerBackGroundColor("green");
        }
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

    document.getElementById('divtest').innerHTML = runPageStatus;
    document.getElementById('btnActionTimer').innerHTML = btnActionCurrentLabel;
  }

  function changeTimerBackGroundColor(color){
    var x = document.getElementsByClassName("timerSpanStyle1");
    var i;
    for (i = 0; i < x.length; i++) {
        x[i].style.backgroundColor = color;
    }
  }
  
 


//document.getElementById('divtest').innerHTML = timesToTick;
document.getElementById('divtest').innerHTML = runPageStatus;
timesToTick = getTotalExerciceTime() * 100;
//initializeTimer('timerDisplayDiv', timesToTick);  


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  document.getElementById('btnActionTimer').addEventListener('click', function() {
    toggleRunPageState();            
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
