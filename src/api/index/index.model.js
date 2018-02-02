import { promisify } from 'util';
import { append, uniq } from 'ramda'
import { Database } from 'cradle'
import { Observable } from 'rx-lite';
/**
 * 
 * @param {Database} services_db 
 * @param {Database} clients_db
 */
export default function(services_db, clients_db){

    function get(db, id){
        return new Promise((resolve,reject)=>{
            db.get(id,function(err,res){
                if (err && res == undefined) {
                    return resolve([])
                } else if (err){
                    return reject(err)
                } else {
                    return resolve(res)
                }
            })
        })
    }

    function saveServices(services){
        return new Promise((resolve,reject)=>{
            services_db.save('services',services,function(err,res){
                 if (err){
                    return reject(err)
                } else {
                    return resolve(res)
                }
            })
        })
    }

    return {

        register : async (id) => {
            const {services} = await get(services_db, 'services')
            const c = append({id,clients:[]},services)
            const cleaned = uniq(c)
            return await saveServices({services : cleaned})
        },

        unregister : async (id) => {
            const {services} = await get(services_db, 'services')
            const cleaned = services.filter((elem) => elem.id !== id)
            return await saveServices({services : cleaned})
        },

        getClients : async () => {
            const {clients} = await get(clients_db, 'clients')
            return clients
        },

        getServices : async () => {
            const {services} = await get(services_db, 'services')
            return services
        },

        reorganize : async (clients, services) => {
            console.log('reorganize',clients, services)
            return {ok:'ok'}
        },

        subscribeChanges: () => {
            const feed = clients_db.changes({since:0});
            return Observable.create(observer => {
                feed.on('change',(change) => observer.onNext(change))
                feed.on('error',(err) => observer.onError(err))
            })
        }
        
    }
}