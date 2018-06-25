(function() {
  'use strict';

  var app = {
    isLoading: true,
    spinner: document.querySelector('.loader'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container')
  };

  //Timer management
  var timesToTick = 0;

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
  document.getElementById('exerciceTitleDiv').querySelector('.titleDiv1').innerHTML = exercice1.nom;

  var rounds = document.getElementById('roundsDisplayDiv')
  var nbRoundsSpan = rounds.querySelector('.nbRounds');
  nbRoundsSpan.innerHTML = exercice1.nbrounds;

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

function initializeTimer(id, endtime) {
  var timer = document.getElementById(id);

  //Reference vers les spans
  //var daysSpan = timer.querySelector('.days');
  //var hoursSpan = timer.querySelector('.hours');
  var minutesSpan = timer.querySelector('.minutes');
  var secondsSpan = timer.querySelector('.seconds');

  function updateTimer() {
    
    //alert('timesToTick: ' + timesToTick);
    var t = getFormattedTime(timesToTick);
    //alert(('0' + t.seconds).slice(-2));

    //daysSpan.innerHTML = t.days;
    //hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
    minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
    secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

    if (t.total <= 0) {
      clearInterval(timeinterval);
    }

    //Le temps est exprimé en ms
    timesToTick = timesToTick - 1000;
  }

  updateTimer();
  var timeinterval = setInterval(updateTimer, 1000);
}

//var deadline = new Date(Date.parse(new Date()) + 15 * 24 * 60 * 60 * 1000);


document.getElementById('divtest').innerHTML = timesToTick;
timesToTick = getTotalExerciceTime() * 100;
initializeTimer('timerDisplayDiv', timesToTick);




  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  //document.getElementById('butRefresh').addEventListener('click', function() {
    // Refresh all of the forecasts
    //app.updateForecasts();
  //});

  //document.getElementById('butAdd').addEventListener('click', function() {
    // Open/show the add new city dialog
    //app.toggleAddDialog(true);
  //});

  //document.getElementById('butAddCancel').addEventListener('click', function() {
    // Close the add new city dialog
    //app.toggleAddDialog(false);
  //});


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
