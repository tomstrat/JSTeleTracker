

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
  const DATA = removeLines(data);

  let dayTracker = new Date(formatDate(DATA[0][TIME]));
  let wrapUpTimeSum = 0;
  let dayCount = 0;

  //begin main loop
  for(let i=0; i<DATA.length - 1; i++){
    let currentDay = new Date(formatDate(DATA[i][TIME]));
    let nextCall = new Date(formatDate(DATA[i+1][TIME]))
    //This is the time at end of call in ms
    let endOfCall = currentDay.getTime() + (DATA[i][DURATION] * 1000)

    //Is the call the same day? if not update the dayTracker and run same check
    if(currentDay.getDate() == dayTracker.getDate()){
      // check that the call isnt longer than the next action (this would mean its not the salespersons call) & is on the same day
      if(endOfCall < nextCall.getTime() && currentDay.getDate() == nextCall.getDate()){
        wrapUpTimeSum += nextCall.getTime() - endOfCall;
        console.log("Same day is: " + (nextCall.getTime() - endOfCall));
      }
    } else {
      dayTracker.setDate(currentDay.getDate());
      dayCount += 1;
      if(endOfCall < nextCall.getTime()){
        wrapUpTimeSum += nextCall.getTime() - endOfCall;
        console.log("Next day is: " + (nextCall.getTime() - endOfCall));
      }
    }
  }
  if(wrapUpTimeSum == 0){
    console.log("Error No Calls to Parse");
    console.log(DATA);
  } else {
    console.log(wrapUpTimeSum / dayCount);
  }
}

//creates datetime arguments
function formatDate(date){

  let split = date.split(" ");
  let dateSplit = split[0].split("/");
  let timeSplit = split[1].split(":");
  //concatanate it all into a string
  let dateString = dateSplit[2] + "-" + dateSplit[1] + "-" + dateSplit[0] + "T" +
  timeSplit[0] + ':' + timeSplit[1] + ':' + timeSplit[2];

  return dateString

}

//Removes lines we dont want and reverses the data
function removeLines(data){
  data.splice(0,1);
  newData = data.reverse();
  for(let i=0; i < newData.length; i++){
    if (newData[i][DURATION] < 20 || newData[i][CALLSTATUS] == "INBOUND UNANSWERED") {
        newData.splice(i,1);
        i--;
    }
  }
  console.log(newData);
  return newData;
}
