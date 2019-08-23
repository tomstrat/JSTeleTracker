

var mainData = [];

//These are references to the column names
const TIME = 1;
const DURATION = 2;
const CALLSTATUS = 5;

//This section deals with reading in the CSV
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

  //Run a quick check over data before it gets wrecked by the reverse.
  getData(mainData);
  mainData = [];
}

function errorHandler(evt){
  if(evt.target.error.name == "NotReadableError"){
    alert("Cannot read file!");
  }
}

//Get Data Output
function getData(rawData){
  //Run a quick check over data before it gets wrecked by the reverse.
  let totalCallsMade = callsMade(rawData);
  let getWrapTime = wrapUpTime(rawData);
  let callData = callDuration(rawData, totalCallsMade);

  //For efficiency callDuration returns an object with the other data. So group this up for simplicity
  let callDataObject = {
    wrapTime: getWrapTime,
    avgDuration: callData.avgDuration,
    avgTime: callData.avgTime,
    avgCalls: callData.avgCalls,
    totalCalls:callData.totalCalls
  };

  makeTableRow(callDataObject);

  //Reset the data array
  document.getElementById("fileUpload").value = "";
  mainData = [];
}

//Create the row on end of the table
function makeTableRow(rowData){

  let table = document.getElementById('mainTable');
  let row = document.createElement('tr');
  let nameData = document.createElement('td', {dataID: "cellName"});
  let durationData = document.createElement('td', {dataID: "cellAvgDuration"});
  let wrapData = document.createElement('td', {dataID: "cellWrap"});
  let timeData = document.createElement('td', {dataID: "cellAvgTime"});
  let callsData = document.createElement('td', {dataID: "cellAvgCalls"});
  let totalData = document.createElement('td', {dataID: "cellTotalCalls"});

  nameData.innerHTML = "";
  durationData.innerHTML = rowData.avgDuration;
  wrapData.innerHTML = rowData.wrapTime;
  timeData.innerHTML = rowData.avgTime;
  callsData.innerHTML = rowData.avgCalls;
  totalData.innerHTML = rowData.totalCalls;

  row.appendChild(nameData);
  row.appendChild(durationData);
  row.appendChild(wrapData);
  row.appendChild(timeData);
  row.appendChild(callsData);
  row.appendChild(totalData);
  table.appendChild(row);

}


//creates datetime arguments
function formatDate(date){

  let split = date.split(" ");
  let dateSplit = split[0].split("/");
  let timeSplit = split[1].split(":");

  //check for 24 hour
  if(split[2] == "PM" && timeSplit[0] != "12"){
    let twentyFour = parseInt(timeSplit[0]) + 12;
    timeSplit[0] = twentyFour.toString();
  }
  //concatanate it all into a string
  let dateString = dateSplit[2] + "-" + dateSplit[1] + "-" + dateSplit[0] + "T" +
  timeSplit[0] + ':' + timeSplit[1] + ':' + timeSplit[2];

  return dateString

}

//Removes lines we dont want and reverses the data
//THIS AFFECTS THE DATA PERMENANTLY ANYTHING IN THE THREAD AFTER THIS WILL SEE THIS DATA INSTEAD
//ONLY NEEDS TO BE RUN ONCE
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

//breaks down milliseconds into useful time format
function getTimeBreakdown(milliseconds){
  let seconds = Math.floor(milliseconds / 1000);
  let minuets;
  let hours;

  // work out the total duration broken down
  if(seconds > 60){
    minuets = Math.floor(seconds / 60);
    seconds = seconds % 60;
    if(minuets > 60){
      hours = Math.floor(minuets / 60);
      minuets = minuets % 60;
    } else {
      hours = 0;
    }
  } else {
    minuets = 0;
    hours = 0;
  }

  //Add leading 0 if lower than 10
  if(seconds < 10){
    seconds.toString();
    seconds = "0" + seconds;
  }
  if(minuets < 10){
    minuets.toString();
    minuets = "0" + minuets;
  }
  if(hours < 10){
    hours.toString();
    hours = "0" + hours;
  }

  return hours + ":" + minuets + ":" + seconds;
}





// This is where the data processing functions are

//*** WRAP UP TIME ***
function wrapUpTime(data){
  const DATA = removeLines(data);

  let dayTracker = new Date(formatDate(DATA[0][TIME]));
  let wrapUpTimeSum = 0;
  let dayCount = 1;

  //begin main loop
  for(let i=0; i<DATA.length - 1; i++){
    let skipCall = 1;
    let currentDay = new Date(formatDate(DATA[i][TIME]));
    let nextCall = new Date(formatDate(DATA[i+1][TIME]))
    //This is the time at end of call in ms
    let endOfCall = currentDay.getTime() + (DATA[i][DURATION] * 1000)

    //Is the call the same day? if not update the dayTracker and run same check
    if(currentDay.getDate() == dayTracker.getDate()){
      // check that the call isnt longer than the next action (this would mean its not the salespersons call) & is on the same day
      while(true){
        if(endOfCall < nextCall.getTime() && currentDay.getDate() == nextCall.getDate()){
          wrapUpTimeSum += nextCall.getTime() - endOfCall;
          skipCall -= 1;
          i += skipCall;
          break;
        } else {
          //check we have not gone to next day because of last call
          if(currentDay.getDate() != nextCall.getDate()){
            break;
          }
          //If we are here its because we need to check the next next call for end of call and skip the calls that werent the agents
          if(i + skipCall == DATA.length - 1){
            break;
          } else {
            skipCall += 1;
            nextCall = new Date(formatDate(DATA[i+skipCall][TIME]));
          }
        }
      }
    } else {
      dayTracker.setDate(currentDay.getDate());
      dayCount += 1;
      // check that the call isnt longer than the next action (this would mean its not the salespersons call) & is on the same day
      while(true){
        if(endOfCall < nextCall.getTime() && currentDay.getDate() == nextCall.getDate()){
          wrapUpTimeSum += nextCall.getTime() - endOfCall;
          skipCall -= 1;
          i += skipCall;
          break;
        } else {
          //check we have not gone to next day because of last call
          if(currentDay.getDate() != nextCall.getDate()){
            break;
          }
          //If we are here its because we need to check the next next call for end of call and skip the calls that werent the agents
          if(i + skipCall == DATA.length - 1){
            break;
          } else {
            skipCall += 1;
            nextCall = new Date(formatDate(DATA[i+skipCall][TIME]));
          }
        }
      }
    }
  }
  if(wrapUpTimeSum == 0){
    console.log("Error No Calls to Parse");
    console.log(DATA);
  } else {
    console.log("Average Wrap Up time is: " + getTimeBreakdown(Math.floor(wrapUpTimeSum / DATA.length))); // Dividing by calls not days
    return(getTimeBreakdown(Math.floor(wrapUpTimeSum / DATA.length)));
  }
}

//*** AVG CALL DURATION & AVG TIME ON PHONE PER DAY***
//Note: this does not take into account time travel calls (not taken by agent)
function callDuration(data, callsMade){
  const DATA = data;
  let callDataObject = {
    avgDuration: 0,
    avgTime: 0,
    avgCalls: 0,
    totalCalls:0
  };
  let durationSum = 0;
  let dayTracker = new Date(formatDate(DATA[0][TIME]));
  let dayCount = 1;

  for(let i=0; i < DATA.length; i++){
    let currentDay = new Date(formatDate(DATA[i][TIME]));

    if(currentDay.getDate() == dayTracker.getDate()){
      durationSum += parseInt(DATA[i][DURATION]);
    } else {
      durationSum += parseInt(DATA[i][DURATION]);
      dayTracker = currentDay;
      dayCount += 1;
    }
  }

  if(durationSum == 0){
    console.log("Error No Calls to Parse");
    console.log(DATA);
  } else {
    console.log("Average Duration is: " + getTimeBreakdown(Math.floor(durationSum / DATA.length)* 1000));
    console.log("Average Time on Phone is: " + getTimeBreakdown(Math.floor(durationSum / dayCount)* 1000));
    console.log("Average Calls Made per day is: " + Math.floor(callsMade / dayCount));
    console.log("Calls made this month: " + callsMade);
    callDataObject.avgDuration = getTimeBreakdown(Math.floor(durationSum / DATA.length)* 1000);
    callDataObject.avgTime = getTimeBreakdown(Math.floor(durationSum / dayCount)* 1000);
    callDataObject.avgCalls = Math.floor(callsMade / dayCount);
    callDataObject.totalCalls = callsMade;
    return callDataObject;
  }

}


//*** AVG CALLS PER DAY & CALLS MADE PER MONTH ***
//Note this is only to work out the calls made before data is ruined.
//Note: this does not take into account time travel calls (not taken by agent)
function callsMade(data){
  const DATA = data;
  let callCount = 0;
  for(let i=0; i<DATA.length; i++){
    if(DATA[i][CALLSTATUS] != "INBOUND UNANSWERED" && DATA[i][CALLSTATUS] != "INBOUND ANSWERED"){
      callCount +=1;
    }
  }
  return callCount;
}
