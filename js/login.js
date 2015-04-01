//Add cortana activation event listener
if (typeof Windows != 'undefined') {
  console.log("Windows namespace is defined");

  var activation = Windows.ApplicationModel.Activation;

  Windows.UI.WebUI.WebUIApplication.addEventListener("activated", function (args) {
    
    console.log("The activation kind: " + args.kind);

    console.log("This is the kind for voice activation: " + activation.ActivationKind.voiceCommand);

    console.log("The args are: " + args);



    var speechRecognitionResult = args.result;

      // Speech reco result
      console.log("Thsi is the speech reco test result: " + speechRecognitionResult.text);

      console.log("This is the command: " + speechRecognitionResult.rulePath[0]);

      console.log("This is the command: " + speechRecognitionResult.RulePath[0]);

    if (args.detail.kind === activation.ActivationKind.voiceCommand) {
      //var speechRecognitionResult = args.result;

      console.log("This is in the if!!");

      // Speech reco result
      console.log("Thsi is the speech reco result: " + speechRecognitionResult);

      // The name of the voice command
      console.log("This is the name of the voice command: " + speechRecognitionResult.rulePath[0]);

      // The actual text spoken
      var textSpoken =
        speechRecognitionResult.text !==
        undefined ? speechRecognitionResult.text : "EXCEPTION";
      
      console.log("This is the actual spoken text: " + textSpoken);
    }

  });
}

//Force into https://
if (window.location.protocol != "https:") {
//  console.log("Forced the page to load into https://");
   window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
}

//Setup the Facebook SDK
window.fbAsyncInit = function() {
	FB.init({
	  appId      : '821945741172950',
	  xfbml      : true,
	  version    : 'v2.1'
	});
};

$( document ).ready(function() {
  var loginB = document.getElementById("loginB");
  loginB.addEventListener("click", loginFB);

  //var logoPic = document.getElementById("logoPic");
  //logoPic.src = "images/logo.png";
});

(function(d, s, id){
 var js, fjs = d.getElementsByTagName(s)[0];
 if (d.getElementById(id)) {return;}
 js = d.createElement(s); js.id = id;
 js.src = "//connect.facebook.net/en_US/sdk.js";
 fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));



 //DO the manual FB login
function loginFB() {
    console.log("Starting Facebook login");
    window.location.href = 'https://www.facebook.com/dialog/oauth?client_id=821945741172950&redirect_uri=https://grouppost.azurewebsites.net/postBoard.html';

    //console.log('Successful login for: ' + response.name);
   //document.getElementById('status').innerHTML = 'Thanks for logging in, ' + response.name + '!';

    //https://wvlogin.azurewebsites.net/loggedIn
}

function getUser() {
	FB.getLoginStatus(function(response) {
    if (response.status === 'connected') {
      var userID = response.authResponse.userID;
      console.log('Logged in.');
      console.log('The user id is: ' + userID);
    }
    else {
      //FB.login();
      console.log('Not logged in');
      window.location.href = "Index.html";
    }
  });
}

