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
        this.options.entryPoints='entryPoints' in options?options.entryPoints:['not_defined'];
        this.options.owner=options.hasOwnProperty('owner')?options.owner:class not_defined {};
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
}
InterfaceData.addGlobalEndPoints(CriteriaType);