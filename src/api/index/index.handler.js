import { setTimeout } from "timers";

export default function(model){
    const handler = {
        register: async (request, h) => {
            setTimeout(()=>{
                h.push('HEY')
            },1000)
            return '{ok:true}'
        }
    }
    return handler
}