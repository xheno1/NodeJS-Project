// Socket.io
const socket = io();

import { chatContainer, btnSendMessage, chatTxtBox } from "./module/dom-element.js";

class App {
  constructor() {

    this.url =  window.location.host;

    // Call the message receiver
    this._renderRealTimeMessage();

    // Scroll page
    this.scrollPage();

    // Event Listener
    btnSendMessage.addEventListener("click", this._sendMessage.bind(this));
  }

  scrollPage() {
    // Scroll To bottom
    chatContainer.scroll({ top: chatContainer.scrollHeight, left: 0, behavior: "smooth" });
  }

  _sendMessage(e) {
    e.preventDefault();

    // If chat box is empty do not send message
    if (chatTxtBox.value === "") return;

    // Create date
    let date = new Date();

    // user
    const user = document.querySelector("#show-user").textContent;

    // prettier-ignore
    let currentDate = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, "0")}-${String(date.getDay()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;

    // Create chat object
    let chatMessage = {
      time: currentDate,
      user,
      userMessage: chatTxtBox.value,
    };

    
    // SEND the user chat using axios
    axios.post(`https://${this.url}/chats`, chatMessage)
    .then(res => {
  
      // Chat string to be send for other user
      let chatString = `
      <div class="message">
        <span>[${currentDate}]</span>
        <span>${user} :</span>
        <span>${chatTxtBox.value}</span>
      </div>
    `;

      // insert message element into sender
      chatContainer.insertAdjacentHTML("beforeend", chatString)

      // Send the realtime message
      socket.emit("message", chatString)

      // Call the message receiver
      // this._renderRealTimeMessage();

      // Clear textbox
      chatTxtBox.value = "";

      // scroll to bottom
      this.scrollPage();
    })
    .catch(err => {
      console.log(`Internal Server Error`);
    });
  }

  _renderRealTimeMessage(){
    // Get the broadcasted message
    socket.on("message", msg => {
      
        // Append the message in html
       chatContainer.insertAdjacentHTML("beforeend", msg);

        // scroll to bottom
        this.scrollPage();
    });
  }
}

const app = new App();

