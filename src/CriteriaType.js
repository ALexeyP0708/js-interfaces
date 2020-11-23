/**
 * @module @alexeyp0708/interface-manager
 */

import {InterfaceData} from "./export.js";

/**
 * @abstract
 * Abstract class. Generates baseline properties and methods  for criteria classes
 * @prop {{entryPoints:Array.<string>,owner:function}} options 
 *
 * ```js
 * {
 *     options:{
 *          entryPoints:[],
 *          owner:''
 *     }
 * }
 * ```
 */
export class CriteriaType{

    /**
     * 
     * @param criteria
     */
    constructor (criteria){
        Object.defineProperties(this,{
            options: {
                enumerable: true,
                    configurable: true,
                    writable: true,
                    value: {}
            }
        });
        this.initOptions(criteria.options);
    }
    /**
     * Sets options and settings for the current object
     * @param {object} options
     * ```js
     * {
     *      entryPoints:'string',
     *      owner: class OwnerCriteria{ } 
     * }
     * ```
     */
    initOptions(options={}){
        if(this.options===undefined){
            this.options={};
        }
        this.options.entryPoints=options.entryPoints??this.options.entryPoints??[];
        this.options.owner=options.owner?? this.options.owner??class not_defined {};
    }

    /**
     * Sets the owner of the criteria
     * @param {class} owner
     */
    setOwner(owner){
        this.options.owner=owner;
    }
    /**
     * Get the owner of the criteria
     * @returns {undefined|class}
     */
    getOwner(){
        return this.options.owner;
    }

    freeze(){
        Object.freeze(this);
        Object.freeze(this.options);
        Object.freeze(this.options.entryPoints);
    }
    
    static generateObject (criteria,owner,entryPoints){
        if(criteria instanceof CriteriaType){
            criteria.initOptions({owner,entryPoints});
        } else {
            criteria=this.formatToObject(criteria,entryPoints);
            criteria = new this(criteria);
            criteria.setOwner(owner);
        }
        criteria.freeze();
        return criteria;
    }

    /**
     * @abstract
     * @param data
     * @param criteria
     * @param entryPoints
     */
    build(data,criteria,entryPoints=[]){
        throw new Error('no method');
    }

    /**
     * @abstract
     */
    compare (){
        throw new Error('no method');
    }

    /**
     * Validation of incoming parameters according to the established current criteria (object)
     * 
     * @abstract
     * @param value
     * @param {string[]} [entryPoints] Indicate where the method call came from
     * @returns {object} If there are no exceptions must return the result of matches
     * @throws {InterfaceError}
     */
    validate(value, entryPoints) {
        throw new Error('no method');
    }
    
    /**
     * Formats the declared criteria in order for further work.
     * The constructor of the class that implements the CriteriaType class takes an object as an argument, 
     * which is a template for creating the current object.
     * This method just generates a strict template-object from a template-object that does not have a strict match.
     * 
     * @abstract
     * @param {undefined|null|object} data
     * @param {string[]} [entryPoints] Indicate where the method call came from
     * @return {object}  The returned data depends on which class the method is applied in.
     */
    static formatToObject(data,entryPoints=[]){
        throw new Error('no method');
    }
}
CriteriaType.isUseStrictSyntax=true;
InterfaceData.addGlobalEndPoints(CriteriaType);