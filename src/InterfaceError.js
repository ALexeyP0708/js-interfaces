export class InterfaceError extends Error {
    constructor (type='default',vars={}){
        if('entryPoints' in vars && Array.isArray( vars.entryPoints) && vars.entryPoints.length>0){
            vars.entryPoints='['+vars.entryPoints.join('][')+']';
        }
        for(let v in  vars){
            let value=vars[v];
            if(Array.isArray(value)){
                for(let k in value){
                    let tv=typeof value[k];
                    if(value[k] instanceof InterfaceError){
                        value[k]=value[k].message;
                    } else if(tv!=='string'){
                        value[k]=`Error [object ${Object.getPrototypeOf(value[k]).constructor.name}]`;
                    }
                    value[k]=value[k].replace(/[\n]/ig,"\n   ");
                }
                vars[v]="\n   "+value.join("\n   ");
            }
        }
        let buf_type=type;
        if(typeof buf_type!=='string' || !(buf_type in InterfaceError.types)){
            buf_type='default';
        }
       //let msg=InterfaceError.types[buf_type]??'';
        let msg=InterfaceError.types[buf_type]!==undefined?InterfaceError.types[buf_type]:'';
        if(!vars.hasOwnProperty('type')){
            vars.type=type;
        }
        let pattern_vars=Object.keys(vars).join('|');
        if(pattern_vars!==''){
            //let pattern =new RegExp('\\${('+pattern_vars+')}','ig');
            let pattern =new RegExp('{\\$([\\w]+)}','ig');
            msg=msg.replace(pattern,(match,p1)=>{
                if(p1 in vars){
                    return vars[p1];
                }
                return '';
            });
        }
        super(msg);
        Object.defineProperty(this,'type',{
           value:type
        });
    }
}
Object.defineProperty(InterfaceError.prototype,'name',{
    enumerable:false,
    value:'InterfaceError'
});
InterfaceError.types={
    default:"{$type}: {$entryPoints} - {$message}{$errors}",
    ErrorType:"{$type}: {$entryPoints} - {$message}",
    BadCriteria:"{$type}: {$entryPoints} - Criteria must meet [object {$className}].",
    //BadIncludesOrExcludes:"{$type}: {$entryPoints} - {$errors}",
    InitTypes:"{$type}: {$entryPoints} - Invalid parameter passed to {$className}.types.",
    //InitTypes_badType:"{$type}: {$entryPoints} - {$errors}",
    //InitIncludes:"",
    //InitExcludes:"",
    //Validate:"",
    ValidateType:`{$type}: {$entryPoints} - Expected type of "{$expectedTypes}"  but defined by "{$definedType}".`,
    ValidateInValues:"{$type}: {$entryPoints} - \"{$value}\" does not match the values ​​in stack",
    ValidateInIncludes:"{$type}: {$entryPoints} - \"{$value}\" is not present in 'includes' stack",
    ValidateInExcludes:"{$type}: {$entryPoints} - \"{$value}\" is not present in 'excludes' stack",
    Compare_badValues:"{$type}: {$entryPoints} - Criteria must be of values in \"{$name}\"",
    //Compare_badType:"",
    //Compare_badParams:"",

    InitArguments:"{$type}: {$entryPoints} - Invalid parameter passed to {$className}.arguments. Must be of type Array.",
    InitReturn:"{$type}: {$entryPoints} - Invalid parameter passed to {$class_name}.return. Must be of type Object.",
    //ValidateArguments:"",
    //CompareMethod:"",
    Compare_badArgument:"{$type}: {$entryPoints} - Argument undeclared",
    ValidateReact:"{$type}: {$entryPoints} - The {$react_type} interface is not defined, but there is a call to the {$react_type}.",
    ValidateReactDeclared:"{$type}: {$entryPoints} - \"{$react_type}\" {$not} must be declared",
    ValidatePropertyDeclared:"{$type}: {$entryPoints} - The property must be declared.",
    ValidateMethodDeclared:"{$type}: {$entryPoints} - The property must be Function.",
    //CompareReact_badParams:"",
    //Validate_BadProps:"",

    //----
    //ErrorTypeCriteria:"The type of criteria should be comparable to the list ['property', 'react', 'method']",
    //ErrorTypeofValues:"In {CriteriaType}.values property, one of the values ​​does not match the declared type in {CriteriaType}.typeof property",

    //ErrorConflictCriteria:'ErrorConflictCriteria:{$message}',
    //ConflictProperty:'{$message}',
    //TypeMismatch:'TypeMismatch:{$message}',
    //badArgumentMethod:'[$entryPoints]The argument "{$argument}"  does not match the expected type',
    //badReturnMethod:'',

};