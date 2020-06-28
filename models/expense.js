const mongoose = require('mongoose');
const expenseSchema = new mongoose.Schema({
    merchant: {
        type: String,
        required: [true, 'Please enter a title !'],
        match: [/^(\w\s?){4,}$/, 'Merchant should contains not less than 4 english letter, numbers and whitespase!']
    },
    createdDate: {
        type: Date,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        minlength: [10, 'Minimum length of description shpuld be 10'],
        maxlength: [50, 'It is allow maximum 50 characters!']
    } || 'No description',
    hasReport: {
        type: Boolean
    },
    users: { type: mongoose.Types.ObjectId, ref: 'User' }
})

module.exports = mongoose.model('Expense', expenseSchema);