import { alertPopUp, modalPopUp, successPopUp } from "./module/component.js";
import { selectUserList, addShareBtn, sectionContainer} from "./module/dom-element.js";

class App {
  constructor() {
    this.url =  window.location.host;

    // event listener
    this._shareFileTo();
    this._removeShareFile();

    // File name
    this.fileName = window.location.pathname.slice(17);

  }

  _removeShareFile(){
    const removeBtn = document.querySelectorAll(".action_remove-share");

    // Attached event listener to all remove share button
    removeBtn.forEach(btnRemove => {
        btnRemove.addEventListener("click", (e) => {


            // fileid 
            const fileId = e.target.dataset.file;
            const userId =  e.target.dataset.userid;

            e.preventDefault();

            // When remove is click show modal 
            sectionContainer.insertAdjacentHTML("beforebegin", modalPopUp(userId, "Confirm From Webpage", `#`, `../../images/question.png`));

            // If confirm deletion send to server
            document.querySelector(".btn-delete-confirm").addEventListener("click", (e) => {
              e.preventDefault();
              
                axios.delete(`https://${this.url}/docs-list/share/${fileId}`, { data: { userId } })
                .then(response => {
                  // Reload page
                  location.reload();
                })
                .catch(err => {
                  console.log(err);
                })
            })

            // Close modal
            document.querySelector(".btn-confirm-close").addEventListener("click", (e) => {
              console.log(1);
              e.preventDefault();
              // remove modal
              document.querySelector(".modal_container").remove()
            })
        })
      })
  }

  _shareFileTo(){

    // Add shared file to other user
    addShareBtn.addEventListener('click', () => {

          //  If select option is empty do not proceed to saving
          if(selectUserList.value === '') return; 

          // Object that we want to push in fileShared
          // Check if the file is already share in the same user
          axios.put(`https://${this.url}/docs-list/share/${this.fileName}`, {
            user: selectUserList.value
          })
          .then(res => {
            sectionContainer.insertAdjacentHTML("beforebegin", successPopUp("Share file", "File successfully share!"));
            // reload page after 1 second
            setTimeout(() => {
              location.reload();
            }, 1000)
          })
          .catch(err => {
            if(err.response.status === 400){
              sectionContainer.insertAdjacentHTML("beforebegin", alertPopUp("Share file", "File is already shared to this user"));

              // remove modal for 1 seconds
              setTimeout(() => {  
                document.querySelector(".error_message").remove();
              }, 1000)
            }
            else
            console.log(err);
          })
    })
  }
}

const app = new App();
