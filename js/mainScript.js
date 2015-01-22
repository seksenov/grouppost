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



$( document ).ready(function() {
  //init firebase data ref
  firebaseDataRef = new Firebase('https://group-post.firebaseio.com/');
  //check if the FB User Id has been set up in Firebase and set it if it hasn't
  //var notesRef = firebaseDataRef.child("test-chat-ks");

  //-------------------------------------------------------------------------
  //init AMS client
  client = new WindowsAzure.MobileServiceClient(
  "https://grouppostbetadb.azure-mobile.net/",
  "hyCoAnJjoajhcntTKrzmnBPJaxKCiw45");
  //init the Azure table
  userTable=client.getTable("userTable");
  //Set the location for the notes
  getGeoLoc();
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

      //Uncomment this-------------------------------------------------------------------------------------------------------------------------------------------------------------------

      //Add a child removed callback and call a funtion that handles the delete of a post
      //This needs to be out of the child added callback as it's the same for the user

      //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      // firebaseDataRef.child(userID).on('child_removed', function(oldChildSnapshot) {
      //   console.log("Div: " + oldChildSnapshot.name() + " was removed");
      //   //Get divnum and call delete div with the correct dcID dc+divNum
      //   var dcID = "dc" + oldChildSnapshot.val().divnum;
      //   var divID = oldChildSnapshot.name();
      //   console.log("This is the dcID: " + dcID);
      //   //call deleteDivHelper here
      //   deleteDivHelper(divID, dcID);
      // });

      // //Putting the on child added before the snapshot to check if this works
      // //This is where add post it will be called
      // firebaseDataRef.child(userID).on('child_added', function(childSnapshot) {

      //   var note = childSnapshot.val();
      //   var image = null;
      //   console.log("A NEW NOTE HAS BEEN ADDED HERE IS THE NOTE OBJECT:");
      //   console.log(note);

      //   //Add a child changed callback and call a function that handles changes
      //   firebaseDataRef.child(userID).child(note.divID).on('child_changed', function(childSnapshot) {
      //     //call the change handler function that handles changes to notes 
      //     updatePosts(getParentName(childSnapshot), childSnapshot.name(), childSnapshot.val());
      //   });
    
      //   //Check if this is the last post it
      //   if (note.picture === "Plus Logo") {
      //     //This is the last post it
      //     idNum = note.divnum;
      //     console.log("This is the last post it note the idNum of the last note is: " + idNum);
      //     console.log("Adding a note from the on chiled added event ------------------------");
      //     isFirst = false;
      //     addPostIt(isFirst, '', true, null);
      //   }
      //   else if (note.picture != "Plus Logo") {
      //     //This is not the last post it
      //     if(note.picture === "Empty") {
      //       image = null;
      //     }
      //     else {
      //       image = note.picture;
      //     }
      //     addPostIt(isFirst, note.message, false, image);
      //   }
  
      // });

      //----------------------------------------------------------------------------------------------------------------------------------------------------------------------------

      /*
      firebaseDataRef.child(userID).once('value', function(snapshot) {
        if (snapshot.val() !== null) {
          //The user already exists in the is in the Firebase DB

          //Adding the child
          firebaseDataRef.child(userID).on('child_added', function(childSnapshot) {
            var note = childSnapshot.val();
            console.log(note);
          });

          /*
          firebaseDataRef.child(userID).on('child_changed', function(childSnapshot) {
            var note = childSnapshot.val();
            console.log(note);
          });
          */

        /*
        }  
        else {
          //New user set up the initial userID node
          console.log("Adding the userID: " + userID);
          
          firebaseDataRef.child(userID).child("emptyDiv").set({
            user: userID, 
            message: "Empty",
            picture: "Empty",
            divID: "Empty",
            divnum: 0,
            location: {
              lat: 0,
              longitude: 0
            }
          });
           
        }
       
      });

      /*
        //Check if the userID is in the FirebaseDB and add it if
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

      usersRef.child(userId).once('value', function(snapshot) {
          var exists = (snapshot.val() !== null);
          userExistsCallback(userId, exists);
        });

      */

      // +firebase this is where the check should be made to see if the user id exists and add the plus note
      // ------------------------------------------------------------------------------------------------------------------------------------
      
      getPostItsFB();

      // ------------------------------------------------------------------------------------------------------------------------------------

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

function selectDiv(divID, buttonID, isPlus, dcID)
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

      $('#' + buttonID).remove();
      //Add a Post button
      var newButton=document.createElement('a');
      newButton.id = buttonID;
      newButton.className = 'postButton fa fa-check';
      //newButton.innerHTML ='Post';
      newButton.addEventListener("click", function (e) { selectDiv(div.id, newButton.id, false, dcID); });

      $('#'+ dcID).append(newButton);

      //Add the camera button
      var cButton = document.createElement('a');
      cButton.id = "cameraB" + buttonID;
      cButton.className = 'cameraButton fa fa-camera';
      cButton.addEventListener("click", function (e) { takePicture(div.id, dcID, cButton.id) });
      $('#'+ dcID).append(cButton); 
      

      //Add the delete button
      var dButton=document.createElement('a');
      dButton.id = "deleteB" + buttonID;
      dButton.className = 'deleteButton fa fa-times';
      //dButton.innerHTML ='Delete';
      dButton.addEventListener("click", function (e) { deleteDiv(div.id); });
      $('#'+ dcID).append(dButton);

    }
    else {
      //Add the Post button
      button.className = 'postButton fa fa-check';
    }
  }
  //This is what gets executed when the post button is hit
  else{
    //Update the PostIt note in the DB
    var postMessage = div.innerHTML;

    //Update the PostIt note in the DB
    var query = userTable;
    query.where({ PID: divID, uid: userID }).read().then(function (postIts) {
      postIts[0].PostItNote = div.innerHTML;
      userTable.update(postIts[0]);
    });
    //Get the location
    //getGeoLoc(); //the navigator get geo loc is async and won't return seynchronously
    //Update the firebase DB

    //This is where the new post is actually added it's previosly added as the empty plus one

    // +firebase --this is where a new note gets added
    //firebaseDataRef.push({name: userName, text: div.innerHTML, uid: userID, image: null, location: loc});

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
    var tags = postMessage.split('#');
    if(tags[1]) {
      if (window.CommunicatorWinRT) {
        //The WinRT was found
        windowsNotify(tags, window.CommunicatorWinRT);  
      }
      else {
        //The WinRT class wasn't found add a fallback
      }
    }

    //Check if this is the last post it and if so add another one
    var lastDiv = "div" + (idNum);
    if(divID == lastDiv)
    {     
      addPostIt(false, "", true);
    }
    //filter_newlines(divID);
    //unselected div
    //div.style.backgroundColor = '#FFFF99';
    div.style.backgroundColor = '#f39c12';
    div.contentEditable = 'false'; 
    button.className = 'editButton fa fa-pencil-square-o';
  }
}

function windowsNotify (tags, object) {
  //Multiply the delay by 1000
  var d = +tags[1];
  var delay = d * 1000; 
  var notifyText = tags[0];
  //Call the WinRT class-----------------------------
  object.toastMessage(notifyText, delay);
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
  else if (Windows.Media.Capture) {
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
  // var Capture = Windows.Media.Capture;
  // var Storage = Windows.Storage;

  var captureUI = new Windows.Media.Capture.CameraCaptureUI();
  captureUI.photoSettings.format = Windows.Media.Capture.CameraCaptureUIPhotoFormat.jpeg;

  captureUI.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo).then(function (capturedItem) {
     if (capturedItem) {

        window.location.reload(true);

        
        var blob = URL.createObjectURL(capturedItem, { oneTimeOnly: true });
        var base64pic;

        //Blob to base64 string

        var reader = new window.FileReader();
        reader.readAsDataURL(blob); 
        reader.onloadend = function() {
          base64pic = reader.result;                
          console.log(base64pic );
        }

        // -----------------------------------------------------------------


        var photoB = document.createElement("img");
        photoB.setAttribute("src", blob);

        document.body.appendChild(photoB);

        document.getElementById(divID).innerHTML = "Success Picture Taken: " + base64pic;

        var h = document.createElement("p");                
        var t = document.createTextNode(base64pic);     
        h.appendChild(t);  
        document.body.appendChild(h);

        var p = document.createElement("p");
        p.innerHTML = "Hello!";
        document.body.appendChild(p);

        // var resizedImage = imageToDataUri(photo, 300, 300);

        var photo = document.createElement("img");
        photo.setAttribute('src', "data:image/png;base64,"+base64pic);
        var resizedImage = imageToDataUri(photo, 300, 300);
        //The user has succeeded in getting a picture
        $("#"+divID).css("background-image", "url(" + resizedImage + ")");
        storeImage(divID, resizedImage);
     }
     else {
        //Taking a picture has failed
        document.getElementById(divID).innerHTML = "Failed";
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
  var query = userTable;
  query.where({ PID: divID, uid: userID }).read().then(function (postIts) {
    //Add the pic here
    postIts[0].image = resizedImage;
    userTable.update(postIts[0]);
  });
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
  if(divID != lastDiv)
  {
    var query = userTable;
     query.where({ PID: divID, uid: userID }).read().then(function (postIts) {
      userTable.del(postIts[0]);
     });

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


function addPostIt (isInit, postText, plusOne, imageString){

  if(!isInit) {
      var postMessage = postText;
      idNum++;
      var pid = "div" + idNum;

      //This is where a new blank note is added to the DB
      //The message will be empty
      //This is the note with the plus on it

      var item = { PostItNote: postText, PID: pid, divnum: idNum, uid: userID, image: null};
      userTable.insert(item);

      //Add the post it to firebase this will be the blank plus note
      firebaseDataRef.child(userID).child(pid).update({
        user: userID, 
        message: postText,
        picture: "Plus Logo",
        divID: pid,
        location: loc,
        divnum: idNum
      });
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

  //Clear the value of the input field
  //document.getElementById("someInput").value = '';
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

//Read the DB and pull old PostITs
function getPostIts(){ 
  var query = userTable; //Give it column name
  //Retrieve the post it's in LIFO order
  idNum = 0;

  var _divID,
      text,
      image;

  query.where({ uid: userID }).read().then(function (postIts) {
    //the number of PostITs is: postIts.length  
    for (var i = 0; i < postIts.length; i++) {
      idNum = postIts[i].divnum;
      //_divID = "div" + idNum;
      //text = postIts[i].PostItNote;
      //image = postIts[i].image;
      if(i == postIts.length-1) {
        //TODO: add args for last post
        addPostIt(true, '', true, null);


        /*        
        firebaseDataRef.child(userID).child(divID).update({
          divnum: idNum
        });
        */


      }
      else {
        addPostIt(true, postIts[i].PostItNote, false, postIts[i].image);

        /*
        firebaseDataRef.child(userID).child(divID).update({
          divnum: idNum
        });
        */
        
      }



    }
    if(postIts.length == 0) {
      //TODO add args for last post
      addPostIt(false,"",true);
    }
  });

}

//Function to handle change callbacks, name is the property name, value is the property value
function updatePosts (divID, name, value) {
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
}

function getParentName(snapshot) {
  var ref = snapshot.ref();
  return ref.parent().name();
}

//Get the PostITs from Firebase
function getPostItsFB () {
  idNum = 0;

  console.log("---------------------LOGGING THE DATA----------------------------------------");

  firebaseDataRef.child(userID).once("value", function(data) { 
    
    var posts = data.val();

    console.log(posts);
    //console.log("This is the length of post its: " + posts.length());

    var postsLength = Object.keys(posts).length;

    console.log("The number of post its is: " + postsLength);

    //Add a child removed callback and call a funtion that handle the delete
    //This needs to be out of the loop as it's only needed for the user
    firebaseDataRef.child(userID).on('child_removed', function(oldChildSnapshot) {
      console.log("Div: " + oldChildSnapshot.name() + " was removed");
      //Get divnum and call delete div with the correct dcID dc+divNum
      var dcID = "dc" + oldChildSnapshot.val().divnum;
      var divID = oldChildSnapshot.name();
      console.log("This is the dcID: " + dcID);
      //call deleteDivHelper here
      deleteDivHelper(divID, dcID);
    });


    //I will need to know if the child was changed from this instance - this can be mitigated by calling the change anytume a child is changed again it won't screw up the current instace
    //Same goes with delete
    //I don't wan't to add the child twice the child won't be added twice the callback will either add an image or change the text in a div

    var count = 0;
    var image = null;
    //Read the post it notes from the data snapshot and add them to the document (addPostIt)
    for (var note in posts) {
      if (posts.hasOwnProperty(note)) {
        count++;
        //find the max id
        idNum = posts[note].divnum;
        console.log("The final id num that was read from Firebase is: " + idNum);
        console.log(note + " -> " + posts[note].message);
        
        //Add a child changed callback and call a function that handles changes
        firebaseDataRef.child(userID).child(posts[note].divID).on('child_changed', function(childSnapshot) {
          //call the change handler function that handles changes to notes 
          console.log("Child changed was called from the plus one note");

          updatePosts(getParentName(childSnapshot), childSnapshot.name(), childSnapshot.val());
        });


        //Check if this is the last post it
        if (count >= postsLength) {
          //This is the last post it
          console.log("This is the last post it note");
          addPostIt(true, '', true, null);
        }
        else {
          //This is not the last post it
          if(posts[note].picture === "Empty") {
            image = null;
          }
          else {
            image = posts[note].picture;
          }
          addPostIt(true, posts[note].message, false, image);
        }

      }
    }
    //Check if there are no notes for the user and add the note with the plus logo
    if(count === 0) {
      //TODO add args for last post
      addPostIt(false,"",true);
    }
  });

  

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
