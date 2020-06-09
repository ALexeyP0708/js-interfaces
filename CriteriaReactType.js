import {CriteriaMethodType,InterfaceTypeError,InterfaceError,ExtObject} from "./export.js";

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
    constructor(get,set,options={}){
        let params;
        if(typeof get ==='object' &&  get !==null && ('get' in get || 'set' in get)){
            params=ExtObject.collectorArguments(['get','set'],[undefined,set], get);
            Object.assign(params,ExtObject.collectorArguments(['options'],[options], get,true));
        } else {
            params=ExtObject.collectorArguments(['get','set','options'],[get,set,options]);
        }
        Object.defineProperties(this,{
            type:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:'react',
            },
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
            }
        });
        /*
        if(!['undefined','object'].includes(typeof set) && set!==null){
            throw new InterfaceTypeError('badArgumentMethod',{argument:'set'});
        }*/
        this.initOptions(options);
        if(typeof params.get ==='object' && params.get!==null){
            this.initGet(params.get,this.options.entryPoints);
        } else {
            delete this.get;
        }
        if(typeof params.set ==='object' && params.set!==null){
            this.initSet(params.set,this.options.entryPoints);
        } else {
            delete this.set;
        }
        //this.freeze();
    }
    initOptions(options){
        this.options={};
        this.options.entryPoints='entryPoints' in options?options.entryPoints:['not_defined'];
    }
    initGet(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let self=this;
        if(!['undefined','object'].includes(typeof criteria) && criteria!==null){
            let class_name=Object.getPrototypeOf(this).constructor.name;
            let message=`Invalid parameter passed to ${class_name}.arguments. Must be of type Object.`;
            throw new InterfaceTypeError('ErrorType',{entryPoints,message});
        }
        if(!(criteria instanceof CriteriaMethodType)){
            if(!('typeof' in criteria)){
                criteria.typeof='mixed';
            }
            criteria = new CriteriaMethodType([],criteria,this.options);
        }
        self.get=criteria;
    }
    initSet(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let self=this;
        if(!['undefined','object'].includes(typeof criteria) && criteria!==null){
            let class_name=Object.getPrototypeOf(this).constructor.name;
            let message=`Invalid parameter passed to ${class_name}.arguments. Must be of type Object.`;
            throw new InterfaceTypeError('ErrorType',{entryPoints,message});
        }
        if(!(criteria instanceof CriteriaMethodType)){
            if(!('typeof' in criteria)){
                criteria.typeof='mixed';
            }
            criteria = new CriteriaMethodType([criteria],{},this.options);
        }
        self.set=criteria;
    }
    validateSet(val,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(! ('set' in this)){
            let message=`The setter interface is not defined, but there is a call to the setter.`;
            throw new InterfaceError('ErrorType',{entryPoints,message});
        }
        this.set.validateArguments([val],entryPoints);
    }
    validateGet(val,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(! ('get' in this)){
            let message=`The getter interface is not defined, but there is a call to the getter.`;
            throw new InterfaceError('ErrorType',{entryPoints,message});
        }
        this.get.validateReturn(val, entryPoints);
    }
    expand(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let errorsStack=[];
        if(!(this instanceof Object.getPrototypeOf(criteria).constructor)){
            let message=`Criteria must meet ${Object.getPrototypeOf(criteria).constructor.name} class.`;
            throw new InterfaceError('ErrorType',{message,entryPoints});
        }
        try {
            if('get' in criteria){
                let entryPoints2=Object.assign([], entryPoints);
                entryPoints2.push(['get']);
                if('get' in this){
                    this.get.expand(criteria.get,entryPoints2);
                } else {
                    this.initGet(criteria.get,entryPoints2);
                }
            }
        } catch (e) {
            if(e instanceof InterfaceError && e.type==='ErrorType'){
                errorsStack.push(e.message);
            } else{
                throw e;
            }
        }
        try {
            if ('set' in criteria) {
                let entryPoints2=Object.assign([], entryPoints);
                entryPoints2.push(['set']);
                if ('set' in this) {
                    this.set.expand(criteria.set,entryPoints2);
                } else {
                    this.initSet(criteria.set, entryPoints2);
                }
            }
        }  catch (e) {
            if(e instanceof InterfaceError && e.type==='ErrorType'){
                errorsStack.push(e.message);
            } else{
                throw e;
            }
        }
        if(errorsStack.length>0){
            let message="\n  "+errorsStack.join("\n  ");
            throw new InterfaceError('ErrorType',{message,entryPoints});
        }
    }
    /*merge(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let errorsStack=[];
        if(!(criteria instanceof Object.getPrototypeOf(this).constructor)){
            let message=`Criteria must meet ${Object.getPrototypeOf(this).constructor.name} class.`;
            throw new InterfaceError('ErrorType',{message,entryPoints});
        }
        try {
            if('get' in criteria){
                let entryPoints2=Object.assign([], entryPoints);
                entryPoints2.push(['get']);
                if('get' in this){
                    this.get.merge(criteria.get,entryPoints2);
                } else {
                    this.initGet(criteria.get,entryPoints2);
                }
            }
        } catch (e) {
            if(e instanceof InterfaceError && e.type==='ErrorType'){
                errorsStack.push(e.message);
            } else{
                throw e;
            }
        }
        try {
            if ('set' in criteria) {
                let entryPoints2=Object.assign([], entryPoints);
                entryPoints2.push(['set']);
                if ('set' in this) {
                    this.set.merge(criteria.set,entryPoints2 );
                } else {
                    this.initSet(criteria.set, entryPoints2);
                }
            }
        }  catch (e) {
            if(e instanceof InterfaceError && e.type==='ErrorType'){
                errorsStack.push(e.message);
            } else{
                throw e;
            }
        }
        if(errorsStack.length>0){
            let message="\n  "+errorsStack.join("\n  ");
            throw new InterfaceError('ErrorType',{message,entryPoints});
        }
    }*/
    freeze(){
        Object.freeze(this);
    }
}