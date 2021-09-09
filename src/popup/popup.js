chrome.storage.local.get({extensionActive: false}, (result)=>{
    if(result.extensionActive){
        document.getElementById("toggle-button").innerHTML = "Active";
    } else{
        document.getElementById("toggle-button").innerHTML = "Not Collecting Data";
    }
});

document.getElementById("toggle-button").addEventListener("click", () => {
    chrome.storage.local.get({extensionActive: false}, (result)=>{
        let status = !result.extensionActive;
        if(status){
            document.getElementById("toggle-button").innerHTML = "Active";
        } else{
            document.getElementById("toggle-button").innerHTML = "Not Collecting Data";
        }
        chrome.storage.local.set({extensionActive: status}, ()=>{
        });
    });
});

