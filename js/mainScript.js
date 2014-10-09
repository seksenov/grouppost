
var app = angular.module('postItApp', []);

var idNum;

var userID;

var notesArray = [];

app.controller('PostItController', function($scope) {
  
});

var client = new WindowsAzure.MobileServiceClient(
"https://grouppostbetadb.azure-mobile.net/",
"hyCoAnJjoajhcntTKrzmnBPJaxKCiw45"
);

var userTable=null;
userTable=client.getTable("userTable");

//do the FB init stuff
//function checkLoginState() {
//    FB.getLoginStatus(function(response) {
//      statusChangeCallback(response);
//    });
//  }

window.fbAsyncInit = function() {

  console.log("Yo! ------------------ initializing FB");

  FB.init({
    appId      : '821945741172950',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.1' // use version 2.1


  });

  // Now that we've initialized the JavaScript SDK, we call 
  // FB.getLoginStatus().  This function gets the state of the
  // person visiting this page and can return one of three states to
  // the callback you provide.  They can be:
  //
  // 1. Logged into your app ('connected')
  // 2. Logged into Facebook, but not your app ('not_authorized')
  // 3. Not logged into Facebook and can't tell if they are logged into
  //    your app or not.
  //
  // These three cases are handled in the callback function.

  //FB.getLoginStatus(function(response) {
  //  statusChangeCallback(response);
  //});

  console.log("Yo! ------------------ about to get the uid");

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

//Get the user FB uid of the person logged in


//var item = { text: "1: This is Static" };
//client.getTable("Item").insert(item);

//Select the clicked canvas
function selectCanvas(canvasID)
{
  //console.log(canvasID);
  //var ctx = document.getElementById(canvasID).getContext("2d");

  var cvs = document.getElementById(canvasID); //The canvas
  var cvsBack = cvs.style.background; //The canvas background
  var ctx = cvs.getContext("2d");

  var color = $( canvasID ).css( "background" );

  console.log(color);

  if(cvsBack == '#FFFF00')
  {
    cvs.background = '#FFFF99';
    
  }
  else
  {
    cvs.style.background = '#FFFF00'; 
  }

}

function FBLogout() {
  FB.logout(function(response) {
        console.log("Person is now logged out");
        window.location.href = "Index.html";
        console.log("They should also be redirected");
  });
}

function FBuid() {

  FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      userID = response.authResponse.userID;
      console.log('Logged in.');
      console.log('The user id is: ' + userID);
      //Get all the post it's from the DB and display them on the page
      getPostIts();
    }
    else {
      //FB.login();
      console.log('Not logged in');
      window.location.href = "Index.html";
    }
  });
}
/*
$(document).on('click', 'div', function () {
    alert(this.id);
});
*/

function selectDiv(divID, buttonID, isPlus, dcID)
{
  var initialColor = 'rgb(255, 255, 153)';
  var div = document.getElementById(divID);
  var backColor = div.style.backgroundColor;
  var button = document.getElementById(buttonID);

  console.log(backColor);
  console.log(initialColor);
  console.log(div.contentEditable);
  //Set the div to editable
  if (div.contentEditable === 'false'){
    //This is where the color is changed
    //can all divs change color at the same time
    div.style.backgroundColor = '#FFFF00';
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
      //console.log("This is dcID: " + dcID);
      //console.log("This is the id of the container: " + $('#'+ dcID).id);
      $('#'+ dcID).append(newButton);
      
      //Add the delete button
      var dButton=document.createElement('a');
      dButton.id = "deleteB" + buttonID;
      dButton.className = 'deleteButton fa fa-times';
      //dButton.innerHTML ='Delete';
      dButton.addEventListener("click", function (e) { deleteDiv(div.id, dcID, dButton.id); });
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
    var query = userTable;
    query.where({ PID: divID, uid: userID }).read().then(function (postIts) {
      console.log(postIts[0].PostItNote);
      postIts[0].PostItNote = div.innerHTML;
      userTable.update(postIts[0]);
    });
    //Check if this is the last post it and if so add another one
    var lastDiv = "div" + (idNum);
    console.log("This is the last div: " + lastDiv);
    if(divID == lastDiv)
    {     
      addPostIt(false, "", true);
    }
    filter_newlines(divID);
    div.style.backgroundColor = '#FFFF99';
    div.contentEditable = 'false'; 
    button.className = 'editButton fa fa-pencil-square-o';
  }
}

function deleteDiv(divID, dcID, buttonID) {
  console.log("deleting div");

  
  var lastDiv = "div" + (idNum);
  if(divID != lastDiv)
  {
    var query = userTable;
     query.where({ PID: divID, uid: userID }).read().then(function (postIts) {
      console.log(postIts[0].PostItNote);
      console.log(postIts[0].id);
      userTable.del(postIts[0]);
     });

      $('#' + dcID).addClass('animated flipOutX'); //zoomOutLeft
      // wait for animation end
      $('#' + dcID).one('webkitAnimationEnd oanimationend msAnimationEnd animationend',   
      function(e) {
        // code to execute after transition ends
        $('#' + dcID).remove();
      });
  }
  else {
    $('#' + dcID).addClass('animated bounce');   
      // wait for animation end
      $('#' + dcID).one('webkitAnimationEnd oanimationend msAnimationEnd animationend',   
      function(e) {
        // code to execute after transition ends
        $('#' + dcID).removeClass('animated bounce');
      });
  }
}

function addPostIt (isInit, postText, plusOne){

  if(!isInit) {
      var postMessage = postText;
      idNum++;
      var pid = "div" + idNum;
      var item = { PostItNote: postText, PID: pid, divnum: idNum, uid: userID};
      userTable.insert(item);
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
  div.className = "col-centered col-fixed postIt";
  div.contentEditable = 'false';

  //add the div ID to the array of divs
  notesArray.push(div.id);

  //Log the id of the newly created div to the console
  console.log("Here logging the div ID: " + div.id);
  console.log(div.className);

  div.style.backgroundColor = '#FFFF99';

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

    //Add the delete button
    var dButton=document.createElement('a');
    dButton.id = "deleteB" + idNum;
    dButton.className = 'deleteButton fa fa-times';
    //dButton.innerHTML ='';
    dButton.addEventListener("click", function (e) { deleteDiv(div.id, dcID, dButton.id); });
    dContainer.appendChild(dButton);
  }

  //Clear the value of the input field
  //document.getElementById("someInput").value = '';
}

function changeColor (color) {
  for (var i = 0; i < notesArray.length; i++) {
    console.log(notesArray[i]);
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
  console.log("Retrieving POST PostITs");
  //console.log("type of element: "+element);
  //Retrieve the post it's in LIFO order
  idNum = 0;

  query.where({ uid: userID }).read().then(function (postIts) {
    console.log("Yo the number of PostITs is: " + postIts.length);
    console.log("THis is what the first post it says: " + postIts[0].PostItNote);
    
    for (var i = 0; i < postIts.length; i++) {
      console.log("here in the loop");
      //console.log(postIts[i].PostItNote);
      //console.log(postIts[i].divnum);
      //console.log(postIts[i].uid);
      idNum = postIts[i].divnum;
      if(i == postIts.length-1) {
        //TODO: add args for last post
        addPostIt(true, '', true);
        console.log("-----YO! in the loop i is #: " + i);
      }
      else {
        addPostIt(true, postIts[i].PostItNote, false);
      }
      

      console.log("Running through the loop!!");

      //if(postIts[i].divnum > idNum) {
        
      //}
    }
    console.log("here --------------");
    console.log("---------------THis is the lenght of postit's: " + postIts.length);
    if(postIts.length == 0) {
      //TODO add args for last post
      addPostIt(false,"",true);
    }
    console.log("Got past the if.....................");
  });

  console.log("FINISHED GETTING PostIts");
}

//The text does not overflow out of the div
function filter_newlines(divID) {
    var divString = '#' + divID;
    var div = $(divString);

    var node, prev, _i, _len, _ref, _results;
    prev = null;
    _ref = div.contents();
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      node = _ref[_i];
      if (node.nodeType === 3) {
        node.nodeValue = node.nodeValue.replace('\n', '');
        if (prev) {
          node.nodeValue = prev.nodeValue + node.nodeValue;
          $(prev).remove();
        }
        _results.push(prev = node);
      } else if (node.tagName.toLowerCase() === 'br') {
        _results.push($(node).remove());
      } else {
        $(node).css('display', 'inline');
        filter_newlines($(node));
        _results.push(prev = null);
      }
    }
    return _results;
  }

//Namespace management idea from http://enterprisejquery.com/2010/10/how-good-c-habits-can-encourage-bad-javascript-habits-part-1/
(function( cursorManager ) {

    //From: http://www.w3.org/TR/html-markup/syntax.html#syntax-elements
    var voidNodeTags = ['AREA', 'BASE', 'BR', 'COL', 'EMBED', 'HR', 'IMG', 'INPUT', 'KEYGEN', 'LINK', 'MENUITEM', 'META', 'PARAM', 'SOURCE', 'TRACK', 'WBR', 'BASEFONT', 'BGSOUND', 'FRAME', 'ISINDEX'];

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


