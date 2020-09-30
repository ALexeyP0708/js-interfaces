
import {
    interfaceData,
    InterfaceData,
    CriteriaReactType,
    CriteriaMethodType,
    CriteriaPropertyType,
    Descriptors,
    InterfaceTools, InterfaceError, InterfaceBuilder
} from "./export.js";

export class InterfaceRules{

    static generateForDescriptors(descriptors,isStatic=false) {
        let rules = {};
        let prefix=isStatic?'.':'#';
        for (let prop of Object.getOwnPropertyNames(descriptors)) {
            let desc = descriptors[prop];
            let entryPoints = [descriptors[prop].constructor.name, `${prefix}${prop}`];
            if ('get' in desc || 'set' in desc) {
                let getCriteria;
                if (desc.get !== undefined) {
                    getCriteria = desc.get();
                    if (typeof getCriteria !== 'object' || getCriteria === null) {
                        getCriteria = {};
                    }
                }
                let setCriteria;
                if (desc.set !== undefined) {
                    setCriteria = {};
                    let rtrn = desc.set(setCriteria);
                    if (typeof rtrn === 'object' && getCriteria !== null) {
                        setCriteria = rtrn;
                    }
                }
                let criteria = new CriteriaReactType({
                    get: getCriteria,
                    set: setCriteria,
                    options: {entryPoints, owner: descriptors[prop].constructor}
                });
                rules[prop]=[{criteria}];
            } 
            else if (typeof desc.value === 'function') {
                let criteria = desc.value();
                if (typeof criteria !== 'object' || criteria === null) {
                    criteria = {};
                }
                if (criteria.options === undefined) {
                    criteria.options = {};
                }
                criteria.options = Object.assign({}, criteria.options, {
                    entryPoints,
                    owner: descriptors[prop].constructor
                });
                criteria = new CriteriaMethodType(criteria);
                rules[prop]=[{criteria}];
            }
            else {
                let criteria = desc.value;
                if (typeof criteria !== 'object' || criteria === null) {
                    criteria = {};
                }
                criteria.options = Object.assign({}, criteria.options, {
                    entryPoints,
                    owner: descriptors[prop].constructor
                });
                criteria = new CriteriaPropertyType(criteria);
                rules[prop]=[{criteria}];
            }
        }
        return rules;
    }

    /**
     *  Generates interface rules from properties of the Class that is the interface.
     * @param {function} ProtoClass The class for which the rules are generated
     * @returns {InterfaceData}
     */
    static generate(ProtoClass) {
        let rules =new InterfaceData();
        let proto = ProtoClass.prototype;
        //if (ProtoClass.hasOwnProperty('isInterface') && ProtoClass.isInterface) {
        let descriptors = Descriptors.get(proto);
        rules.protoProps = this.generateForDescriptors(descriptors);
        let staticDescriptors = Descriptors.get(ProtoClass);
        rules.staticProps = this.generateForDescriptors(staticDescriptors,true);
        rules.interfaces.push(ProtoClass);
        //}
        return rules;
    }

    /**
     *  Adds / extends interface rules for Class.
     * @param {function} ProtoClass
     * @param  {InterfaceData} [rules]
     * @return {InterfaceData}
     */
    static add(ProtoClass, rules = new InterfaceData()) {
        let interfaceData = InterfaceData.init(ProtoClass);
        let entryPoints=[ProtoClass.name];
        for (let prop of Object.getOwnPropertyNames(rules.protoProps)){
            let equal_rule = rules.protoProps[prop][0];
            let equal_criteria=equal_rule.criteria;
            if (prop in rules) {
                let criteria=interfaceData.protoProps[prop][0].criteria;
                let ep=entryPoints.concat([`~${criteria.getOwner().name}~`,`~${equal_criteria.getOwner().name}~`]);
                criteria.compare(equal_criteria,ep);
            }
            interfaceData.protoProps[prop] = [equal_rule];
        }
        for (let prop of Object.getOwnPropertyNames(rules.staticProps)) {
            let equal_rule = rules.staticProps[prop][0];
            let equal_criteria=equal_rule.criteria;
            if (prop in rules) {
                let criteria=interfaceData.staticProps[prop][0].criteria;
                let ep=entryPoints.concat([`~${criteria.getOwner().name}~`,`~${equal_criteria.getOwner().name}~`]);
                criteria.compare(equal_criteria,ep);
            }
            interfaceData.staticProps[prop] = [equal_rule];
        }
        for (let val of rules.interfaces) {
            if (!interfaceData.interfaces.includes(val)) {
                interfaceData.interfaces.push(val);
            }
        }
        return interfaceData;
    }

    /**
     * sets the interface rules for the class, if the class is an interface, it will generate and combine the rules.
     * @param {function} ProtoClass
     * @param {InterfaceData} [rules]
     * @returns {InterfaceData} new rules
     */
    static init(ProtoClass, rules) {
        let interfaceData = this.add(ProtoClass, rules);
        if (InterfaceBuilder.isInterface(ProtoClass) && !interfaceData.interfaces.includes(ProtoClass)) {
        //if(!interfaceData.interfaces.includes(ProtoClass)){
            rules = this.generate(ProtoClass);
            interfaceData = this.add(ProtoClass, rules);
            this.clearInterface(ProtoClass);
        //}
        }
        return interfaceData;
    }

    /**
     * Clears a class that is an interface from properties.
     * @param {function} ProtoClass The class to be cleaned
     */
    static clearInterface(ProtoClass) {
        let proto = ProtoClass.prototype;
        if (InterfaceBuilder.isInterface(ProtoClass)){
            for (let prop of Object.getOwnPropertyNames(proto)) {
                if (prop === 'constructor') {
                    continue;
                }
                delete proto[prop];
            }
            for (let prop of Object.getOwnPropertyNames(ProtoClass)) {
                if (['length', 'name', 'prototype', 'isInterface', interfaceData].includes(prop)) {
                    continue;
                }
                delete ProtoClass[prop];
            }
        }
    }
}
InterfaceData.addGlobalEndPoints(InterfaceRules);