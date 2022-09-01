/////////////////////////////////////////////////////
// Alert Popup or Modal
export const alertPopUp = (popUpTitle, popUpBody) => {
  return `
            <div class="error_message">
              <div class="error_modal">
                <div class="error_header">${popUpTitle}</div>
                <div class="error_body">
                    <h1 class="error_warning-icon">⚠️</h1>
                    ${popUpBody}
                </div>
              </div>
            </div>

    `;
};

export const successPopUp = (popUpTitle, popUpBody) => {
  return `
          <div class="success_message">
            <div class="success_modal">
              <div class="success_header">${popUpTitle}</div>
              <div class="success_body">
                  <h1 class="success_warning-icon">✔️</h1>
                  ${popUpBody}
              </div>
            </div>
          </div>
    `;
};

export const popUp = popUpTitle => {
  return `
           <div class="loading_message">
            <div class="loading_modal">
              <div class="loading_header popup-primary">${popUpTitle}</div>
              <div class="loading_body">
                  <div class="loading_body-icon"></div><br>
                  Loading please Wait
              </div>
            </div>
          </div>
    `;
};

export const modalPopUp = (userData, modalTitle, cancelBtn, imgPath) => {
  return `
       <div class="modal_container">
  	  	<div class="modal">
  	  		<div class="modal_header"><span>${modalTitle}</span> <button>X</button></div>
  	  		<div class="modal_body">
  	  				<img src="${imgPath}" class="modal_img"><h4>Are you sure?</h4>
  	  		</div>
  	  		<div class="modal_footer">
  	  			<form>
  	  				<button type="button" class="btn-confirm btn-delete-confirm" data-variable="${userData}">Ok</button>
  	  				<a href="${cancelBtn}"><button type="button" class="btn-confirm btn-confirm-close">Cancel</button></a>
  	  			</form>
  	  		</div>
  	  	</div>
  	  </div>
   `;
};

/////////////////////////////////////////////////////
// File Upload

export const fileUploadModal = () => {
  return `
       <div class="modal_container">
        <div class="modal upload_file-modal">
          <div class="modal_header"><span class="fw-bold">Upload</span> <button class="fw-bold border2">X</button></div>
          <div class="modal_body">
              <div class="file_container" >
                <div class="file_form">
                  <span class="fw-bold fs4 file_description-title">File Description</span>
                  <span class="w100 padding_file-form flex-col">
                    <span class="file_desc-error fs5 text-red"></span>
                    <input type="text" name="file_label" form="form-upload" id="file-upload-description" class="form-input" placeholder="Sample name">
                  </span>
                </div>
                <div class="file_form mt2">
                  <span class="fw-bold fs5 text-center file_upload-title">File Upload</span>
                  <span class="flex-col">
                    <span class="file_upload-error fs5 text-red"></span>
                    <input type="file" name="file_upload" form="form-upload" id="file-upload-box" class="choose_file-btn">
                  </span>
                </div>
              </div>
          </div>
          <div class="modal_footer file_modal-footer">
            <form action="/docs-list/upload" method="post" enctype="multipart/form-data" id="form-upload" class="footer_form-submit">
              <input type="submit" id="btn-file-upload" class="btn-secondary upload_now-btn" value="Upload">
              <a href="/docs-list"><button class="btn-secondary upload_cancel-btn" type="button">Cancel</button></a>
            </form>
          </div>
        </div>
      </div>
  `;
};

export const editUploadModal = file => {
  return `
    <div class="modal_container">
			<div class="modal file_modal">
				<div class="modal_header border2"><span class="fw-bold">Edit</span> <button class="fw-bold border2">X</button></div>
				<div class="modal_body flex flex-left pl1">
						<div class="file_container mt2 pl2">
							<div class="file_form">
								<span class="fw-bold fs4" style="width: 200px;">File Description</span>
								<span class="w100 flex flex-col" style="padding-right: 50px;">
                  <span class="file_edit-error fs5 text-red"></span>
                  <input type="text" name="file_label" id="file-edit-description" class="form-input w100" value="${file[0]}">
                </span>
							</div>
							<div class="file_form mt2">
								<form style="display: flex; gap: 30px; margin-left: 138px;">
									<button class="btn-secondary" id="file-edit-btn" type="button" style="font-weight: bold; width: 110px; background: #b3b4b5;" data-file="${file[1]}">Save</button>
                  <a href="/docs-list"><button class="btn-secondary"  type="button" style="font-weight: bold; width: 110px; background: #b3b4b5">Cancel</button></a>
                </form>
							</div>
						</div>
				</div>
			</div>
		</div>
  `;
};

/////////////////////////////////////////
// Register Success
export const successMessage = () => {
  return `
    <section>
			<h1>Registration Successful</h1>
			
			<h4 class="fw-light">Thank you for your registration</h5>
			<a href="/" class="mt3 text-blue">Click to return to home page</a>
		</section>
  `;
};
