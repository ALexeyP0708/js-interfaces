import {InterfaceTools, interfaceData, InterfaceData, CriteriaType} from "./export.js";

export class Descriptors{


    /**
     * Generates object descriptors.
     * @param {object|class} object
     * @returns {object} Descriptor format
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
     *              isBuilt:false // Indicates whether the class property is compiled
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
     * @param {object} object
     * @returns {object}
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
     *              isBuilt:false // Indicates whether the class property is compiled
     *     }
     * }
     * ```
     */
    static getAll(object) {
        let descriptors = {};
        let proto = object;
        let end_points = InterfaceData.getAllEndPoints();
        do {
            let proto_descriptors = this.get(proto);
            if (proto.hasOwnProperty('constructor')) {
                end_points.splice(end_points.length, 0, ...InterfaceData.getAllEndPoints(proto.constructor));
            }
            for (let pd in proto_descriptors) {
                if (!(pd in descriptors)) {
                    descriptors[pd] = proto_descriptors[pd];
                }
            }
            proto = Object.getPrototypeOf(proto);
        } while (!(proto.hasOwnProperty('constructor') && end_points.includes(proto.constructor)));
        return descriptors;
    }
}
InterfaceData.addGlobalEndPoints(Descriptors);