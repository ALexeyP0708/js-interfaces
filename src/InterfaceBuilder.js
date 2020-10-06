
import {
    CriteriaMethodType,
    CriteriaReactType,
    Descriptors,
    InterfaceData,
    InterfaceError,
    InterfaceRules,
    InterfaceValidator,
    InterfaceFuncBuilder, MirrorFuncInterface, CriteriaPropertyType
} from './export.js';

let ownerSandbox=Symbol.for('ownerSandbox');
export class InterfaceBuilder{
    static isInterface(ProtoClass) {
        return ProtoClass.hasOwnProperty('isInterface') && ProtoClass.isInterface;
    }
    static runSandbox(func,args,criteria,entryPoints=[]){
        try{
            let rules=criteria.validateArguments(args,entryPoints);
            for(let key=0; key< rules.length; key++){
                if(typeof args[key]!=='function'){continue;}
                let rule=rules[key].types;
                if(rule instanceof CriteriaMethodType &&rule.isBuildSandbox!==false){
                    args[key]=this.generateSandbox(args[key],rule,entryPoints.concat(`arguments[${key}].call()`));
                }
            }
        } catch(e){
            if(e instanceof InterfaceError){
                e.renderErrors();
            }
            throw e;
        }
        let answer =func.call(this,...args);
        try {
            let rule=criteria.validateReturn(answer,entryPoints).types;
            if( typeof answer==='function' && rule instanceof CriteriaMethodType && rule.isBuildSandbox!==false){
                answer=this.generateSandbox(answer,rule,entryPoints.concat(`return.call()`));
            }
        } catch(e){
            if(e instanceof InterfaceError){
                e.renderErrors();
            }
            throw e;
        }
        return answer;
    }
    
    /**
     * 
     * @param func
     * @param {CriteriaMethodType} criteria
     * @param {string[]} entryPoints
     */
    static generateSandbox(func,criteria,entryPoints=[]){
        func=this.getOwnerOfSandbox(func);
        entryPoints=entryPoints.concat([]);
        let name=func.name??'';
        let self=this;
        let sandbox ={[name](...args){
            return self.runSandbox(func,args,criteria,entryPoints);
        }}[func.name];
        Object.defineProperty(sandbox,ownerSandbox,{
            configurable:true,
            writable:true,
            value:func
        });
        return sandbox;
    }
    
    static getOwnerOfSandbox(func){
        if(this.isSandbox(func)){
            func=func[ownerSandbox];
        }
        return func;
    }
    static isSandbox(func){
        return typeof func==='function' && ownerSandbox in func && typeof func[ownerSandbox]==='function';
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
            if (desc.get !== undefined && typeof desc.get[ownerSandbox] === 'function') {
                desc.get = desc.get[ownerSandbox];
            }
            if (desc.set !== undefined && typeof desc.set[ownerSandbox] === 'function') {
                desc.set = desc.get[ownerSandbox];
            }
            if (desc.value !== undefined && typeof desc.value[ownerSandbox] === 'function') {
                desc.value = desc.value[ownerSandbox];
            }
        }
        return descriptors;
    }
    /**
     * Assembling  descriptors for the properties (functions and getter / setter) of a class.
     * Puts native descriptors in the sandbox, for verification purposes at runtime.
     * @param {object} descriptors  See {@Descriptors.get}
     * @param {object} rules
     * @returns {object} new descriptors  See [method .Descriptors.get]
     */
    static buildDescriptors(descriptors, rules = {}) {
        for (let prop of Object.getOwnPropertyNames(rules)) {
            if (prop in descriptors) {
                for (let rule of rules[prop]) {
                    let entryPoints = [`${descriptors[prop].constructor.name}`, `~${rule.criteria.getOwner().name}~`, `.${prop}`];
                    if (rule.criteria instanceof CriteriaReactType) {
                        if (
                            descriptors[prop].get !== undefined &&
                            rule.criteria.get.isBuildSandbox !== false &&
                            rule.criteria.get.return.types.length > 0 &&
                            !rule.criteria.get.return.types.includes('mixed')
                        ) {
                            descriptors[prop].get = this.generateSandbox(descriptors[prop].get, rule.criteria.get, entryPoints);

                        }
                        if (
                            descriptors[prop].set !== undefined &&
                            rule.criteria.set.isBuildSandbox !== false &&
                            rule.criteria.set['arguments'].length > 0 &&
                            rule.criteria.set['arguments'][0].types.length > 0 &&
                            !rule.criteria.set['arguments'][0].types.includes('mixed')
                        ) {
                            descriptors[prop].set = this.generateSandbox(descriptors[prop].set, rule.criteria.set, entryPoints);
                        }
                    } else if (
                        rule.criteria instanceof CriteriaMethodType &&
                        rule.criteria.isBuildSandbox !== false &&
                        typeof descriptors[prop].value === 'function' &&
                        descriptors[prop].value.prototype === undefined
                    ) {
                        let check = false;
                        for (let arg of rule.criteria['arguments']) {
                            if (
                                arg instanceof CriteriaPropertyType && arg.types.length > 0 && !arg.types.includes('mixed') ||
                                arg instanceof CriteriaMethodType
                            ) {
                                check = true;
                                break;
                            }
                        }
                        if (
                            check ||
                            rule.criteria.return instanceof CriteriaPropertyType &&
                            rule.criteria.return.types.length > 0 &&
                            !rule.criteria.return.types.includes('mixed') ||
                            rule.criteria.return instanceof CriteriaMethodType
                        ) {
                            descriptors[prop].value = this.generateSandbox(descriptors[prop].value, rule.criteria, entryPoints);
                        }
                    }
                }
            }
        }
        return descriptors;
    }
    /**
     * Assembling object properties.
     * Methods and reactive properties will be executed in the sandbox (shell function).
     * A sandbox is a function in which a method or reactive function will be executed with
     * a check of the transmitted and returned parameters.
     * @param {object|function} object An object whose properties will be collected in the sandbox.
     * @param { object } [rules]
     * @returns { Array } properties names 
     */
    static buildObjects(object,rules = {}){
        let descs = Descriptors.get(object);
        let builtProps=[];
        descs = this.buildDescriptors(descs, rules);
        Object.defineProperties(object, descs);
        return builtProps;
    }
    
    /**
     * Assembling class properties.
     * Methods and reactive properties will be executed in the sandbox (shell function).
     * A sandbox is a function in which a method or reactive function will be executed with
     * a check of the transmitted and returned parameters.
     * @param {function} ProtoClass
     * @param { InterfaceData } [rules]
     */
    static buildClass(ProtoClass, rules = new InterfaceData) {
        if (this.isInterface(ProtoClass)) {
            return;
        }
        let builtProps = {
            protoProps: [],
            staticProps: []
        };
        builtProps.protoProps=this.buildObjects(ProtoClass.prototype,rules.protoProps);
        builtProps.staticProps=this.buildObjects(ProtoClass,rules.staticProps);
    }
    /**
     *  Collects interface rules for a class if the class is not yet assembled, and collects class properties
     * @param ProtoClass
     * @param forceBuild
     * @returns {InterfaceData}
     */
    static buildInterface(ProtoClass, forceBuild = false) {
        let self = this;
        let end_points = InterfaceData.getAllEndPoints();
        let recurs = function (ProtoClass) {
            let proto = ProtoClass.prototype;
            if (end_points.includes(ProtoClass)) {
                return undefined;
            }
            end_points.splice(end_points.length, 0, ...InterfaceData.getEndPoints(ProtoClass));
            if (InterfaceData.has(ProtoClass) && InterfaceData.get(ProtoClass).isBuilt && !forceBuild) {
                return InterfaceData.get(ProtoClass);
            }
            let rules = recurs(Object.getPrototypeOf(proto).constructor);
            rules = InterfaceRules.init(ProtoClass, rules);
            self.buildClass(ProtoClass, rules);
            let interfaceData = InterfaceData.get(ProtoClass);
            interfaceData.isBuilt = true;
            return interfaceData;
        };
        return recurs(ProtoClass);
    }
    /**
     * Extends the class with interfaces.
     * @param ProtoClass
     * @param {...function|boolean} [RestInterfaces]
     * If the  RestInterfaces[0] of the array is "true" (boolean type), then apply extendClassFromOwnPrototypes before final assembly of ProtoClass. (then element[0] must be boolean type)
     */
    static extendAfter(ProtoClass, ...RestInterfaces) {
        let rules = this.buildInterface(ProtoClass);
        let isExtend = false;
        if (typeof RestInterfaces[0] === 'boolean') {
            isExtend = RestInterfaces[0];
            RestInterfaces.splice(0, 1);
        }
        try {
            if (RestInterfaces.length > 0) {
                for (let Interface of RestInterfaces) {
                    if (!rules.interfaces.includes(Interface)) {
                        let rulesInterface = this.buildInterface(Interface);
                        rules = InterfaceRules.add(ProtoClass, rulesInterface);
                    }
                }
                rules = InterfaceData.get(ProtoClass);
                if (isExtend) {
                    let staticProps = Object.getOwnPropertyNames(rules.staticProps);
                    let protoProps = Object.getOwnPropertyNames(rules.protoProps);
                    this.extendOwnPropertiesFromPrototypes(ProtoClass, protoProps, staticProps);
                }
                this.buildClass(ProtoClass, rules);
            } else if (isExtend) {
                let staticProps = Object.getOwnPropertyNames(rules.staticProps);
                let protoProps = Object.getOwnPropertyNames(rules.protoProps);
                this.extendOwnPropertiesFromPrototypes(ProtoClass, protoProps, staticProps);
                this.buildClass(ProtoClass, rules);
            }
        } catch(e){
            if(e instanceof InterfaceError){
                e.renderErrors();
            }
            throw e;
        }
        return rules;
    }
    static extendBefore(ProtoClass, ...RestInterfaces) {
        let firstRules = this.buildInterface(ProtoClass);
        let isExtend = false;
        if (typeof RestInterfaces[0] === 'boolean') {
            isExtend = RestInterfaces[0];
            RestInterfaces.splice(0, 1);
        }
        let rules = firstRules;
        try {
            if (RestInterfaces.length > 0) {
                rules = new InterfaceData();
                rules.owner=ProtoClass;
                for (let Interface of RestInterfaces) {
                    if (!rules.interfaces.includes(Interface)) {
                        let rulesInterface = this.buildInterface(Interface);
                        rules = InterfaceRules.add(rules, rulesInterface);
                    }
                }
                rules = InterfaceRules.add(rules, firstRules);
                InterfaceData.set(ProtoClass,rules);
                rules =InterfaceData.get(ProtoClass);
            }  
            if (isExtend) {
                let staticProps = Object.getOwnPropertyNames(rules.staticProps);
                let protoProps = Object.getOwnPropertyNames(rules.protoProps);
                this.extendOwnPropertiesFromPrototypes(ProtoClass, protoProps, staticProps);
            }
            if(RestInterfaces.length > 0 ||isExtend){
                this.buildClass(ProtoClass, rules);
            }
        } catch(e){
            if(e instanceof InterfaceError){
                e.renderErrors();
            }
            throw e;
        }
        return rules;
    }

    /**
     * @borrows extendAfter
     */
    static extend (ProtoClass, ...RestInterfaces){
        if(InterfaceBuilder.isInterface(ProtoClass)){
            return this.extendBefore(ProtoClass, ...RestInterfaces);
        }
        return this.extendAfter(ProtoClass, ...RestInterfaces);
    }
    /**
     * Implements Interfaces in the class
     * @param {function}ProtoClass
     * @param {...function|boolean} [RestInterfaces]
     * If the  RestInterfaces[0] of the array is "true" (boolean type), then apply extendClassFromOwnPrototypes before final assembly of ProtoClass. (then element[0] must be boolean type)

     */
    static implement(ProtoClass, ...RestInterfaces) {
        if (typeof ProtoClass !== 'function' || ProtoClass.prototype===undefined ) {
            //ProtoClass = Object.getPrototypeOf(ProtoClass).constructor;
            throw Error('Bab argument');
        }
        if (this.isInterface(ProtoClass)) {
            let message = `Cannot create instance from interface`;
            let entryPoints = [ProtoClass.name];
            new InterfaceError('ImplementInterfaceError', {message, entryPoints}).throw();
        }
        let rules = this.extend(ProtoClass, ...RestInterfaces);
        InterfaceValidator.validateClass(ProtoClass, rules);
        return InterfaceData.get(ProtoClass);
    }


    /**
     * Forms its own properties based on prototypes.
     * If the property is not explicitly specified, but it exists in the prototype, it creates its own property based on the prototype descriptor.
     * @param ProtoClass The class in which the properties will be created.
     * @param {Array|undefined} extendProtoProps. List of properties for prototype. If not specified, then all properties of the inherited classes will be created.
     * @param {Array|undefined} extendStaticProps . List of static properties. If not specified, then all properties of the inherited classes will be created.
     */
    static extendOwnPropertiesFromPrototypes(ProtoClass, extendProtoProps, extendStaticProps) {
        let protoProps = Object.getOwnPropertyNames(ProtoClass.prototype);
        let staticProps = Object.getOwnPropertyNames(ProtoClass);
        let protoDescs = Descriptors.getAll(ProtoClass.prototype);
        protoDescs = this.extractOwnDescriptors(protoDescs);
        let writeDescs={};
        if(extendProtoProps===undefined){
            extendProtoProps=protoProps;
        }
        extendProtoProps.forEach((prop,k)=>{
            if(protoDescs[prop]!==undefined && !protoProps.includes(prop)){
                writeDescs[prop]=protoDescs[prop];
            }
        });
        writeDescs = this.extractOwnDescriptors(writeDescs);
        Object.defineProperties(ProtoClass.prototype, writeDescs);
       
        let staticDescs = Descriptors.getAll(ProtoClass);
        writeDescs={};
        if(extendStaticProps===undefined){
            extendStaticProps=staticProps;
        }
        extendStaticProps.forEach((prop,k)=>{
            if(staticDescs[prop]!==undefined && !staticProps.includes(prop)){
                writeDescs[prop]=staticDescs[prop];
            }
        });
        writeDescs = this.extractOwnDescriptors(writeDescs);
        Object.defineProperties(ProtoClass, writeDescs);
    }

/*

    
    static expandInterfaces(ProtoClass, ...RestInterfaces) {
        if (RestInterfaces.length > 0) {
            if (typeof RestInterfaces[0] !== 'boolean') {
                RestInterfaces.splice(0, 0, true);
            } else {
                RestInterfaces[0] = true;
            }
        }
        InterfaceManager.extend(ProtoClass, ...RestInterfaces);
    }*/



}
InterfaceData.addGlobalEndPoints(InterfaceBuilder);

