import {InterfaceError,CriteriaPropertyType} from "./export.js";

export class CriteriaMethodType{
    constructor(criteria={}){
        Object.defineProperties(this,{
            arguments:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:[]
            },
            return:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:{}
            },
            options: {
                enumerable: true,
                configurable: true,
                writable: true,
                value: {}
            }
        });
        this.initOptions(criteria.options);
        let errors=[];
        try {
            this.initArguments(criteria.arguments,[]);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                throw e;
            }
        };
        try {
            this.initReturn(criteria.return,[]);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                throw e;
            }
        };
        if (errors.length > 0) {
            throw new InterfaceError('Init_BadArgumentsOrReturn', {entryPoints: this.options.entryPoints, errors});
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
        for(let argument of this.arguments){
            argument.setOwner(owner);
        }
        this.return.setOwner(owner);
    }
    getOwner(){
        return this.options.owner;
    }
    initArguments(args=[],entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(!Array.isArray(args)){
            throw new InterfaceError('InitArguments',{entryPoints,className:Object.getPrototypeOf(this).constructor.name});
        }
        for(let arg of args) {
            if(arg===undefined){
                arg={
                    types:['undefined']
                };
            }
            let criteria=Object.assign({},arg);
            if(criteria.options===undefined){
                criteria.options={};
            }
            criteria.options=Object.assign({},this.options,criteria.options,{entryPoints:entryPoints});
            criteria=new CriteriaPropertyType(criteria);
            this.arguments.push(criteria);
        }
    }
    initReturn(rtrn={},entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(typeof rtrn !=='object' || rtrn==null){
            throw new InterfaceError('InitReturn',{entryPoints,className:Object.getPrototypeOf(this).constructor.name});
        }
        let criteria=Object.assign({},rtrn);
        if(criteria.types===undefined){
            criteria.types=['mixed'];
        }
        if(criteria.options===undefined){
            criteria.options={};
        }
        criteria.options=Object.assign({},this.options,criteria.options,{entryPoints:entryPoints});
        criteria=new CriteriaPropertyType(criteria);
        this.return=criteria;
    }
    validateArguments(args,entryPoints=['not_defined']){
        let errors=[];
        entryPoints=Object.assign([],entryPoints);
        for(let n in this.arguments){
            n=Number(n);
            try{
                this.arguments[n].validate(args[n],[`arguments[${n+1}]`]);
            } catch(e){
                if(e instanceof InterfaceError ){
                    errors.push(e);
                }
            }
        }
        if(errors.length>0){
            throw new InterfaceError('ValidateArguments',{errors,entryPoints});
        }
    }
    validateReturn(rtrn,entryPoints=['not_defined']){
        entryPoints=entryPoints.concat(['return']);
        this.return.validate(rtrn,entryPoints);
    }
    compare(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let errors=[];
        if(!(criteria instanceof Object.getPrototypeOf(this).constructor)){
            throw new InterfaceError('BadCriteria',{entryPoints,className:Object.getPrototypeOf(this).constructor.name});
        }
        for(let k in this.arguments){
            k=Number(k);
            if(!(k in criteria.arguments)){
                if(!this.arguments[k].types.includes('mixed') && !this.arguments[k].types.includes('undefined')){
                    let error= new InterfaceError('Compare_badArgument',{entryPoints:[`argument ${k+1}`]});
                    errors.push(error.message);
                }
            } else {
                try {
                    this.arguments[k].compare(criteria.arguments[k],[`argument ${k+1}`]);
                }catch (error) {
                    if(error instanceof InterfaceError){
                        errors.push(error);
                    } else {
                        throw error;
                    }
                }
            }
        }
        try {
            this.return.compare(criteria.return,[`return`]);
        } catch (error) {
            if(error instanceof InterfaceError){
                errors.push(error);
            } else {
                throw error;
            }
        }
        if(errors.length>0){
            throw new InterfaceError('CompareMethod_badParams',{errors,entryPoints});
        }
    }
    expand(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let errors=[];
        if(!(this instanceof Object.getPrototypeOf(criteria).constructor)){
            throw new InterfaceError('BadCriteria',{className:Object.getPrototypeOf(criteria).constructor.name,entryPoints});
        }
        for(let k in criteria.arguments){
            k=Number(k);
            if(!(k in this.arguments)){
               this.arguments.push(criteria.arguments[k]);
            } else {
                try {
                    this.arguments[k].expand(criteria.arguments[k],[`argument ${k+1}`]);
                } catch (error) {
                    if(error instanceof InterfaceError){
                        errors.push(error);
                    } else {
                        throw error;
                    }
                }
            }
        }
        try {
            this.return.expand(criteria.return,[`return`]);
        } catch (error) {
            if(error instanceof InterfaceError){
                errors.push(error);
            } else {
                throw error;
            }
        }
        if(errors.length>0){
            throw new InterfaceError('ExpandMethod_badParams',{errors,entryPoints});
        }
    }
    freeze(){
        Object.freeze(this);
    }
}
