const docsController = require(".././controller/docs-list-controller");
const express = require("express");

const router = express.Router();

router.route("/")
.get(docsController.showPage)

router.route('/upload')
.post(docsController.uploadFile)
.put(docsController.editFile)

router.route("/:file")
.delete(docsController.deleteFile)

router.route("/share/:file")
.get(docsController.showShareFile)
.put(docsController.shareFileToUser)
.delete(docsController.removeShareFile);

router.route('/myfile/:file')
.get(docsController.downloadMyFile);

router.route("/sharedfile/:file")
.get(docsController.downloadSharedFile);

module.exports = router;
