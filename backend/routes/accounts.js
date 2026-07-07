const express = require('express');
const { protect } = require('../middlewares/auth');
const { createAccount, getAccounts, toggleStatus, deleteAccount } = require('../controllers/accountController');

const router = express.Router();

// All account routes require authentication
router.use(protect);

router.post('/', createAccount);
router.get('/', getAccounts);
router.patch('/:id/status', toggleStatus);
router.delete('/:id', deleteAccount);

module.exports = router;
