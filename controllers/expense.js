const { expenseModel, userModel } = require('../models')

module.exports = {
    get: {
        index: (req, res, next) => {
            const user = req.user;
            if (!user) {
                res.render('indexNotAuth', { title: 'Home Page', user })
                return;
            }
            expenseModel.find({ users: user.id })
                .then(expensesN => {
                    const expenses = expensesN.map(r => {
                        r.createdDate.toISOString().substring(0, 15);
                        return r;
                    })
                    res.render('indexAuth', { title: 'Home Page', user, expenses })
                })
                .catch(err => console.log(err))

            // expenseModel.find()
            //     .then(courses => {
            //         if (!user) {
            //             let sorted = [...courses].sort((a, b) => { return b.users.length - a.users.length })
            //             const topCourses = sorted.slice(0, 3);
            //             res.render('indexNotAuth.hbs', { title: 'Course | Home page', courses: topCourses, user });
            //             return;
            //         }
            //         // let date = courses.createdAt.toString().slice(0,21) //da se naprawvi datata
            //         const sorted = [...courses].sort((a, b) => {
            //             if (b.createdAt === a.createdAt) {
            //                 return a.title.localeCompare(b.title)
            //             }
            //             return b.createdAt - a.createdAt
            //         })
            //         res.render('indexAuth.hbs', { title: 'Course | Home page', courses: sorted, user });
            //         return
            //     })
            //     .catch(err => console.log(err))
        },
        create: (req, res, next) => {
            const user = req.user;
            res.render('create.hbs', { title: 'Create expense', user })
        },
        details: (req, res, next) => {
            const id = req.params.id;
            const user = req.user || 'undefined';
            expenseModel.findById(id)
                .then(expense => {
                    res.render('details.hbs', { title: 'course details', expense, user })
                })
                .catch(err => res.render('404.hbs', { msg: err }))
        },
        delete: (req, res, next) => {
            const user = req.user;
            expenseModel.findByIdAndDelete(req.params.id)
                .then(expense =>
                    Promise.all([
                        expense,
                        userModel.findByIdAndUpdate(user.id, { $pull: { expenses: expense.id } })
                    ])
                )
                .then(([expense, userD]) => {
                    res.redirect('/')
                })
                .catch(err => next(err))
        },
        notFound: (req, res, next) => {
            const user = req.user;
            res.render('404.hbs', { title: 'course | Not found page', user })
        }
    },
    post: {
        create: (req, res, next) => {
            const { merchant = null, total = 0, category = null, description, hasReport } = req.body;
            const user = req.user;

            expenseModel.create({ merchant, total, category, description, hasReport: hasReport === 'on', users: user.id, createdDate: Date.now() })
                // userModel.findByIdAndUpdate(user.id, { $inc: { amount: -total } }, { runValidators: true })
                .then(expense => {
                    userModel.findByIdAndUpdate(user.id, { $push: { expenses: expense.id } }, { runValidators: true })
                        .then(() => res.redirect('/'))
                        .catch(error => console.log(error))
                })
                .catch(err => {
                    if (err.name == 'ValidationError') {
                        res.render('create.hbs', { title: 'Create course', user, errors: err.errors })
                        return;
                    }
                    next(err);
                    console.log(err)
                })
        }
    }
}

