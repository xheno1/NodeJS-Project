import { sectionContainer, nameRegister, emailRegister, passRegister, cnfrmPass, btnRegister } from "./module/dom-element.js";
import { alertPopUp, successMessage } from "./module/component.js";

// Regex pattern for Email
let emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

class App {
  constructor() {
    this.url =  window.location.host;

    ///////////////////////////////
    // Event Listener
    btnRegister.addEventListener("click", this._register.bind(this));
  }

  _register(e) {
    e.preventDefault();

    const bindThis = this;

    // Since we dont want to duplicate the popup we need to return something
    // to stop the duplicated alert.

    if (!checkEmptyFields(nameRegister.value, "Registration", "Name must not be empty")) return;

    if (!checkEmptyFields(emailRegister.value, "Registration", "Email must not be empty")) return;

    if (!checkEmptyFields(passRegister.value, "Registration", "Password must not be empty")) return;

    if (!checkEmptyFields(cnfrmPass.value, "Registration", "Confirm password must not be empty")) return;

    ///////////////////////////////////
    // Check Email Pattern

    if (!emailPattern.test(emailRegister.value)) {
      if (!checkEmptyFields("", "Registration", "Email Address is not valid")) return;
    }

    ////////////////////////////////////////////////
    // Check empty fields
    function checkEmptyFields(fields, popUpTitle, popUpBody) {
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

    /////////////////////////////////////////////////////////
    // Check if confirm password and password are the same
    if (!checkSamePass(passRegister.value, cnfrmPass.value)) return;

    function checkSamePass(fields1, fields2) {
      if (fields1 !== fields2) {
        // Show alert
        sectionContainer.insertAdjacentHTML("beforeend", alertPopUp("Registration", "Password is not the same with confirm password!"));

        // Hide Alert after 2 seconds
        setTimeout(() => {
          document.querySelector(".error_message").remove();
        }, 2000);

        return;
      }

      // If fields not empty
      return true;
    }

    // form
    const formData = {
      name: nameRegister.value,
      email: emailRegister.value,
      password: passRegister.value,
      confirm_pass: cnfrmPass.value,
    };

    // Send data async
    // Submit the data
    axios
      .post(`https://${this.url}/register`, formData)
      .then(response => {
        // if email is already existing then send a response to client
        if (response.status === 200 && response.data.code === 11000) {
          sectionContainer.insertAdjacentHTML("beforeend", alertPopUp("Registration", "Email is already used please try another one!"));

          // Hide Alert after 2 seconds
          setTimeout(() => {
            document.querySelector(".error_message").remove();
          }, 2000);

          return;
        }

        // If all validation is met then show success message
        if (response.data.status === "ok" && response.data.message === "Register Success") {
          // Remove the form
          sectionContainer.remove();

          // Show the succcess message
          document.querySelector("body").insertAdjacentHTML("afterbegin", successMessage());
        }
      })
      .catch(err => {
        // If there is an error
        console.error("Server error");
      });
  }
}

const app = new App();
