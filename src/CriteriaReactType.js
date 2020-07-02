import {CriteriaMethodType,InterfaceError} from "./export.js";

export class CriteriaReactType {
    /**
     *
     * @param {CriteriaMethodType|CriteriaPropertyType|object} get -Defines return criteria for getter.
     * An object of type CriteriaPropertyType or an object having characteristic properties
     * for CriteriaPropertyType is passed.
     * If an object of type CriteriaMethodType is passed, then it must contain criteria in the return property
     * n the first argument, you can pass an argument object - {get:...,set:...} , where the properties are the arguments of the method
     *
     * @param {CriteriaMethodType|CriteriaPropertyType|object} set -Defines write criteria for setter.
     * An object of type CriteriaPropertyType or an object having characteristic properties
     * for CriteriaPropertyType is passed.
     * If an object of type CriteriaMethodType is passed, then it must contain criteria in the arguments property
     */
    constructor(criteria={}){

        Object.defineProperties(this,{
            get:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:{}
            },
            set:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:{}
            },
            options:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:{}
            }
        });

        this.initOptions(criteria.options);
        if(typeof criteria.get ==='object' && criteria.get!==null){
            this.initGet(criteria.get,this.options.entryPoints);
        } else {
            delete this.get;
        }
        if(typeof criteria.set ==='object' && criteria.set!==null){
            this.initSet(criteria.set,this.options.entryPoints);
        } else {
            delete this.set;
        }
        //this.freeze();
    }
    initOptions(options={}){
        this.options={};
        this.options.entryPoints='entryPoints' in options?options.entryPoints:['not_defined'];
        this.options.owner=options.hasOwnProperty('owner')?options.owner:class not_defined {};
    }
    setOwner(owner){
        this.options.owner=owner;
        this.get.setOwner(owner);
        this.set.setOwner(owner);

    }
    getOwner(){
        return this.options.owner;
    }
    initGet(criteria={},entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(criteria.hasOwnProperty('return')){
            let options=criteria.options;
            criteria=criteria.return;
            if(criteria.options===undefined){
                criteria.options=options;
            }
        }
        criteria=Object.assign({},criteria);
        delete criteria.arguments;
        if(criteria.types===undefined){
            criteria.types=['undefined'];
        }
        if(criteria.options===undefined){
            criteria.options={};
        }
        let options=Object.assign({},this.options,criteria.options,{entryPoints:entryPoints});
        criteria = new CriteriaMethodType({return:criteria,options});
        this.get=criteria;
    }
    initSet(criteria={},entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(criteria.hasOwnProperty('arguments')){
            let options=criteria.options;
            criteria=criteria.arguments[0];
            if(criteria.options===undefined){
                criteria.options=options;
            }
        }
        criteria=Object.assign({},criteria);
        delete criteria.return;
        if(criteria.types===undefined){
            criteria.types=['mixed'];
        }
        if(criteria.options===undefined){
            criteria.options={};
        }
        let options=Object.assign({},this.options,criteria.options,{entryPoints:entryPoints});
        criteria = new CriteriaMethodType({arguments:[criteria],options});
        this.set=criteria;
    }
    validateSet(val,entryPoints=['not_defined']){
        entryPoints=entryPoints.concat(['set']);
        if(! ('set' in this)){
            throw new InterfaceError('ValidateReactDeclared',{entryPoints,not:'not',react_type:'setter'});
        }
        this.set.validateArguments([val],entryPoints);
    }
    validateGet(val,entryPoints=['not_defined']){
        entryPoints=entryPoints.concat(['get']);
        if(! ('get' in this)){
            throw new InterfaceError('ValidateReactDeclared',{entryPoints,not:'not',react_type:'getter'});
        }
        this.get.validateReturn(val, entryPoints);
    }
    compare(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let errors=[];
        if(!(this instanceof Object.getPrototypeOf(criteria).constructor)){
            throw new InterfaceError('BadCriteria',{entryPoints,className:Object.getPrototypeOf(criteria).constructor.name});
        }
        if(this.hasOwnProperty('get')){
            if(!criteria.hasOwnProperty('get')){
                // ошибка
                errors.push(new InterfaceError('ValidateReactDeclared',{entryPoints:['get'],react_type:'getter'}));
            } else {
                try{
                    this.get.compare(criteria.get);
                }catch (e) {
                    if(e instanceof InterfaceError){
                        errors.push(e);
                    } else {
                        throw e;
                    }
                }
            }
        } else if(criteria.hasOwnProperty('get')){
            errors.push(new InterfaceError('ValidateReactDeclared',{entryPoints:['get'],not:'not',react_type:'getter'}));
        }
        if(this.hasOwnProperty('set')){
            if(!criteria.hasOwnProperty('set')){
                // ошибка
                errors.push(new InterfaceError('ValidateReactDeclared',{entryPoints:['set'],react_type:'setter'}));
            } else {
                try{
                    this.set.compare(criteria.set);
                }catch (e) {
                    if(e instanceof InterfaceError){
                        errors.push(e);
                    } else {
                        throw e;
                    }
                }
            }
        } else if(criteria.hasOwnProperty('set')){
            errors.push(new InterfaceError('Compare_ReactDeclared',{entryPoints:['set'],not:'not',react_type:'setter'}));
        }
        if(errors.length>0){
            throw new InterfaceError('CompareReact_badParams',{errors,entryPoints});
        }
    }

    expand(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let errors=[];
        if(!(this instanceof Object.getPrototypeOf(criteria).constructor)){
            throw new InterfaceError('BadCriteria',{entryPoints,className:Object.getPrototypeOf(criteria).constructor.name});
        }
        if(this.hasOwnProperty('get') && criteria.hasOwnProperty('get')){
            try{
                this.get.expand(criteria.get,['get']);
            } catch (e) {
                if(e instanceof InterfaceError){
                    errors.push(e);
                }else{
                    throw e;
                }
            }
        } else if(criteria.hasOwnProperty('get')){
            this.initGet(criteria.get,entryPoints.concat(['get']));
        }
        if(this.hasOwnProperty('set') && criteria.hasOwnProperty('set')){
            try{
                this.set.expand(criteria.set,['set']);
            } catch (e) {
                if(e instanceof InterfaceError){
                    errors.push(e);
                }else{
                    throw e;
                }
            }

        } else if(criteria.hasOwnProperty('set')){
            this.initSet(criteria.set,entryPoints.concat(['set']));
        }
        if(errors.length>0){
            throw new InterfaceError('expandReact_badParams',{errors,entryPoints});
        }
    }
    freeze(){
        Object.freeze(this);
    }
}