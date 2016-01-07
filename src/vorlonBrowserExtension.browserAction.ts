chrome.browserAction.onClicked.addListener((activeTab) => {
    chrome.tabs.create({url : 'index.html'}, (tab) => {
        
    });  
});