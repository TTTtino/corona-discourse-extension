chrome.action.setBadgeText({text:''});

// get's the extension status. If not stored then it defaults to false
chrome.storage.local.get({extensionActive: false}, (result)=>{
  // if the extension is active
  if(result.extensionActive){
      // make the toggle button "active"
      document.getElementById("toggle-button").dataset.active = true;
      // Change the toggle button text to "active"
      document.getElementById("toggle-button").innerHTML = "Collecting Data. Press to stop";
  } else{
      // make the toggle button "inactive"
      document.getElementById("toggle-button").dataset.active = false;
      // Change the toggle button text to "Not Collecting Data"
      document.getElementById("toggle-button").innerHTML ="Not Collecting Data. Press to start.";
      // Change the icon to black and white
      chrome.action.setIcon({
          path: {
              16: "/images/bw_logo16.png",
              48: "/images/bw_logo48.png",
              128: "/images/bw_logo128.png",
          },
      });
  }
});

// if the toggle button is pressed
document.getElementById("toggle-button").addEventListener("click", () => {
  // get the extension's active status
  chrome.storage.local.get({extensionActive: false}, (result)=>{
      // toggle the status
      let status = !result.extensionActive;
      // if new status is active
      if(status){
        if(confirm("Please confirm that you want to activate this extension. After you activate the extension, it will read the content of the allow-listed websites as you browse them. The collected results will not be saved anywhere until you give your permission to share them.  To review your results, navigate to the 'Analysis Overview / Results' tab on the 'Extension Options' page.")){
          // make the toggle button "active"
          document.getElementById("toggle-button").dataset.active = true;
          // Change the toggle button text to "active"
          document.getElementById("toggle-button").innerHTML = "Collecting Data. Press to stop";
        }
      } else{
          // make the toggle button "inactive"
          document.getElementById("toggle-button").dataset.active = false;
          // Change the toggle button text to "Not Collecting Data"
          document.getElementById("toggle-button").innerHTML = "Not Collecting Data. Press to start.";
          // Change the icon to black and white
          chrome.action.setIcon({
              path: {
                  16: "/images/bw_logo16.png",
                  48: "/images/bw_logo48.png",
                  128: "/images/bw_logo128.png",
              },
          });
      }
      // alter the storage to reflect the new status
      chrome.storage.local.set({extensionActive: status}, ()=>{
      });
  });
});

chrome.storage.local.get(['project'], function(result) {
  if (typeof result.project !== 'undefined'){
     document.getElementById("selected-project-text").innerHTML = 'The current selected project is <b>'+result.project.name+'</b>.';
     document.getElementById("toggle-button").style.visibility = "visible";
          // alter the storage to reflect the new status
  }else{
  document.getElementById("selected-project-text").innerHTML =
  'There is no project selected. You can select a project in the options of the extension.</br> To open the options page please press  the button <b>Open Extension Options</b>'+
'<ol>'+
  '<li>Within the option page, please select <b>Select project</b> from the menu on the left.</li>'+
 ' <li>Select a project from the dropbox and confirm your choice.</li>'+
'</ol>'+
'After you finished the steps above the selected project will be displayed here and you can start to run the analysis.'
  document.getElementById("toggle-button").style.visibility = "hidden";
  }

});


// if the to extension options button is pressed
document.getElementById("option-button").addEventListener("click", () => {
chrome.runtime.openOptionsPage();
});
