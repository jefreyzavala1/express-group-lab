const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.get('/',userController.getUser)
router.post('/',userController.createUser)
router.post('/login',userController.loginUser)
router.put('/:id',userController.auth,userController.updateUser)
 router.delete('/:id',userController.auth,userController.deleteUser)
 router.post('/logout',userController.auth, userController.logoutUser)

module.exports =  router