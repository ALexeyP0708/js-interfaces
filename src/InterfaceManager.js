import {InterfaceError,CriteriaMethodType,CriteriaReactType,CriteriaPropertyType} from "./export.js";
let interfacesData=Symbol.for('interfacesData');
export class InterfaceManager {

    /**
     *  returns interface data for the class
     * @param {class} ProtoClass
     * @returns {object|undefined}
     */
    static getInterfaceData(ProtoClass){

        if(ProtoClass.hasOwnProperty(interfacesData)){
            return ProtoClass[interfacesData];
        }
        return undefined;
    }

    /**
     * set interface data for the class
     * @param {class} ProtoClass
     * @param {object} data
     */
    static setInterfaceData(ProtoClass,data){
        ProtoClass[interfacesData]=data;
    }

    /**
     * checks if interface data is installed
     * @param ProtoClass
     * @returns {boolean}
     */
    static hasInterfaceData(ProtoClass){
        return ProtoClass.hasOwnProperty(interfacesData);
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
                interfaces:[],
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
            delete descriptors[interfacesData];
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
     * so that in case of an error, refer to them.
     * @returns {object} rules interface
     */
    static generateDescriptorsRules(descriptors){
        let rules={};
        for (let prop of Object.getOwnPropertyNames(descriptors)){
            let desc=descriptors[prop];
            let entryPoints=[descriptors[prop].constructor.name,`.${prop}`];
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
                    if(typeof rtrn ==='object' && getCriteria!==null){
                        setCriteria=rtrn;
                    }
                }
                let criteria=new CriteriaReactType({get:getCriteria,set:setCriteria,options:{entryPoints,owner:descriptors[prop].constructor}});
                this.compareAndSetRule(rules,prop,{criteria});
            } else if(typeof desc.value === 'function'){
                let criteria=desc.value();
                if(typeof criteria!=='object' || criteria===null){
                    criteria={};
                }
                if(criteria.options===undefined){
                    criteria.options={};
                }
                criteria.options=Object.assign({},criteria.options,{entryPoints,owner:descriptors[prop].constructor});
                criteria= new CriteriaMethodType(criteria);
                this.compareAndSetRule(rules,prop,{criteria});
            } else {
                let criteria=desc.value;
                if(typeof criteria!=='object' || criteria===null){
                    criteria={};
                }
                criteria.options=Object.assign({},criteria.options,{entryPoints,owner:descriptors[prop].constructor});
                criteria= new CriteriaPropertyType(criteria,{entryPoints});
                this.compareAndSetRule(rules,prop,{criteria});
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
            interfaces:[],
            protoProps:{},
            staticProps:{}
        };
        let proto=ProtoClass.prototype;
        if(ProtoClass.hasOwnProperty('isInterface') && ProtoClass.isInterface){
            let descriptors=this.getDescriptors(proto);
            rules.protoProps=this.generateDescriptorsRules(descriptors);
            let staticDescriptors=this.getDescriptors(ProtoClass);
            rules.staticProps=this.generateDescriptorsRules(staticDescriptors);
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
    static  expandAndSetRule(rules,prop,rule,OwnerClass){
        let criteria=rule.criteria;
        let cls=criteria.getOwner();
        if(prop in rules){
            let last_cls=rules[prop][0].criteria.getOwner();
            let entryPoints=[`${last_cls.name}`,`${cls.name}`,`.${prop}`];
            rules[prop][0].criteria.expand(criteria,entryPoints);
        } else {
            let CriteriaClass=Object.getPrototypeOf(criteria).constructor;
            criteria=new CriteriaClass(criteria);
            if(OwnerClass!==undefined){criteria.setOwner(OwnerClass);}
            rules[prop]=[{criteria}];
        }
    }
    static compareAndSetRule(rules,prop,rule){
        let criteria=rule.criteria;
        let cls=criteria.getOwner();
        if(prop in rules){
            let last_cls=rules[prop][0].criteria.getOwner();
            let entryPoints=[`${last_cls.name}`,`${cls.name}`,`.${prop}`];
            rules[prop][0].criteria.compare(criteria,entryPoints);
            //criteria.compare(rules[prop][0].criteria,entryPoints);
            //rules[prop][0].criteria.compareOwnTo(criteria,entryPoints);
        }
        rules[prop]=[rule];
    }
    /**
     *  Adds / extends interface rules for Class.
     * @param {class} ProtoClass
     * @param  {object|undefined} rules
     * @param  {boolean} isExpand
     * @return {object}
     */
    static addRules(ProtoClass,rules={interfaces:[],protoProps:{},staticProps:{}},isExpand=false){
        let interfaceData=this.initInterfaceData(ProtoClass);
        for(let prop of Object.getOwnPropertyNames(rules.protoProps)){
            let rule=rules.protoProps[prop];
            if(isExpand){
                this.expandAndSetRule(interfaceData.protoProps,prop,rule[0],ProtoClass);
            } else {
                this.compareAndSetRule(interfaceData.protoProps,prop,rule[0]);
            }
        }
        for(let prop of Object.getOwnPropertyNames(rules.staticProps)){
            let rule=rules.staticProps[prop];
            if(isExpand){
                this.expandAndSetRule(interfaceData.staticProps,prop,rule[0],ProtoClass);
            } else {
                this.compareAndSetRule(interfaceData.staticProps,prop,rule[0]);
            }
        }
        for(let val of rules.interfaces){
            if(!interfaceData.interfaces.includes(val)){
                interfaceData.interfaces.push(val);
            }
        }
        return interfaceData;
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
            if(['length','name','prototype','isInterface',interfacesData].includes(prop)){continue;}
            delete ProtoClass[prop];
        }
    }

    /**
     * sets the interface rules for the class, if the class is an interface, it will generate and combine the rules.
     * @param {class} ProtoClass
     * @param {object|undefined} rules
     * @returns {Object} new rules
     */
    static initRules(ProtoClass,rules) {
        let interfaceData=this.addRules(ProtoClass, rules);
        if(ProtoClass.hasOwnProperty('isInterface') && ProtoClass.isInterface && !interfaceData.interfaces.includes(ProtoClass)){
           rules=this.generateRules(ProtoClass);
           interfaceData=this.addRules(ProtoClass, rules);
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
    static validateDescriptors(descriptors,rules={}){
        let errors=[];
        for(let prop of Object.getOwnPropertyNames(rules)){
            let last=rules[prop].length-1;
            if(!descriptors.hasOwnProperty(prop)){;
                let entryPoints=[rules[prop][last].criteria.getOwner().name,`.${prop}`];
                let error=new InterfaceError('ValidatePropertyDeclared',{entryPoints});
                errors.push(error);
                continue;
            }
            for(let rule of rules[prop]){
                let entryPoints=[rule.criteria.getOwner().name,`.${prop}`];
                if(rule.criteria instanceof CriteriaReactType){
                    if(!('get' in descriptors[prop]) && !('set' in descriptors[prop])){
                        let error =new InterfaceError('ValidateReactDeclared',{entryPoints:entryPoints.concat(['get/set']),react_type:'getter/setter'});
                        errors.push(error);
                        continue;
                    }
                    if(rule.criteria.get!==undefined && descriptors[prop].get===undefined){
                        let error =new InterfaceError('ValidateReactDeclared',{entryPoints:entryPoints.concat(['get']),react_type:'getter'});
                        errors.push(error.message);
                    } else if(rule.criteria.get===undefined && descriptors[prop].get!==undefined){
                        let error =new InterfaceError('ValidateReactDeclared',{entryPoints:entryPoints.concat(['get']),not:'not',react_type:'getter'});
                        errors.push(error);
                    }
                    if(rule.criteria.set!==undefined && descriptors[prop].set===undefined){
                        let error =new InterfaceError('ValidateReactDeclared',{entryPoints:entryPoints.concat(['set']),react_type:'setter'});
                        errors.push(error);
                    } else if(rule.criteria.set===undefined && descriptors[prop].set!==undefined){
                        let error =new InterfaceError('ValidateReactDeclared',{entryPoints:entryPoints.concat(['set']),not:'not',react_type:'setter'});
                        errors.push(error);
                    }
                } else if(rule.criteria instanceof CriteriaMethodType){
                    if(typeof descriptors[prop].value!=='function'){
                        let error =new InterfaceError('ValidateMethodDeclared',{entryPoints});
                        errors.push(error);
                    }
                } else if(rule.criteria instanceof CriteriaPropertyType){
                    try {
                        rule.criteria.validate(descriptors[prop].value,entryPoints);
                    }catch (error) {
                        if(error instanceof  InterfaceError){
                            errors.push(error);
                        } else {
                            throw error;
                        }
                    }
                }
            }
        }
        return errors;
    }
    /**
     * Checks if the Class passes the established rules.
     * @param {class} ProtoClass  Constructor - Class
     * @param {object} rules {class,criteria}
     *          class- constructor Interface that generated the criteria
     *          criteria -  CriteriaPropertyType|CriteriaMethodType|CriteriaReactType []
     * @throws {InterfaceError} -  Throws if properties validation fails

     */
    static validatePropsClass(ProtoClass,rules={protoProps:{},staticProps:{}}){
        let proto=ProtoClass.prototype;
        let descs=this.getProtoDescriptors(proto);
        let staticDescs=this.getProtoDescriptors(ProtoClass);
        let entryPoints=[ProtoClass.name];
        let protoErrorsStack=this.validateDescriptors(descs,rules.protoProps);
        let staticErrorsStack =this.validateDescriptors(staticDescs,rules.staticProps);
        let errors=[];
        errors.splice(errors.length,0,...protoErrorsStack);
        errors.splice(errors.length,0,...staticErrorsStack);
        if(errors.length>0){
            throw new InterfaceError('Validate_BadProperties',{errors,entryPoints});
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
    static buildPropsDescriptors(descriptors,rules={}){
        for(let prop of Object.getOwnPropertyNames(rules)){
            if(prop in descriptors){
                for(let rule of rules[prop]){
                    let entryPoints=[`${descriptors[prop].constructor.name}`,`${rule.criteria.getOwner().name}`,`.${prop}`];
                    if(rule.criteria instanceof CriteriaReactType){
                        if(descriptors[prop].get!==undefined){
                            //let entryPointsGet=entryPoints.concat(['get']);
                            let get=descriptors[prop].get;
                            if(descriptors[prop].isBuilt===true){
                                get=get(Symbol.for('get_own_descriptor'));
                            }
                            descriptors[prop].get=function(key){
                                if(key===Symbol.for('get_own_descriptor')){
                                    return get;
                                }
                                let answer=get.call(this);
                                //rule.criteria.validateGet(answer,entryPointsGet);
                                rule.criteria.validateGet(answer,entryPoints);
                                return answer;
                            };
                        }
                        if(descriptors[prop].set!==undefined){
                            //let entryPointsSet=entryPoints.concat(['set']);
                            let set=descriptors[prop].set;
                            if(descriptors[prop].isBuilt===true){
                                set=set(Symbol.for('get_own_descriptor'));
                            }
                            descriptors[prop].set=function(value){
                                if(value===Symbol.for('get_own_descriptor')){
                                    return set;
                                }
                                //rule.criteria.validateSet(value,entryPointsSet);
                                rule.criteria.validateSet(value,entryPoints);
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
        if(ProtoClass.hasOwnProperty('isInterface') && ProtoClass.isInterface){
            return;
        }
        let proto=ProtoClass.prototype;
        let builtProps={
                protoProps:[],
                staticProps:[]
            };
        let descs=this.getDescriptors(proto);
        descs=this.buildPropsDescriptors(descs,rules.protoProps);
        for(let prop of Object.getOwnPropertyNames(descs)){
            if(descs[prop].isBuilt===true){
                builtProps.protoProps.push(prop);
            }
        }
        Object.defineProperties(proto,descs);
        let staticDescs=this.getDescriptors(ProtoClass);
        staticDescs=this.buildPropsDescriptors(staticDescs,rules.staticProps);
        for(let prop of Object.getOwnPropertyNames(staticDescs)){
            if(staticDescs[prop].isBuilt===true){
                builtProps.staticProps.push(prop);
            }
        }
        Object.defineProperties(ProtoClass,staticDescs);
        let interfacesData=this.initInterfaceData(ProtoClass);
        interfacesData.builtProps=builtProps;
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
            let interfacesData=self.getInterfaceData(ProtoClass); //rules;
            interfacesData.isBuilt=true;
            return interfacesData;
        };
        return recurs(ProtoClass);
    }

    /**
     * Extends the class with interfaces.
     * @param ProtoClass
     * @param {class[]} RestInterfaces.
     *If the  RestInterfaces[0] of the array is "true" (boolean type), then  extends custom  interface for class  the specified interfaces
     * If the  RestInterfaces[1] of the array is "true" (boolean type), then apply extendClassFromOwnPrototypes before final assembly of ProtoClass. (then element[0] must be boolean type)
     */
    static extendInterfaces(ProtoClass,...RestInterfaces){
        let rules=this.buildInterface(ProtoClass);
        let isExtend=false;
        let isExpand=false;
        if(typeof RestInterfaces[0] === 'boolean'){
            isExpand=RestInterfaces[0];
            if(typeof RestInterfaces[1] === 'boolean'){
                isExtend=RestInterfaces[1];
                RestInterfaces.splice(1,1);
            } else if(Array.isArray(RestInterfaces[1])){

            }
            RestInterfaces.splice(0,1);
        } else if(typeof RestInterfaces[1] === 'boolean'){
            RestInterfaces.splice(1,1);
        }
        if(RestInterfaces.length>0){
            for(let Interface of RestInterfaces){
                if(!rules.interfaces.includes(Interface)){
                    let rulesInterface=this.buildInterface(Interface);
                    rules=this.addRules(ProtoClass, rulesInterface,isExpand);
                }
            }
            rules=this.getInterfaceData(ProtoClass);
            if(isExtend){
                let staticProps=Object.getOwnPropertyNames(rules.staticProps);
                let protoProps=Object.getOwnPropertyNames(rules.protoProps);
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
        if(RestInterfaces.length>0){
            if(typeof RestInterfaces[0]!=='boolean'){
                RestInterfaces.splice(0,0,true);
            } else {
                RestInterfaces[0]=true;
            }
        }
        InterfaceManager.extendInterfaces(ProtoClass,...RestInterfaces);
    }

    /**
     * Implements Interfaces in the class
     * Расширить правила Класса
     * @param {class}ProtoClass
     * @param {class[]} RestInterfaces .
     * If the  RestInterfaces[0] of the array is "true" (boolean type), then  extends custom  interface for class  the specified interfaces
     * If the  RestInterfaces[1] of the array is "true" (boolean type), then apply extendClassFromOwnPrototypes before final assembly of ProtoClass. (then element[0] must be boolean type)

     */
    static  implementInterfaces (ProtoClass,...RestInterfaces){
        if(typeof ProtoClass!=='function'){
            ProtoClass=Object.getPrototypeOf(ProtoClass).constructor;
        }

        //=[],isExpand=false
        if(Object.getOwnPropertyNames(ProtoClass).includes('isInterface') && ProtoClass.isInterface){
            let message=`Cannot create instance from interface`;
            let entryPoints=[ProtoClass.name];
            throw new InterfaceError('ErrorType',{message,entryPoints});
        }
        let rules=this.extendInterfaces(ProtoClass,...RestInterfaces);
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
    static setEndPoints(ProtoClass,EndPoints=[]){
        let interfacesData=this.initInterfaceData(ProtoClass);
        interfacesData.end_points=EndPoints;
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
    static instanceOfInterface(object,Interface){
        let ProtoClass=object;
        let to=typeof object;
        if(to==='object' && object!==null){
            ProtoClass=Object.getPrototypeOf(object).constructor;
        } else if(to!=='function'){
            return false;
        }
        let interfacesData=InterfaceManager.getInterfaceData(ProtoClass);
        if(interfacesData===undefined){
            return false;
        }
        for(let iface of interfacesData.interfaces){
            if(typeof iface==='function' && (iface===Interface || Interface.isPrototypeOf(iface))){
                return true;
            }
        }
        return false;
    }
    static freezePropСlass(ProtoClass,props=[]){
       // запретить обьявленым свойствам класса перезаписываться и изменять конфигурацию
        let descs=this.getDescriptors(ProtoClass.prototype);
        for(let desc of descs){
            desc.writable=false;
            desc.configurable=false;
        }
        Object.defineProperties(ProtoClass.prototype,descs);

        descs=this.getDescriptors(ProtoClass);
        for(let desc of descs){
            desc.writable=false;
            desc.configurable=false;
        }
        Object.defineProperties(ProtoClass,descs);
    }

}
InterfaceManager.end_points=[
    Object,
    Function,
    InterfaceError,
    InterfaceManager,
    CriteriaReactType,
    CriteriaMethodType,
    CriteriaPropertyType
];