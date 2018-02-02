import 'source-map-support'
import config from './config'
import Package from '../package.json'
import {Connection} from 'cradle'
import Api from './api/index'
import Socket from 'socket.io'
import {Server} from 'hapi'
import {isNil} from 'ramda'
import { Observable } from 'rx-lite';
const cradle = new Connection(config.couchdb.host,config.couchdb.port)
const services_db = cradle.database(config.couchdb.services_db)
const clients_db = cradle.database(config.couchdb.clients_db)

const dbs = [services_db,clients_db]
dbs.forEach(db => {
    db.exists(function(err,exists){
        if (err) return console.error(err)
        else if (exists) {
            console.log("Database already exists, continuing with it")
        }
        else {
            console.log("Database does not exists, creating it")
            db.create()
        }
    })
})

const server = new Server({
    port: config.api.port,
    host: config.api.host,
})

const io = Socket(server.listener)

// middleware
io.use((socket, next) => {
    let id = socket.handshake.query.id;
    if (!isNil(id)) {
      return next();
    }
    return next(new Error('authentication error, must provide the ID of the service'));
  });


io.on('connection',function(socket){
    // on connect, I have to register routes for this client
    const api = Api(socket, services_db, clients_db)
    const id = socket.handshake.query.id
    // I also need to write in db that a new client exists, and i have to recalculate the task allocation
    socket.on('disconnect',function(reason){
        api.model.unregister(id)
        .then(()=> console.log(`${id} have been disconnected, and removed from available services`))
        .catch(console.error)
    })
    api.model.register(id).then().catch(console.error)

    api.model.subscribeChanges()
        .flatMap((changes) => Observable.combineLatest(
            api.model.getClients(),
            api.model.getServices(),
        ))
        .flatMap(([clients, services])=> api.model.reorganize(clients, services))
        .subscribe()

})

server.start()
.then(() => console.log(`${Package.name} server started on port ${config.api.port}`))
.catch(console.error)




/*
error cases : 
    self crash
    db_updated
    connect
    disconnect
*/