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
document.getElementById("toggle-button").addEventListener("click", () => {
    // get the extension's active status
    chrome.storage.local.get({extensionActive: false}, (result)=>{
        // toggle the status
        let status = !result.extensionActive;
        // if new status is active
        if(status){
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
        // alter the storage to reflect the new status
        chrome.storage.local.set({extensionActive: status}, ()=>{
        });
    });
});

