
chrome.storage.local.get(['project'], function(result) {
  if (typeof result.project !== 'undefined'){
     document.getElementById("selected-project-text").innerHTML = 'The current selected project is <b>'+result.project.name+'</b>.';
     document.getElementById("toggle-button").style.visibility = "visible";
  }else{
  document.getElementById("selected-project-text").innerHTML =
  'There is no project selected. You can select a project in the options of the extension. Please follow these steps:'+
  '<ol>'+
  '<li>Click on the extension icon in your navigation bar.</li>'+
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
    // get the extension's active status
    chrome.storage.local.get({extensionActive: false}, (result)=>{
        // toggle the status
        let status = !result.extensionActive;
        // if new status is active
        if(status){
         if(confirm("Are you sure you want to activate this extension? By activating it, it will read the content of the website you see before you."+
        "The collected data will not be saved anywhere until we don't specifically got your permission to do so. If you close this tab, all the collected data will be permanently deleted")){

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {action: "startAnalysis"}, ()=> {
              });
            });
            }

        } else{

        }
        // alter the storage to reflect the new status
        chrome.storage.local.set({extensionActive: status}, ()=>{
        });
    });
});

