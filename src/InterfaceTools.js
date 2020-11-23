/**
 * @module @alexeyp0708/interface-manager
 */


import {InterfaceData,Descriptors} from "./export.js";
export class InterfaceTools{
    /**
     * Freezing class properties
     * @param {function} ProtoClass
     * @param {Array} props the names of the properties to be frozen
     */
    static freezePropClass(ProtoClass, props = []) {
        let descs = Descriptors.get(ProtoClass.prototype);
        for (let desc of descs) {
            desc.writable = false;
            desc.configurable = false;
        }
        Object.defineProperties(ProtoClass.prototype, descs);

        descs = Descriptors.get(ProtoClass);
        for (let desc of descs) {
            desc.writable = false;
            desc.configurable = false;
        }
        Object.defineProperties(ProtoClass, descs);
    }
}

InterfaceData.addGlobalEndPoints(InterfaceTools);