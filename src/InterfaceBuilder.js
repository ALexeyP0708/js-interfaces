
import {
    CriteriaMethodType,
    CriteriaReactType,
    Descriptors,
    InterfaceData,
    InterfaceError,
    InterfaceRules,
    InterfaceValidator,
    InterfaceTools
} from './export.js';

let ownerSandbox=Symbol.for('ownerSandbox');
export class InterfaceBuilder{
    static isInterface(ProtoClass) {
        return ProtoClass.hasOwnProperty('isInterface') && ProtoClass.isInterface;
    }

    /**
     * 
     * @param func
     * @param {CriteriaMethodType} criteria
     * @param {string[]} entryPoints
     */
    static getSandbox(func,criteria,entryPoints=[]){
        func=this.getOwnerOfSandbox(func);
        let name=func.name??'';
        let sandbox ={[name]:function(...args){
            try{
                criteria.validateArguments(args,entryPoints);
            } catch(e){
                if(e instanceof InterfaceError){
                    e.renderErrors();
                }
                throw e;
            }
            let answer =func.call(this,...args);
            try {
                criteria.validateReturn(answer,entryPoints);
            } catch(e){
                if(e instanceof InterfaceError){
                    e.renderErrors();
                }
                throw e;
            }
            return answer;
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
                desc.value = desc.get[ownerSandbox];
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
                        if (descriptors[prop].get !== undefined) {
                            descriptors[prop].get=this.getSandbox(descriptors[prop].get,rule.criteria.get,entryPoints);
                        }
                        if (descriptors[prop].set !== undefined) {
                            descriptors[prop].set=this.getSandbox(descriptors[prop].set,rule.criteria.set,entryPoints);
                        }
                    } else if (rule.criteria instanceof CriteriaMethodType) {
                        if (typeof descriptors[prop].value === 'function') {
                            descriptors[prop].value=this.getSandbox(descriptors[prop].value,rule.criteria,entryPoints);
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
    static extendInterfaces(ProtoClass, ...RestInterfaces) {
        let rules = this.buildInterface(ProtoClass);
        let isExtend = false;
        if (typeof RestInterfaces[0] === 'boolean') {
            isExtend = RestInterfaces[0];
            RestInterfaces.splice(0, 1);
        } 
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
        return rules;
    }

    /**
     * Implements Interfaces in the class
     * @param {function}ProtoClass
     * @param {...function|boolean} [RestInterfaces]
     * If the  RestInterfaces[0] of the array is "true" (boolean type), then apply extendClassFromOwnPrototypes before final assembly of ProtoClass. (then element[0] must be boolean type)

     */
    static implementInterfaces(ProtoClass, ...RestInterfaces) {
        if (typeof ProtoClass !== 'function') {
            ProtoClass = Object.getPrototypeOf(ProtoClass).constructor;
            throw Error('Bab argument');
        }
        if (this.isInterface(ProtoClass)) {
            let message = `Cannot create instance from interface`;
            let entryPoints = [ProtoClass.name];
            new InterfaceError('ImplementInterfaceError', {message, entryPoints}).throw();
        }
        let rules = this.extendInterfaces(ProtoClass, ...RestInterfaces);
        InterfaceValidator.validateClass(ProtoClass, rules);
        return InterfaceData.get(ProtoClass);
    }


    /**
     * Forms its own properties based on prototypes.
     * If the property is not explicitly specified, but it exists in the prototype, it creates its own property based on the prototype descriptor.
     * @param ProtoClass The class in which the properties will be created.
     * @param {Array|undefined} extendProtoProps. List of properties for prototype. If not specified, then all properties of the inherited classes will be created.
     * @param {Array|undefined} extendsStaticProps . List of static properties. If not specified, then all properties of the inherited classes will be created.
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
        InterfaceManager.extendInterfaces(ProtoClass, ...RestInterfaces);
    }*/



}
InterfaceData.addGlobalEndPoints(InterfaceBuilder);