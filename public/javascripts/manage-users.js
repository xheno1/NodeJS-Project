import { modalPopUp } from "./module/component.js";
import {
  sectionContainer,
} from "./module/dom-element.js";

class App {

  constructor() {
    this.url =  window.location.host;

    // Methods
    this._deleteUser();
  }

  _deleteUser() {
    const actionDeleteUser = document.querySelectorAll(".action_link-delete");

    // Attached an event listener for each user delete
    actionDeleteUser.forEach(user => {
      // Target element click delete link
      user.addEventListener("click", e => {
        // remove default button behavior
        e.preventDefault();

        // Open modal
        sectionContainer.insertAdjacentHTML("beforebegin", modalPopUp(e.target.dataset.email, "Confirm Delete", "/user-list", "./images/question.PNG"));

        // Select dynamic delete btn then do the delete if ok is click
        document.querySelector(".btn-delete-confirm").addEventListener("click", e => {
          
          /////////////////////////////////////
          // Delete the user in the User collection
          axios.delete(`https://${this.url}/user-list/${e.target.dataset.variable}`)
          .then(response => {
            if(response.status === 200 && response.statusText === "OK"){
              location.reload();
            }else{
              location.reload();
            }
          }).catch(err => {
            location.reload();
          });
          
        });
      });
    });
  }
}

const app = new App();
