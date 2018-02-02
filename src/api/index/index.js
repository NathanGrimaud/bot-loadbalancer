import Handler from './index.handler'
import Route from './index.route'
import Model from './index.model'
import Worker from './index.worker'
export default function(socket, services_db,clients_db ){
    const model = Model(services_db,clients_db)
    const handler = Handler(model)
    const route = Route(socket,handler)
    return { handler, model, route }
}