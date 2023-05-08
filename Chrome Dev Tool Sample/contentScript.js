console.log('contentScript.js is running');

// Send message to background.js
const sendMsgToBackground = (msg) => {
  chrome.runtime.sendMessage(msg);
};


// Listener for messages from background.js
chrome.runtime.onMessage.addListener(msg => {
    console.log('printing msg received from background.js: ', msg)
});


// Listener for messages from the window
// window.addEventListener('message', e => {
//     console.log('printing msg received from the window: ', e)
// });


document.addEventListener("click", (event) => {
    sendMsgToBackground({
        click: true,
        xPosition: event.clientX + document.body.scrollLeft,
        yPosition: event.clientY + document.body.scrollTop
      });
  });