import { userMail, passWord, btnLogin, sectionContainer } from "./module/dom-element.js";
import { alertPopUp, popUp } from "./module/component.js";

class App {
  constructor() {
    this.url =  window.location.host;

    ///////////////////////////////
    // Event Listener
    btnLogin.addEventListener("click", this._login.bind(this));
  }

  _login(e) {
    e.preventDefault();

    // Since we dont want to duplicate the popup we need to return something
    // to stop the duplicated alert.

    if (!checkFields(userMail.value, "Login", "Email must not be empty")) return;

    if (!checkFields(passWord.value, "Login", "Password must not be empty")) return;

    function checkFields(fields, popUpTitle, popUpBody) {
      if (fields === "") {
        // Show alert
        sectionContainer.insertAdjacentHTML("beforeend", alertPopUp(popUpTitle, popUpBody));

        // Hide Alert after 2 seconds
        setTimeout(() => {
          document.querySelector(".error_message").remove();
        }, 2000);

        return;
      }

      // If fields not empty
      return true;
    }

    ///////////////////////////////////
    // AXIOS
    const formData = {
      email: userMail.value,
      password: passWord.value,
    };


    // Consume
    axios
      .post(`https://${this.url}/login`, formData)
      .then(res => {
        // Check if user is not existing or server error
        if (res.data.status === "failed" && res.status === 200) {
          checkFields("", "Login", res.data.message);
        }

        // If the status is okay and input is correct proceed
        if (res.data.status === "ok" && res.status === 200) {
          // disable button
          btnLogin.setAttribute("disabled", '');

          // redirect to login success
          sectionContainer.insertAdjacentHTML("beforeend", popUp(res.data.message));
          setTimeout(() => {
            window.location.replace("/users");
          }, 1000);
        }
      })
      .catch(err => {
        // Log server error
        if (err.response.data?.status === "failed" && err.response?.status === 500) console.log(err.response.data?.message);
      });
  }
}

const app = new App();
