import { alertPopUp, successPopUp } from "./module/component.js";
import {
  btnUpdateUserInfo as btnUpdate,
  userEditFullName as nameTxtbox,
  userEditEmail as emailTxtbox,
  sectionContainer,
} from "./module/dom-element.js";

// Regex pattern for Email
const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;

class App {
  constructor() {

    this.url =  window.location.host;

    // Event Listener
    btnUpdate.addEventListener("click", this._validateInput.bind(this));
  }

  _validateInput() {
    // Check if name or email textbox is empty
    if (nameTxtbox.value === "") {
      // Show pop up alert
      sectionContainer.insertAdjacentHTML("beforebegin", alertPopUp("Update Information", "Name must not be empty")); //

      // Remove the modal after 2 seconds
      setTimeout(() => {
        document.querySelector(".error_message").remove();
      }, 2000);

      //  Stop from procceding below
      return;
    } else if (emailTxtbox.value === "") {
      // Show pop up alert
      sectionContainer.insertAdjacentHTML("beforebegin", alertPopUp("Update Information", "Email must not be empty")); //

      // Remove the modal after 2 seconds
      setTimeout(() => {
        document.querySelector(".error_message").remove();
      }, 2000);

      //  Stop from procceding below
      return;
    } else {
      // Check if email is existing after
      this._checkifEmailCorrect();
    }
  }

  _checkifEmailCorrect() {
    if (emailPattern.test(emailTxtbox.value)) {
      // call the the save update user
      this._saveUpdatedUser();
    } else {
      // Show pop up alert that the email is not valid
      sectionContainer.insertAdjacentHTML("beforebegin", alertPopUp("Update Information", "Email format is not correct!")); //

      // Remove alert after 2 seconds
      setTimeout(() => {
        document.querySelector(".error_message").remove();
      }, 2000);
    }
  }

  _saveUpdatedUser(){
    const userMail = location.pathname.slice(11);

    axios.patch(`https://${this.url}/user-list/${userMail}`, {
      name: nameTxtbox.value,
      email: emailTxtbox.value
    })
    .then(response => {
      // optional chain undefined if the property not existing

      // Consume promise
      // check if the user is editing himself if he change
      // his email then logout the user
      if(response.data?.changeEmail){
        window.location.replace("/logout");
      }
      
      // if the logged in user did not change his email or
      // update other user
      if(response.data?.editOtherAccount){
        sectionContainer.insertAdjacentHTML("beforeend", successPopUp("Success", response.data.message));
        
        // Navigate after 2 seconds
        setTimeout(() => {
          window.location.replace('/user-list');
        }, 1000);
      } 
      
      // If email is already duplicated
      // Show error
      if (response.data.ok === 0 && response.data.code === 11000) {
        sectionContainer.insertAdjacentHTML("beforeend", alertPopUp("Edit user", "Email is already used please try another one!"));

        // Hide Alert after 2 seconds
        setTimeout(() => {
          document.querySelector(".error_message").remove();
        }, 2000);

        return;
      }
    }).catch(err => {
      // console.log(err.code);
      sectionContainer.insertAdjacentHTML("beforeend", alertPopUp("Edit user", "Internal Server Error"));

      // Hide Alert after 2 seconds
      setTimeout(() => {
        document.querySelector(".error_message").remove();
      }, 2000);
    })
  }

}

const app = new App();
