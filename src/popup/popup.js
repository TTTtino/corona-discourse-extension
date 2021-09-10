chrome.storage.local.get({extensionActive: false}, (result)=>{
    if(result.extensionActive){
        document.getElementById("toggle-button").dataset.active = true;
        document.getElementById("toggle-button").innerHTML = "Active";
    } else{
        document.getElementById("toggle-button").dataset.active = false;
        document.getElementById("toggle-button").innerHTML = "Not Collecting Data";
        chrome.action.setIcon({
            path: {
                16: "/images/bw_logo16.png",
                48: "/images/bw_logo48.png",
                128: "/images/bw_logo128.png",
            },
        });
    }
});

document.getElementById("toggle-button").addEventListener("click", () => {
    chrome.storage.local.get({extensionActive: false}, (result)=>{
        let status = !result.extensionActive;
        if(status){
            document.getElementById("toggle-button").dataset.active = true;
            document.getElementById("toggle-button").innerHTML = "Active";
        } else{
            document.getElementById("toggle-button").dataset.active = false;
            document.getElementById("toggle-button").innerHTML = "Not Collecting Data";
            chrome.action.setIcon({
                path: {
                    16: "/images/bw_logo16.png",
                    48: "/images/bw_logo48.png",
                    128: "/images/bw_logo128.png",
                },
            });
        }
        chrome.storage.local.set({extensionActive: status}, ()=>{
        });
    });
});

