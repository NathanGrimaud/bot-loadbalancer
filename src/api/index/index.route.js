import {Observable} from 'rx-lite'

export default function(socket, handler){

    function event(eventName){
        return Observable.create(o => socket.on('PING',(...args)=>o.onNext(args)))
    }
    

    event('hey')
        .do()
        .subscribe()

}