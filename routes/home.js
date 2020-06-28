const { Router } = require('express')
const expenseController = require('../controllers/expense')
const auth = require('../utils/auth')
const router = Router()

router.get('/', auth(false), expenseController.get.index)
router.get('/home', auth(false), expenseController.get.index)
router.all('/home/*', auth(false), expenseController.get.notFound)
// router.all('*', auth(false), courseController.get.notFound)

module.exports = router