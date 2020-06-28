const { userModel, tokenBlacklistModel, courseModel, expenseModel } = require('../models')
const { createToken, verifyToken } = require('../utils/jwt');
const { use } = require('../routes/user');

function signin(req, res) {
    const token = createToken({ userID: req.user.id });
    res.cookie('auth-cookie', token).redirect('/');
}

module.exports = {
    get: {
        login: (req, res) => {
            const user = req.user;
            res.render('login.hbs')
        },
        register: (req, res) => {
            res.render('register')
        },
        logout: (req, res, next) => {
            const token = req.token || req.cookies['auth-cookie'];
            if (!token) {
                res.redirect('/');
                return;
            }
            tokenBlacklistModel.create({ token })
                .then(() => {
                    res.clearCookie('auth-cookie');
                    res.status(200).redirect('/');
                })
                .catch(err => next(err))
        },
        accountInfo: (req, res, next) => {
            const user = req.user;
            Promise.all([
                userModel.findById(user.id),
                expenseModel.find({ users: user.id })
            ])
            .then(([user, expenses]) => {
                
                const totalExpenses = expenses.reduce((a, b) => a + b.total, 0);
                const grandTotal = user.amount - totalExpenses;
                res.render('account-info', { title: 'Account info', grandTotal, totalExpenses, user })
                
                })
                .catch(err => console.log(err))
        }
    },
    post: {
        login: (req, res, next) => {
            const { username, password } = req.body;
            userModel.findOne({ username })
                .then(userData => {
                    if (!userData) {
                        res.render('login', { errors: { username: `This user ${username} not exist!` } });
                        return;
                    }
                    const match = Promise.all([userData, userData.matchPassword(password)])   //promise in promise - mot nested
                        .then(([userData, match]) => {
                            if (!match) {
                                res.render('login', { errors: { password: 'Password mismatch!' } });
                                return;
                            }
                            req.user = userData;
                            // const token = createToken({ userID: user.id });
                            // res.cookie('auth-cookie', token).redirect('/');
                            signin(req, res);
                            return;
                        })
                        .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
        },
        register: (req, res, next) => {
            let { username, password, repeatPassword, amount } = req.body;
            if (!amount) {
                amount = 0
            }

            if (password !== repeatPassword) {
                res.render('register.hbs', { errors: { password: 'Password and repeatpassword don\'t match' } })
                // Promise.reject('Password and r don\'t match')
                return;
            }
            userModel.create({ username, password, amount, expenses: [] })
                .then((user) => {
                    req.user = user;
                    signin(req, res);
                    return;
                })
                .catch(err => {
                    if (err.code = 11000 && err.name === 'MongoError') {
                        res.render('register', { errors: { username: 'User already exist' } })
                        return;
                    }
                    if (err.name === 'ValidationError') {
                        res.render('register.hbs', { errors: err.errors });
                        console.log(err)
                        return;
                    }
                    next(err);
                })
        },
        refill: (req, res, next) => {
            const user = req.user;
            const { newAmount } = req.body;
            userModel.findByIdAndUpdate(user.id, { $inc: { amount: +newAmount } })
                .then((updated) => res.redirect('/'))
                .catch(err => console.log(err))
        }
    }
}