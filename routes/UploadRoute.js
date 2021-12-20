const express = require('express')
const router = express.Router()

const UploadController = require('../controllers/UploadController')

router.post('/files', UploadController.getAllFiles)
router.post('/add', UploadController.addFile)
router.post('/remove', UploadController.removeFile)

module.exports = router