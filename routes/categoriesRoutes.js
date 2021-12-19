const CategoriesController = require('../controllers/categoriesController');
const passport = require('passport');

module.exports = (app) => {

    app.get('/api/categories/getAll', passport.authenticate('jwt', {
        session: false
    }), CategoriesController.getAll);

    app.post('/api/categories/create', passport.authenticate('jwt', {
        session: false
    }), CategoriesController.create);
}