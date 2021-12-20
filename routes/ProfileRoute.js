const express = require('express')
const router = express.Router()

const ProfileController = require('../controllers/ProfileController')

router.post('/all', ProfileController.getAllProfile)
router.post('/savemp', ProfileController.saveMine)
router.post('/savepm', ProfileController.savePayment)
router.post('/changepass', ProfileController.changePassword)

module.exports = router;