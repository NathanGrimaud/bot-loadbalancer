import env from 'common-env'
export default env().getOrElseAll({
    api:{
        host: 'localhost',
        port: '3001'
    },
    couchdb: {
        host : 'http://127.0.0.1',
        port : '5984',
        clients_db: 'clients_db',
        services_db: 'services_db'
    },  
})