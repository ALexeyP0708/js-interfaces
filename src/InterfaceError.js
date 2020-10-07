/**
 * @module @alexeyp0708/interface-manager
 */

import {buffer, InterfaceBuilder, InterfaceData, SilentConsole} from './export.js';
/**
 * 
 */
let console=buffer.console;
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
            if(errors[k] instanceof InterfaceError){
                result[k]=errors[k].vars.buildedMessage;
            } else 
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
    throw(overwriteErrorsInConsole=false){
        if(InterfaceError.consoleNotification && !InterfaceError.isNode()){

            // for browsers
            
            let constructor=Object.getPrototypeOf(this).constructor;
            let sc=constructor.sc;
            if(overwriteErrorsInConsole){
                sc.clearStack();
            }
            if(!sc.isDenied()){
                sc.denyToSpeak(true);
            } 
            this.throwFront('error');
        }  else {
            this.throwBack();
        }
    }
    renderErrors(){
        if(InterfaceError.consoleNotification && !InterfaceError.isNode()){
            let constructor=Object.getPrototypeOf(this).constructor;
            let sc=constructor.sc;
            sc.allowToSpeak(true);
            //this.message='See ⇑⇑⇑';
            //this.stack='See ⇑⇑⇑';
        }
    }
    clearErrors(){
        if(InterfaceError.consoleNotification && !InterfaceError.isNode()){
            let constructor=Object.getPrototypeOf(this).constructor;
            let sc=constructor.sc;
            sc.clearStack();
        }
    }
    throwFront(typeMsg='warn'){
        let errors=Object.assign([],this.errors);
        let levels=[];
        let buildVars=InterfaceError.buildVars(this.vars);
        let msg=InterfaceError.buildMessage('consoleGroup',buildVars);
        console.groupCollapsed(`%c ${msg}`,'background:#FFF0F0;color:#FF3434;');
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
        throw this;
    }
    throwBack(){
        throw this;
    }
    static isNode(){
        let isNode=false;
        try{
            isNode=Boolean(process);
            if(process.versions.node===undefined){
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

let helpLink='http://sites/NodeJS/Interfaces/docs/module-@alexeyp0708_interface-manager.InterfaceError.types.html#.';
/**
 * @namespace
 */
InterfaceError.types={

    /**
     *  Template for the header of grouped error messages
     */
    consoleGroup:"{$type}:",

    /**
     * Console error message template.
     */
    consoleMessage:`help => {$helpLink}\n\n{$buildedMessage}\n------\nStack\n------\n{$stack}`,
    
    /** Template for errors when no error is defined */
    default:`{$type}: {$entryPoints} - {$message}{$errors}`,

    /**
     * An error is thrown in the following cases:  
     * -  when forming an interface member, if the object for the criteria does not match the criteria template
     * ([template  .CriteriaPropertyType], [template .CriteriaMethodType], [template .CriteriaReactType])  
     * - Criteria are not comparable when comparing interfaces  
     */
    BadCriteria:"{$type}: {$entryPoints} - Criteria must meet [object {$className}].",

    /**
     * An error is thrown in the following cases:  
     * - when forming an interface member, if the criteria "includes" or "excludes" are incorrect  
     *   
     * Accompanied by errors: {@link ...InitIncludes},  {@link ...InitExcludes}
     */
    Init_BadIncludesOrExcludes:undefined, //"{$type}: {$entryPoints} - {$errors}"
    
    /**
     * 
     * An error is thrown in the following cases:  
     * - when forming an interface member, if the passed types for the criteria are not correct.  
     *  
     * Groups errors of all invalid types   
     *   
     * Accompanied by errors: {@link ...InitTypes_badType}    
     *  
     */
    InitTypes:undefined,
    
    /**
     * An error is thrown in the following cases:  
     * -when forming an interface member, if an inappropriate type is passed.  
     */
    InitTypes_badType:"{$type}: {$entryPoints} - Invalid parameter passed to {$className}.types=[{$dataType}].",
    
    /**
     * An error is thrown in the following cases:  
     *  - when forming an interface member,  if the passed "includes" values ​​for the criteria are not correct.  
     *  
     *  Groups errors of all invalid "includes" values.
     *  
     *  Accompanied by errors: {@link ...ValidateType}
     */
    InitIncludes:undefined,
    
    /**
     * An error is thrown in the following cases:  
     *  - when forming an interface member,  if the passed "excludes" values ​​for the criteria are not correct.  
     * 
     * Groups errors of all invalid "excludes" values.
     *  
     * Accompanied by errors:  {@link ...ValidateType}
     */
    InitExcludes:undefined,

    /**
     * An error is thrown in the following cases:
     *  - when forming an interface member (method), if the criteria for arguments and/or return values ​​are not correct  
     *    
     *  Groups errors.  
     *   
     * Accompanied by errors: {@link ...BadCriteria} {@link ...InitTypes} {@link ...Init_BadIncludesOrExcludes}
     */
    Init_BadArgumentsOrReturn:undefined,
    
    /**
     * An error is thrown in the following cases:
     * - When checking class members for an interface (matching criteria),
     * if the member value (property, method arguments, method return values,
     * reactive properties) does not meet the criteria
     * Groups errors the criteria
     * 
     * Accompanied by errors: {@link ...ValidateInIncludes}, {@link ...validateInExcludes}
     */
    Validate:undefined,
    
    /**
     * An error is thrown in the following cases:  
     * -  When validate class members according to interface criteria , If the value does not match the types from the interface criteria   
     * 
     * Accompanied by errors:  {@link ...Validate_BadMirrorProperties} (if one of the types is extends [class  .MirrorInterface])  
     */
    ValidateType:`{$type}: {$entryPoints} - Expected type of "{$expectedTypes}"  but defined by "{$definedType}".{$errors}`,
    
    /**
     * An error is thrown in the following cases:  
     * -When validate class members according to interface criteria , if the value does not match the value on the "includes" stack 
     */

    ValidateInIncludes:"{$type}: {$entryPoints} - \"{$value}\" is not present in 'includes' stack",

    /**
     * An error is thrown in the following cases:
     *  -When validate class members according to interface criteria , if the value matches one of the values ​​on the "excludes" stack
     */
    ValidateInExcludes:"{$type}: {$entryPoints} - \"{$value}\" is present in 'excludes' stack",


    /**
     * An error is thrown in the following cases:   
     * -When validated  class members from criteria, if class member is not a method.
     */
    ValidateMethodDeclared:"{$type}: {$entryPoints} - The property must be Function.",
 
    /**
     * An error is thrown in the following cases:
     *  -When validation the arguments of the class methods according to the interface criteria, if the argument does not meet the criteria.
     *  
     *  Groups errors for arguments
     *  
     *  Accompanied by errors:  {@link ...Validate}, {@link ...ValidateType}
     */
    ValidateArguments:undefined,


    /**
     *  An error is thrown in the following cases:
     *  -when validated the reactive property values ​​,if getter / setter should be declared or not declared,
     *  - when a reactive property is to be declared.
     */
    ValidateReactDeclared:"{$type}: {$entryPoints} - \"{$react_type}\" {$not} must be declared",

    /**
     * An error is thrown in the following cases:
     * -When validated  class members from criteria, if there is no member in the class.
     */
    ValidateMemberDeclared:"{$type}: {$entryPoints} - The member must be declared.",
    
    /**
     * An error is thrown in the following cases:
     * -when the class fails validation.
     * 
     * Groups errors
     * 
     * Accompanied by errors: 
     * {@link ...ValidateMemberDeclared},
     * {@link ...ValidateReactDeclared},
     * {@link ...ValidateMethodDeclared},
     * {@link ...Validate}
     * {@link ...ValidateType}
     */
    Validate_BadMembers:undefined,

    /**
     * An error is thrown in the following cases:
     * -When a class or object is validated against  mirror interface.
     * 
     * Accompanied by errors: {@link ...Validate_BadMembers}
     */
    Validate_BadMirrorProperties:undefined,


    /**
     * An error is thrown in the following cases:
     * -When comparing criteria for interface members,if the interfaces do not match the criteria  
     *   
     * Groups errors the criteria when compare  
     *   
     * Accompanied by errors:  {@link ...CompareIncludes}, {@link ...CompareExcludes}  
     */
    Compare:undefined,

    /**
     * An error is thrown in the following cases:
     * - When comparing criteria for interface members, if the criteria "types" do not match
     */
    CompareTypes:'{$type}: {$entryPoints} - not matching stacks "types"',//"{$type}: {$entryPoints} - type \"{$value}\" is not present in 'types' stack",

    /**
     * An error is thrown in the following cases:  
     * - When comparing criteria for interface members, if the criteria "includes" do not match
     */
    CompareIncludes:'{$type}: {$entryPoints} - not matching stacks "includes"',
    
    
    /**
     * An error is thrown in the following cases:
     * - When comparing criteria for interface members, if the criteria "excludes" do not match
     */
    CompareExcludes:'{$type}: {$entryPoints} - not matching stacks "excludes"',
    
    
    /**
     *  An error is thrown in the following cases:
     *  -When comparing criteria for interface members,if the method lacks required arguments
     *
     */
    CompareMethod:undefined,


    /**
     * 
     */
    CompareReact:undefined,
    
    /**
     * An error is thrown in the following cases:
     * - When  [method .InterfaceBuilder.implementInterfaces] is called and the first argument is an interface.
     * Build and validation happens only for classes.
     */

    ImplementInterfaceError:undefined,
};
InterfaceError.consoleNotification=true;
InterfaceError.sc=new SilentConsole(console);
InterfaceData.addGlobalEndPoints(InterfaceError);