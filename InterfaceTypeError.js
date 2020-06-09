import {ExtError} from "./export.js";
export class InterfaceTypeError extends ExtError {
    constructor (type='default',vars={}){
        super(type,InterfaceTypeError,vars);
    }
}
Object.defineProperty(InterfaceTypeError.prototype,'name',{
    enumerable:false,
    value:'InterfaceTypeError'
});
InterfaceTypeError.types=Object.assign({

},ExtError.types);