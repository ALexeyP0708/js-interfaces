/**
 * @module @alexeyp0708/interface-manager
 */

import {InterfaceError, CriteriaPropertyType, CriteriaType, InterfaceData, MirrorFuncInterface} from "./export.js";


/**
 * An instance of the CriteriaMethodType class stores the criteria for a method
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
 * @prop {object} options - settings for criteria
 * ```js
 * {
 *     options:{
 *          entryPoints:[],
 *          owner:''
 *     }
 * }
 * ```
 */
export class CriteriaMethodType extends CriteriaType{
    /**
     * @param {object} criteria   The object is passed the criteria for the method.  
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
     * @throws {InterfaceError}  Errors {@link .InterfaceError.types.default default}  {@link .InterfaceError.types#default default}
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
            this.initReturn(criteria.return,[]);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                throw e;
            }
        };
        //sc.allowToSpeak();
        if (errors.length > 0) {
            new InterfaceError('Init_BadArgumentsOrReturn', {entryPoints: this.options.entryPoints, errors}).throw(true);
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
     * Initializes criteria for arguments in the current object
     * @param {Array.<CriteriaType|{[arguments]:Array,[return]:object}|{[types]:Array,[includes]:Array,[excludes]:Array}>} args
     * @param {Array} [entryPoints]  Indicate where the method call came from
     * @throws {InterfaceError} 
     */
    initArguments(args=[],entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(!Array.isArray(args)){
            new InterfaceError('initArguments',{message:'Array expected. Example:{arguments:[{types["string","number"]},{arguments:[],return:{}}]}'}).throw();
        }
        for(let arg of args) {
            let criteria={};
            if(arg instanceof CriteriaType){
                criteria=arg;
                criteria.initOptions({entryPoints:entryPoints});
                this.arguments.push(criteria);
                continue;
            }
            criteria=Object.assign({},arg);
            criteria.options=Object.assign({},this.options,criteria,{entryPoints:entryPoints});
            if(criteria.hasOwnProperty('arguments') || criteria.hasOwnProperty('return') ){
                criteria=new CriteriaMethodType(criteria);
            } else {
                criteria=new CriteriaPropertyType(criteria);
            }
            this.arguments.push(criteria);
        }
    }

    /**
     * Initializes criteria for the return value in the current object
     * @param {CriteriaType|{[arguments]:Array,[return]:object}|{[types]:Array,[includes]:Array,[excludes]:Array}} rtrn
     * @param {string[]} [entryPoints]  Indicate where the method call came from
     * @throws {InterfaceError}
     */
    initReturn(rtrn={},entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let tp= typeof rtrn;
        if(!['object'].includes(tp)|| rtrn==null){
            new InterfaceError('initReturn',{message:'Object expected. Example:{types["string","number"]} or {arguments:[],return:{}}'}).throw();
        }
        let criteria;
        if(rtrn instanceof CriteriaType){
            criteria=rtrn;
            criteria.initOptions({entryPoints:entryPoints});
            
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
    validate (value, entryPoints = ['not_defined']){
        if(typeof value!=='function' || value.prototype!==undefined){
            new InterfaceError('ValidateMethodDeclared',{entryPoints}).throw();
        }
        return {types:this,includes:false,excludes:false};
    }
    /**
     * Validation for method arguments according to criteria
     * @param {Array} args
     * @param {Array} entryPoints  Indicate where the method call came from
     * @return {{types:boolean|*,includes:boolean|*,excludes:boolean|*}[]} 
     * If there are no exceptions, will return an array of matches for the arguments.
     * @throws {InterfaceError}
     */
    validateArguments(args,entryPoints=['not_defined']){
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
     * @param {Array} entryPoints  Indicate where the method call came from
     * @returns {{types:boolean|*,includes:boolean|*,excludes:boolean|*}}
     * If there are no exceptions will return the result of matches
     * @throws {InterfaceError} 
     */
    validateReturn(rtrn,entryPoints=['not_defined']){
        entryPoints=entryPoints.concat(['return']);
        return this.return.validate(rtrn,entryPoints);
    }

    /**
     * Compares criteria. Necessary when expanding criteria  
     * Rules:  
     * - The number of arguments in the passed criteria must be at least in the current criteria(object)
     * - The criteria for the arguments of the passed object must match the criteria for the arguments of the current object
     * - The criteria for the returned object must match the criteria for the current object
     * @param {CriteriaMethodType|CriteriaType} criteria  If the criteria do not match the CriteriaMethodType type 
     * then a BadCriteria error will be thrown
     * @param entryPoints Indicate where the method call came from
     * @throws {InterfaceError} 
     */ 
    compare(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(!(criteria instanceof Object.getPrototypeOf(this).constructor)){
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
        try {
            this.return.compare(criteria.return,[`return`]);
        } catch (error) {
            if(error instanceof InterfaceError){
                new InterfaceError('CompareMethod',{entryPoints,message:'returns are not comparable'}).throw();
            }
            throw error;
            
        }
    }
    
    static formatExtendedSyntaxToObject(data,entryPoints=['not defined']){
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
     * 
     * @param data
     * @param entryPoints
     * @returns {*}
     * 
     * @example
     * 
     * //from
     * data ={};
     * //to
     * data={arguments:[],return:{types:['mixed'],includes:[],excludes:[]}}
     * 
     * from
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
    static formatStrictSyntaxToObject (data,entryPoints=['not_defined']){
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
            if(result['arguments'][key].hasOwnProperty('arguments') || result['arguments'][key].hasOwnProperty('return') ){
                result['arguments'][key]=CriteriaMethodType.formatStrictSyntaxToObject(result['arguments'][key],entryPoints.concat(`arguments[${key}].call()`));
            } else {
                result['arguments'][key]=CriteriaPropertyType.formatStrictSyntaxToObject(result['arguments'][key],entryPoints.concat(`arguments[${key}]`));
            }
        }
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
        if(result['options']===undefined){
            result.options={entryPoints};
        }
        return result;
    }
  
}
InterfaceData.addGlobalEndPoints(CriteriaMethodType);
CriteriaMethodType.isBuildSandbox=true;
