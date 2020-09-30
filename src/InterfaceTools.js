import {InterfaceData} from "./InterfaceData.js";
import {Descriptors} from "./Descriptors.js";

export class InterfaceTools{

    /*static isInterface(ProtoClass) {
        return ProtoClass.hasOwnProperty('isInterface') && ProtoClass.isInterface;
    }*/




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