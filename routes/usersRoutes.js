const UsersController = require('../controllers/usersController');
const passport = require('passport');

module.exports = (app, upload) => {

    // Obtener todos los usuarios
    app.get('/api/users/getAll', UsersController.getAll);

    // Obtener usuario en específico por id
    app.get('/api/users/findById/:id', passport.authenticate('jwt', {
        session: false
    }), UsersController.findById);

    // Encontrar los repartidores 
    app.get('/api/users/findDeliveryMen', passport.authenticate('jwt', {
        session: false
    }), UsersController.findDeliveryMen);
    app.get('/api/users/getAdminsNotificationTokens', passport.authenticate('jwt', {
        session: false
    }), UsersController.getAdminsNotificationTokens);

    // Crear un nuevo usuario
    app.post('/api/users/create', upload.array('image', 1), UsersController.registerWithImage);
    // Inicar sesión
    app.post('/api/users/login', UsersController.login);
    // Cerrar sesión
    app.post('/api/users/logout', UsersController.logout);

    // Actualizar usuario
    app.put('/api/users/update', passport.authenticate('jwt', {
        session: false
    }), upload.array('image', 1), UsersController.update)
    // Actualizar token de notificación
    app.put('/api/users/updateNotificationToken', UsersController.updateNotificationToken)
}