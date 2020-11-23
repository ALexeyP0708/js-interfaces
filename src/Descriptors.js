/**
 * @module @alexeyp0708/interface-manager
 */

import {interfaceData, InterfaceData} from "./export.js";

/**
 * Class of static methods that works with object and function(class) descriptors 
 */
export class Descriptors{


    /**
     * Generates object descriptors.
     * @param {object|class} object
     * @returns {{writable:boolean,enumerable:boolean,configurable:boolean,value:*,get:function,set:function,constructor:function}} Descriptor format
     * ```js
     * {
     *      property:{
     *              writable:true,
     *              enumerable:true,
     *              configurable:true,
     *              value:function{},
     *              get:function(){},
     *              set:function(v){},
     *              constructor:NameClass, // It indicates where the descriptor is taken from.
     *     }
     * }
     * ```
     */
    static get(object) {
        let descriptors = Object.getOwnPropertyDescriptors(object);
        if (typeof object === 'function') {
            delete descriptors.length;
            delete descriptors.name;
            delete descriptors.prototype;
            delete descriptors.isInterface;
            delete descriptors[interfaceData];
        } else {
            if (descriptors.hasOwnProperty('constructor')) {
                delete descriptors.constructor;
            }
        }

        if (typeof object === 'function') {
            for (let prop in descriptors) {
                descriptors[prop].constructor = object;
            }
        } else {
            for (let prop in descriptors) {
                descriptors[prop].constructor = object.constructor;
            }
        }
        return descriptors;
    }

    /**
     * Returns descriptors based on prototypes.
     * Prototypes descriptors are added to the current descriptor.
     *
     * @param {object|function} object
     * @returns {{writable:boolean,enumerable:boolean,configurable:boolean,value:*,get:function,set:function,constructor:function}}
     * Descriptor format
     * ```js
     * {
     *      property:{
     *              writable:true,
     *              enumerable:true,
     *              configurable:true,
     *              value:function{}, // or
     *              get:function(){},
     *              set:function(v){},
     *              constructor:NameClass, // It indicates where the descriptor is taken from.
     *     }
     * }
     * ```
     */
    static getAll(object) {
        let descriptors = {};
        let proto = object;
        let end_points = InterfaceData.getAllEndPoints(proto);
        while (
                !(typeof proto==='function'&& end_points.includes(proto)) &&
                !(proto.hasOwnProperty('constructor') && end_points.includes(proto.constructor))
            ) 
        {

            let proto_descriptors = this.get(proto);
            for (let pd in proto_descriptors) {
                if (!(pd in descriptors)) {
                    descriptors[pd] = proto_descriptors[pd];
                }
            }
            proto = Object.getPrototypeOf(proto);
            end_points.splice(end_points.length, 0, ...InterfaceData.getEndPoints(proto));
        } 
        return descriptors;
    }
}
InterfaceData.addGlobalEndPoints(Descriptors);