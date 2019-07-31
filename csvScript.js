

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
    let currentDay = new Date(DATA[i][TIME]);
    let nextCall = new Date(DATA[i+1][TIME])
    //This is the time at end of call in ms
    let endOfCall = currentDay.getTime() + (DATA[i][DURATION] * 1000)

    //Is the call the same day? if not update the dayTracker and run same check
    if(currentDay.getDate() == dayTracker.getDate()){
      // check that the call isnt longer than the next action (this would mean its not the salespersons call)
      if(endOfCall < nextCall.getTime()){
        wrapUpTimeSum += endOfCall - nextCall.getTime();
      }
    } else {
      dayTracker.setDate(currentDay.getDate());
      dayCount += 1;
      if(endOfCall < nextCall.getTime()){
        wrapUpTimeSum += endOfCall - nextCall.getTime();
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
  let y=parseInt(dateSplit[2]), m=parseInt(dateSplit[1]-1), d=parseInt(dateSplit[0]),
  hh=parseInt(timeSplit[0]), mm=parseInt(timeSplit[1]), ss=parseInt(timeSplit[2]);
  return y, m, d, hh, mm, ss;

}

//Removes lines we dont want and reverses the data
function removeLines(data){
  data.splice(0,1);
  //newData = data.reverse();
  for(let i=0; i < data.length; i++){
    if (data[i][DURATION] < 20 || data[i][CALLSTATUS] == "INBOUND UNANSWERED") {
        data.splice(i,1);
    }
  }
  return data;
}
