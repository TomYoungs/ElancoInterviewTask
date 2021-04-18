var  rawData;
var appList;
var resourceList;

var appListArr;
var resListArr;
var locArr=[];

// Investigate data totals by application (Resource group)
var databyAppCost;
// Investigate data totals by resource
var databyResCost;
// Investigate data totals by location
var databyLocCost;

var summaryData = {
    totalNumRecords: 0,
    minDate: new Date(),
    maxDate: new Date(0) //date in the past 1/jan/1970
};

var validateErr = "";

function StartDataProcessing(){

    (async () => {
    
        rawData = await axios('https://engineering-task.elancoapps.com/api/raw').then(resp => resp.data);
    
        //Application master list
        appListArr = await axios('https://engineering-task.elancoapps.com/api/applications').then(resp => resp.data);
        
        //Resource master list
        resListArr = await axios('https://engineering-task.elancoapps.com/api/resources').then(resp => resp.data);
        
        //because there is no api for locations this function just finds all the unique location instances
        rawData.forEach(item => locationsInstance(item));
    
        //set up the storage arrays
        databyAppCost= new Array(appListArr.length).fill(0);
       // databyAppConsumed= new Array(appListArr.length).fill(0);
        databyResCost= new Array(resListArr.length).fill(0);
        //databyResConsumed= new Array(resListArr.length).fill(0);

        //dont have the location list at this point - assuming it doesnt change
        databyLocCost= new Array(resListArr.length).fill(0);


        //Raw Data processing
        rawData.forEach(item => ProcessRawItem(item));
        console.log(databyLocCost);
        //Write Data Summary
        const element = document.getElementById('dataSummaryText');
        var output = "Data Summary for Elanco between '"+ summaryData.minDate.toDateString() +" - " + summaryData.maxDate.toDateString() + "'";
        var textNode = document.createTextNode(output);
        element.appendChild(textNode);
        element.appendChild(document.createElement('br'));

        output = "Total number of records: " + summaryData.totalNumRecords;
        textNode = document.createTextNode(output);
        element.appendChild(textNode);
        element.appendChild(document.createElement('br'));

        DisplayAppMasterlist();
        DisplayResMasterlist();
        DisplayResLocationMasterlist();
    

        //Write App tables
        //var tblasHTML = makeTable("tblAppCost", "Application",  appListArr, "Cost", databyAppCost, "Consumed Quantity", databyAppConsumed);
        var tblasHTML = makeTable("tblAppCost", "Application",  appListArr, "Cost", databyAppCost);
        document.getElementById('summarySectionAppCost').appendChild(tblasHTML);

        //Write Res tables
        //var tblasHTML = makeTable("tblResCost", "Resource",  resListArr, "Cost", databyResCost, "Consumed Quantity", databyResConsumed);
        var tblasHTML = makeTable("tblResCost", "Resource",  resListArr, "Cost", databyResCost);    
        document.getElementById('summarySectionResCost').appendChild(tblasHTML);

        //Write Location tables
        var tblasHTML = makeTable("tblLocCost", "Location",  locArr, "Cost", databyLocCost);    
        document.getElementById('summarySectionLocCost').appendChild(tblasHTML);

        // transform tables into datatables to allow filtering and sorting and other useful stuff, basically makes it look fancy
        $('#tblAppCost').DataTable({
            "order": [[ 1, "desc" ]]//descending on cost column
        } );
        $('#tblResCost').DataTable({
            "order": [[ 1, "desc" ]]
        } );
        $('#tblLocCost').DataTable({
            "order": [[ 1, "desc" ]]
        } );

    })()
}
function locationsInstance(item){;
    if(!(locArr.includes(item.ResourceLocation)))
        locArr.push(item.ResourceLocation)
}

function ProcessRawItem(item){
    summaryData.totalNumRecords ++;
    //console.log(rawData.length);
    //bit painful- looks like date in the data is in format DD/MM/YYYY need to extract the parts
    // and create the correct date object - also remember js counts months from 0 so you need a "-1" to make it correct:
    var parts =item.Date.split('/');
    var thedate = new Date(parts[2], parts[1] - 1, parts[0]);
    
    if ( isEarlier(thedate, summaryData.minDate)){//keeps track of the earliest and latest date
        summaryData.minDate=thedate;
    } 
    if ( isLater(thedate, summaryData.maxDate)){
        summaryData.maxDate=thedate;
    } 

        var appIndex=appListArr.indexOf(item.ResourceGroup)
        databyAppCost[appIndex] += Number(item.Cost);

        var resIndex=resListArr.indexOf(item.MeterCategory)
        databyResCost[resIndex] += Number(item.Cost);
        
        var locIndex = locArr.indexOf(item.ResourceLocation)
        databyLocCost[locIndex] += Number(item.Cost);
}

function DisplayAppMasterlist(){
    //Application List processing
    var apptext = "APPLICATION LIST IN USE: (" + appListArr.length  + " applications)" + '\r\n' + appListArr;
    document.getElementById('dataApplicationText').innerHTML = apptext;
} 
function DisplayResMasterlist(){
    var restext = "RESOURCE LIST IN USE: (" + resListArr.length  + " resources)" + '\r\n' + resListArr;
    document.getElementById('dataResourceText').innerHTML = restext;
} 
function DisplayResLocationMasterlist(){
    var loctext = "RESOURCE LOCATIONS IN DATASET (" + locArr.length  + " locations)" + '\r\n' + locArr;
    document.getElementById('dataResourceLocationText').innerHTML = loctext;
}

/*function validateData(item){
    //validateinApplist
    //mapping could be incorrect****
    if (!appListArr.includes(item.ResourceGroup)){
        //app not in master list
        validateErr += "Warning: ApplicationsList does not contain: " + item.ResourceGroup + '\r\n';
        return false;
    }
    //validateinResourceList
    if (!resListArr.includes(item.MeterCategory)){
        //res not in master list
        validateErr += "Warning: ResourceList does not contain: " + item.MeterCategory + '\r\n';
        return false;
    }
    //ResourceLocations
    if (!locListArr.includes(item.ResourceLocation)){
        //add location to master list
        locListArr.push(item.ResourceLocation)
        return true;
    }
    return true;
}*/

function isLater(thedate, currentminDate)
{
    return thedate > currentminDate;
}
function isEarlier(thedate, currentmaxDate)
{
    return thedate < currentmaxDate;
}

function makeTable(tblIDName, col1Name, col1Arr, col2Name, col2Arr) { 
    //datatables is really fussy about the table having the correct elements
    var table = document.createElement('table');
    table.id=tblIDName;
    
    var header = document.createElement('thead');
    var headerrow = document.createElement('tr');
    var cell = document.createElement('th'); 
    cell.textContent = col1Name; 
    headerrow.appendChild(cell);
    cell = document.createElement('th'); 
    cell.textContent = col2Name; 
    headerrow.appendChild(cell);   
    
    header.appendChild(headerrow);
    headerrow.appendChild(cell);
    table.appendChild(header);
    var tbody = document.createElement('tbody');
    for (var i = 0; i < col1Arr.length; i++) {    
        var row = document.createElement('tr');  
        var cell = document.createElement('td'); 
        cell.textContent = col1Arr[i]; row.appendChild(cell);  
        var cell = document.createElement('td'); 
        cell.textContent = col2Arr[i].toFixed(4).toString(); row.appendChild(cell);       
        tbody.appendChild(row); 
    }
    table.appendChild(tbody)
    return table;
}