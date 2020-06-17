import {ExtError} from './export.js';
export class InterfaceError extends ExtError {
    constructor (type='default',vars={}){
        if('entryPoints' in vars && Array.isArray( vars.entryPoints) && vars.entryPoints.length>0){
            vars.entryPoints='['+vars.entryPoints.join('][')+']';
        }
        super(type,InterfaceError,vars);
    }
}
Object.defineProperty(InterfaceError.prototype,'name',{
    enumerable:false,
    value:'InterfaceError'
});
InterfaceError.types=Object.assign({
    ErrorTypeCriteria:"The type of criteria should be comparable to the list ['property', 'react', 'method']",
    //ErrorTypeofValues:"In {CriteriaType}.values property, one of the values ​​does not match the declared type in {CriteriaType}.typeof property",
    ErrorType:"{$entryPoints} - {$message}",
    ErrorConflictCriteria:'ErrorConflictCriteria:{$message}',
    ConflictProperty:'{$message}',
    TypeMismatch:'TypeMismatch:{$message}',
    badArgumentMethod:'[$entryPoints]The argument "{$argument}"  does not match the expected type',
    badReturnMethod:'',

},ExtError.types);