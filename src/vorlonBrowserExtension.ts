module VBE {
   export class Dashboard {
       constructor() {
           var messagesDiv = document.getElementById("messages");
           chrome.runtime.onMessage.addListener(
                function(request, sender, sendResponse) {
                    messagesDiv.innerText += messagesDiv.innerText + (sender.tab ?
                                "from a content script:" + sender.tab.url :
                                "from the extension");
                });
       }
   }
}