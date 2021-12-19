//Configurar la conexión con la base de datos

const promise = require('bluebird');
const options = { //objeto
    promiseLib: promise,
    query: (e) => {} //retornar una función
}

const pgp = require('pg-promise')(options);
const types = pgp.pg.types;
types.setTypeParser(1114, function (stringValue) {
    return stringValue;
});

const databaseConfig = {
    'host': '127.0.0.1', //el mismo host definido en pgAdmin
    'port': 5432,
    'database': 'delivery_db2',
    'user': 'postgres',
    'password': 'Cornerstone-99' //el del servidor de pgAdmin
};

const db = pgp(databaseConfig);

module.exports = db; //para usar la variable en diferentes archivos