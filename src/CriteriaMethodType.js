/**
 * @module @alexeyp0708/interface-manager
 */

import {InterfaceError, CriteriaPropertyType, CriteriaType, InterfaceData} from "./export.js";

/**
 * An instance of the CriteriaMethodType class stores the criteria for a method
 * @prop {CriteriaPropertyType[]} arguments - Criteria for arguments
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
            }
        });
        let errors=[];
        //let sc=new SilentConsole(console);
        //sc.denyToSpeak();
        try {
            this.initArguments(criteria.arguments,[]);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                //sc.allowToSpeak();
                throw e;
            }
        };
        try {
            this.initReturn(criteria.return,[]);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                //sc.allowToSpeak();
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
     * @param {Array} args
     * @param {Array} entryPoints  Indicate where the method call came from
     * @throws {InterfaceError} 
     */
    initArguments(args=[],entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(!Array.isArray(args)){
            new InterfaceError('BadCriteria',{entryPoints,className:Object.getPrototypeOf(this).constructor.name}).throw();
        }
        for(let arg of args) {
            if(arg===undefined){
                arg={
                    types:['undefined']
                };
            }
            let criteria=Object.assign({},arg);
            if(criteria.options===undefined){
                criteria.options={};
            }
            criteria.options=Object.assign({},this.options,criteria.options,{entryPoints:entryPoints});
            criteria=new CriteriaPropertyType(criteria);
            this.arguments.push(criteria);
        }
    }

    /**
     * Initializes criteria for the return value in the current object
     * @param {object} rtrn
     * @param {Array} entryPoints  Indicate where the method call came from
     * @throws {InterfaceError} InterfaceError.type==='InitReturn'
     */
    initReturn(rtrn={},entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(typeof rtrn !=='object' || rtrn==null){
            new InterfaceError('BadCriteria',{entryPoints,className:Object.getPrototypeOf(this).constructor.name}).throw();
        }
        let criteria=Object.assign({},rtrn);
        if(criteria.types===undefined){
            criteria.types=['mixed'];
        }
        if(criteria.options===undefined){
            criteria.options={};
        }
        criteria.options=Object.assign({},this.options,criteria.options,{entryPoints:entryPoints});
        criteria=new CriteriaPropertyType(criteria);
        this.return=criteria;
    }

    /**
     * Validation for method arguments according to criteria
     * @param {Array} args
     * @param {Array} entryPoints  Indicate where the method call came from
     * @throws {InterfaceError} InterfaceError.typw==='ValidateArguments'
     */
    validateArguments(args,entryPoints=['not_defined']){
        let errors=[];
        entryPoints=Object.assign([],entryPoints);
        //let sc=new SilentConsole(console);
        //sc.denyToSpeak();
        for(let n in this.arguments){
            n=Number(n);
            try{
                this.arguments[n].validate(args[n],[`arguments[${n+1}]`]);
            } catch(e){
                if(e instanceof InterfaceError ){
                    errors.push(e);
                }
            }
        }
        //sc.allowToSpeak();
        if(errors.length>0){
            new InterfaceError('ValidateArguments',{errors,entryPoints}).throw(true);
        }
    }

    /**
     * Validation for method return data according to criteria
     * @param rtrn
     * @param {Array} entryPoints  Indicate where the method call came from
     * @throws {InterfaceError} 
     */
    validateReturn(rtrn,entryPoints=['not_defined']){
        entryPoints=entryPoints.concat(['return']);
        this.return.validate(rtrn,entryPoints);
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
        let errors=[];
        if(!(criteria instanceof Object.getPrototypeOf(this).constructor)){
            new InterfaceError('BadCriteria',{entryPoints,className:Object.getPrototypeOf(this).constructor.name}).throw();
        }
        //let sc=new SilentConsole(console);
        //sc.denyToSpeak();
        for(let k=0; k<this.arguments.length;k++){
            if(!(k in criteria.arguments)){
                if(!this.arguments[k].types.includes('mixed') && !this.arguments[k].types.includes('undefined')){
                    let error= new InterfaceError('CompareMethod_ArgumentUnDeclared',{entryPoints:[`argument ${k+1}`]});
                    errors.push(error.message);
                }
            } else {
                try {
                    this.arguments[k].compare(criteria.arguments[k],[`argument ${k+1}`]);
                }catch (error) {
                    if(error instanceof InterfaceError){
                        errors.push(error);
                    } else {
                        //sc.allowToSpeak();
                        throw error;
                    }
                }
            }
        }
        try {
            this.return.compare(criteria.return,[`return`]);
        } catch (error) {
            if(error instanceof InterfaceError){
                errors.push(error);
            } else {
                //sc.allowToSpeak();
                throw error;
            }
        }
        //sc.allowToSpeak();
        if(errors.length>0){
            new InterfaceError('CompareMethod_badParams',{errors,entryPoints}).throw(true);
        }
    }

    /**
     * Expands the current object with the passed
     * @param criteria  If the criteria do not match the CriteriaMethodType type
     * then a BadCriteria error will be thrown
     * @param entryPoints Indicate where the method call came from
     * @throws {InterfaceError} InterfaceError.type===BadCriteria|ExpandMethod_badParams
     */
    expand(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let errors=[];
        if(!(this instanceof Object.getPrototypeOf(criteria).constructor)){
            new InterfaceError('BadCriteria',{className:Object.getPrototypeOf(criteria).constructor.name,entryPoints}).throw();
        }

        //let sc=new SilentConsole();
        //sc.denyToSpeak();
        for(let k=0; k< criteria.arguments.length; k++){
            if(!(k in this.arguments)){
               this.arguments.push(criteria.arguments[k]);
            } else {
                try {
                    this.arguments[k].expand(criteria.arguments[k],[`argument ${k+1}`]);
                } catch (error) {
                    if(error instanceof InterfaceError){
                        errors.push(error);
                    } else {
                        //sc.allowToSpeak();
                        throw error;
                    }
                }
            }
        }
        try {
            this.return.expand(criteria.return,[`return`]);
        } catch (error) {
            if(error instanceof InterfaceError){
                errors.push(error);
            } else {
                //sc.allowToSpeak();
                throw error;
            }
        }
        //sc.allowToSpeak();
        if(errors.length>0){
            new InterfaceError('ExpandMethod_badParams',{errors,entryPoints}).throw(true);
        }
    }
}
InterfaceData.addGlobalEndPoints(CriteriaMethodType);
