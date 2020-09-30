/**
 * @module @alexeyp0708/interface-manager
 */

import {CriteriaMethodType, CriteriaType, InterfaceData, InterfaceError} from "./export.js";

/**
 *  An instance of the CriteriaMethodType class stores the criteria for a reactive properties
 *  @prop {object} get  Criteria for a getter
 * ```js
 * {
 *     get: CriteriaMethodType {
 *          return:{
 *              types, 
 *              includes,
 *              excludes,
 *              options
 *          }
 *          arguments:[]
 *    }
 * }
 * 
 * ```
 * @prop {object} set Criteria for a setter
 * ```js
 * {
 *     set: CriteriaMethodType {
 *          arguments:[{
 *              types, 
 *              includes,
 *              excludes,
 *              options
 *          }],
 *          return:{}
 *    }
 * }
 * 
 * ```
 * 
 * @prop {object} options - settings for criteria
 * ```js
 * {
 *     options:{entryPoints:[],owner:''}
 * }
 * ```
 * 

 */
export class CriteriaReactType extends CriteriaType {
    /**
     * @param {object}  criteria  defines criteria for reactive properties
     * ```js
     * { 
     *     get:{ //Template as CriteriaPropertyType. If get is missing it will not install.
     *         types,
     *         includes,
     *         excludes
     *     },
     *     set:{ //Template as CriteriaPropertyType. If set is missing it will not install.
     *         types,
     *         includes,
     *         excludes
     *     }
     *     options:{entryPoints:[],owner:''}
     * }
     * ```
     * or
     *```js
     * { 
     *     get:{ //Template as CriteriaMethodType. If get is missing it will not install.
     *         arguments:[],
     *         return:{
     *             types,
     *             includes,
     *             excludes
     *         }
     *     },
     *     set:{ //Template as CriteriaPropertyType. If set is missing it will not install.
     *        arguments:[
     *            {
     *                types,
     *                includes,
     *                excludes
     *            }
     *        ],
     *        return:{}
     *     }
     *     options:{entryPoints:[],owner:''}
     * }
     * ```
     * @throws {InterfaceError}
     */
    constructor(criteria={}){
        super(criteria);
        Object.defineProperties(this,{
            get:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:{}
            },
            set:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:{}
            }
        });

        if(typeof criteria.get ==='object' && criteria.get!==null){
            this.initGet(criteria.get,this.options.entryPoints);
        } else {
            delete this.get;
        }
        if(typeof criteria.set ==='object' && criteria.set!==null){
            this.initSet(criteria.set,this.options.entryPoints);
        } else {
            delete this.set;
        }
        //this.freeze();
    }

    /**
     * @inheritdoc
     */
    setOwner(owner){
        super.setOwner(owner);
        this.get.setOwner(owner);
        this.set.setOwner(owner);
    }

    /**
     * Initializes the getter
     * @param {object} criteria 
     * @param {Array} entryPoints Indicate where the method call came from
     * @throws {InterfaceError}
     */
    initGet(criteria={},entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(criteria.hasOwnProperty('return')){
            let options=criteria.options;
            criteria=criteria.return;
            if(criteria.options===undefined){
                criteria.options=options;
            }
        }
        criteria=Object.assign({},criteria);
        //delete criteria.arguments;
        if(criteria.types===undefined){
            criteria.types=['undefined'];
        }
        if(criteria.options===undefined){
            criteria.options={};
        }
        let options=Object.assign({},this.options,criteria.options,{entryPoints:entryPoints});
        criteria = new CriteriaMethodType({return:criteria,options});
        this.get=criteria;
    }

    /**
     * Initializes the setter
     * @param {object} criteria
     * @param {Array} entryPoints Indicate where the method call came from
     * @throws {InterfaceError}
     */
    initSet(criteria={},entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(criteria.hasOwnProperty('arguments')){
            let options=criteria.options;
            criteria=criteria.arguments[0];
            if(criteria.options===undefined){
                criteria.options=options;
            }
        }
        criteria=Object.assign({},criteria);
        delete criteria.return;
        if(criteria.types===undefined){
            criteria.types=['mixed'];
        }
        if(criteria.options===undefined){
            criteria.options={};
        }
        let options=Object.assign({},this.options,criteria.options,{entryPoints:entryPoints});
        criteria = new CriteriaMethodType({arguments:[criteria],options});
        this.set=criteria;
    }

    /**
     * Seter validation according to criteria
     * If the seter is not set by the criteria, then an error will
     * @param val
     * @param {Array} entryPoints Indicate where the method call came from
     * @throws {InterfaceError} InterfaceError.type ===ValidateReactDeclared
     */
    validateSet(val,entryPoints=['not_defined']){
        entryPoints=entryPoints.concat(['set']);
        if(! ('set' in this)){
            new InterfaceError('ValidateReactDeclared',{entryPoints,not:'not',react_type:'setter'}).throw();
        }
        this.set.validateArguments([val],entryPoints);
    }

    /**
     * Getter validation according to criteria
     * If the geter is not set by the criteria, then an error will
     * @param val
     * @param {Array} entryPoints Indicate where the method call came from
     * @throws {InterfaceError} InterfaceError.type ===ValidateReactDeclared
     */
    validateGet(val,entryPoints=['not_defined']){
        entryPoints=entryPoints.concat(['get']);
        if(! ('get' in this)){
            new InterfaceError('ValidateReactDeclared',{entryPoints,not:'not',react_type:'getter'}).throw();
        }
        this.get.validateReturn(val, entryPoints);
    }

    /**
     * Compares criteria. Necessary when expanding criteria  
     * Rules:
     * - Getter/Setter must be present in the compared criteria, if the getter/setter is declared in the current object
     * - Getter/Setter not must be present in the compared criteria, if the getter/setter is not declared in the current object
     * @param {CriteriaReactType|CriteriaType} criteria If the criteria do not match the CriteriaReactType type
     * then a BadCriteria error will be thrown
     * @param entryPoints Indicate where the method call came from
     * @throws {InterfaceError} 
     */
    compare(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let errors=[];
        if(!(this instanceof Object.getPrototypeOf(criteria).constructor)){
            new InterfaceError('BadCriteria',{entryPoints,className:Object.getPrototypeOf(criteria).constructor.name}).throw();
        }
        //let sc=new SilentConsole();
        //sc.denyToSpeak();
        if(this.hasOwnProperty('get')){
            if(!criteria.hasOwnProperty('get')){
                errors.push(new InterfaceError('ValidateReactDeclared',{entryPoints:['get'],react_type:'getter'}));
            } else {
                try{
                    this.get.compare(criteria.get);
                }catch (e) {
                    if(e instanceof InterfaceError){
                        errors.push(e);
                    } else {
                        //sc.allowToSpeak();
                        throw e;
                    }
                }
            }
        } else if(criteria.hasOwnProperty('get')){
            errors.push(new InterfaceError('ValidateReactDeclared',{entryPoints:['get'],not:'not',react_type:'getter'}));
        }
        if(this.hasOwnProperty('set')){
            if(!criteria.hasOwnProperty('set')){
                // ошибка
                errors.push(new InterfaceError('ValidateReactDeclared',{entryPoints:['set'],react_type:'setter'}));
            } else {
                try{
                    this.set.compare(criteria.set);
                }catch (e) {
                    if(e instanceof InterfaceError){
                        errors.push(e);
                    } else {
                        //sc.allowToSpeak();
                        throw e;
                    }
                }
            }
        } else if(criteria.hasOwnProperty('set')){
            errors.push(new InterfaceError('ValidateReactDeclared',{entryPoints:['set'],not:'not',react_type:'setter'}));
        }
        //sc.allowToSpeak();
        if(errors.length>0){
            new InterfaceError('CompareReact_badParams',{errors,entryPoints}).throw(true);
        }
    }
    /**
     * Expands the current object with the passed
     * @param criteria  If the criteria do not match the CriteriaMethodType type
     * then a BadCriteria error will be thrown
     * @param entryPoints Indicate where the method call came from
     * @throws {InterfaceError} InterfaceError.type===BadCriteria|expandReact_badParams
     */
    expand(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let errors=[];
        if(!(this instanceof Object.getPrototypeOf(criteria).constructor)){
            new InterfaceError('BadCriteria',{entryPoints,className:Object.getPrototypeOf(criteria).constructor.name}).throw();
        }
        //let sc=new SilentConsole();
        //sc.denyToSpeak();
        if(this.hasOwnProperty('get') && criteria.hasOwnProperty('get')){
            try{
                this.get.expand(criteria.get,['get']);
            } catch (e) {
                if(e instanceof InterfaceError){
                    errors.push(e);
                }else{
                    //sc.allowToSpeak();
                    throw e;
                }
            }
        } else if(criteria.hasOwnProperty('get')){
            this.initGet(criteria.get,entryPoints.concat(['get']));
        }
        if(this.hasOwnProperty('set') && criteria.hasOwnProperty('set')){
            try{
                this.set.expand(criteria.set,['set']);
            } catch (e) {
                if(e instanceof InterfaceError){
                    errors.push(e);
                }else{
                    //sc.allowToSpeak();
                    throw e;
                }
            }

        } else if(criteria.hasOwnProperty('set')){
            this.initSet(criteria.set,entryPoints.concat(['set']));
        }
        //sc.allowToSpeak();
        if(errors.length>0){
            new InterfaceError('ExpandReact_badParams',{errors,entryPoints}).throw(true);
        }
    }
}
InterfaceData.addGlobalEndPoints(CriteriaReactType);