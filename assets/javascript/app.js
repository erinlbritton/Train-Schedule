 // Initialize Firebase
 var config = {
    apiKey: "AIzaSyAHE6rd4A5_40WpAasAM19EWGd-LFFq7Kk",
    authDomain: "train-schedule-5fec9.firebaseapp.com",
    databaseURL: "https://train-schedule-5fec9.firebaseio.com",
    projectId: "train-schedule-5fec9",
    storageBucket: "train-schedule-5fec9.appspot.com",
    messagingSenderId: "129959676643"
  };

firebase.initializeApp(config);

var database = firebase.database();
// Subway icon train details
var train = {
    0: {
        train: "Line 4 (北京地铁四号线)",
        destination: "Beijing Zoo (动物园)",
        firstTrainTime: "05:10",
        frequency: 15},
    1: {
        train: "Metropolitan Line",
        destination: "Baker Street Underground Station",
        firstTrainTime: "06:16",
        frequency: 19},
    2: {
        train: "Canarsie Line",
        destination: "Lorimer St",
        firstTrainTime: "01:10",
        frequency: 4},
    3: {
        train: "Filyovskaya Line (Филёвская)",
        destination: "Fili Station (Фили)",
        firstTrainTime: "05:30",
        frequency: 12},
    4: {
        train: "Gyeongui–Jungang Line (경의·중앙선)",
        destination: "Obin Station (오빈역)",
        firstTrainTime: "05:30",
        frequency: 30},
    5: {
        train: "Paris Métro Line 1",
        destination: "Château de Vincennes Station",
        firstTrainTime: "05:30",
        frequency: 12},
    6: {
        train: "Hanzōmon Line (東京メトロ半蔵門線)",
        destination: "Shibuya Station (渋谷駅)",
        firstTrainTime: "05:15",
        frequency: 5}
}
// Add realtime clock to subheading to update every second
var datetime = null,
        date = null;

var update = function () {
    date = moment(new Date())
    datetime.html(date.format('dddd, MMMM Do YYYY, h:mm:ss a'));
};

$(document).ready(function(){
    datetime = $('#datetime');
    update();
    setInterval(update, 1000);
});
// Initialize var to locally hold snapshot from database
var trainLocal = [];

database.ref().on("value", function(childSnapshot) {
    trainLocal = childSnapshot.val();
// Clear rows from table
    $("tbody").empty();
// Build each row to add table
    $.each(childSnapshot.val(), function(i) {
    // Subtract one year from first train time    
        var firstTimeConverted = moment(trainLocal[i].firstTrainTime, "hh:mm").subtract(1, "years");
    // Difference between present minutes and first train time minutes    
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    // Divide difference by frequency to return remainder
        var tRemainder = diffTime % trainLocal[i].frequency;
    // Subtract remainder from frequency to calculate minutes til next train arrives
        var tMinutesTillTrain = trainLocal[i].frequency - tRemainder;
    // Format next train time
        var nextTrain = moment().add(tMinutesTillTrain, "minutes").format("hh:mm a");
    // Add seconds to ETA countdown
        var sec = moment(60 - moment(date, "seconds")).format("ss");
    // Prevent minute from changing until :59
        if (sec === "00") {
            tMinutesTillTrain = tMinutesTillTrain + ":" + sec;
        } else {
            tMinutesTillTrain = tMinutesTillTrain-1 + ":" + sec;
        }
    // Add each row to table
        $("tbody").append(`
        <tr>
            <td>${childSnapshot.val()[i].train}</td>
            <td>${childSnapshot.val()[i].destination}</td>
            <td class="text-center">${childSnapshot.val()[i].frequency}</td>
            <td class="text-center">${nextTrain}</td>
            <td class="text-center">${tMinutesTillTrain}</td>
            <td data-key="${i}" class="remove text-center"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></td>
        </tr>`);   
    })
// Function to return error message
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});

// Click event to add a new train to the database
$("#addBtn").on("click", function() {
    // Grab text from input
        var trainName = $("#trainName").val().trim();
        var trainDestination = $("#trainDestination").val().trim();
        var trainTime = $("#trainTime").val().trim();
        var trainFrequency = $("#trainFrequency").val().trim();
        trainFrequency = parseInt(trainFrequency, 10);        
    // Push new train data to database
    database.ref().push({
            train: trainName,
            destination: trainDestination,
            firstTrainTime: trainTime,
            frequency: trainFrequency
    });

});

// Click event to add a new train to the database
    $(".subwayIcons").on("click", ".subway", function() {
    // Grab text from input
            var key = ($(this).attr("key"));
            var trainName = train[key].train;
            var trainDestination = train[key].destination;
            var trainTime = train[key].firstTrainTime;
            var trainFrequency = train[key].frequency;
            trainFrequency = parseInt(trainFrequency, 10);        
    // Push new train data to database
        database.ref().push({
                train: trainName,
                destination: trainDestination,
                firstTrainTime: trainTime,
                frequency: trainFrequency
        });
    });

// Add click event to X on each train row to remove from database
    $("#tableContent").on("click", ".remove", function() {
    // The key is the Firebase key; stored in data-key attribute
        var key = ($(this).attr("data-key"));
    // Remove child from Firebase database
        database.ref().child(key).remove();
    });

// Function to update table contents once per second
function secTimer () {
// Clear rows from table
    $("tbody").empty();
// Build each row to add table -- see line 73 for details
    $.each(trainLocal, function(i) {
        var firstTimeConverted = moment(trainLocal[i].firstTrainTime, "hh:mm").subtract(1, "years");
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        var tRemainder = diffTime % trainLocal[i].frequency;
        var tMinutesTillTrain = trainLocal[i].frequency - tRemainder;
        var nextTrain = moment().add(tMinutesTillTrain, "minutes").format("hh:mm a");
        var sec = moment(60 - moment(date, "seconds")).format("ss");
        if (sec === "00") {
            tMinutesTillTrain = tMinutesTillTrain + ":" + sec;
        } else {
            tMinutesTillTrain = tMinutesTillTrain-1 + ":" + sec;
        }
        $("tbody").append(`
        <tr>
            <td>${trainLocal[i].train}</td>
            <td>${trainLocal[i].destination}</td>
            <td class="text-center">${trainLocal[i].frequency}</td>
            <td class="text-center">${nextTrain}</td>
            <td class="text-center">${tMinutesTillTrain}</td>
            <td data-key="${i}" class="remove text-center"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></td>
        </tr>`);   
    });
}
secTimer();
setInterval(secTimer, 1000);
