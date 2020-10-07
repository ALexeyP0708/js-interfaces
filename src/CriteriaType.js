/**
 * @module @alexeyp0708/interface-manager
 */

import {InterfaceData} from "./export.js";

export class CriteriaType{
    constructor (criteria){
        Object.defineProperties(this,{
            options: {
                enumerable: true,
                    configurable: true,
                    writable: true,
                    value: {}
            },
            comparisonType:{
                enumerable: true,
                configurable: true,
                writable: true,
                value: 'equal' //equal|compress|expand
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
        this.options={};
        this.options.entryPoints=options.entryPoints??this.options.entryPoints??['not_defined'];
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
    }

    validate() {
        throw new Error('no method');
    }
    static formatExtendedSyntaxToObject(data,entryPoints){
        throw new Error('no method');
    }
    static formatStrictSyntaxToObject(data,entryPoints){
        throw new Error('no method');
    }
    static formatToObject(data,entryPoints=['not_defined']){
        if(!CriteriaType.isUseStrictSyntax){
            data=this.formatExtendedSyntaxToObject(data,entryPoints);
        }
        return this.formatStrictSyntaxToObject(data,entryPoints);
    }
}
CriteriaType.isUseStrictSyntax=true;
InterfaceData.addGlobalEndPoints(CriteriaType);