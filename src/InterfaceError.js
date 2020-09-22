/**
 * @module @alexeyp0708/interface-manager
 */
let helpLink='http://sites/NodeJS/Interfaces/docs/module-@alexeyp0708_interface-manager.InterfaceError.types.html#.';
/**
 * 
 */

export class InterfaceError extends Error {
    constructor (type='default',vars={}){
        let errors=vars.errors??[];
        if(vars.helpLink===undefined){
            vars.helpLink=`${helpLink}${type}`;
        }
        if(vars.type===undefined){
            vars.type=type;
        }
        let buildVars=InterfaceError.buildVars(vars);
        let msg=InterfaceError.buildMessage(type,buildVars);
        super(msg);
        Object.defineProperties(this,{
            type:{
                value:type
            },
            errors:{
                value:errors
            },
            vars:{
                value:vars
            }
        });
        this.vars.buildedMessage=msg;
        msg=this.message;
        this.message='';
        this.vars.stack=this.stack;
        this.message=msg;
    }

    /**
     * Вычисляет патерн по типу ошибки, и парсит его заменяя обозначение переменных на сообщения переменных.
     * @param type
     * @param variables
     * @returns {string}
     */
    static buildMessage(type,vars={}){
        vars=Object.assign({},vars);

        if(typeof type!=='string' || !(InterfaceError.types[type]!==undefined)){
            type='default';
        }
        let msg=InterfaceError.types[type]!==undefined?InterfaceError.types[type]:'';
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
        return msg;
    }
    /*static buildErrorsMessage(errors=[]){
        
        let tab='    ';
        let getTabs=(count=0)=>{
            let result='';
            for(let k=0; k<=count; k++){
                result+=tab;
            }
            return result;
        };
        let tabCount=0;
        let result=[];
        let levels=[];
        for(let key=0; key<errors.length;key++){
            let error=errors[key];
            levels.push(key);
            tabCount++;
            result.push(genTabs(tabCount)+error.message);
            let check=false;
            if(error instanceof InterfaceError){
                let vars=error.vars;
                let type =error.type;
                InterfaceError.bu
                if(error.errors instanceof Array){
                    if(error.errors.length>0){
                        error=error.errors;
                        check=true;
                    }
                }
            } else{
                result.push(genTabs(tabCount)+error.message);
            }
            if(error instanceof Array){
                errors.splice(key + 1, 0, ...error.errors);
                for(let z=0;z<levels.length;z++){
                    levels[z]=levels[z]+error.errors.length;
                }
                continue;
            }
            while(levels[levels.length-1]===key){
                tabCount--;
                levels.splice(levels.length-1,1);
            }
        }
        return result.join("\n");
    }*/

    static buildErrorsMessage(errors){
        let result=[];
        for(let k=0; k<errors.length; k++){
            result.push(errors[k]);
            let tv=typeof errors[k];
            if(errors[k] instanceof Error){
                result[k]=errors[k].message;
            }
            result[k]=result[k].replace(/[\n]/ig,"\n   ");
        }
        return "\n   "+result.join("\n   ");
    }
    /**
     * Собирает переданные переменные. Если переменная масив строк или ошибок, то преобразует в читаемую строку.
     * Также соблюдает табуляцию пр переходе строк.
     * @param {object} vars
     */
    static buildVars(vars){
        // переписать под полную сборку  а не на результиирующем сообщении ошибки.
        let result=Object.assign({},vars);
        if('entryPoints' in result && Array.isArray( result.entryPoints) && result.entryPoints.length>0){
            result.entryPoints='['+result.entryPoints.join('][')+']';
        }
        if(result.errors instanceof Array){
            result.errors=InterfaceError.buildErrorsMessage(result.errors);
        }
        return result;
    }

    /**
     * Создает собственный выводимый формат и выбрасывает исключение.
     *
     */
    throw(){
        if(!InterfaceError.isNode()){
            // for browsers
            this.throwFront('error');
        }  else {
            this.throwBack();

        }
    }
    throwFront(typeMsg='warn'){
        let errors=Object.assign([],this.errors);
        let levels=[];
        let self=this;
        /*let link=(type)=>{ return {
            get help(){
                let link=`${helpLink}#.${type}`;
                window.open(link);
                return link;
            }
        }};*/
        let buildVars=InterfaceError.buildVars(this.vars);
        let msg=InterfaceError.buildMessage('consoleGroup',buildVars);
        console.group(`%c ${msg}`,'background:#FFF0F0;color:#FF3434;');

        msg=InterfaceError.buildMessage('consoleMessage',buildVars);
        console[typeMsg](msg);
        for(let key=0; key<errors.length; key++){
            let error=errors[key];
            let buildVars=InterfaceError.buildVars(error.vars);
            let msg=InterfaceError.buildMessage('consoleGroup',buildVars);
            console.groupCollapsed(`%c ${msg}`,'background:#FFF0F0;color:#FF3434;');
            msg=InterfaceError.buildMessage('consoleMessage',buildVars);
            console[typeMsg](msg);
            levels.push(key);// [~0+2,1~,2~,3+2~,4~,5~]
            if(error instanceof InterfaceError) {
                if (error.errors instanceof Array) {
                    if (error.errors.length > 0) {
                        errors.splice(key + 1, 0, ...error.errors);
                        for(let z=0;z<levels.length;z++){
                            levels[z]=levels[z]+error.errors.length;
                        }
                        continue;
                    }
                }
            }
            while(levels[levels.length-1]===key){
                console.groupEnd();
                levels.splice(levels.length-1,1);
            }
        }
        console.groupEnd();
        this.message='See ⇑⇑⇑';
        this.stack='See ⇑⇑⇑';
        throw this;
    }
    throwBack(){
        throw this;
    }
    static isNode(){
        let isNode=false;
        try{
            isNode=Boolean(process);
            if(process.release!=='node' && process.node===undefined){
                isNode=false;
            }
        } catch (e) {

        }
        return isNode;
    }
}
Object.defineProperty(InterfaceError.prototype,'name',{
    enumerable:false,
    value:'InterfaceError'
});
/**
 * @namespace
 */
InterfaceError.types={
    /** Template for errors when no error is defined */
    default:`{$type}: {$entryPoints} - {$message}{$errors}`,

    /**
     * An error is thrown when the criteria for an invalid form are passed.  
     * The criteria must match (repeat) [object CriteriaPropertyType] or [object CriteriaMethodType] or [object CriteriaReactType].  
     * The error message will clarify such data
     */
    BadCriteria:"{$type}: {$entryPoints} - Criteria must meet [object {$className}].",
    //BadIncludesOrExcludes:"{$type}: {$entryPoints} - {$errors}",
    InitTypes:"{$type}: {$entryPoints} - Invalid parameter passed to {$className}.types.",
    //InitTypes_badType:"{$type}: {$entryPoints} - {$errors}",
    //InitIncludes:"",
    //InitExcludes:"",
    //Validate:"",
    ValidateType:`{$type}: {$entryPoints} - Expected type of "{$expectedTypes}"  but defined by "{$definedType}".{$errors}`,
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
    Init_BadArgumentsOrReturn:'',
    ImplementInterfaceError:undefined

};
