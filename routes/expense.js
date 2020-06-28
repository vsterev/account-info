const { Router } = require('express')
const expenseController = require('../controllers/expense')
const userController = require('../controllers/user')
const auth = require('../utils/auth')
const router = Router()

router.get('/create', auth(), expenseController.get.create)
router.post('/create', auth(), expenseController.post.create)

router.get('/details/:id', auth(), expenseController.get.details)

router.get('/delete/:id', auth(), expenseController.get.delete)
router.all('*', auth(false), expenseController.get.notFound)

module.exports = router