import {InterfaceError,CriteriaMethodType,CriteriaReactType,CriteriaPropertyType} from "./export.js";

export class InterfaceManager {

    /**
     *  returns interface data for the class
     * @param {class} ProtoClass
     * @returns {object|undefined}
     */
    static getInterfaceData(ProtoClass){
        if(ProtoClass.hasOwnProperty('interfaces')){
            return ProtoClass.interfaces;
        }
        return undefined;
    }

    /**
     * set interface data for the class
     * @param {class} ProtoClass
     * @param {object} data
     */
    static setInterfaceData(ProtoClass,data){
        ProtoClass.interfaces=data;
    }

    /**
     * checks if interface data is installed
     * @param ProtoClass
     * @returns {boolean}
     */
    static hasInterfaceData(ProtoClass){
        return ProtoClass.hasOwnProperty('interfaces');
    }

    /**
     * initializes interface data for the class
     * @param ProtoClass
     * @returns {Object}
     */
    static initInterfaceData(ProtoClass){
        if(!this.hasInterfaceData(ProtoClass)){
            this.setInterfaceData(ProtoClass,{
                isBuilt:false,
                protoProps:{},
                staticProps:{},
                builtProps:{
                    protoProps:[],
                    staticProps:[],
                },
                end_points:[]
            });
        }
        return this.getInterfaceData(ProtoClass);
    }

    /**
     * Generates object descriptors.
     * @param {object|class} object
     * @returns {object} Descriptor format
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
*      }
     */
    static getDescriptors(object){
        let descriptors=Object.getOwnPropertyDescriptors(object);
        let builtProps={
                protoProps:[],
                staticProps:[]
            };
        let ProtoClass=function(){};
        if(typeof object ==='function'){
            delete descriptors.length;
            delete descriptors.name;
            delete descriptors.prototype;
            delete descriptors.isInterface;
            delete descriptors.interfaces;
            ProtoClass=object;
        } else {
            if(descriptors.hasOwnProperty('constructor')){
                ProtoClass=object.constructor;
                delete descriptors.constructor;
            }
        }
        builtProps=this.hasInterfaceData(ProtoClass)
            ?this.getInterfaceData(ProtoClass).builtProps
            :builtProps;

        for(let prop in descriptors){
            descriptors[prop].isBuilt=false;
            if(typeof object ==='function'){
                descriptors[prop].constructor=object;

                if(builtProps.staticProps.includes(prop)){
                    descriptors[prop].isBuilt=true;
                }
            } else {
                descriptors[prop].constructor=object.constructor;
                if(builtProps.protoProps.includes(prop)){
                    descriptors[prop].isBuilt=true;
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
     */
    static getProtoDescriptors(object){
        let descriptors={};
        let proto=object;
        let end_points=this.getAllEndPoints();
        do {
            let proto_descriptors=this.getDescriptors(proto);
            if(proto.hasOwnProperty('constructor')){
                end_points.splice(end_points.length,0,...this.getAllEndPoints(proto.constructor));
            }
            for(let pd in proto_descriptors){
                if(!(pd in descriptors)){
                    descriptors[pd]= proto_descriptors[pd];
                }
            }
            proto=Object.getPrototypeOf(proto);
        } while( !(proto.hasOwnProperty('constructor') && end_points.includes(proto.constructor)));
        return descriptors;
    }

    /**
     * If the property descriptor has isBuilt = true (the property is assembled),
     * then it extracts the original descriptor from the assembly.
     * @param descriptors
     * @returns {descriptors}
     */
    static extractOwnDescriptors(descriptors={}){
        for(let prop in descriptors){
            let desc=descriptors[prop];
            if(desc.isBuilt===true){
                if(desc.get!==undefined){
                    desc.get=desc.get(Symbol.for('get_own_descriptor'));
                }
                if(desc.set!==undefined){
                    desc.set=desc.set(Symbol.for('get_own_descriptor'));
                }
                if(desc.value!==undefined && typeof desc.value === 'function'){
                    desc.value=desc.value(Symbol.for('get_own_descriptor'));
                }
            }
            delete desc.isBuilt;
        }
        return descriptors;
    }

    /**
     * Generates interface rules from descriptors of the Class that is the interface.
     * @param {object}descriptors See {@InterfaceManager.getDescriptors}
     * @param {Array} entryPointsBuf  Entry points. Indicate the labels where the method was called,
     * so that in case of an error, refer to them.
     * @returns {object} rules interface
     */
    static generateDescriptorsRules(descriptors,entryPointsBuf=['not_defined']){
        let rules={};
        for (let prop of Object.getOwnPropertyNames(descriptors)){
            let desc=descriptors[prop];
            let entryPoints=entryPointsBuf.concat([descriptors[prop].constructor.name,`.${prop}`]);
            if('get' in desc || 'set' in desc){
                let getCriteria;
                if( desc.get!==undefined){
                    getCriteria=desc.get();
                    if(typeof getCriteria !=='object' || getCriteria===null){
                        getCriteria={};
                    }
                }
                let setCriteria;
                if(desc.set!==undefined){
                    setCriteria={};
                    let rtrn=desc.set(setCriteria);
                    if(rtrn!==undefined){
                        setCriteria=rtrn;
                    }
                }
                let criteria=new CriteriaReactType(getCriteria,setCriteria,{entryPoints});
                this.expandAndSetRule(rules,prop,{class:descriptors[prop].constructor,criteria});
            } else if(typeof desc.value === 'function'){
                let methodRules=desc.value();
                if(typeof methodRules!=='object' || methodRules===null){
                    methodRules={};
                }
                if(!Array.isArray(methodRules)){
                    methodRules=[methodRules];
                }
                for(let methodRule of methodRules){
                    if(!(methodRule instanceof CriteriaMethodType)){
                        methodRule= new CriteriaMethodType(methodRule,{},{entryPoints});
                    }
                    this.expandAndSetRule(rules,prop,{class:descriptors[prop].constructor,criteria:methodRule});
               }
            } else {
                let propertyRules=desc.value;
                if(typeof propertyRules!=='object' || propertyRules===null){
                    propertyRules={};
                }
                if(!Array.isArray(propertyRules)){
                    propertyRules=[propertyRules];
                }
                for(let propertyRule of propertyRules){
                    if(!(propertyRule instanceof CriteriaPropertyType)){
                        propertyRule= new CriteriaPropertyType(propertyRule,[],{entryPoints});
                    }
                    this.expandAndSetRule(rules,prop,{class:descriptors[prop].constructor,criteria:propertyRule});
                }
            }
        }
        return rules;
    }

    /**
     *  Generates interface rules from properties of the Class that is the interface.
     * @param ProtoClass
     * @returns {{protoProps: {}, staticProps: {}}}
     */
    static generateRules(ProtoClass){
        let rules={
            protoProps:{},
            staticProps:{}
        };
        let proto=ProtoClass.prototype;
        if(ProtoClass.hasOwnProperty('isInterface') && ProtoClass.isInterface){
            let descriptors=this.getDescriptors(proto);
            rules.protoProps=this.generateDescriptorsRules(descriptors,[]);
            let staticDescriptors=this.getDescriptors(ProtoClass);
            rules.staticProps=this.generateDescriptorsRules(staticDescriptors,['static']);
        }
        return rules;
    }

    /**
     * Expands the rules for a property from new rules
     * @param rules
     * @param prop
     * @param rule
     */
    static  expandAndSetRule(rules,prop,rule){
        if(prop in rules){
            let entryPoints=[`${rules[prop][0].class.name}`,`${rule.class.name}`,`.${prop}`];
            rule.criteria.expand( rules[prop][0].criteria,entryPoints);
        }
        rules[prop]=[rule];
    }
    static compareAndSetRule(rules,prop,rule){
        if(prop in rules){
            let entryPoints=[`${rules[prop][0].class.name}`,`${rule.class.name}`,`.${prop}`];
            rules[prop][0].criteria.compare(rule.criteria,entryPoints);
        }
        rules[prop]=[rule];
    }
    /**
     *  Adds / extends interface rules for Class.
     * @param {class} ProtoClass
     * @param  {object|undefined} rules
     * @param  {boolean} isExpand
     */
    static addRules(ProtoClass,rules={protoProps:{},staticProps:{}},isExpand=false){
        let interfaces=this.initInterfaceData(ProtoClass);
        for(let prop of Object.getOwnPropertyNames(rules.protoProps)){
            let rule=rules.protoProps[prop];
            if(isExpand){
                this.expandAndSetRule(interfaces.protoProps,prop,rule[0]);
            }else{
                this.compareAndSetRule(interfaces.protoProps,prop,rule[0]);
            }
        }
        for(let prop of Object.getOwnPropertyNames(rules.staticProps)){
            let rule=rules.staticProps[prop];
            if(isExpand){
                this.expandAndSetRule(interfaces.staticProps,prop,rule[0]);
            } else {
                this.compareAndSetRule(interfaces.staticProps,prop,rule[0]);
            }
        }
    }

    /**
     * Clears a class that is an interface from properties.
     * @param ProtoClass
     */
    static clearClass(ProtoClass){
        let proto=ProtoClass.prototype;
        for(let prop of Object.getOwnPropertyNames(proto)){
            if(prop==='constructor'){continue;}
            delete proto[prop];
        }
        for(let prop of Object.getOwnPropertyNames(ProtoClass)){
            if(['length','name','prototype','isInterface','interfaces'].includes(prop)){continue;}
            delete ProtoClass[prop];
        }
    }

    /**
     * sets the interface rules for the class, if the class is an interface, it will generate and combine the rules.
     * @param {class} ProtoClass
     * @param {object|undefined} rules
     * @returns {Object} new rules
     */
    static initRules(ProtoClass,rules=undefined) {
        this.addRules(ProtoClass, rules);
        if(ProtoClass.hasOwnProperty('isInterface') && ProtoClass.isInterface){
           rules=this.generateRules(ProtoClass);
           this.addRules(ProtoClass, rules);
           this.clearClass(ProtoClass);
        }
        return this.getInterfaceData(ProtoClass);
    }

    /**
     * Checks descriptors according to interface rules
     * @param descriptors See {@InterfaceManager.getDescriptors}
     * @param rules Rules interface for prototype to class or   for  properties to class (static)
     * @param entryPointsBuf
     * @return {Array} errors stack
     */
    static validateDescriptors(descriptors,rules={},entryPointsBuf=['not_defined']){
        let errorsStack=[];
        for(let prop of Object.getOwnPropertyNames(rules)){
            let last=rules[prop].length-1;
            if(!Object.getOwnPropertyNames(descriptors).includes(prop)){
                let message=`The property must be declared.`;
                let entryPoints=entryPointsBuf.concat([rules[prop][last].class.name,`.${prop}`]);
                let error=new InterfaceError('ErrorType',{entryPoints,message});
                errorsStack.push(error);
                continue;
            }
            for(let rule of rules[prop]){
                let entryPoints=entryPointsBuf.concat([descriptors[prop].constructor.name,`.${prop}`]);
                if(rule.criteria instanceof CriteriaReactType){
                    let entryPointsSet=entryPoints.concat(['set']);
                    let entryPointsGet=entryPoints.concat(['get']);
                    if(!('get' in descriptors[prop]) && !('set' in descriptors[prop])){
                        let message=` The property  must be the getter/setter.`;
                        let error =new InterfaceError('ErrorType',{entryPoints,message});
                        errorsStack.push(error);
                        continue;
                    }
                    if(rule.criteria.get!==undefined && descriptors[prop].get===undefined){
                        let message=`The property must be the getter`;
                        let error =new InterfaceError('ErrorType',{entryPoints:entryPointsGet,message});
                        errorsStack.push(error.message);
                    } else if(rule.criteria.get===undefined && descriptors[prop].get!==undefined){
                        let message=`The property not must be the getter.`;
                        let error =new InterfaceError('ErrorType',{entryPoints:entryPointsGet,message});
                        errorsStack.push(error);
                    }
                    if(rule.criteria.set!==undefined && descriptors[prop].set===undefined){
                        let message=`The property must be the setter.`;
                        let error =new InterfaceError('ErrorType',{entryPoints:entryPointsSet,message});
                        errorsStack.push(error);
                    } else if(rule.criteria.set===undefined && descriptors[prop].set!==undefined){
                        let message=`The property  not must be the setter.`;
                        let error =new InterfaceError('ErrorType',{entryPoints:entryPointsSet,message});
                        errorsStack.push(error);
                    }
                } else if(rule.criteria instanceof CriteriaMethodType){
                    if(typeof descriptors[prop].value!=='function'){
                        let message=`The property must be Function.`;
                        //errorsStack[prop].errorDeclaredFunction.push(message);
                        let error =new InterfaceError('ErrorType',{entryPoints,message});
                        errorsStack.push(error);
                    }
                } else if(rule.criteria instanceof CriteriaPropertyType){
                    try {
                        rule.criteria.validate(descriptors[prop].value,entryPoints);
                    }catch (error) {
                        if(error instanceof  InterfaceError){
                            errorsStack.push(error);
                        } else {
                            throw error;
                        }
                    }
                }
            }
        }
        return errorsStack;
    }
    /**
     * Checks if the Class passes the established rules.
     * @param {class} ProtoClass  Constructor - Class
     * @param {object} rules {class,criteria}
     *          class- constructor Interface that generated the criteria
     *          criteria -  CriteriaPropertyType|CriteriaMethodType|CriteriaReactType []
     * @param {Array} errorsStack
     * @throws {InterfaceError} -  Throws if properties validation fails

     */
    static validatePropsClass(ProtoClass,rules={protoProps:{},staticProps:{}},errorsStack=[]){
        let proto=ProtoClass.prototype;
        let descs=this.getProtoDescriptors(proto);
        let staticDescs=this.getProtoDescriptors(ProtoClass);
        let protoErrorsStack=this.validateDescriptors(descs,rules.protoProps,[ProtoClass.name]);
        let staticErrorsStack =this.validateDescriptors(staticDescs,rules.staticProps,['static',ProtoClass.name]);
        //errorsStack=errorsStack.concat(protoErrorsStack,staticErrorsStack);
        errorsStack.splice(errorsStack.length,0,...protoErrorsStack);
        errorsStack.splice(errorsStack.length,0,...staticErrorsStack);
        if(errorsStack.length>0){
            let message="\n";
            for(let error of errorsStack){
                message+=error.message+"\n";
            }
            //let message="\n"+errorsStack.message.join("\n");
            throw new InterfaceError('ErrorType',{message});
        }
    }

    /**
     * Assembling  descriptors for the properties (functions and getter / setter) of a class.
     * Puts native descriptors in the sandbox, for verification purposes at runtime.
     * @param descriptors  See {@InterfaceManager.getDescriptors}
     * @param rules
     * @param entryPointsBuf
     * @returns {object} new descriptors  See {@InterfaceManager.getDescriptors}
     */
    static buildPropsDescriptors(descriptors,rules={},entryPointsBuf=['not_defined']){
        for(let prop of Object.getOwnPropertyNames(rules)){
            if(prop in descriptors){
                for(let rule of rules[prop]){
                    let entryPoints=entryPointsBuf.concat([`${rule.class.name}`,`${descriptors[prop].constructor.name}`,`.${prop}`]);
                    if(rule.criteria instanceof CriteriaReactType){
                        if(descriptors[prop].get!==undefined){
                            let entryPointsGet=entryPoints.concat(['get']);
                            let get=descriptors[prop].get;
                            if(descriptors[prop].isBuilt===true){
                                get=get(Symbol.for('get_own_descriptor'));
                            }
                            descriptors[prop].get=function(key){
                                if(key===Symbol.for('get_own_descriptor')){
                                    return get;
                                }
                                let answer=get.call(this);
                                rule.criteria.validateGet(answer,entryPointsGet);
                                return answer;
                            };
                        }
                        if(descriptors[prop].set!==undefined){
                            let entryPointsSet=entryPoints.concat(['set']);
                            let set=descriptors[prop].set;
                            if(descriptors[prop].isBuilt===true){
                                set=set(Symbol.for('get_own_descriptor'));
                            }
                            descriptors[prop].set=function(value){
                                if(value===Symbol.for('get_own_descriptor')){
                                    return set;
                                }
                                rule.criteria.validateSet(value,entryPointsSet);
                                set.call(this,value);
                            }
                        }
                        if(descriptors[prop].get!==undefined || descriptors[prop].set!==undefined){
                            descriptors[prop].isBuilt=true;
                        }
                    } else if(rule.criteria instanceof CriteriaMethodType){
                        if(typeof descriptors[prop].value==='function'){
                            let call=descriptors[prop].value;
                            if(descriptors[prop].isBuilt===true){
                                call=call(Symbol.for('get_own_descriptor'));
                            }
                            descriptors[prop].value=function(...args) {
                                if(args[0]===Symbol.for('get_own_descriptor')){
                                    return call;
                                }
                                rule.criteria.validateArguments(args, entryPoints);
                                let answer = call.call(this, ...args);
                                rule.criteria.validateReturn(answer, entryPoints);
                                return answer;
                            };
                            descriptors[prop].isBuilt=true;
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
     * @param rules
     */
    static buildPropsClass(ProtoClass,rules={protoProps:{},staticProps:{}}){
        let proto=ProtoClass.prototype;
        let builtProps={
                protoProps:[],
                staticProps:[]
            };
        let descs=this.getDescriptors(proto);
        descs=this.buildPropsDescriptors(descs,rules.protoProps,[]);
        for(let prop of Object.getOwnPropertyNames(descs)){
            if(descs[prop].isBuilt===true){
                builtProps.protoProps.push(prop);
            }
        }
        Object.defineProperties(proto,descs);
        let staticDescs=this.getDescriptors(ProtoClass);
        staticDescs=this.buildPropsDescriptors(staticDescs,rules.staticProps,['static']);
        for(let prop of Object.getOwnPropertyNames(staticDescs)){
            if(staticDescs[prop].isBuilt===true){
                builtProps.staticProps.push(prop);
            }
        }
        Object.defineProperties(ProtoClass,staticDescs);
        let interfaces=this.initInterfaceData(ProtoClass);
        interfaces.builtProps=builtProps;
    }

    /**
     * Forms its own properties based on prototypes.
     *  If the property is not explicitly specified, but it exists in the prototype, it creates its own property based on the prototype descriptor.
     * @param ProtoClass The class in which the properties will be created.
     * @param {Array|undefined} extendProtoProps. List of properties for prototype. If not specified, then all properties of the inherited classes will be created.
     * @param {Array|undefined} extendsStaticProps . List of static properties. If not specified, then all properties of the inherited classes will be created.
     */
    static extendOwnPropertiesFromPrototypes (ProtoClass,extendProtoProps,extendsStaticProps) {
        let protoProps = Object.getOwnPropertyNames(ProtoClass.prototype);
        let staticProps = Object.getOwnPropertyNames(ProtoClass);
        let proto = ProtoClass.prototype;
        let protoDescs=this.getProtoDescriptors(ProtoClass.prototype);
        protoDescs=this.extractOwnDescriptors(protoDescs);
        for(let prop of Object.getOwnPropertyNames(protoDescs)){
            let desc=protoDescs[prop];
            if(!protoProps.includes(prop) && (!Array.isArray(extendProtoProps)||extendProtoProps.includes(prop))){
                Object.defineProperty(ProtoClass.prototype,prop,desc);
            }
        }
        let staticDescs=this.getProtoDescriptors(ProtoClass);
        staticDescs=this.extractOwnDescriptors(staticDescs);
        for(let prop of Object.getOwnPropertyNames(staticDescs)){
            let desc=staticDescs[prop];
            if(!staticProps.includes(prop) && (!Array.isArray(extendsStaticProps)||extendsStaticProps.includes(prop))){
                Object.defineProperty(ProtoClass,prop,desc);
            }
        }
    }
    /**
     *  Collects interface rules for a class if the class is not yet assembled, and collects class properties
     * @param ProtoClass
     * @param forceBuild
     * @returns {rules}
     */
    static buildInterface(ProtoClass,forceBuild=false){
        /**/
        let self=this;
        let end_points=self.getAllEndPoints();
        let recurs = function(ProtoClass){
            let proto=ProtoClass.prototype;
            if(end_points.includes(ProtoClass)){
                return undefined;
            }
            end_points.splice(end_points.length,0,...self.getEndPoints(ProtoClass));
            if(self.hasInterfaceData(ProtoClass) && self.getInterfaceData(ProtoClass).isBuilt && !forceBuild){
                return self.getInterfaceData(ProtoClass);
            }
            let rules=recurs(Object.getPrototypeOf(proto).constructor);
            rules=self.initRules(ProtoClass,rules);
            self.buildPropsClass(ProtoClass,rules);
            let interfaces=self.getInterfaceData(ProtoClass); //rules;
            interfaces.isBuilt=true;
            return interfaces;
        };
        return recurs(ProtoClass);
    }

    /**
     * Extends the class with interfaces.
     * @param ProtoClass
     * @param {class[]} RestInterfaces. If the first element of the array is "true" (boolean type), then apply extendClassFromOwnPrototypes before final assembly of ProtoClass
     */
    static extendInterfaces(ProtoClass,...RestInterfaces){
        let rules=this.buildInterface(ProtoClass);
        let isExtend=false;
        if(typeof RestInterfaces[0] === 'boolean'){
            isExtend=RestInterfaces[0];
            RestInterfaces.splice(0,1);
        }
        if(RestInterfaces.length>0){
            for(let Interface of RestInterfaces){
                let rulesInterface=this.buildInterface(Interface);
                this.addRules(ProtoClass, rulesInterface);
            }
            rules=this.getInterfaceData(ProtoClass);
            if(isExtend){
                let staticProps=Object.getOwnPropertyNames(rules.staticProps);
                let protoProps=Object.getOwnPropertyNames(rules.staticProps);
                this.extendOwnPropertiesFromPrototypes(ProtoClass,protoProps,staticProps);
            }
            this.buildPropsClass(ProtoClass,rules);
        } else if(isExtend){
            let staticProps=Object.getOwnPropertyNames(rules.staticProps);
            let protoProps=Object.getOwnPropertyNames(rules.protoProps);
            this.extendOwnPropertiesFromPrototypes(ProtoClass,protoProps,staticProps);
            this.buildPropsClass(ProtoClass,rules);
        }
        return rules;
    }

    static expandInterfaces(ProtoClass,...RestInterfaces){

    }

    /**
     * Implements Interfaces in the class
     * Расширить правила Класса
     * @param {class}ProtoClass
     * @param {class[]} RestInterfaces . If the first element of the array is "true" (boolean type), then apply extendClassFromOwnPrototypes before final assembly of ProtoClass
     */
    static  implementInterfaces (ProtoClass,RestInterfaces,isExpand=false){
        if(typeof ProtoClass!=='function'){
            ProtoClass=Object.getPrototypeOf(ProtoClass).constructor;
        }
        if(Object.getOwnPropertyNames(ProtoClass).includes('isInterface') && ProtoClass.isInterface){
            let message=`Cannot create instance from interface`;
            let entryPoints=[ProtoClass.name];
            throw new InterfaceError('ErrorType',{message,entryPoints});
        }
        let rules;
        if(isExpand){
            rules=this.expandInterfaces(ProtoClass,...RestInterfaces);
        } else{
            rules=this.extendInterfaces(ProtoClass,...RestInterfaces);
        }

        this.validatePropsClass(ProtoClass,rules);
        return this.getInterfaceData(ProtoClass);
    }

    /**
     * Регестрируем Классы - глобальные конечные точки.  Т.е. дальше указанных классов по прототипам анализ и сборка не будет происходить.
     */
    static addGlobalEndPoints(points=[]){
        this.end_points.splice(this.end_points.length,0,...points);
    }

    /**
     * Регестрируем Класс - как конечную точку.  Т.е. дальше указанного класса по прототипам анализ и сборка не будет происходить.
     */
    static setEndPoint(ProtoClass,EndPointClass){
        let interfaces=this.initInterfaceData(ProtoClass);
        interfaces.end_points=[EndPointClass];
    }
    static getEndPoints(ProtoClass){
        if(this.hasInterfaceData(ProtoClass)){
            return this.getInterfaceData(ProtoClass).end_points;
        }
        return [];
    }
    static getAllEndPoints(ProtoClass=undefined){
        let end_points=Object.assign([],this.end_points);

        if(ProtoClass!==undefined ){
            end_points=end_points.concat(this.getEndPoints(ProtoClass));
        }
        return end_points;
    }
}
InterfaceManager.end_points=[
    Object,
    Function
];