// var app = angular.module('postItApp', []);

var idNum;

var isFirst = true;

var loc = {}; //stores note location

var userID; //FB User ID
var userName; //FB User Name

var notesArray = [];

var isPostsLoaded = false;

// app.controller('PostItController', function($scope) {
  
// });

var client; //Azure Mobile Services Client
var userTable=null; //Azure DB table

var firebaseDataRef; //Firebase data reference

//Add cortana activation event listener
if (typeof Windows !== 'undefined') {
  console.log("Windows namespace is defined");

  var activation = Windows.ApplicationModel.Activation;

  Windows.UI.WebUI.WebUIApplication.addEventListener("activated", function (args) {
    
    console.log("The activation kind: " + args.kind);

    console.log("This is the kind for voice activation: " + activation.ActivationKind.voiceCommand);

    console.log("The args are: " + args);

    if (args.kind === activation.ActivationKind.voiceCommand) {
      //var speechRecognitionResult = args.result;

      console.log("This is in the if!!");

      var speechRecognitionResult = args.result;

      // Speech reco result
      console.log("Thsi is the speech reco test result: " + speechRecognitionResult.text);

      console.log("This is the command .rulePath: " + speechRecognitionResult.rulePath[0]);

      //console.log("This is the command: " + speechRecognitionResult.RulePath[0]);

      // Speech reco result
      console.log("Thsi is the speech reco result: " + speechRecognitionResult);

      // The name of the voice command
      console.log("This is the name of the voice command: " + speechRecognitionResult.rulePath[0]);

      if (speechRecognitionResult.rulePath[0] === "addNote") {

        console.log("Adding this note from Cortana: " + speechRecognitionResult.text);
        selectDiv("div"+idNum, "editB"+idNum, true, "dc"+idNum, speechRecognitionResult.text);

      }

      // The actual text spoken
      var textSpoken =
        speechRecognitionResult.text !==
        undefined ? speechRecognitionResult.text : "EXCEPTION";
      
      console.log("This is the actual spoken text: " + textSpoken);
    }
  });
}

$( document ).ready(function() {
  //init firebase data ref
  firebaseDataRef = new Firebase('https://group-post.firebaseio.com/');
  //check if the FB User Id has been set up in Firebase and set it if it hasn't
  //var notesRef = firebaseDataRef.child("test-chat-ks");

  //-------------------------------------------------------------------------
  //init AMS client
  // client = new WindowsAzure.MobileServiceClient(
  // "https://grouppostbetadb.azure-mobile.net/",
  // "hyCoAnJjoajhcntTKrzmnBPJaxKCiw45");
  // //init the Azure table
  // userTable=client.getTable("userTable");
  //Set the location for the notes
  getGeoLoc();

  WinJS.UI.XYFocus.enableXYFocus();
});

window.fbAsyncInit = function() {

  FB.init({
    appId      : '821945741172950',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.1' // use version 2.1
  });

  //Get the Facebook UserId
  FBuid();

};

// Load the SDK asynchronously
(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function FBLogout() {
  FB.logout(function(response) {
        //redirect the user to the login page
        window.location.href = "Index.html";
  });
}

// Check if the user exists
function checkIfUserExists() {
  firebaseDataRef.child(userID).once('value', function(snapshot) {
    var exists = (snapshot.val() !== null);
    userExistsCallback(exists);
  });
}

// User exists callback, if the user does not exist add a plus note
function userExistsCallback (exists) {
  console.log ("Does the user exist: " + exists);
  if (!exists) {
    idNum = 1;
    var postMessage = "";
    var picString = "Plus Logo";
    var divID = "div" + idNum;


    firebaseDataRef.child(userID).child(divID).update({
      user: userID, 
      message: postMessage,
      picture: picString,
      divID: divID,
      location: loc,
      divnum: idNum
    });         
  }
}

//hello

function FBuid() {

  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      //assign the Facebook UserId from the auth response
      userID = response.authResponse.userID;

      //Get the name of the user
      FB.api('/me', {fields: 'name'}, function(response) {
        userName = response.name;
      });

      //Check if the userID is in the FirebaseDB and add it if
      /*
      console.log("The userID is: " + userID);
      firebaseDataRef.child(userID).child("divTest").set({
        message: "test",
        picture: "test",
        divID: "test",
        location: {
          lat: 0,
          longitude: 0
        }
      });
      */

      checkIfUserExists();

      // ToDo - If there are no post its for the user he/she has to be set up and run
      firebaseDataRef.child(userID).on('child_added', function(childSnapshot) {
        //A new child has been loaded
        console.log("new child added the child is: " + childSnapshot.name());

        // Add the child changed listener
        //Add a child changed callback and call a function that handles changes
        firebaseDataRef.child(userID).child(childSnapshot.val().divID).on('child_changed', function(changedChild) {
          //call the change handler function that handles changes to notes 
          console.log("Child changed was called from the plus one note");

          //var dcID = "dc" + getParent(changedChild).val().divNum;

          console.log("This is the parent: ---+++---+++___+++___++___++___+++___++_+++" + getParent(changedChild));
          var idArray = getParent(changedChild).split('v');
          var dcID = "dc" + idArray[1];
          console.log("This is what the dcID is: " + dcID);



          updatePosts(getParentName(changedChild), changedChild.name(), changedChild.val(), dcID);
        });

        var image = null;
        // This will always be the value of the latest note when a new note is added post the initial load
        // Even at initial load it will be the value of the one that is loaded last so that case is covered too
        idNum = childSnapshot.val().divnum;
        //Check if this is indeed the last note over the picture value
        if (childSnapshot.val().picture === "Plus Logo") {
          console.log("This is the last note the one with the Plus Logo Picture");
          //Call the client side add
          addPostIt(true, '', true, null);           
        }
        // This is not the last note
        else {
          //This is not the last post it
          if(childSnapshot.val().picture === "Empty") {
            image = null;
          }
          else {
            image = childSnapshot.val().picture;
          }
          addPostIt(true, childSnapshot.val().message, false, image);
        }

      });

      // The on child removed listener
      firebaseDataRef.child(userID).on('child_removed', function(oldChildSnapshot) {
        console.log("Div: " + oldChildSnapshot.name() + " was removed");
        //Get divnum and call delete div with the correct dcID dc+divNum
        var dcID = "dc" + oldChildSnapshot.val().divnum;
        var divID = oldChildSnapshot.name();
        console.log("This is the dcID: " + dcID);
        //call deleteDivHelper here
        deleteDivHelper(divID, dcID);
      });

      //Get all the post it's from the DB and display them on the page
      //getPostIts();
      initEventListeners();
    }
    else {
      //This get executed if the user isn't logged in
      window.location.href = "Index.html";
    }
  });
}



//Get the parent of a firebase snapshot
function getParent(snapshot) {
  // You can get the reference (A Firebase object) from a snapshot
  // using .ref().
  var ref = snapshot.ref();
  // Now simply find the parent and return the name.
  return ref.parent().name();
}

function reloadClearCache() {
  window.location.reload(true);
}

function initEventListeners() {
  //Facebook logout button
  var logoutButton = document.getElementById('fbLogout');
  logoutButton.addEventListener("click", function (e) { FBLogout(); });
  //Clear the cache
  // var logoutButton = document.getElementById('Reload');
  // logoutButton.addEventListener("click", function (e) { reloadClearCache(); });
}

function getGeoLoc () {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(setPosition);
  }
  else {
    console.log("browser doesn't support position");
  }
}

function setPosition (position) {
  //Set the lat long of the note
  loc.latitude = position.coords.latitude;
  loc.longitude = position.coords.longitude;
}

function selectDiv(divID, buttonID, isPlus, dcID, cortanaReco)
{
  var initialColor = 'rgb(255, 255, 153)';
  var div = document.getElementById(divID);
  var backColor = div.style.backgroundColor;
  var button = document.getElementById(buttonID);

  //Set the div to editable
  if (div.contentEditable === 'false'){
    //This is where the color is changed
    //can all divs change color at the same time
    //div.style.backgroundColor = '#FFFF00';
    div.style.backgroundColor = '#f1c40f';
    div.contentEditable = 'true';
    cursorManager.setEndOfContenteditable(div);
    div.focus();
    
    //PLus Post it note
    if(isPlus) {
      // Set up the plus post it note
      rmPlusAddBtns(divID, buttonID, dcID);

      if (cortanaReco) {

        selectDiv(divID, buttonID, false, dcID, cortanaReco);

      }

    }
    else {
      //Add the Post button
      button.className = 'postButton fa fa-check';
    }
  }
  //This is what gets executed when the post button is hit
  else{
    //Update the PostIt note in the DB
    var postMessage;
    if (cortanaReco) {
      var recoWordsArray = cortanaReco.split(" ");
      var message = "";
      for (var i = 3; i < recoWordsArray.length; i++) {
        message += recoWordsArray[i] + " "; 
        if (recoWordsArray[i+1] == "using") {
          break;
        }
      }
      postMessage = message;
    }
    else {
      postMessage = div.innerHTML;
    }
    

    //Update the PostIt note in the DB
    // var query = userTable;
    // query.where({ PID: divID, uid: userID }).read().then(function (postIts) {
    //   postIts[0].PostItNote = div.innerHTML;
    //   userTable.update(postIts[0]);
    // });

    //Check if a new not "plusOne" if being added and change the picture to Empty
    firebaseDataRef.child(userID).child(divID).once("value", function(data) { 
    
      var picString = data.val().picture;

      //var picString = post.picture;
      console.log("This is what the name of the pic is: " + picString);
      if (picString === "Plus Logo") {
        console.log("the picString is being set to empty");
        picString = "Empty";
      };

      firebaseDataRef.child(userID).child(divID).update({
        //user: userID, 
        message: postMessage,
        picture: picString,
        divID: divID,
        location: loc,
        //divnum: idNum
      });
    });
    
    //This is where the windows notification goes -----------------------------------------------------------------
    windowsNotification (postMessage);
    
    

    //Check if this is the last post it and if so add another one
    //This will just have to be replace with an Update call to add a new post it in firebase
    var lastDiv = "div" + (idNum);

    
    if(divID == lastDiv)
    {     
      idNum++;
      var pid = "div" + idNum;
      //addPostIt(false, "", true);
      var postText = "";
      // ----------------------------------Add code in here-----------------------------------
      firebaseDataRef.child(userID).child(pid).update({
        user: userID, 
        message: postText,
        picture: "Plus Logo",
        divID: pid,
        location: loc,
        divnum: idNum
      });
    }

    div.style.backgroundColor = '#f39c12';
    div.contentEditable = 'false'; 
    button.className = 'editButton fa fa-pencil-square-o';
  }
}

function windowsNotification (postMessage) {
  var tags = postMessage.split('#');
  if(tags[1]) {
    if (window.CommunicatorWinRT) {
      //The WinRT was found
      windowsNotify(tags, window.CommunicatorWinRT);  
    }
    else if (typeof Windows != 'undefined') {
      //document.getElementById(divID).innerHTML = "Success going to try and send a Windows notification";
      var d = +tags[1];
      var delay = d * 1000;
      toastMessage (tags[0], delay);

    }
    else {
      //The WinRT class wasn't found add a fallback
    }
  }
}

// Get Plus not ready for addition of new note
function rmPlusAddBtns (divID, buttonID, dcID, sync) {
  $('#' + buttonID).remove();
      var idArray = divID.split('v');
      var divnum = idArray[1];

      //Add a Post button
      var newButton=document.createElement('a');
      newButton.id = buttonID;
      if (sync) {
        newButton.className = 'editButton fa fa-pencil-square-o';
      }
      else
      {
        newButton.className = 'postButton fa fa-check';  
      }
      //newButton.innerHTML ='Post';
      newButton.addEventListener("click", function (e) { selectDiv(divID, newButton.id, false, dcID); });

      $('#'+ dcID).append(newButton);

      //Add the camera button
      var cButton = document.createElement('a');
      cButton.id = "cameraB" + divnum;
      cButton.className = 'cameraButton fa fa-camera';
      cButton.addEventListener("click", function (e) { takePicture(divID, dcID, cButton.id) });
      $('#'+ dcID).append(cButton); 
      

      //Add the delete button
      var dButton=document.createElement('a');
      dButton.id = "deleteB" + divnum;
      dButton.className = 'deleteButton fa fa-times';
      //dButton.innerHTML ='Delete';
      dButton.addEventListener("click", function (e) { deleteDiv(divID); });
      $('#'+ dcID).append(dButton);
}

// Toast notifications for addWebAllowedObject with WebView
function windowsNotify (tags, object) {
  //Multiply the delay by 1000
  var d = +tags[1];
  var delay = d * 1000; 
  var notifyText = tags[0];
  //Call the WinRT class-----------------------------
  object.toastMessage(notifyText, delay);
}

//WinRT function for toast notifications
function toastMessage (notifyText, delay) {

  var notifications = Windows.UI.Notifications;
  //Get the XML template where the notification content will be suplied
  var template = notifications.ToastTemplateType.toastImageAndText01;
  var toastXml = notifications.ToastNotificationManager.getTemplateContent(template);
  //Supply the text to the XML content
  var toastTextElements = toastXml.getElementsByTagName("text");
  toastTextElements[0].appendChild(toastXml.createTextNode(notifyText));
  //Supply an image for the notification
  var toastImageElements = toastXml.getElementsByTagName("image");
  //Set the image this could be the background of the note, get the image from the web
  toastImageElements[0].setAttribute("src", "https://raw.githubusercontent.com/seksenov/grouppost/master/images/logo.png");
  toastImageElements[0].setAttribute("alt", "red graphic");
  //Specify a long duration
  var toastNode = toastXml.selectSingleNode("/toast");
  toastNode.setAttribute("duration", "long");
  //Specify the audio for the toast notification
  var toastNode = toastXml.selectSingleNode("/toast");                        
  var audio = toastXml.createElement("audio");
  audio.setAttribute("src", "ms-winsoundevent:Notification.IM");
  //Specify launch paramater
  toastXml.selectSingleNode("/toast").setAttribute("launch", '{"type":"toast","param1":"12345","param2":"67890"}');
  //Create a toast notification based on the specified XML
  var toast = new notifications.ToastNotification(toastXml);
  //Send the toast notification
  var toastNotifier = notifications.ToastNotificationManager.createToastNotifier();
  toastNotifier.show(toast);
}

//Check if the browser supports getUserMedia
function hasGetUserMedia() {
  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

var errorCallback = function(e) {
    //GetUserMediaHasBeen Rejected
};

//Complete feature detection to determin how to capture the image
function takePicture(divID, dcID, buttonID) {
  
  //Take picture invoked
  if (window.cameraWinRT) {

    //Taking a pic using the WinRT APIs
    windowsCapture(window.cameraWinRT, divID);
  }
  else if (typeof Windows != 'undefined') {
    //Take a capture by directly calling WinRT
    winRTCapture(divID);
  }
  else if (hasGetUserMedia()) {
    //Taking a pic using GetUserMedia
    gumCapture(divID, dcID, buttonID);
  }
  else {
    //There is no way to take a pic
    console.log("This host does not support camara capabilities");
  }
}

function imageToDataUri(img, width, height) {

    // create an off-screen canvas
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
    // set its dimension to target size
    canvas.width = width;
    canvas.height = height;
    // draw source image into the off-screen canvas:
    ctx.drawImage(img, 0, 0, width, height);
    // encode image to data-uri with base64 version of compressed image
    return canvas.toDataURL();
}

//Take the picture through the WinRT API
function windowsCapture (object, divID) {
  //Get the base64 image from WinRT and do stuff with it
  object.capturePicture().then(function(base64pic){
    //Taking the picture succeeded 
    var photo = document.createElement("img");
    photo.setAttribute('src', "data:image/png;base64,"+base64pic);
    var resizedImage = imageToDataUri(photo, 300, 300);
    //$("#"+divID).css("background-image", "url('data:image/png;base64," + base64pic + "')");
    //add the image as a background
    $("#"+divID).css("background-image", "url(" + resizedImage + ")");
    //Add the image to the DB
    storeImage(divID, resizedImage);
  }, function(err) {
    //Taking the picture failed
    console.log("Taking the picture on Windows was canceled");
  });
}

function winRTCapture (divID) {
  //Initialize windows media camera capture
  var captureUI = new Windows.Media.Capture.CameraCaptureUI();
  //Set the format of the picture that's going to be captured (.png or .jpg)
  captureUI.photoSettings.format = Windows.Media.Capture.CameraCaptureUIPhotoFormat.png;

  //Pop up the camera UI to take a picture
  captureUI.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo).then(function (capturedItem) {
     if (capturedItem) {
        //Convert the blob file to a base 64 string
        var reader = new window.FileReader();
        reader.readAsDataURL(capturedItem); 
        reader.onloadend = function() {
          var base64pic = reader.result;                
          //Resize the base64 image
          var photo = document.createElement("img");
          photo.setAttribute('src', base64pic);
          var resizedImage = imageToDataUri(photo, 300, 300);
          //Set the picture as the background of the div
          $("#"+divID).css("background-image", "url(" + resizedImage + ")");
          //Store the image in the DB
          storeImage(divID, resizedImage);
        }
     }
     else {
        //Taking a picture has failed
        console.log("Taking the picture with WinRT failed");
     }
  });
}

//Take the picture through GUM API
function gumCapture (divID, dcID, buttonID) {
  //document.getElementById(buttonID).removeEventListener("click", arguments.callee);
  //Get rid of all event listeners
  var old_element = document.getElementById(buttonID);
  var new_element = old_element.cloneNode(true);
  old_element.parentNode.replaceChild(new_element, old_element);
  
  var video = document.createElement("video");
  //var canvas = document.createElement("canvas");
  var photo = document.createElement("img");
  //Set the video id
  var videoId = "v" + divID;
  //Get the position of the div
  var rect = document.getElementById(divID).getBoundingClientRect();

  //Set the position of the video to overlay the div
  video.style.position = "absolute";
  video.style.top = "-38px";
  video.style.left = "0px";
  video.style.height = "300px";
  video.style.width = "300px";
  //video.style.zIndex = '20';
  video.id = divID + "video";
  
  //get the webcam stream and add it to the video tag
  navigator.getMedia = ( navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia);

  //add the stream
  
  navigator.getMedia(
    {
      video: true,
      audio: false
    },
    function(stream) {
      if (navigator.mozGetUserMedia) {
        video.mozSrcObject = stream;
      } else {
        var vendorURL = window.URL || window.webkitURL;
        video.src = vendorURL.createObjectURL(stream);
        //document.getElementById("thevideo").onClick = function() {
        
      }
      video.play();
    },
    function(err) {
      console.log("An error occured! " + err);
    }
  );

  document.getElementById(buttonID).addEventListener("click", function (e) { setBackground(video, divID, dcID, buttonID); });
  //video is being added
  document.getElementById(divID).appendChild(video);
}

function setBackground (video, divID, dcID, buttonID) {
  //Setting the background image of a div
  document.getElementById(divID).removeChild(video);

  var resizedImage = imageToDataUri(video, 300, 300);
  $("#"+divID).css("background-image", "url(" + resizedImage + ")");

  //Add the image to the DB
  storeImage(divID, resizedImage);

  var old_element = document.getElementById(buttonID);
  var new_element = old_element.cloneNode(true);
  old_element.parentNode.replaceChild(new_element, old_element);

  document.getElementById(buttonID).addEventListener("click", function (e) { ( takePicture(divID, dcID, buttonID)); });
}

//Add the image to the DB
function storeImage (divID, resizedImage) {
  //Update the PostIt note in the DB
  // var query = userTable;
  // query.where({ PID: divID, uid: userID }).read().then(function (postIts) {
  //   //Add the pic here
  //   postIts[0].image = resizedImage;
  //   userTable.update(postIts[0]);
  // });
  //Store the image in the firebase DB +firebase
  firebaseDataRef.child(userID).child(divID).update({
    picture: resizedImage
  });

}

//Use this function to remove a note from firebase the delete div will be called from the callback
function deleteDiv (divID) {
  //Delete the div from Firebase (this needs to call in the delete divHelper)
  firebaseDataRef.child(userID).child(divID).remove();
}

function deleteDivHelper(divID, dcID) {
  //Delete the selected div
  var lastDiv = "div" + (idNum);
  console.log("This is what a dcID looks like:-------------------------------------" + dcID);
  if(divID != lastDiv)
  {
    // var query = userTable;
    //  query.where({ PID: divID, uid: userID }).read().then(function (postIts) {
    //   userTable.del(postIts[0]);
    //  });

      //this is the animation that happens wehn a div is deleted
      $('#' + dcID).addClass('animated flipOutX'); //zoomOutLeft
      // wait for animation end
      $('#' + dcID).one('webkitAnimationEnd oanimationend msAnimationEnd animationend',   
      function(e) {
        // code to execute after transition ends
        $('#' + dcID).remove();
      });
  }
  else {
    //animation occurs if the plus one note is atempted to be deleted
    $('#' + dcID).addClass('animated bounce');   
      // wait for animation end
      $('#' + dcID).one('webkitAnimationEnd oanimationend msAnimationEnd animationend',   
      function(e) {
        // code to execute after transition ends
        $('#' + dcID).removeClass('animated bounce');
      });
  }
}

// This needs to be made to fix sync issues
function removePlus (divID, divnum) {
  var dcID = "dc" + divnum;
  var divContainer = $('#' + dcID);
  var buttonID = "editB" + divnum;

  $('#' + buttonID).remove();
  
  //Add a edit button
  var newButton=document.createElement('a');
  newButton.id = buttonID;
  newButton.className = 'editButton fa fa-pencil-square-o';
  //newButton.innerHTML ='Post';
  newButton.addEventListener("click", function (e) { selectDiv(divID, newButton.id, false, dcID); });

  $('#'+ dcID).append(newButton);

  //Add the camera button
  var cButton = document.createElement('a');
  cButton.id = "cameraB" + buttonID;
  cButton.className = 'cameraButton fa fa-camera';
  cButton.addEventListener("click", function (e) { takePicture(divID, dcID, cButton.id) });
  $('#'+ dcID).append(cButton); 
  

  //Add the delete button
  var dButton=document.createElement('a');
  dButton.id = "deleteB" + buttonID;
  dButton.className = 'deleteButton fa fa-times';
  //dButton.innerHTML ='Delete';
  dButton.addEventListener("click", function (e) { deleteDiv(divID); });
  $('#'+ dcID).append(dButton);

}

function addPostIt (isInit, postText, plusOne, imageString){

  if(!isInit) {
      var postMessage = postText;

      //This is where a new blank note is added to the DB
      //The message will be empty
      //This is the note with the plus on it

      var item = { PostItNote: postText, PID: pid, divnum: idNum, uid: userID, image: null};
      //userTable.insert(item);

  }
  else{
    var postMessage = postText;
  
  }
  
  var dContainer = document.createElement('div');
  dContainer.id = "dc" + idNum;
  var dcID = "dc" + idNum;
  dContainer.className = "col-centered col-fixed postIt";

  //Insert the container as the first child of the div
  document.getElementById('postItNotes').insertBefore(dContainer, document.getElementById('postItNotes').firstChild);

  var div = document.createElement('div');
  div.id = "div" + idNum;
  div.className = "col-centered col-fixed postIt innerDiv";
  div.contentEditable = 'false';

  //add the div ID to the array of divs
  notesArray.push(div.id);

  //div.style.backgroundColor = '#FFFF99';
  div.style.backgroundColor = '#f39c12';

  //Add the div to the body and within the parent canvas div
  //document.body.appendChild(div); // adds the canvas to the body element
  document.getElementById(dcID).appendChild(div);

  var t=document.createTextNode(postMessage);
  div.appendChild(t);

  
  if(plusOne) {
    var plus = document.createElement("input");
    plus.id = "editB" + idNum; 
    plus.src = "images/AddNote.png"; 
    plus.type = "image";
    plus.className = "plusButton"
    //TODO add oneplue arg
    plus.addEventListener("click", function (e) { selectDiv(div.id, plus.id, true, dcID); });
    dContainer.appendChild(plus);

    //this is whre the animation should go
    $('#' + dcID).addClass('animated rollIn');   
      // wait for animation end
    $('#' + dcID).one('webkitAnimationEnd oanimationend msAnimationEnd animationend',   
    function(e) {
      $('#' + dcID).removeClass('animated rollIn');
    });
  }
  else {
    //Add the edit button
    var button=document.createElement('a');
    button.id = "editB" + idNum;
    button.className = 'editButton fa fa-pencil-square-o';
    //button.innerHTML ='Edit';
    //TODO add oneplus arg
    button.addEventListener("click", function (e) { selectDiv(div.id, button.id, false, dcID); });
    dContainer.appendChild(button);

    //Add the camera button
    var cButton = document.createElement('a');
    cButton.id = "cameraB" + idNum;
    cButton.className = 'cameraButton fa fa-camera';
    cButton.addEventListener("click", function (e) { ( takePicture(div.id, dcID, cButton.id)); });
    dContainer.appendChild(cButton); 

    //Add the delete button
    var dButton=document.createElement('a');
    dButton.id = "deleteB" + idNum;
    dButton.className = 'deleteButton fa fa-times';
    //dButton.innerHTML ='';
    dButton.addEventListener("click", function (e) { deleteDiv(div.id); });
    dContainer.appendChild(dButton);
  }
  //Set the backround of the div if one exists imageString
  if (imageString) {
    divID = div.id;
    $("#"+divID).css("background-image", "url(" + imageString + ")");
  }

}

function changeColor (color) {
  for (var i = 0; i < notesArray.length; i++) {
     var div = document.getElementById(notesArray[i]);
     div.style.backgroundColor = color;
  }
}

//Function to have the Enter key post as well as clicking the button
$("#someInput").keyup(function(event){
  if(event.keyCode == 13){
    $("#postButton").click();
  }
});

//Function to handle change callbacks, name is the property name, value is the property value
function updatePosts (divID, name, value, dcID) {
  //Check if the postIt message changed, the value is the message
  if (name === "message") {
    console.log("The message of div: " + divID + " has changed to: " + value);
    $("#"+divID).html(value);
  } 
  //Check if the background picture chaged, the value is the base64 pic
  else if (name === "picture") {
    console.log("The picture of div: " + divID + " has changed to: " + value);
    $("#"+divID).css("background-image", "url(" + value + ")");
  }

  // Set the divnum
  var idArray = divID.split('v');
  var divnum = idArray[1];

  //Check if the plus button is still lingering
  // console.log("About to do the if check for the plus button class");
  var dc = document.getElementById(dcID);
  var cameraB = document.getElementById("cameraB"+divnum);

  var numChildren = dc.childElementCount;

  console.log("dc Element:" + dc + " The element id looking for: " + dcID);
  console.log("cameraB Element:" + cameraB + " The element id looking for: " + "cameraB"+divnum);
  console.log( $.contains( dc , cameraB) );

  // This is for the synced board, check if the camera is present if not the plus must be present
  if(!($.contains( dc , cameraB))) {
    // This is where the remove plus needs to be called
    var buttonID = "editB" + divnum;
    rmPlusAddBtns (divID, buttonID, dcID, true);
    

    console.log("The input element is still present!!!! Should only show up in non primary");
    // removePlus(divID, divnum);
  } 
}

function getParentName(snapshot) {
  var ref = snapshot.ref();
  return ref.parent().name();
}

//Namespace management idea from http://enterprisejquery.com/2010/10/how-good-c-habits-can-encourage-bad-javascript-habits-part-1/
(function( cursorManager ) {

    //From: http://www.w3.org/TR/html-markup/syntax.html#syntax-elements
    var voidNodeTags = ['AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 
    'MENUITEM', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR', 'BASEFONT', 'BGSOUND', 'FRAME', 'ISINDEX'];

    //From: http://stackoverflow.com/questions/237104/array-containsobj-in-javascript
    Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    }

    //Basic idea from: http://stackoverflow.com/questions/19790442/test-if-an-element-can-contain-text
    function canContainText(node) {
        if(node.nodeType == 1) { //is an element node
            return !voidNodeTags.contains(node.nodeName);
        } else { //is not an element node
            return false;
        }
    };

    function getLastChildElement(el){
        var lc = el.lastChild;
        while(lc.nodeType != 1) {
            if(lc.previousSibling)
                lc = lc.previousSibling;
            else
                break;
        }
        return lc;
    }

    //Based on Nico Burns's answer
    cursorManager.setEndOfContenteditable = function(contentEditableElement)
    {

        while(getLastChildElement(contentEditableElement) &&
              canContainText(getLastChildElement(contentEditableElement))) {
            contentEditableElement = getLastChildElement(contentEditableElement);
        }

        var range,selection;
        if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
        {    
            range = document.createRange();//Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection();//get the selection object (allows you to change selection)
            selection.removeAllRanges();//remove any selections already made
            selection.addRange(range);//make the range you have just created the visible selection
        }
        else if(document.selection)//IE 8 and lower
        { 
            range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
            range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
            range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
            range.select();//Select the range (make it the visible selection
        }
    }

}( window.cursorManager = window.cursorManager || {}));
