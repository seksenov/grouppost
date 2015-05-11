# GroupPost
## [Visit GroupPost!](https://grouppost.azurewebsites.net)

Responsive note taking single page application designed to perform well as a native hosted web application on Windows. Feature detection and access to Windows APIs directly from JS when running as an application on Windows with browser fallbacks. 

## Notes

Notes are taken within a "PostIt Note" and are of text input (letters and numbers). Individual note backgrounds can be set to a pictures taken from the webcam.

## Login

Currently only supports Facebook login. Once logged in the user will be able to add notes. Notes are currently private so only the user posting will be able to view them.

## Integration with Windows Platfrom

Before each function is called feature detection is done to dermine if the Windows namespace is available.

```javascript
if (typeof Windows != "undefined") {
	//Call the function for platfrom integration
}
```

### Camera Capture

```javascript
function winRTCapture (divID) {
  //Initialize windows media camera capture
  var captureUI = new Windows.Media.Capture.CameraCaptureUI();
  
  //Set the format of the picture that's going to be captured (.png or .jpg)
  captureUI.photoSettings.format = Windows.Media.Capture.CameraCaptureUIPhotoFormat.png;

  //Pop up the camera UI to take a picture
  captureUI.captureFileAsync(Windows.Media.Capture.CameraCaptureUIMode.photo).then(function (capturedItem) {
     if (capturedItem) {
        //Do stuff with the image
     }
     else {
        //Taking a picture has failed
     }
  });
}
```

## Storage

The notes and backgtound pictures are stored on Firebase levaraging callbacks for live syncing and updates across clients. 

## Coming Soon

- Sharing note boards across groups of Facebook friends
- Live updates to notes across multiple devices
- More Facebook integration
- Twitter login and integration
