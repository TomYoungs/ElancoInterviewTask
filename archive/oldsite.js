var  rawData;
var appList;
var resourceList;

var appListArr;
var resListArr;
var resLocationArr =[];

// Investigate data totals by application (Resource group)
var dataByApp = {};
class appTotals {
    constructor(name, ConsumedQuantity, Cost) {
        this.name = name;
        this.consumedQuantity = consumedQuantity;
        this.cost = cost;
    }  
  }
  class appTotalsList {
    constructor(){
      this.appTotals = []
    }
    addAppTotal(name, consumedQuantity, cost){
        let at = new appTotals(name, consumedQuantity, cost)
        this.appTotalsList.push(at)
    }
    updateAppTotal(name, consumedQuantity, cost){
        let at = new appTotals(name, consumedQuantity, cost)
        this.appTotalsList.push(at)
    }
    /*newAppTotal(name, consumedQuantity, cost){
      let at = new appTotals(name, consumedQuantity, cost)
      this.appTotalsList.push(at)
      return at
    }
    addAppTotal(name, consumedQuantity, cost){

        const i = this.appTotalsList.findIndex(n => this.appTotalsList.name == name);
        if(appExists) {
            return new Error({error:'User exists'})
        }
        else{
            let at = new appTotals(name, consumedQuantity, cost)
            this.appTotalsList.push(at)
        }
      }*/
    get appTotalsList(){
      return this.appTotalsList
    }   
    get dataAsHTMLTable(){
        return makeTable(this.appTotalsList);
    }
  }
  
  let DataByApp= new appTotalsList();
  


// Investigate data totals by resource
var dataByResource = {};

var summaryData = {
    totalNumRecords: 0,
    minDate: new Date().toDateString(),
    maxDate: new Date("01/01/1950").toDateString(),
    //appsinUse: appList.length(),


    getTimeFrame: function() {
		return maxDate - minDate;
	}

};

var validateErr = "";

function StartDataProcessing(){

    (async () => {
        //const axios = require('axios')
    
        //console.log("Fetching application data....")
    
        rawData = await axios('https://engineering-task.elancoapps.com/api/raw').then(resp => resp.data);
    
        appListArr = await axios('https://engineering-task.elancoapps.com/api/applications').then(resp => resp.data);
        //appListArr =appList.split(',');
        resListArr = await axios('https://engineering-task.elancoapps.com/api/resources').then(resp => resp.data);
        //resListArr =resList.split(',');
    
        //Raw Data processing
        rawData.forEach(item => ProcessRawItem(item));

        //Application List processing
        //var appCtr = 0;
        //appList.forEach(app => appCtr ++ );
        //var apptext = "APPLICATION LIST IN USE: (" + appCtr  + " applications)" + '\r\n' + appList;
        var apptext = "APPLICATION LIST IN USE: (" + appListArr.length  + " applications)" + '\r\n' + appListArr;
        document.getElementById('dataApplicationText').innerHTML = apptext;
        //appList.forEach(application => summaryData.totalNumRecords ++)

        
        //Resource list processing
        //var resCtr = 0;
        //resourceList.forEach(res => resCtr ++);
        var restext = "RESOURCE LIST IN USE: (" + resListArr.length  + " resources)" + '\r\n' + resListArr;
        document.getElementById('dataResourceText').innerHTML = restext;

        var resloctext = "RESOURCE LOCATIONS IN DATASET (" + resLocationArr.length  + " locations)" + '\r\n' + resLocationArr;
        document.getElementById('dataResourceLocationText').innerHTML = resloctext;


        //Write Data Summary
   
            var output = "Data Summary for Elenco "+ summaryData.minDate +" - " + summaryData.maxDate   + '\r\n';
            output += "Total number of records: " + summaryData.totalNumRecords + '\r\n';
            document.getElementById('dataSummaryText').innerHTML = output;
 
            document.getElementById('validationErrors').innerHTML = validateErr;


    })()
}

function ProcessRawItem(item){
    summaryData.totalNumRecords ++;
    //var dataObj = JSON.parse(item);
    if ( isEarlier(item.Date, summaryData.minDate)){
        summaryData.minDate=item.Date;
    } 
    if ( isLater(item.Date, summaryData.maxDate)){
        summaryData.maxDate=item.Date;
    } 

    //validateinApplist
    //mapping could be incorrect****
    if (!appListArr.includes(item.ResourceGroup)){
        //app not in master list
        validateErr += "Warning: ApplicationsList does not contain: " + item.ResourceGroup + '\r\n';
    }
    //validateinResourceList
    if (!resListArr.includes(item.MeterCategory)){
        //res not in master list
        validateErr += "Warning: ResourceList does not contain: " + item.MeterCategory + '\r\n';
    }
    //ResourceLocations
    if (!resLocationArr.includes(item.ResourceLocation)){
        //add location to master list
        resLocationArr.push(item.ResourceLocation)
    }

    DataByApp.newappTotal(item.ResourceGroup, item.ConsumedQuantity, item.Cost)
}

function GetDateStringAsDate(dateString){
    var parts =dateString.split('/');
    //  JavaScript counts months from 0:
    var mydate = new Date(parts[0], parts[1] - 1, parts[2]); 
    return (mydate);
}

function validateData(){
    //check instance guid are unique
    //check resource list matches 
    //check app list match
    return true;
}
function isLater(str1, str2)
{
    return new Date(str1) > new Date(str2);
}
function isEarlier(str1, str2)
{
    return new Date(str1) < new Date(str2);
}

var tblasHTML = makeTable();
document.getElementById('summarySection').appendChild(tblasHTML);

function makeTable(array) { 
    var table = document.createElement('table'); 
    for (var i = 0; i < array.length; i++) { 
        var row = document.createElement('tr'); 
        for (var j = 0; j < array[i].length; j++) { 
            var cell = document.createElement('td'); 
            cell.textContent = array[i][j]; row.appendChild(cell); 
        } 
        table.appendChild(row); 
    } 
    return table;
}