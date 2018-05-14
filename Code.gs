//set the global vars
var sheetID = "1_aoUCGQ83hshffrTUjEYd0NHRNgyP7t2Umzq-lIt0u0";
var firstRow = 14;





// ******************************************************************************************************
// Function to display the HTML as a webApp
// ******************************************************************************************************
function doGet() {
  var template = HtmlService
                 .createTemplateFromFile('CardSorter');

  var htmlOutput = template.evaluate()
                   .setSandboxMode(HtmlService.SandboxMode.IFRAME)
                   .setTitle('Card Sorter');

  return htmlOutput;
};






// ******************************************************************************************************
// Function to print out the content of an HTML file into another (used to load the CSS and JS)
// ******************************************************************************************************
function getContent(filename) {
  var pageContent = HtmlService.createTemplateFromFile(filename).getRawContent();
  return pageContent;
}





// ******************************************************************************************************
// Function to randomise an array from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
// use it like: arr = shuffle(arr);
// ******************************************************************************************************
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
};





// ******************************************************************************************************
// Function to print primary menu items
// ******************************************************************************************************
function addPrimary() {
  var ss = SpreadsheetApp.openById(sheetID);
  var sheet = ss.getSheetByName("Settings");  
  
  //get list of items
  var lastRow = sheet.getLastRow();
  var items = [];
  for ( var i=firstRow; i<lastRow; i++ ){
    cellVal = sheet.getRange(i, 3, 1,1).getValue();
    altCellVal = sheet.getRange(i, 4, 1,1).getValue();
    if ( cellVal != "") { 
        // if present, swap items for A/B testing of alternative category names
      if (altCellVal != "" && Math.random() > 0.5 ) {items.push(altCellVal); } else {items.push(cellVal);}
    }  
  }

  
  //Allow editing of category names?
  var allowEdit = sheet.getRange(6, 2, 1, 1).getValue();
  var editClass = '';
  if (allowEdit == "Yes") {editClass= 'editable';} else {editClass= 'no-edit';};
  
  var newItem = '';
  var elementsNum = items.length;
  for (var i=0; i<items.length; i++ ){
      newItem = newItem + '<div class="wrapper elements'+elementsNum+'"><span><h2 class="category-titles '+editClass+'">'+items[i]+'</h2><ul id="primary'+i+'" class="sortableBox" ondrop="dragdrop_handler(event);" ondragover="dragover_handler(event);"  ondragleave="dragleave_handler(event);" ></ul><div class="clearblock"></div></span></div>';
  } 
  return newItem;
}





// ******************************************************************************************************
// Function to print secondary menu items
// ******************************************************************************************************
function addSecondary() {
  var ss = SpreadsheetApp.openById(sheetID);
  var sheet = ss.getSheetByName("Settings");  
  
  //get list of items
  var lastRow = sheet.getLastRow();
  var items = [];
  for ( var i=firstRow; i<lastRow; i++ ){
    cellVal = sheet.getRange(i, 5, 1,1).getValue();
    altCellVal = sheet.getRange(i, 6, 1,1).getValue();
    if ( cellVal != "") { 
        // if present, swap items for A/B testing of alternative category names
      if (altCellVal != "" && Math.random() > 0.5 ) {items.push(altCellVal); } else {items.push(cellVal);}
    }  
  }

  
  //Allow editing of category names?
  var allowEdit = sheet.getRange(6, 2, 1, 1).getValue();
  var editClass = '';
  if (allowEdit == "Yes") {editClass= 'editable';} else {editClass= 'no-edit';};
  
  var newItem = '';
  var elementsNum = items.length;
  for (var i=0; i<items.length; i++ ){
      newItem = newItem + '<div class="wrapper elements'+elementsNum+'"><span><h2 class="'+editClass+'">'+items[i]+'</h2><ul id="secondary'+i+'" class="sortableBox" ondrop="dragdrop_handler(event);" ondragover="dragover_handler(event);" ondragleave="dragleave_handler(event);" ></ul><div class="clearblock"></div></span></div>';
  } 
  return newItem;
}





// ******************************************************************************************************
// Function to print the cards
// ******************************************************************************************************
function addCards(){
  var ss = SpreadsheetApp.openById(sheetID);
  var sheet = ss.getSheetByName("Settings");
  
  //get list of items
  var lastRow = sheet.getLastRow();
  var items = [];
  for ( var i=firstRow; i<lastRow; i++ ){
    cellVal = sheet.getRange(i, 7, 1,1).getValue();
    altCellVal = sheet.getRange(i, 8, 1,1).getValue();
    if ( cellVal != "" && cellVal != undefined) { 
        // if present, swap items for A/B testing of alternative category names (half of the times)
      if (altCellVal != "" && Math.random() > 0.5 ) {items.push(altCellVal); } else {items.push(cellVal);}
    }  
  }
  
  items = shuffle(items);  
  
  var newItem = '';
  
  var maxItems = items.length;
  maxItems = 51;
  
  for (var i=0; i<maxItems; i++ ){
      newItem = newItem + '<li draggable="true" ondragstart="dragstart_handler(event);" ondragend="dragend_handler(event);" id="Item'+i+'" class="card-item"><p ondragover="return false;" ondragend="return false;" ondrop="return false;">'+items[i]+'</p></li>';
  } 
  return newItem;
};






// ******************************************************************************************************
// Function to find an item in an array
// ******************************************************************************************************
function findInArray(haystack,needle) {
  var i = haystack.length;
  while (i--) {
    if (needle != null) {
      if (haystack[i].toLowerCase() == needle.toLowerCase()) {
        return true;
      }
    }  
  }
  return false;
}





// ******************************************************************************************************
// Function to print an array of values to the spreadsheet
// ******************************************************************************************************
function printValues(e){
  var ss = SpreadsheetApp.openById(sheetID);
  var sheet = ss.getSheetByName("Results");
  var dummy = "";
  
  //lock to avoid concurrent writes 
  var lock = LockService.getPublicLock();
  lock.waitLock(30000);  // wait 30 seconds before conceding defeat.
 
  //print header values (assuming that items names are in Row 1
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]; 
  
  //if an item is not in the headers array (= it has been edited), add a new column to the sheet, print the new header value, then add it to the "header" array
  for (key in e) {
    if(findInArray(headers,key)===false) { 
      sheet.insertColumnAfter(sheet.getLastColumn());
      sheet.getRange(1,sheet.getLastColumn()).setValue(key);
      headers.push(key);
    }
  }
   
  // get row where to print the data
  var nextRow = sheet.getLastRow()+1; 
 
  var row = [];  
  // loop through the header columns and assign values
  for (i in headers){
    
    if (headers[i] == "Timestamp"){ // special case if you include a 'Timestamp' column
      var timestamp = new Date();
      row.push(timestamp);
    } else { // else use header name to get data
      dummy = e[headers[i]] == 'undefined' ? "" : e[headers[i]]
      row.push(dummy);  
    }
  }
  // more efficient to set values as [][] array than individually
  sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
 
  lock.releaseLock();
  
}
