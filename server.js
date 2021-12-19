// Middleware: Son esos métodos/funciones/operaciones que se denominan ENTRE el procesamiento de la Solicitud y
// el envío de la Respuesta en su método de aplicación.
//Cors: Es un mecanismo para permitir o restringir los recursos solicitados en un servidor web dependiendo de
// dónde se inició la solicitud HTTP.

const express = require('express'); // Se requiere el modulo express
const app = express(); // Se ejecuta express para inicializar la aplicación
const http = require('http');
const server = http.createServer(app);
const logger = require('morgan'); // Sirve para debuggear errores
const cors = require('cors');
const multer = require('multer');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const passport = require('passport');
const io = require('socket.io')(server);
const mercadopago = require('mercadopago');

// Configuración para mercadopago
mercadopago.configure({
    access_token: 'TEST-5603669237883404-121103-40bdc7236cc3a1495b2cfc5ec98e4c64-261550727'
});

// Sockets
const orderDeliverySocket = require('./sockets/orders_delivery_socket');

// Inicializar firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
})

const upload = multer({
    storage: multer.memoryStorage()
})


// Aqui se hará la instancia de las rutas
const users = require('./routes/usersRoutes');
const categories = require('./routes/categoriesRoutes');
const products = require('./routes/productsRoutes');
const address = require('./routes/addressRoutes');
const orders = require('./routes/ordersRoutes');
const mercadoPagoRoutes = require('./routes/mercadoPagoRoutes');

const port = process.env.PORT || 3000; // Definición del puerto

app.use(logger('dev')); // Usar el logger para desarrollador para debuggear errores
app.use(express.json()); // Para parsear las respuestas recibidas en .json
app.use(express.urlencoded({ // Es un método incorporado en express para reconocer el objeto de solicitud entrante como cadenas o matrices. Este método se llama como middleware
    extended: true
}));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

app.disable('x-powered-by'); // Seguridad

app.set('port', port);

// Llamar a los sockets
orderDeliverySocket(io);


//Llamando a las rutas
users(app, upload);
categories(app);
address(app);
orders(app);
products(app, upload);
mercadoPagoRoutes(app);

server.listen(3000, '192.168.0.15' || 'localhost', function () {
    console.log('Aplicacion de NodeJS ' + port + ' Iniciada...') //prueba
});


//MANEJO DE ERRORES
app.use((err, req, res, next) => {
    console.log(err);
    res.status(err.status || 500).send(err.stack);
});

module.exports = {
    app: app,
    server: server
}