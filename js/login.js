//Force into https://
if (window.location.protocol != "https:") {
//  console.log("Forced the page to load into https://");
   window.location.href = "https:" + window.location.href.substring(window.location.protocol.length);
}



//Setup the Facebook SDK
window.fbAsyncInit = function() {
	FB.init({
	  appId      : '748913388496088',
	  xfbml      : true,
	  version    : 'v2.1'
	});
};

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
    window.location.href = 'https://www.facebook.com/dialog/oauth?client_id=748913388496088&redirect_uri=https://grouppost.azurewebsites.net/postBoard.html';

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

