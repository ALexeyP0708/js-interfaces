/**
 * @module @alexeyp0708/interface-manager
 */

import {CriteriaMethodType,CriteriaPropertyType, CriteriaType, InterfaceData, InterfaceError} from "./export.js";

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
        if(criteria.get === null || criteria.get===undefined){
            delete this.get;
        } else{
            criteria.get=CriteriaPropertyType.formatToObject(criteria.get,this.options.entryPoints);
            if(typeof criteria.get ==='object' && criteria.get!==null){
                this.initGet(criteria.get,this.options.entryPoints);
            } 
        }
        if(criteria.set === null || criteria.set===undefined){
            delete this.set;
        } else {
            criteria.set=CriteriaPropertyType.formatToObject(criteria.set,this.options.entryPoints);
            if(typeof criteria.set ==='object' && criteria.set!==null){
                this.initSet(criteria.set,this.options.entryPoints);
            } 
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
        let tp= typeof criteria;
        if(!['object'].includes(tp)|| criteria==null){
            new InterfaceError('initGet',{message:'Object expected. Example:{types:["string","number"]} or {return:{types:["string","number"]}}'}).throw();
        }
        entryPoints=Object.assign([],entryPoints);
        if(criteria.hasOwnProperty('return')){
            let options=criteria.options;
            criteria=criteria.return;
            if(criteria.options===undefined){
                criteria.options=options;
            }
        }
        criteria=Object.assign({},criteria);
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
        let tp= typeof criteria;
        if(!['object'].includes(tp)|| criteria==null){
            new InterfaceError('initSet',{message:'Object expected. Example:{types:["string","number"]} or {return:{types:["string","number"]}}'}).throw();
        }
        entryPoints=Object.assign([],entryPoints);
        if(criteria.hasOwnProperty('arguments')){
            let options=criteria.options;
            criteria=criteria.arguments[0];
            if(criteria.options===undefined){
                criteria.options=options;
            }
        }
        criteria=Object.assign({},criteria);
        let options=Object.assign({},this.options,criteria.options,{entryPoints:entryPoints});
        criteria = new CriteriaMethodType({arguments:[criteria],options});
        this.set=criteria;
    }

    /**
     * Seter validation according to criteria
     * If the seter is not set by the criteria, then an error will
     * @param val
     * @param {Array} entryPoints Indicate where the method call came from
     * @returns {{types:boolean|*,includes:boolean|*,excludes:boolean|*}}
     * If there are no exceptions will return the result of matches
     * @throws {InterfaceError} 
     */
    validateSet(val,entryPoints=['not_defined']){
        entryPoints=entryPoints.concat(['set']);
        if(! ('set' in this)){
            new InterfaceError('ValidateReactDeclared',{entryPoints,not:'not',react_type:'setter'}).throw();
        }
        return this.set.validateArguments([val],entryPoints)[0];
    }

    /**
     * Getter validation according to criteria
     * If the geter is not set by the criteria, then an error will
     * @param val
     * @param {Array} entryPoints Indicate where the method call came from
     * @returns {{types:boolean|*,includes:boolean|*,excludes:boolean|*}}
     * If there are no exceptions will return the result of matches
     * @throws {InterfaceError} InterfaceError.type ===ValidateReactDeclared
     */
    validateGet(val,entryPoints=['not_defined']){
        entryPoints=entryPoints.concat(['get']);
        if(! ('get' in this)){
            new InterfaceError('ValidateReactDeclared',{entryPoints,not:'not',react_type:'getter'}).throw();
        }
        return this.get.validateReturn(val, entryPoints);
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
        if(!(this instanceof Object.getPrototypeOf(criteria).constructor)){
            new InterfaceError('BadCriteria',{entryPoints,className:Object.getPrototypeOf(criteria).constructor.name}).throw();
        }
        if(this.hasOwnProperty('get')){
            if(!criteria.hasOwnProperty('get')){
                new InterfaceError('CompareReact',{entryPoints,message:'getter not comparable'}).throw();
            } else {
                try{
                    this.get.compare(criteria.get);
                }catch (e) {
                    if(e instanceof InterfaceError){
                        new InterfaceError('CompareReact',{entryPoints,message:'getter not comparable'}).throw();
                    }
                    throw e;
                }
            }
        } else if(criteria.hasOwnProperty('get')){
            new InterfaceError('CompareReact',{entryPoints,message:'getter not comparable'}).throw();
        }
        if(this.hasOwnProperty('set')){
            if(!criteria.hasOwnProperty('set')){
                new InterfaceError('CompareReact',{entryPoints,message:'setter not comparable'}).throw();
            } else {
                try{
                    this.set.compare(criteria.set);
                }catch (e) {
                    if(e instanceof InterfaceError){
                        new InterfaceError('CompareReact',{entryPoints,message:'setter not comparable'}).throw();
                    } 
                    throw e;
                }
            }
        } else if(criteria.hasOwnProperty('set')){
            new InterfaceError('CompareReact',{entryPoints,message:'setter not comparable'}).throw();
        }
    }
    
    static formatStrictSyntaxToObject (data,entryPoints=['not_defined']){
        if(data===null || data===undefined){
            data={};
        }
        if(typeof data!=='object' ){
            new InterfaceError('CriteriaReactFormat',{message: `Object expected. Example:  {get:{},set{}}`}).throw();
        }
        let result={};
        for (let prop of ['get','set']){
            if(data.hasOwnProperty(prop)){
                if(data[prop]===undefined){
                    continue;
                }
                if(data[prop].hasOwnProperty('arguments')||data[prop].hasOwnProperty('return')){
                    result[prop]=CriteriaMethodType.formatStrictSyntaxToObject(data[prop],entryPoints.concat(['get']));
                } else {
                    result[prop]=CriteriaPropertyType.formatStrictSyntaxToObject(data[prop],entryPoints.concat(['get']));
                }
            }
        }
        if(result['options']===undefined){
            result.options={entryPoints};
        }
        return result;
    }
}
InterfaceData.addGlobalEndPoints(CriteriaReactType);