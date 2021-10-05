// get's the extension status. If not stored then it defaults to false


chrome.storage.local.get(['project'], function(result) {
  if (typeof result.project !== 'undefined'){
     document.getElementById("selected-project-text").innerHTML = 'The current selected project is <b>'+result.project.name+'</b>.';
     document.getElementById("toggle-button").style.visibility = "visible";
          // alter the storage to reflect the new status
  }else{
  document.getElementById("selected-project-text").innerHTML =
  'There is no project selected. You can select a project in the options of the extension. Please follow these steps:'+
  '<ol>'+
  '<li>Click on the extension icon (jigsaw puzzle piece) in your navigation bar.</li>'+
  '<li>Find Corona Discourse Extension and click on the three dots next to it.</li>'+
  '<li>Select "Options".</li>'+
  '<li>Select "Select project" from the menu on the left.</li>'+
  '<li>Select "Choose a project from the dropbox and confirm your choice.</li>'+
'</ol>'+
'After you finished the steps above the selected project will be displayed here and you can start to run the analysis.'
  document.getElementById("toggle-button").style.visibility = "hidden";
  }

});


// if the toggle button is pressed
document.getElementById("toggle-button").addEventListener("click", () => {
console.log("Run analysis button pressed");
    // get the extension's active status
         if(confirm("Are you sure you want to activate this extension? By activating it, it will read the content of the website you see before you."+
        "The collected data will not be saved anywhere until we don't specifically got your permission to do so. If you close this tab, all the collected data will be permanently deleted")){

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {action: "startAnalysis"}, ()=> {
              });
            });
            }

    });


// get's the extension status. If not stored then it defaults to false
chrome.storage.local.get({extensionActive: false}, (result)=>{
    // if the extension is active
    if(!result.extensionActive){
        chrome.action.setIcon({
            path: {
                16: "/images/bw_logo16.png",
                48: "/images/bw_logo48.png",
                128: "/images/bw_logo128.png",
            },
        });
        }
});

