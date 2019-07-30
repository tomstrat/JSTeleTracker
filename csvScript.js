

var mainData = [];

//These are references to the column names
const TIME = 1;
const DURATION = 2;
const CALLSTATUS = 5;


function handleFiles (files){
  // Check for the various File API support.
  if (window.File && window.FileReader) {
    // Great success! All the File APIs are supported.
    getAsText(files[0]);
  } else {
    alert('The File APIs are not fully supported in this browser.');
  }
}

function getAsText(fileToRead){
  var reader = new FileReader();
  // Read file into memory as UTF-8
  reader.readAsText(fileToRead);
  //Handle errors load
  reader.onload = loadHandler;
  reader.onerror = errorHandler;
}

function loadHandler(event){
  var csv = event.target.result;
  processData(csv);
}

function processData(csv){
  var allTextLines = csv.split(/\r\n|\n/)
  for (var i=0; i<allTextLines.length; i++){
    var data = allTextLines[i].split(',');
    var tarr = [];
    for (var j=0; j<data.length; j++){
      tarr.push(data[j]);
    }
    mainData.push(tarr);
  }
  console.log(mainData);
  wrapUpTime(mainData);
}

function errorHandler(evt){
  if(evt.target.error.name == "NotReadableError"){
    alert("Cannot read file!");
  }
}


// This is where the data processing functions are
function wrapUpTime(data){
  const REVERSE_DATA = data.reverse();
  let dayTracker = new Date(REVERSE_DATA[0][TIME]);

  //begin main loop
  for(let i=0; i<REVERSE_DATA.length; i++){
    //Does the call fit the criterea?
    if (REVERSE_DATA[i][DURATION] > 20 &&
      REVERSE_DATA[i][CALLSTATUS] != "INBOUND UNANSWERED") {
      let currentDay = new Date(REVERSE_DATA[i][TIME]);
      //Is the call the same day?
      if(currentDay.getDate() == dayTracker.getDate()){

      }
    }
  }
}
