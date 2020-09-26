/**
 * @module @alexeyp0708/interface-manager
 */
import {
    CriteriaMethodType,
    CriteriaPropertyType,
    CriteriaReactType,
    InterfaceError,
    SilentConsole
} from "./export.js";

let interfacesData = Symbol.for('interfacesData');

/**
 * Class of static methods for managing classes and interfaces
 */
export class InterfaceManager {

    /**
     * Returns interface data for the class
     * @param {class} ProtoClass
     * @returns {object|undefined}
     */
    static getInterfaceData(ProtoClass) {
        if (ProtoClass.hasOwnProperty(interfacesData)) {
            return ProtoClass[interfacesData];
        }
        return undefined;
    }

    /**
     * set interface data for the class
     * @param {class} ProtoClass
     * @param {object} data
     */
    static setInterfaceData(ProtoClass, data) {
        ProtoClass[interfacesData] = data;
    }

    /**
     * checks if interface data is installed
     * @param {class} ProtoClass
     * @returns {boolean}
     */
    static hasInterfaceData(ProtoClass) {
        return ProtoClass.hasOwnProperty(interfacesData);
    }

    /**
     * initializes interface data for the class
     * @param {class} ProtoClass
     * @returns {Object}
     */
    static initInterfaceData(ProtoClass) {
        if (!this.hasInterfaceData(ProtoClass)) {
            this.setInterfaceData(ProtoClass, {
                isBuilt: false,
                interfaces: [],
                protoProps: {},
                staticProps: {},
                ownRule:{},
                builtProps: {
                    protoProps: [],
                    staticProps: [],
                },
                end_points: []
            });
        }
        return this.getInterfaceData(ProtoClass);
    }

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
    static getDescriptors(object) {
        let descriptors = Object.getOwnPropertyDescriptors(object);
        let builtProps = {
            protoProps: [],
            staticProps: []
        };
        let ProtoClass = function () {
        };
        if (typeof object === 'function') {
            delete descriptors.length;
            delete descriptors.name;
            delete descriptors.prototype;
            delete descriptors.isInterface;
            delete descriptors[interfacesData];
            ProtoClass = object;
        } else {
            if (descriptors.hasOwnProperty('constructor')) {
                ProtoClass = object.constructor;
                delete descriptors.constructor;
            }
        }
        builtProps = this.hasInterfaceData(ProtoClass)
            ? this.getInterfaceData(ProtoClass).builtProps
            : builtProps;

        for (let prop in descriptors) {
            descriptors[prop].isBuilt = false;
            if (typeof object === 'function') {
                descriptors[prop].constructor = object;

                if (builtProps.staticProps.includes(prop)) {
                    descriptors[prop].isBuilt = true;
                }
            } else {
                descriptors[prop].constructor = object.constructor;
                if (builtProps.protoProps.includes(prop)) {
                    descriptors[prop].isBuilt = true;
                }
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
    static getProtoDescriptors(object) {
        let descriptors = {};
        let proto = object;
        let end_points = this.getAllEndPoints();
        do {
            let proto_descriptors = this.getDescriptors(proto);
            if (proto.hasOwnProperty('constructor')) {
                end_points.splice(end_points.length, 0, ...this.getAllEndPoints(proto.constructor));
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

    /**
     * If the property descriptor has isBuilt = true (the property is assembled),
     * then it extracts the original descriptor from the assembly.
     * @param descriptors
     * @returns {object} return own descriptor
     */
    static extractOwnDescriptors(descriptors = {}) {
        for (let prop in descriptors) {
            let desc = descriptors[prop];
            if (desc.isBuilt === true) {
                if (desc.get !== undefined) {
                    desc.get = desc.get(Symbol.for('get_own_descriptor'));
                }
                if (desc.set !== undefined) {
                    desc.set = desc.set(Symbol.for('get_own_descriptor'));
                }
                if (desc.value !== undefined && typeof desc.value === 'function') {
                    desc.value = desc.value(Symbol.for('get_own_descriptor'));
                }
            }
            delete desc.isBuilt;
        }
        return descriptors;
    }

    /**
     * Generates interface rules from descriptors of the Class that is the interface.
     * @param {object}descriptors See {@InterfaceManager.getDescriptors}
     * so that in case of an error, refer to them.
     * @returns {object} rules interface
     */
    static generateDescriptorsRules(descriptors) {
        let rules = {};
        for (let prop of Object.getOwnPropertyNames(descriptors)) {
            let desc = descriptors[prop];
            let entryPoints = [descriptors[prop].constructor.name, `.${prop}`];
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
                this.compareAndSetRule(rules, prop, {criteria});
            } else if (typeof desc.value === 'function') {
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
                this.compareAndSetRule(rules, prop, {criteria});
            } else {
                let criteria = desc.value;
                if (typeof criteria !== 'object' || criteria === null) {
                    criteria = {};
                }
                criteria.options = Object.assign({}, criteria.options, {
                    entryPoints,
                    owner: descriptors[prop].constructor
                });
                criteria = new CriteriaPropertyType(criteria, {entryPoints});
                this.compareAndSetRule(rules, prop, {criteria});
            }
        }
        return rules;
    }

    /**
     *  Generates interface rules from properties of the Class that is the interface.
     * @param ProtoClass The class for which the rules are generated
     * @returns {{protoProps: {}, staticProps: {}}}
     */
    static generateRules(ProtoClass) {
        let rules = {
            interfaces: [],
            protoProps: {},
            staticProps: {}
        };
        let proto = ProtoClass.prototype;
        if (ProtoClass.hasOwnProperty('isInterface') && ProtoClass.isInterface) {
            let descriptors = this.getDescriptors(proto);
            rules.protoProps = this.generateDescriptorsRules(descriptors);
            let staticDescriptors = this.getDescriptors(ProtoClass);
            rules.staticProps = this.generateDescriptorsRules(staticDescriptors);
            rules.interfaces.push(ProtoClass);
        }
        return rules;
    }

    /**
     * Expands the rules for a property from new rules
     * @param rules
     * @param prop
     * @param rule
     * @param OwnerClass
     */
    static expandAndSetRule(rules, prop, rule, OwnerClass,isStatic=false) {
        let criteria = rule.criteria;
        let cls = criteria.getOwner();
        let prefix=isStatic?'.':'#';
        if (prop in rules) {
            let last_cls = rules[prop][0].criteria.getOwner();
            let entryPoints = [`${OwnerClass.name}` ,`~${cls.name}~`,`~${last_cls.name}~`, `${prefix}${prop}`];
            rules[prop][0].criteria.expand(criteria, entryPoints);
        } else {
            let CriteriaClass = Object.getPrototypeOf(criteria).constructor;
            criteria = new CriteriaClass(criteria);
            if (OwnerClass !== undefined) {
                criteria.setOwner(OwnerClass);
            }
            rules[prop] = [{criteria}];
        }
    }

    static compareAndSetRule(rules, prop, rule,OwnerClass,isStatic=false) {
        let criteria = rule.criteria;
        let cls = criteria.getOwner();
        let prefix=isStatic?'.':'#';
        if (prop in rules) {
            let last_cls = rules[prop][0].criteria.getOwner();
            let entryPoints = [`${OwnerClass.name}`, `~${cls.name}~`,`~${last_cls.name}~`, `${prefix}${prop}`];
            rules[prop][0].criteria.compare(criteria, entryPoints);
            //criteria.compare(rules[prop][0].criteria,entryPoints);
            //rules[prop][0].criteria.compareOwnTo(criteria,entryPoints);
        }
        rules[prop] = [rule];
    }

    /**
     *  Adds / extends interface rules for Class.
     * @param {class} ProtoClass
     * @param  {object|undefined} rules
     * @param  {boolean} isExpand
     * @return {object}
     */
    static addRules(ProtoClass, rules = {interfaces: [], protoProps: {}, staticProps: {}}, isExpand = false) {
        let interfaceData = this.initInterfaceData(ProtoClass);
        for (let prop of Object.getOwnPropertyNames(rules.protoProps)) {
            let rule = rules.protoProps[prop];
            if (isExpand) {
                this.expandAndSetRule(interfaceData.protoProps, prop, rule[0], ProtoClass);
            } else {
                this.compareAndSetRule(interfaceData.protoProps, prop, rule[0],ProtoClass);
            }
        }
        for (let prop of Object.getOwnPropertyNames(rules.staticProps)) {
            let rule = rules.staticProps[prop];
            if (isExpand) {
                this.expandAndSetRule(interfaceData.staticProps, prop, rule[0], ProtoClass,true);
            } else {
                this.compareAndSetRule(interfaceData.staticProps, prop, rule[0],ProtoClass,true);
            }
        }
        for (let val of rules.interfaces) {
            if (!interfaceData.interfaces.includes(val)) {
                interfaceData.interfaces.push(val);
            }
        }
        return interfaceData;
    }

    /**
     * Clears a class that is an interface from properties.
     * @param {class} ProtoClass The class to be cleaned
     */
    static clearClass(ProtoClass) {
        let proto = ProtoClass.prototype;
        for (let prop of Object.getOwnPropertyNames(proto)) {
            if (prop === 'constructor') {
                continue;
            }
            delete proto[prop];
        }
        for (let prop of Object.getOwnPropertyNames(ProtoClass)) {
            if (['length', 'name', 'prototype', 'isInterface', interfacesData].includes(prop)) {
                continue;
            }
            delete ProtoClass[prop];
        }
    }

    /**
     * sets the interface rules for the class, if the class is an interface, it will generate and combine the rules.
     * @param {class} ProtoClass
     * @param {object|undefined} rules
     * @returns {Object} new rules
     */
    static initRules(ProtoClass, rules) {
        let interfaceData = this.addRules(ProtoClass, rules);
        if (ProtoClass.hasOwnProperty('isInterface') && ProtoClass.isInterface && !interfaceData.interfaces.includes(ProtoClass)) {
            rules = this.generateRules(ProtoClass);
            interfaceData = this.addRules(ProtoClass, rules);
            this.clearClass(ProtoClass);
        }
        return interfaceData;
    }

    /**
     * Checks descriptors according to interface rules
     * @param descriptors See {@InterfaceManager.getDescriptors}
     * @param rules Rules interface for prototype to class or   for  properties to class (static)
     * @return {Array} errors stack
     */
    static validateDescriptors(descriptors, rules = {},isStatic=false) {
        let errors = [];
        let prefix=isStatic?'.':'#';

        //let sc=new SilentConsole();
        //sc.denyToSpeak();
        for (let prop of Object.getOwnPropertyNames(rules)) {
            let last = rules[prop].length - 1;
            if (!descriptors.hasOwnProperty(prop)) {
                if(!(rules[prop][0] instanceof CriteriaPropertyType) ||  
                    !rules[prop][0].types.includes('undefined') && !rules[prop][0].types.includes('mixed')){
                    let entryPoints = ['~'+rules[prop][last].criteria.getOwner().name+'~', `${prefix}${prop}`];
                    let error = new InterfaceError('ValidateMemberDeclared', {entryPoints});
                    errors.push(error);
                } 
                continue;
            }
            for (let rule of rules[prop]) {
                let entryPoints = ['~'+rule.criteria.getOwner().name+'~', `${prefix}${prop}`];
                if (rule.criteria instanceof CriteriaReactType) {
                    if (!('get' in descriptors[prop]) && !('set' in descriptors[prop])) {
                        let error = new InterfaceError('ValidateReactDeclared', {
                            entryPoints: entryPoints.concat(['get/set']),
                            react_type: 'getter/setter'
                        });
                        errors.push(error);
                        continue;
                    }
                    if (rule.criteria.get !== undefined && descriptors[prop].get === undefined) {
                        let error = new InterfaceError('ValidateReactDeclared', {
                            entryPoints: entryPoints.concat(['get']),
                            react_type: 'getter'
                        });
                        errors.push(error.message);
                    } else if (rule.criteria.get === undefined && descriptors[prop].get !== undefined) {
                        let error = new InterfaceError('ValidateReactDeclared', {
                            entryPoints: entryPoints.concat(['get']),
                            not: 'not',
                            react_type: 'getter'
                        });
                        errors.push(error);
                    }
                    if (rule.criteria.set !== undefined && descriptors[prop].set === undefined) {
                        let error = new InterfaceError('ValidateReactDeclared', {
                            entryPoints: entryPoints.concat(['set']),
                            react_type: 'setter'
                        });
                        errors.push(error);
                    } else if (rule.criteria.set === undefined && descriptors[prop].set !== undefined) {
                        let error = new InterfaceError('ValidateReactDeclared', {
                            entryPoints: entryPoints.concat(['set']),
                            not: 'not',
                            react_type: 'setter'
                        });
                        errors.push(error);
                    }
                } else if (rule.criteria instanceof CriteriaMethodType) {
                    if (typeof descriptors[prop].value !== 'function') {
                        let error = new InterfaceError('ValidateMethodDeclared', {entryPoints});
                        errors.push(error);
                    }
                } else if (rule.criteria instanceof CriteriaPropertyType) {
                    try {
                        rule.criteria.validate(descriptors[prop].value, entryPoints);
                    } catch (error) {
                        if (error instanceof InterfaceError) {
                            errors.push(error);
                        } else {
                            //sc.allowToSpeak();
                            throw error;
                        }
                    }
                }
            }
        }
        //sc.allowToSpeak();
        return errors;
    }

    /**
     * Checks the object for compliance with the rules (set of criteria)
     * @param {object|function} object
     * @param rules
     * @param {boolean} isStatic
     * @returns {Array}  If errors occur, it will display a set of errors
     */
    static validatePropsObject(object,rules,isStatic=false){
        let descs=this.getProtoDescriptors(object);
        return this.validateDescriptors(descs, rules,isStatic);
    }
    
    /**
     * Checks if the Class passes the established rules.
     * @param {class} ProtoClass  Constructor - Class
     * @param { {protoProps: {}, staticProps: {}}} rules {class,criteria}
     *          class- constructor Interface that generated the criteria
     *          criteria -  CriteriaPropertyType|CriteriaMethodType|CriteriaReactType []
     * @throws {InterfaceError} -  Throws if properties validation fails

     */
    static validatePropsClass(ProtoClass, rules = {protoProps: {}, staticProps: {}}) {
        let protoErrorsStack = this.validatePropsObject(ProtoClass.prototype, rules.protoProps);
        let staticErrorsStack = this.validatePropsObject(ProtoClass, rules.staticProps,true);
        let entryPoints = [ProtoClass.name];
        let errors = [];
        errors.splice(errors.length, 0, ...protoErrorsStack);
        errors.splice(errors.length, 0, ...staticErrorsStack);
        if (errors.length > 0) {
            try{
                new InterfaceError('Validate_BadMembers', {errors, entryPoints}).throw(true);
            }catch(e){
                if(e instanceof InterfaceError){
                    e.renderErrors();
                }
                throw e;
            }
        }
    }

    /**
     * Assembling  descriptors for the properties (functions and getter / setter) of a class.
     * Puts native descriptors in the sandbox, for verification purposes at runtime.
     * @param {object} descriptors  See {@InterfaceManager.getDescriptors}
     * @param {object} rules
     * @returns {object} new descriptors  See [method .InterfaceManager.getDescriptors]
     */
    static buildPropsDescriptors(descriptors, rules = {}) {
        for (let prop of Object.getOwnPropertyNames(rules)) {
            if (prop in descriptors) {
                for (let rule of rules[prop]) {
                    let entryPoints = [`${descriptors[prop].constructor.name}`, `~${rule.criteria.getOwner().name}~`, `.${prop}`];
                    if (rule.criteria instanceof CriteriaReactType) {
                        if (descriptors[prop].get !== undefined) {
                            //let entryPointsGet=entryPoints.concat(['get']);
                            let get = descriptors[prop].get;
                            if (descriptors[prop].isBuilt === true) {
                                get = get(Symbol.for('get_own_descriptor'));
                            }
                            descriptors[prop].get = function (key) {
                                if (key === Symbol.for('get_own_descriptor')) {
                                    return get;
                                }
                                let answer = get.call(this);
                                //rule.criteria.validateGet(answer,entryPointsGet);
                                try{
                                    rule.criteria.validateGet(answer, entryPoints);
                                }catch(e){
                                    if(e instanceof InterfaceError){
                                        e.renderErrors();
                                    }
                                    throw e;
                                }
                                return answer;
                            };
                        }
                        if (descriptors[prop].set !== undefined) {
                            //let entryPointsSet=entryPoints.concat(['set']);
                            let set = descriptors[prop].set;
                            if (descriptors[prop].isBuilt === true) {
                                set = set(Symbol.for('get_own_descriptor'));
                            }
                            descriptors[prop].set = function (value) {
                                if (value === Symbol.for('get_own_descriptor')) {
                                    return set;
                                }
                                //rule.criteria.validateSet(value,entryPointsSet);
                                try{
                                    rule.criteria.validateSet(value, entryPoints);
                                }catch(e){
                                    if(e instanceof InterfaceError){
                                        e.renderErrors();
                                    }
                                    throw e;
                                }
                                set.call(this, value);
                            }
                        }
                        if (descriptors[prop].get !== undefined || descriptors[prop].set !== undefined) {
                            descriptors[prop].isBuilt = true;
                        }
                    } else if (rule.criteria instanceof CriteriaMethodType) {
                        if (typeof descriptors[prop].value === 'function') {
                            let call = descriptors[prop].value;
                            if (descriptors[prop].isBuilt === true) {
                                call = call(Symbol.for('get_own_descriptor'));
                            }
                            descriptors[prop].value = function (...args) {
                                if (args[0] === Symbol.for('get_own_descriptor')) {
                                    return call;
                                }
                                try{
                                    rule.criteria.validateArguments(args, entryPoints);
                                }catch(e){
                                    if(e instanceof InterfaceError){
                                        e.renderErrors();
                                    }
                                    throw e;
                                }
                                let answer = call.call(this, ...args);
                                try{
                                    rule.criteria.validateReturn(answer, entryPoints);
                                }catch(e){
                                    if(e instanceof InterfaceError){
                                        e.renderErrors();
                                    }
                                    throw e;
                                }
                                return answer;
                            };
                            descriptors[prop].isBuilt = true;
                        }
                    }
                }
            }
        }
        return descriptors;
    }

    /**
     * Assembling class properties.
     * Methods and reactive properties will be executed in the sandbox (shell function).
     * A sandbox is a function in which a method or reactive function will be executed with
     * a check of the transmitted and returned parameters.
     * @param {function} ProtoClass
     * @param { {protoProps: {}, staticProps: {}} } rules
     */
    static buildPropsClass(ProtoClass, rules = {protoProps: {}, staticProps: {}}) {
        if (ProtoClass.hasOwnProperty('isInterface') && ProtoClass.isInterface) {
            return;
        }
        let proto = ProtoClass.prototype;
        let builtProps = {
            protoProps: [],
            staticProps: []
        };
        let descs = this.getDescriptors(proto);
        descs = this.buildPropsDescriptors(descs, rules.protoProps);
        for (let prop of Object.getOwnPropertyNames(descs)) {
            if (descs[prop].isBuilt === true) {
                builtProps.protoProps.push(prop);
            }
        }
        Object.defineProperties(proto, descs);
        let staticDescs = this.getDescriptors(ProtoClass);
        staticDescs = this.buildPropsDescriptors(staticDescs, rules.staticProps);
        for (let prop of Object.getOwnPropertyNames(staticDescs)) {
            if (staticDescs[prop].isBuilt === true) {
                builtProps.staticProps.push(prop);
            }
        }
        Object.defineProperties(ProtoClass, staticDescs);
        let interfacesData = this.initInterfaceData(ProtoClass);
        interfacesData.builtProps = builtProps;
    }
    

    /**
     * Forms its own properties based on prototypes.
     * If the property is not explicitly specified, but it exists in the prototype, it creates its own property based on the prototype descriptor.
     * @param ProtoClass The class in which the properties will be created.
     * @param {Array|undefined} extendProtoProps. List of properties for prototype. If not specified, then all properties of the inherited classes will be created.
     * @param {Array|undefined} extendsStaticProps . List of static properties. If not specified, then all properties of the inherited classes will be created.
     */
    static extendOwnPropertiesFromPrototypes(ProtoClass, extendProtoProps, extendsStaticProps) {
        let protoProps = Object.getOwnPropertyNames(ProtoClass.prototype);
        let staticProps = Object.getOwnPropertyNames(ProtoClass);
        let proto = ProtoClass.prototype;
        let protoDescs = this.getProtoDescriptors(ProtoClass.prototype);
        protoDescs = this.extractOwnDescriptors(protoDescs);
        for (let prop of Object.getOwnPropertyNames(protoDescs)) {
            let desc = protoDescs[prop];
            if (!protoProps.includes(prop) && (!Array.isArray(extendProtoProps) || extendProtoProps.includes(prop))) {
                Object.defineProperty(ProtoClass.prototype, prop, desc);
            }
        }
        let staticDescs = this.getProtoDescriptors(ProtoClass);
        staticDescs = this.extractOwnDescriptors(staticDescs);
        for (let prop of Object.getOwnPropertyNames(staticDescs)) {
            let desc = staticDescs[prop];
            if (!staticProps.includes(prop) && (!Array.isArray(extendsStaticProps) || extendsStaticProps.includes(prop))) {
                Object.defineProperty(ProtoClass, prop, desc);
            }
        }
    }

    /**
     *  Collects interface rules for a class if the class is not yet assembled, and collects class properties
     * @param ProtoClass
     * @param forceBuild
     * @returns {rules}
     */
    static buildInterface(ProtoClass, forceBuild = false) {
        /**/
        let self = this;
        let end_points = self.getAllEndPoints();
        let recurs = function (ProtoClass) {
            let proto = ProtoClass.prototype;
            if (end_points.includes(ProtoClass)) {
                return undefined;
            }
            end_points.splice(end_points.length, 0, ...self.getEndPoints(ProtoClass));
            if (self.hasInterfaceData(ProtoClass) && self.getInterfaceData(ProtoClass).isBuilt && !forceBuild) {
                return self.getInterfaceData(ProtoClass);
            }
            let rules = recurs(Object.getPrototypeOf(proto).constructor);
            rules = self.initRules(ProtoClass, rules);
            self.buildPropsClass(ProtoClass, rules);
            let interfacesData = self.getInterfaceData(ProtoClass); //rules;
            interfacesData.isBuilt = true;
            return interfacesData;
        };
        return recurs(ProtoClass);
    }

    /**
     * Extends the class with interfaces.
     * @param ProtoClass
     * @param {...class} RestInterfaces.
     *If the  RestInterfaces[0] of the array is "true" (boolean type), then  extends custom  interface for class  the specified interfaces
     * If the  RestInterfaces[1] of the array is "true" (boolean type), then apply extendClassFromOwnPrototypes before final assembly of ProtoClass. (then element[0] must be boolean type)
     */
    static extendInterfaces(ProtoClass, ...RestInterfaces) {
        let rules = this.buildInterface(ProtoClass);
        let isExtend = false;
        let isExpand = false;
        if (typeof RestInterfaces[0] === 'boolean') {
            isExpand = RestInterfaces[0];
            if (typeof RestInterfaces[1] === 'boolean') {
                isExtend = RestInterfaces[1];
                RestInterfaces.splice(1, 1);
            } else if (Array.isArray(RestInterfaces[1])) {

            }
            RestInterfaces.splice(0, 1);
        } else if (typeof RestInterfaces[1] === 'boolean') {
            RestInterfaces.splice(1, 1);
        }
        if (RestInterfaces.length > 0) {
            for (let Interface of RestInterfaces) {
                if (!rules.interfaces.includes(Interface)) {
                    let rulesInterface = this.buildInterface(Interface);
                    rules = this.addRules(ProtoClass, rulesInterface, isExpand);
                }
            }
            rules = this.getInterfaceData(ProtoClass);
            if (isExtend) {
                let staticProps = Object.getOwnPropertyNames(rules.staticProps);
                let protoProps = Object.getOwnPropertyNames(rules.protoProps);
                this.extendOwnPropertiesFromPrototypes(ProtoClass, protoProps, staticProps);
            }
            this.buildPropsClass(ProtoClass, rules);
        } else if (isExtend) {
            let staticProps = Object.getOwnPropertyNames(rules.staticProps);
            let protoProps = Object.getOwnPropertyNames(rules.protoProps);
            this.extendOwnPropertiesFromPrototypes(ProtoClass, protoProps, staticProps);
            this.buildPropsClass(ProtoClass, rules);
        }
        return rules;
    }
    static extendFuncInterfaces(ProtoClass, ...RestInterfaces){
        let rules = this.buildInterface(ProtoClass);
        let isExtend = false;
        let isExpand = false;
        if (typeof RestInterfaces[0] === 'boolean') {
            isExpand = RestInterfaces[0];
            if (typeof RestInterfaces[1] === 'boolean') {
                isExtend = RestInterfaces[1];
                RestInterfaces.splice(1, 1);
            } else if (Array.isArray(RestInterfaces[1])) {

            }
            RestInterfaces.splice(0, 1);
        } else if (typeof RestInterfaces[1] === 'boolean') {
            RestInterfaces.splice(1, 1);
        }
        if (RestInterfaces.length > 0) {
            for (let Interface of RestInterfaces) {
                if (!rules.interfaces.includes(Interface)) {
                    let rulesInterface = this.buildInterface(Interface);
                    rules = this.addRules(ProtoClass, rulesInterface, isExpand);
                }
            }
            rules = this.getInterfaceData(ProtoClass);
            if (isExtend) {
                let staticProps = Object.getOwnPropertyNames(rules.staticProps);
                let protoProps = Object.getOwnPropertyNames(rules.protoProps);
                this.extendOwnPropertiesFromPrototypes(ProtoClass, protoProps, staticProps);
            }
            this.buildPropsClass(ProtoClass, rules);
        } else if (isExtend) {
            let staticProps = Object.getOwnPropertyNames(rules.staticProps);
            let protoProps = Object.getOwnPropertyNames(rules.protoProps);
            this.extendOwnPropertiesFromPrototypes(ProtoClass, protoProps, staticProps);
            this.buildPropsClass(ProtoClass, rules);
        }
        return rules;
    }
    static expandInterfaces(ProtoClass, ...RestInterfaces) {
        if (RestInterfaces.length > 0) {
            if (typeof RestInterfaces[0] !== 'boolean') {
                RestInterfaces.splice(0, 0, true);
            } else {
                RestInterfaces[0] = true;
            }
        }
        InterfaceManager.extendInterfaces(ProtoClass, ...RestInterfaces);
    }

    /**
     * Implements Interfaces in the class
     * @param {class}ProtoClass
     * @param {class[]} RestInterfaces.  
     * If the  RestInterfaces[0] of the array is "true" (boolean type), then  extends custom  interface for class  the specified interfaces  
     * If the  RestInterfaces[1] of the array is "true" (boolean type), then apply extendClassFromOwnPrototypes before final assembly of ProtoClass. (then element[0] must be boolean type)  

     */
    static implementInterfaces(ProtoClass, ...RestInterfaces) {
        if (typeof ProtoClass !== 'function') {
            ProtoClass = Object.getPrototypeOf(ProtoClass).constructor;
        }
        

        //=[],isExpand=false
        if (Object.getOwnPropertyNames(ProtoClass).includes('isInterface') && ProtoClass.isInterface) {
            let message = `Cannot create instance from interface`;
            let entryPoints = [ProtoClass.name];
            new InterfaceError('ImplementInterfaceError', {message, entryPoints}).throw();
        }
        let rules = this.extendInterfaces(ProtoClass, ...RestInterfaces);
        this.validatePropsClass(ProtoClass, rules);
        return this.getInterfaceData(ProtoClass);
    }

    /**
     * We register endpoints globally.
     * Endpoints are classes where analysis stops along the prototype chain.
     * Analysis and assembly will not occur beyond the specified classes by prototypes.
     * @param {class[]} points
     */
    static addGlobalEndPoints(points = []) {
        this.end_points.splice(this.end_points.length, 0, ...points);
    }

    /**
     * We register endpoints globally.
     * Endpoints are classes where analysis stops along the prototype chain.
     * Analysis and assembly will not occur beyond the specified classes by prototypes.
     * Local points they apply only when using a specific class or interface
     * @param {class}  ProtoClass The class for which the endpoints will be set
     * @param {class[]} points
     */
    static setEndPoints(ProtoClass, points = []) {
        let interfacesData = this.initInterfaceData(ProtoClass);
        interfacesData.end_points = points;
    }

    /**
     * Returns endpoints for the class
     * @param {class} ProtoClass
     * @returns {class[]}
     */
    static getEndPoints(ProtoClass) {
        if (this.hasInterfaceData(ProtoClass)) {
            return this.getInterfaceData(ProtoClass).end_points;
        }
        return [];
    }

    /**
     * Returns the endpoints for the class along with the global points
     * @param {class} ProtoClass
     * @returns {class[]}
     */
    static getAllEndPoints(ProtoClass = undefined) {
        let end_points = Object.assign([], this.end_points);

        if (ProtoClass !== undefined) {
            end_points = end_points.concat(this.getEndPoints(ProtoClass));
        }
        return end_points;
    }

    /**
     * Checks if a class / object implements an interface
     * @param {object|class} object
     * @param {class} Interface
     * @returns {boolean}
     */
    static instanceOfInterface(object, Interface) {
        let ProtoClass = object;
        let to = typeof object;
        if (to === 'object' && object !== null) {
            ProtoClass = Object.getPrototypeOf(object).constructor;
        } else if (to !== 'function') {
            return false;
        }
        let interfacesData = InterfaceManager.getInterfaceData(ProtoClass);
        if (interfacesData === undefined) {
            return false;
        }
        for (let iface of interfacesData.interfaces) {
            if (typeof iface === 'function' && (iface === Interface || Interface.isPrototypeOf(iface))) {
                return true;
            }
        }
        return false;
    }

    /**
     * Freezing class properties
     * @param {class} ProtoClass
     * @param {Array} props the names of the properties to be frozen
     */
    static freezePropСlass(ProtoClass, props = []) {
        let descs = this.getDescriptors(ProtoClass.prototype);
        for (let desc of descs) {
            desc.writable = false;
            desc.configurable = false;
        }
        Object.defineProperties(ProtoClass.prototype, descs);

        descs = this.getDescriptors(ProtoClass);
        for (let desc of descs) {
            desc.writable = false;
            desc.configurable = false;
        }
        Object.defineProperties(ProtoClass, descs);
    }
 /*   static buildFunction(func,rule,isExpand){
        let end_points = self.getAllEndPoints();
        if(end_points.includes(func)){
            return func;
        }
        let entryPoints = [`function ${func.name}`, `~${rule.criteria.getOwner().name}~`];
        let ruleFunc=InterfaceManager.initInterfaceData(func);
        if (ruleFunc.isBuilt === true) {
            
        }
        if (isExpand) {
            this.expandAndSetRule(interfaceData.protoProps, prop, rule[0], ProtoClass);
        } else {
            
        }
       
        InterfaceManager.addRules();
        rule.isBuilt = true;
        let newFunc= function (...args) {
            if (args[0] === Symbol.for('get_own_descriptor')) {
                return func;
            }
            try{
                rule.criteria.validateArguments(args, entryPoints);
            }catch(e){
                if(e instanceof InterfaceError){
                    e.renderErrors();
                }
                throw e;
            }
            let answer = func.call(this, ...args);
            try{
                rule.criteria.validateReturn(answer, entryPoints);
            }catch(e){
                if(e instanceof InterfaceError){
                    e.renderErrors();
                }
                throw e;
            }
            return answer;
        };
    };
    static extendFuncInterfaces(func,...RestInterfaces){
        let rule=InterfaceManager.initInterfaceData(func);
        if(rule.isBuilt){
            func = func(Symbol.for('get_own_descriptor'));
        }
        for(let iFunc of RestInterfaces){
            if(!iFunc.isInterface && !InterfaceManager.hasInterfaceData(iFunc)){
                continue;
            } 
            let i_rule;
            if(iFunc.isInterface){
                if(!InterfaceManager.hasInterfaceData(iFunc)){
                    i_rule=InterfaceManager.initInterfaceData(iFunc).ownRule;
                    let criteria=iFunc();
                    if (typeof criteria !== 'object' || criteria === null) {
                        criteria = {};
                    }
                    if (criteria.options === undefined) {
                        criteria.options = {};
                    }
                    criteria.options = Object.assign({}, criteria.options, {
                        entryPoints,
                        owner: iFunc
                    });
                    criteria = new CriteriaMethodType(criteria);
                    i_rule.criteria=criteria;
                }
            }
            i_rule=InterfaceManager.getInterfaceData(iFunc);
            let buf={rule};
            this.compareAndSetRule(buf, 'rule', {i_rule});
            rule=buf.rule;
        }
        rule.isBuilt = true;
        let newFunc= {[func.name]:function (...args) {
            if (args[0] === Symbol.for('get_own_descriptor')) {
                return func;
            }
            try{
                rule.criteria.validateArguments(args, entryPoints);
            }catch(e){
                if(e instanceof InterfaceError){
                    e.renderErrors();
                }
                throw e;
            }
            let answer = func.call(this, ...args);
            try{
                rule.criteria.validateReturn(answer, entryPoints);
            }catch(e){
                if(e instanceof InterfaceError){
                    e.renderErrors();
                }
                throw e;
            }
            return answer;
        }}[func.name];
    }*/

}

/**
 * The global endpoints at which the analysis of objects along the prototype chain should stop
 * @type {Function[]} 
 */
InterfaceManager.end_points = [
    Object,
    Function,
    InterfaceError,
    InterfaceManager,
    CriteriaReactType,
    CriteriaMethodType,
    CriteriaPropertyType
];