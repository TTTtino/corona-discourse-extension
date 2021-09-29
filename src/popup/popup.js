<<<<<<< HEAD

chrome.storage.local.get(['projectName'], function(result) {
  if (typeof result.projectName !== 'undefined'){
     document.getElementById("selected-project-text").innerHTML = 'The current selected project is <b>'+result.projectName+'</b>.';
     document.getElementById("toggle-button").style.visibility = "visible";
  }else{
  document.getElementById("selected-project-text").innerHTML =
  'There is no project selected. To select a project please follow these steps:'+
  ' <ol>'+
  '<li>Click on the extension icon in your navigation bar.</li>'+
  '<li>Find Corona Discourse Extension and click on the three dots next to it.</li>'+
  '<li>Select "Options".</li>'+
  '<li>Select "Select analysis" from the menu on the left.</li>'+
  '<li>Select "Choose a project from the dropbox and confirm your choice.</li>'+
'</ol>'+
'After you finished the steps above the selected project will be displayed here and you can start to run the analysis.'
  document.getElementById("toggle-button").style.visibility = "hidden";
  }

});

//
//chrome.storage.local.get({extensionActive: false}, (result)=>{
//    if(result.extensionActive){
        document.getElementById("toggle-button").dataset.active = true;
//    } else{
//        document.getElementById("toggle-button").dataset.active = false;
//        chrome.action.setIcon({
//            path: {
//                16: "/images/bw_logo16.png",
//                48: "/images/bw_logo48.png",
//                128: "/images/bw_logo128.png",
//            },
//        });
//    }
//});

=======
// get's the extension status. If not stored then it defaults to false
chrome.storage.local.get({extensionActive: false}, (result)=>{
    // if the extension is active
    if(result.extensionActive){
        // make the toggle button "active"
        document.getElementById("toggle-button").dataset.active = true;
        // Change the toggle button text to "active"
        document.getElementById("toggle-button").innerHTML = "Active";
    } else{
        // make the toggle button "inactive"
        document.getElementById("toggle-button").dataset.active = false;
        // Change the toggle button text to "Not Collecting Data"
        document.getElementById("toggle-button").innerHTML = "Not Collecting Data";
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
>>>>>>> f6c02517b72ab53f2b08a8e33a89f0fc6876c64f
document.getElementById("toggle-button").addEventListener("click", () => {
    // get the extension's active status
    chrome.storage.local.get({extensionActive: false}, (result)=>{
        // toggle the status
        let status = !result.extensionActive;
        // if new status is active
        if(status){
<<<<<<< HEAD
         if(confirm("Are you sure you want to activate this extension? By activating it, it will read the content of the website you see before you."+
        "The collected data will not be saved anywhere until we don't specifically got your permission to do so. If you close this tab, all the collected data will be permanently deleted")){
//            document.getElementById("toggle-button").dataset.active = true;

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
              chrome.tabs.sendMessage(tabs[0].id, {action: "startAnalysis"}, ()=> {
              });
            });
            }
=======
            // make the toggle button "active"
            document.getElementById("toggle-button").dataset.active = true;
            // Change the toggle button text to "active"
            document.getElementById("toggle-button").innerHTML = "Active";
>>>>>>> f6c02517b72ab53f2b08a8e33a89f0fc6876c64f
        } else{
            // make the toggle button "inactive"
            document.getElementById("toggle-button").dataset.active = false;
<<<<<<< HEAD
//            document.getElementById("toggle-button").innerHTML = "Start Collecting Data";
//            chrome.action.setIcon({
//                path: {
//                    16: "/images/bw_logo16.png",
//                    48: "/images/bw_logo48.png",
//                    128: "/images/bw_logo128.png",
//                },
//            });
=======
            // Change the toggle button text to "Not Collecting Data"
            document.getElementById("toggle-button").innerHTML = "Not Collecting Data";
            // Change the icon to black and white
            chrome.action.setIcon({
                path: {
                    16: "/images/bw_logo16.png",
                    48: "/images/bw_logo48.png",
                    128: "/images/bw_logo128.png",
                },
            });
>>>>>>> f6c02517b72ab53f2b08a8e33a89f0fc6876c64f
        }
        // alter the storage to reflect the new status
        chrome.storage.local.set({extensionActive: status}, ()=>{
        });
    });
});
