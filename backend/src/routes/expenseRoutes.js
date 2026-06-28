const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const adminAuth = require('../middleware/adminAuthMiddleware');

// All expense routes require admin auth
router.use(adminAuth);

router.post('/', expenseController.createExpense);
router.get('/turf/:turfId', expenseController.getExpenses);
router.get('/turf/:turfId/pnl', expenseController.getProfitAndLoss);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
