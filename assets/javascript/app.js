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
//   var train = {
//       0: {
//         train: "Kyoto City Subway Karasuma Line",
//         destination: "Takeda (Kyoto)",
//         firstTrainTime: "05:23",
//         frequency: 27
//       },
//       1: {
//         train: "Kyoto City Subway Tozai Line",
//         destination: "Uzumasa",
//         firstTrainTime: "05:15",
//         frequency: 34
//       },
//   }
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

var trainLocal = [];

database.ref().on("value", function(childSnapshot) {
    trainLocal = childSnapshot.val();

    $("tbody").empty();

    $.each(childSnapshot.val(), function(i) {
        var firstTimeConverted = moment(trainLocal[i].firstTrainTime, "hh:mm").subtract(1, "years");
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        var tRemainder = diffTime % trainLocal[i].frequency;
        var tMinutesTillTrain = trainLocal[i].frequency - tRemainder;
        var nextTrain = moment().add(tMinutesTillTrain, "minutes").format("hh:mm a");
        var sec = moment(60 - moment(date, "seconds")).format("ss");
        tMinutesTillTrain = tMinutesTillTrain-1 + ":" + sec;
        
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
}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});

// Click event to add a new button to the button group
$("#addBtn").on("click", function() {
    // Grab text from input
        var trainName = $("#trainName").val().trim();
        var trainDestination = $("#trainDestination").val().trim();
        var trainTime = $("#trainTime").val().trim();
        var trainFrequency = $("#trainFrequency").val().trim();
        trainFrequency = parseInt(trainFrequency, 10);        
    // If the text isn't already in the array or blank, add it to the end
    database.ref().push({
            train: trainName,
            destination: trainDestination,
            firstTrainTime: trainTime,
            frequency: trainFrequency
    });

});

$("#tableContent").on("click", ".remove", function() {
    var key = ($(this).attr("data-key"));
    console.log(key);
    database.ref().child(key).remove();
});

function fn60sec() {
    $("tbody").empty();

    $.each(trainLocal, function(i) {
        var firstTimeConverted = moment(trainLocal[i].firstTrainTime, "hh:mm").subtract(1, "years");
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        var tRemainder = diffTime % trainLocal[i].frequency;
        var tMinutesTillTrain = trainLocal[i].frequency - tRemainder;
        var nextTrain = moment().add(tMinutesTillTrain, "minutes").format("hh:mm a");
        var sec = moment(60 - moment(date, "seconds")).format("ss");
        tMinutesTillTrain = tMinutesTillTrain-1 + ":" + sec;

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
fn60sec();
setInterval(fn60sec, 1000);
