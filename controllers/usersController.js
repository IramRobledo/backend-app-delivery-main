//Await: espera hasta que se ejecute la consulta para seguir con otra instrucción
const User = require('../models/user'); //Para acceder al modelo user
const Rol = require('../models/rol');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const storage = require('../utils/cloud_storage');

module.exports = { //se exporta todo el objeto
    async getAll(req, res, next) { // método asincrono
        try {
            const data = await User.getAll(); //en data se retornan todos los usuarios de la tabla
            console.log(`Usuarios: ${data}`);
            return res.status(201).json(data); //201 que ha tenido exito y se ha creado un nuevo recurso.
            // Se pasan los datos
        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Error al obtener los usuarios'
            }); // 501 el método no es soportado por el servidor
        }
    },

    async findById(req, res, next) { // método asincrono
        try {
            const id = req.params.id;

            const data = await User.findByUserId(id); //en data se retornan todos los usuarios de la tabla
            console.log(`Usuario: ${data}`);
            return res.status(201).json(data); //201 que ha tenido exito y se ha creado un nuevo recurso.
            // Se pasan los datos
        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Error al obtener el usuario por ID'
            }); // 501 el método no es soportado por el servidor
        }
    },

    async findDeliveryMen(req, res, next) {
        try {
            const data = await User.findDeliveryMen();
            console.log(`Repartidores: ${data}`);
            return res.status(201).json(data);
        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Error al obtener los repartidores'
            });
        }
    },

    async getAdminsNotificationTokens(req, res, next) {
        try {
            const data = await User.getAdminsNotificationTokens();
            let tokens = [];


            data.forEach(d => {
                tokens.push(d.notification_token);
            });

            console.log('Tokens de admin:', tokens);
            return res.status(201).json(tokens);
        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Error al obtener los repartidores'
            });
        }
    },

    async register(req, res, next) {
        try {
            const user = req.body; //se capturan los datos de un usuario que envía el cliente
            const data = await User.create(user);

            await Rol.create(data.id, 1); // rol 1(cliente) por defecto

            return res.status(201).json({ // respuesta para el usuario
                success: true,
                message: 'El registro se realizo correctamente, ahora inicia sesion',
                data: data.id, // se retorna el id
            });

        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Hubo un error con el registro del usuario',
                error: error
            });
        }
    },

    async registerWithImage(req, res, next) {
        try {

            const user = JSON.parse(req.body.user); //se capturan los datos de un usuario que envía el cliente
            console.log(`Datos enviados del usuario: ${user}`);

            const files = req.files;

            if (files.length > 0) {
                const pathImage = `image_${Date.now()}`; //Nombre del archivo que se va a almacenar
                const url = await storage(files[0], pathImage);

                if (url != undefined && url != null) {
                    user.image = url;
                }
            }

            const data = await User.create(user);

            await Rol.create(data.id, 1); // rol 1(cliente) por defecto

            return res.status(201).json({ // respuesta para el usuario
                success: true,
                message: 'El registro se realizo correctamente, ahora inicia sesion',
                data: data.id, // se retorna el id
            });

        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Hubo un error con el registro del usuario',
                error: error
            });
        }
    },

    async update(req, res, next) {
        try {

            const user = JSON.parse(req.body.user); //se capturan los datos de un usuario que envía el cliente
            console.log(`Datos enviados del usuario: ${JSON.stringify(user)}`);

            const files = req.files;

            if (files.length > 0) {
                const pathImage = `image_${Date.now()}`; //Nombre del archivo que se va a almacenar
                const url = await storage(files[0], pathImage);

                if (url != undefined && url != null) {
                    user.image = url;
                }
            }

            await User.update(user);

            return res.status(201).json({ // respuesta para el usuario
                success: true,
                message: 'Los datos del usuario se actualizaron correctamente'
            });

        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Hubo un error con la actualizacion de datos del usuario',
                error: error
            });
        }
    },

    async updateNotificationToken(req, res, next) {
        try {

            const body = req.body;
            console.log('Datos enviados del usuario: ', body);

            await User.updateNotificationToken(body.id, body.notification_token);

            return res.status(201).json({
                success: true,
                message: 'El token de notificaciones se ha almacenado correctamente'
            });

        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Hubo un error con la actualizacion de datos del usuario',
                error: error
            });
        }
    },

    async login(req, res, next) {
        try {
            const email = req.body.email;
            const password = req.body.password;

            const myUser = await User.findByEmail(email); //para saber si hay un usuario con ese email

            if (!myUser) { //si no existe un usuario con ese email
                return res.status(401).json({
                    success: false,
                    message: 'El email no fue encontrado'
                });
            }

            if (User.isPasswordMatched(password, myUser.password)) {
                const token = jwt.sign({
                    id: myUser.id,
                    email: myUser.email
                }, keys.secretOrKey, {
                    // expiresIn: (60*60*24) // 1 hora 
                });
                const data = { //información que se va a retornar cuando el usuario haga login
                    id: myUser.id,
                    name: myUser.name,
                    lastname: myUser.lastname,
                    email: myUser.email,
                    phone: myUser.phone,
                    image: myUser.image,
                    session_token: `JWT ${token}`,
                    roles: myUser.roles
                }

                await User.updateToken(myUser.id, `JWT ${token}`);

                console.log(`USUARIO ENVIADO ${data}`);

                return res.status(201).json({
                    success: true,
                    data: data,
                    message: 'El usuario ha sido autenticado'
                });
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'La contraseña es incorrecta'
                });
            }

        } catch (error) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Error al momento de hacer login',
                error: error
            });
        }
    },
    async logout(req, res, next) {

        try {
            const id = req.body.id;
            await User.updateToken(id, null);
            return res.status(201).json({ // respuesta para el usuario
                success: true,
                message: 'La sesion del usuario se ha cerrado correctamente'
            });
        } catch (e) {
            console.log(`Error: ${error}`);
            return res.status(501).json({
                success: false,
                message: 'Error al momento de cerrar sesion',
                error: error
            });
        }
    }



};