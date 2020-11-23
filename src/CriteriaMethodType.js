/**
 * @module @alexeyp0708/interface-manager
 */

import {
    InterfaceError,
    CriteriaPropertyType,
    CriteriaType,
    InterfaceData,
    InterfaceBuilder
} from "./export.js";


/**
 * @prop {CriteriaType[]} arguments - Criteria for arguments
 * ```js
 * {
 *      arguments:[
 *          CriteriaPropertyType { 
 *              types,
 *              includes,
 *              excludes,
 *              options
 *          },
 *           CriteriaPropertyType { 
 *              types,
 *              includes,
 *              excludes,
 *              options
 *          },
 *          ...
 *      
 *      ]
 *}
 * ```
 * @prop {CriteriaPropertyType} return - Criteria for return result
 * ```js
 * {
 *     return : CriteriaPropertyType { 
 *              types,
 *              includes,
 *              excludes,
 *              options
 *      }
 * }
 * ```
 * @inheritDoc
 */
export class CriteriaMethodType extends CriteriaType{
    /**
     * @param {{arguments:Array,return:{}}} criteria    In this parameters is passed the criteria for the method/function.  
     * The object must repeat the construction of an instance of the CriteriaMethodType class.    
     *```js
     *  {
     *     arguments:[
     *         { 
     *              types:'number' 
     *         }
     *     ],
     *     return:{
     *         types:'number'
     *     }
     *  }
     * ```
     * @throws {InterfaceError} 
     */
    constructor(criteria={}){
        super(criteria);
        Object.defineProperties(this,{
            arguments:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:[]
            },
            return:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:{}
            },
            isBuildSandbox:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:true
            },
            
        });
        let errors=[];
        try {
            this.initArguments(criteria.arguments,[]);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                throw e;
            }
        };
        try {
            this.initReturn(criteria.return,this.options.entryPoints);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                throw e;
            }
        };
        if (errors.length > 0) {
            new InterfaceError('Init_BadArgumentsOrReturn', {entryPoints: this.options.entryPoints, errors}).throw(true);
        }
    }

    /**
     * @inheritDoc
     */
    initOptions(options={}){
        super.initOptions(options);
        if(this.arguments!==undefined){
            for(let argument of this.arguments){
                argument.initOptions(this.options);
            }
        }
        if(this.return!==undefined){
            this.return.initOptions(this.options);
        }
    }
    
    /**
     * @inheritdoc
     */
    setOwner(owner){
        super.setOwner(owner);
        for(let argument of this.arguments){
            argument.setOwner(owner);
        }
        this.return.setOwner(owner);
    }

    /**
     * @inheritdoc
     */
    freeze(){
        super.freeze();
        for(let argument of this.arguments){
            argument.freeze();
        }
        this.return.freeze();
    }

    /**
     * Initializes criteria for arguments
     * @param {Array.<(CriteriaType|{arguments:Array,return:object}|{types:Array,includes:Array,excludes:Array})>} args
     * @param {string[]} [entryPoints]  Indicate where the method call came from
     * @throws {InterfaceError} 
     */
    initArguments(args=[],entryPoints=[]){
        entryPoints=Object.assign([],entryPoints);
        if(!Array.isArray(args)){
            new InterfaceError('initArguments',{message:'Array expected. Example:{arguments:[{types["string","number"]},{arguments:[],return:{}}]}'}).throw();
        }
        for(let arg of args) {
            let criteria={};
            if(arg instanceof CriteriaType){
                this.arguments.push(arg);
                continue;
            }
            criteria=Object.assign({},arg);
            criteria.options=Object.assign({},this.options,criteria.options,{entryPoints:entryPoints});
            if(criteria.hasOwnProperty('arguments') || criteria.hasOwnProperty('return') ){
                criteria=new CriteriaMethodType(criteria);
            } else {
                criteria=new CriteriaPropertyType(criteria);
            }
            this.arguments.push(criteria);
        }
    }

    /**
     * Initializes criteria for the return value
     * @param {(CriteriaType|{arguments:Array,return:object}|{types:Array,includes:Array,excludes:Array})} rtrn
     * @param {string[]} [entryPoints]  Indicate where the method call came from
     * @throws {InterfaceError}
     */
    initReturn(rtrn={},entryPoints=[]){
        entryPoints=Object.assign([],entryPoints);
        let tp= typeof rtrn;
        if(!['object'].includes(tp)|| rtrn==null){
            new InterfaceError('initReturn',{message:'Object expected. Example:{types["string","number"]} or {arguments:[],return:{}}'}).throw();
        }
        let criteria;
        if(rtrn instanceof CriteriaType){
            criteria=rtrn;
        } else {
            criteria=Object.assign({},rtrn);
/*            if(criteria.types===undefined){
                criteria.types=['mixed'];
            }*/
            criteria.options=Object.assign({},this.options,criteria.options,{entryPoints:entryPoints});
            if(criteria.hasOwnProperty('arguments') || criteria.hasOwnProperty('return') ){
                criteria=new CriteriaMethodType(criteria);
            } else {
                criteria=new CriteriaPropertyType(criteria);
            }
        }
        this.return=criteria;
    }

    /**
     * @inheritDoc
     */
    build(data,criteria,entryPoints=[]){
        let func=data;
        if (
            criteria instanceof CriteriaMethodType &&
            criteria.isBuildSandbox !== false &&
            typeof func === 'function' &&
            func.prototype === undefined
        ){
            let check = false;
            for (let arg of criteria['arguments']) {
                if (
                    arg instanceof CriteriaPropertyType && arg.types.length > 0 && !arg.types.includes('mixed') ||
                    arg instanceof CriteriaMethodType
                ) {
                    check = true;
                    break;
                }
            }
            if (
                check ||
                criteria.return instanceof CriteriaPropertyType &&
                criteria.return.types.length > 0 &&
                !criteria.return.types.includes('mixed') ||
                criteria.return instanceof CriteriaMethodType
            ) {
                func = InterfaceBuilder.generateSandbox(func, criteria, entryPoints);
            }
        }
        return func;
    }
    
    validate (value, entryPoints = []){
        if(typeof value!=='function' || value.prototype!==undefined){
            new InterfaceError('ValidateMethodDeclared',{entryPoints}).throw();
        }
        return {types:this,includes:false,excludes:false};
    }
    
    
    /**
     * Validation for method arguments according to criteria
     * @param {Array} args
     * @param {string[]} [entryPoints]  Indicate where the method call came from
     * @return {Array.<{types:(boolean|*),includes:(boolean|*),excludes:(boolean|*)}>} 
     * If there are no exceptions, will return an array of matches for the arguments.
     * @throws {InterfaceError}
     */
    validateArguments(args,entryPoints=[]){
        let errors=[];
        let result=[];
        entryPoints=Object.assign([],entryPoints);
        
        for(let n in this.arguments){
            n=Number(n);
            try{
                result.push(this.arguments[n].validate(args[n],[`arguments[${n+1}]`]));
            } catch(e){
                if(e instanceof InterfaceError ){
                    errors.push(e);
                }
            }
        }
        if(errors.length>0){
            new InterfaceError('ValidateArguments',{errors,entryPoints}).throw(true);
        }
        return result;
    }

    /**
     * Validation for method return data according to criteria
     * @param rtrn
     * @param {string[]} [entryPoints]  Indicate where the method call came from
     * @returns {{types:(boolean|*),includes:(boolean|*),excludes:(boolean|*)}}
     * If there are no exceptions will return the result of matches
     * @throws {InterfaceError} 
     */
    validateReturn(rtrn,entryPoints=[]){
        entryPoints=entryPoints.concat(['return']);
        return this.return.validate(rtrn,entryPoints);
    }

    /**
     * Compares criteria.  
     * Used when an interface member is about to replace a member of the same name in another interface.
     * Rules:  
     * - The number of arguments in the passed criteria must be at least in the current criteria
     * - the remaining arguments are optional and therefore their criteria must be of type 'undefined' or 'mixed'
     * - The criteria for the arguments  must match  current  criteria
     * - The criteria for the returned data must match the current criteria 
     * @param {CriteriaMethodType|CriteriaType} criteria  If the criteria do not match the CriteriaMethodType type 
     * then a error will be thrown
     * @param {string[]} [entryPoints] Indicate where the method call came from
     * @throws {InterfaceError} 
     */ 
    compare(criteria,entryPoints=[]){
        entryPoints=Object.assign([],entryPoints);
        if(Object.getPrototypeOf(this).constructor !== Object.getPrototypeOf(criteria).constructor){
            new InterfaceError('BadCriteria',{entryPoints,className:Object.getPrototypeOf(this).constructor.name}).throw();
        }
        for(let k=0; k<this.arguments.length;k++){
            if(!(k in criteria.arguments)){
                new InterfaceError('CompareMethod',{entryPoints,message:'arguments are not comparable'}).throw();
            } else {
                try {
                    this.arguments[k].compare(criteria.arguments[k],[`argument ${k+1}`]);
                }catch (error) {
                    if(error instanceof InterfaceError){
                        new InterfaceError('CompareMethod',{entryPoints,message:'arguments are not comparable'}).throw();
                    } 
                    throw error;
                }
            }
        }
        if(criteria.arguments.length>this.arguments.length){
            for(let k=this.arguments.length; k<criteria.arguments.length;k++){
                if(criteria.arguments[k].types.length>0 && !criteria.arguments[k].types.includes('undefined') && !criteria.arguments[k].types.includes('mixed')){
                    new InterfaceError('CompareMethod',{entryPoints,message:`arguments are not comparable.\n`+
                    `The rest of the arguments [${this.arguments.length+1}]-[${criteria.arguments.length}] should be optional and therefore `+
                            `their criteria should contain the type "undefined" or "mixed"
                            `}).throw();
                }
            }
        }
        try {
            this.return.compare(criteria.return,[`return`]);
        } catch (error) {
            if(error instanceof InterfaceError){
                new InterfaceError('CompareMethod',{entryPoints,message:'returns are not comparable'}).throw();
            }
            throw error;
            
        }
    }
    
    static formatExtendedSyntaxToObject(data,entryPoints=[]){
        let tp=typeof data;
        let result;
        if(['function','string'].includes(tp)){
            result={
                return:data
            }
        } else if(Array.isArray(data)){
            result={
                arguments:data
            };
            if(data.return){
                result.return=data.return;
            }
        } else if(data===undefined || data===null) {
            result={};
        } else if(tp!=='object'){
            new InterfaceError('BadCriteriaFormat',{entryPoints}).throw(true);
        }else{
            result=Object.assign({},data);
        }
        /*if(result['arguments']!==undefined){
            result['arguments']=result['arguments'].split(',');
        }*/
        
        for(let key=0; key<result['arguments'];key++){
            if(typeof result['arguments'][key]==='function' && result['arguments'][key].prototype===undefined){
                result['arguments'][key]=result['arguments'][key]();
                result['arguments'][key]=CriteriaMethodType.formatExtendedSyntaxToObject(result['arguments'][key],entryPoints.concat(`arguments[${key}]`));
            } else {
                result['arguments'][key]=CriteriaPropertyType.formatExtendedSyntaxToObject(result['arguments'],entryPoints.concat(`arguments[${key}]`));
            }
        }

        if(result['return']!==undefined){
            if(typeof result['return']==='function' && result['return'].prototype===undefined){
                result['return']=result['return']();
                result['return']=CriteriaMethodType.formatExtendedSyntaxToObject(result['return'],entryPoints.concat(`return`));
            } else {
                result['return']=CriteriaPropertyType.formatExtendedSyntaxToObject(result['return'],entryPoints.concat(`return`));
            }
        } 
        return result;
        /*data.forEach((val,k)=>{
            data[k]=CriteriaPropertyType.formatToObject(val);
        });*/
    }

    /**
     * Formats the declared criteria in order for further work.  
     * Formats strong syntax.
     * @param {undefined|null|object} data
     * @param {string[]} [entryPoints] Indicate where the method call came from
     * @returns {{arguments:Array,return:object}}
     * 
     * @example
     * 
     * //from
     * data ={};
     * //to
     * data={arguments:[],return:{types:['mixed'],includes:[],excludes:[]}}
     * 
     * //from
     * data={arguments:['string']}
     * // to
     * data={arguments:[{types:['string'],includes:[],excludes:[]}],return:{...}}
     * 
     * //from 
     * data={arguments:[{arguments:['string']}]}
     * // to
     * data={arguments:[{arguments:[{types:['string'],includes:[],excludes:[]}],return:{types:['mixed'],includes:[],excludes:[]}}],return:{...}}
     *
     * //from
     * data={return:'string'}
     * // to
     * data={arguments:[...],return:{types:['string']}}
     *
     * //from
     * data={{return:{return:'string'}}}
     * // to
     * data={arguments:[...],return:{arguments:[],return:{types:['string']}}}
     * 
     */
    static formatStrictSyntaxToObject (data,entryPoints=[]){
        if(data===null || data===undefined){
            data={};
        }
        if(typeof data!=='object'){
            new InterfaceError('CriteriaMethodFormat',{message:'Object expected. Example:{arguments:[{types:["number"]},{arguments:[],return{}}],return:{types:["string","number"]}}'}).throw();
        }
        let tp=typeof data;
        let result=Object.assign({},data);
        if(result['arguments']===undefined){
            result['arguments']=[];
        }
        for(let key=0; key<result['arguments'].length;key++){
            if(typeof result['arguments'][key]!=='object' || result['arguments'][key]===null ){
                result['arguments'][key]={
                    types:[result['arguments'][key]]
                };
            }
            if(!(result['arguments'][key] instanceof CriteriaType)){
                if(result['arguments'][key].hasOwnProperty('arguments') || result['arguments'][key].hasOwnProperty('return') ){
                    result['arguments'][key]=CriteriaMethodType.formatToObject(result['arguments'][key],entryPoints.concat(`arguments[${key}].call()`));
                } else {
                    result['arguments'][key]=CriteriaPropertyType.formatToObject(result['arguments'][key],entryPoints.concat(`arguments[${key}]`));
                }
            } else {
                if(result['arguments'][key] instanceof CriteriaMethodType){
                    result['arguments'][key].initOptions({entryPoints:entryPoints.concat(`arguments[${key}].call()`)});
                } else {
                    let ProtoClass=Object.getPrototypeOf(result['arguments'][key]).constructor;
                    result['arguments'][key]=ProtoClass.generateObject(result['arguments'][key],undefined,entryPoints.concat(`arguments[${key}]`));
                    console.log(21);
                }
            }
        }
        if(!(result['return'] instanceof CriteriaType)){
            if(result['return']===undefined){
                result['return']={};
            }else if(typeof result['return']!=='object' || result['return']===null){
                result['return']={
                    types:[result['return']]
                };
            }
            if(result['return'].hasOwnProperty('arguments') || result['return'].hasOwnProperty('return') ){
                result['return']=CriteriaMethodType.formatStrictSyntaxToObject(result['return'],entryPoints.concat(`return.call()`));
            } else {
                result['return']=CriteriaPropertyType.formatStrictSyntaxToObject(result['return'],entryPoints.concat(`return`));
            }
        } else {
            if(result['return'] instanceof CriteriaMethodType){
                result['return'].initOptions({entryPoints:entryPoints.concat(`return.call()`)});
            } else {
                result['return'].initOptions({entryPoints:entryPoints.concat(`return`)});
            }
        }
        if(result['options']===undefined){
            result.options={entryPoints};
        }
        return result;
    }

    /**
     * @inheritDoc
     *
     * */
    static formatToObject(data,entryPoints=[]){
        if(!this.isUseStrictSyntax){
            return this.formatExtendedSyntaxToObject(data,entryPoints);
        }
        return this.formatStrictSyntaxToObject(data,entryPoints);
    }
  
}
InterfaceData.addGlobalEndPoints(CriteriaMethodType);
CriteriaMethodType.isBuildSandbox=true;
