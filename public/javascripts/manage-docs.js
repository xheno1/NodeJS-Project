import { fileUploadModal, editUploadModal, modalPopUp } from "./module/component.js";
import {
  uploadModal,
  sectionContainer,
} from "./module/dom-element.js";

class App {

  constructor() {
    this.url =  window.location.host;

    this._editFileUpload();
    this._deleteFileUpload();
    
    // Event Listener
    uploadModal.addEventListener("click", this._showUploadModal.bind(this));
  }

  _showUploadModal() {
    sectionContainer.insertAdjacentHTML("beforebegin", fileUploadModal());

    // Attached event listener on file upload
    document.querySelector("#btn-file-upload").addEventListener("click", (e) => {
      e.preventDefault();
      
      const fileDescriptionError = document.querySelector(".file_desc-error");
      const fileDescription = document.querySelector("#file-upload-description");

      const fileUploadBoxError = document.querySelector(".file_upload-error");
      const fileUploadBox = document.querySelector("#file-upload-box");


      // Check if description textbox is empty
      if (fileDescription.value === "") {
        fileDescriptionError.textContent = "File description must not be empty";
        fileDescription.style.border = "solid 1px red";

        // Stop from procceding below the upload
        return;
      } else {
        fileDescriptionError.textContent = "";
        fileDescription.style.border = "solid 1px";
      }

      // Check if file upload is empty
      if (fileUploadBox.value.slice(12) === "") {
        fileUploadBoxError.textContent = "File must not be empty";
        fileUploadBox.style.border = "solid 1px red";

        // Stop from procceding below the upload
        return;
      } else {
        fileUploadBoxError.textContent = "";
        fileUploadBox.style.border = "0px";
      }
      
      // Do file upload
      document.querySelector("#form-upload").submit();
    });
  }

  _editFileUpload() {
    const editFile = document.querySelectorAll(".action_link-edit");

    // Attached an event listener forEach element
    editFile.forEach(el => {
      el.addEventListener("click", e => {
        // Just the default behavior of button
        e.preventDefault();

        // Render the file edit modal
        // Get the label and filename data attribute to update data
        sectionContainer.insertAdjacentHTML("beforebegin", editUploadModal([e.target.dataset.filelabel, e.target.dataset.file]));

        // Textbox in modal edit
        const fileEditTxtBox = document.querySelector("#file-edit-description");
        const fileErrorMsg = document.querySelector(".file_edit-error");

        // Save Button
        document.querySelector("#file-edit-btn").addEventListener("click", e => {
          // Check if textbox is empty
          if (fileEditTxtBox.value === "") {
            fileEditTxtBox.style.border = "solid 1px red";
            fileErrorMsg.textContent = "Description must not be empty";
          } else {
            /////////////////////
            // UPDATE in file upload


            // send the value
            axios.put(`https://${this.url}/docs-list/upload`, {
              file_Id: e.target.dataset.file,
              file_LabeL: fileEditTxtBox.value
            })
            .then(response => {
              // refresh page
              if(response.status === 200)
              location.reload()
            })
            .catch(err => {
              console.log(err);
            })

          }
        });

        // When user type in textbox remove error
        fileEditTxtBox.addEventListener("input", () => {
          fileEditTxtBox.style.border = "solid 1px";
          fileErrorMsg.textContent = "";
        });
      });
    });
  }

  _deleteFileUpload() {
    const deleteFile = document.querySelectorAll(".action_link-delete");

    // Attached an event listener to each element
    deleteFile.forEach(el => {
      el.addEventListener("click", e => {

        e.preventDefault();

        // Render modal confirmation
        sectionContainer.insertAdjacentHTML("beforebegin", modalPopUp(e.target.dataset.file, "Confirm File Deletion?", "/docs-list", "./images/question.PNG"));

        document.querySelector(".btn-delete-confirm").addEventListener("click", e => {
          const fileName = e.target.dataset.variable;

          ////////////////////////////
          // Delete in file Mongodb

          axios.delete(`https://${this.url}/docs-list/${fileName}`, 
          {
            file_Id: fileName
          })
          .then(response => {
            if(response.status === 200)
            location.reload();
          })
          .catch(err => console.log(err))

        });
      });
    });
  }
}

const app = new App();
