import {InterfaceError,CriteriaPropertyType,ExtObject} from "./export.js";

export class CriteriaMethodType{
    constructor(args=[],rtrn={},options={}){
        let params;
        if(!Array.isArray(args) && typeof args==='object'){
            params=ExtObject.collectorArguments(['arguments','return'],[[],args,options], args);
            Object.assign(params,ExtObject.collectorArguments(['options'],[options], args,true));
        } else {
            params=ExtObject.collectorArguments(['arguments','return','options'],[args,rtrn,options]);
        }
        Object.defineProperties(this,{
            type:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:'method',
            },
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
            }
        });
        this.initOptions(options);
        this.initArguments(params['arguments'],this.options.entryPoints);
        this.initReturn(params.return,this.options.entryPoints);
        //this.freeze();
    }
    initOptions(options){
        this.options={};
        this.options.entryPoints=('entryPoints' in options)?Object.assign([],options.entryPoints):['not_defined'];
    }
    initArguments(args=[],entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let self=this;
        if(!Array.isArray(args)){
            let class_name=Object.getPrototypeOf(this).constructor.name;
            let message=`Invalid parameter passed to ${class_name}.arguments. Must be of type Array.`;
            throw new InterfaceError('ErrorType',{entryPoints,message});
        }
        for(let arg of args) {
            let criteria=arg;
            if(!(criteria instanceof CriteriaPropertyType)){
                criteria=new CriteriaPropertyType(criteria,[],this.options);
            }
            self.arguments.push(criteria);
        }
    }
    initReturn(rtrn={},entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let self=this;
        if(typeof rtrn !=='object' || rtrn==null){
            let class_name=Object.getPrototypeOf(this).constructor.name;
            let message=`Invalid parameter passed to ${class_name}.arguments. Must be of type Object.`;
            throw new InterfaceError('ErrorType',{entryPoints,message});
        }
        let criteria={
            typeof:'undefined'
        };
        if('typeof' in rtrn || 'values' in rtrn){
            criteria=rtrn;
        }
        if(!(criteria instanceof CriteriaPropertyType)){
            criteria=new CriteriaPropertyType(criteria,[],this.options);
        }
        self.return=criteria;
    }
    validateArguments(args,entryPoints=['not_defined']){
        let errorsStack=[];
        entryPoints=Object.assign([],entryPoints);
        for(let n in this.arguments){
            try{
                this.arguments[n].validate(args[n],[`argument ${Number(n)+1}`]);
            } catch(e){
                if(e instanceof InterfaceError && e.type==='ErrorType'){
                    errorsStack.push(e);
                }
            }
        }
        let check=false,err_msg="\n";
        for(let n in errorsStack){
            let error=errorsStack[n];
            err_msg+="  "+error.message+"\n";
            check=true;
        }
        if(check){
            throw new InterfaceError('ErrorType',{message:err_msg,entryPoints});
        }
    }
    validateReturn(rtrn,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        entryPoints.push('return');
        this.return.validate(rtrn,entryPoints);
    }
    expand(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let errorsStack=[];
        if(!(this instanceof Object.getPrototypeOf(criteria).constructor)){
            let message=`Criteria must meet ${Object.getPrototypeOf(criteria).constructor.name} class.`;
            throw new InterfaceError('ErrorType',{message,entryPoints});
        }
        for(let k in criteria.arguments){
            k=Number(k);
            if(!(k in this.arguments)){
                let message=`Argument undeclared`;
                let error= new InterfaceError('ErrorType',{message,entryPoints:[`argument ${k+1}`]});
                errorsStack.push(error.message);
            } else {
                try {
                    this.arguments[k].expand(criteria.arguments[k],[`argument ${k+1}`]);
                }catch (error) {
                    if(error instanceof InterfaceError && error.type==='ErrorType'){
                        errorsStack.push(error.message);
                    } else {
                        throw error;
                    }
                }
            }
        }
        try {
            this.return.expand(criteria.return,[`return`]);
        } catch (error) {
            if(error instanceof InterfaceError && error.type==='ErrorType'){
                errorsStack.push(error.message);
            } else {
                throw error;
            }
        }
        if(errorsStack.length>0){
            let message="\n  "+errorsStack.join("\n  ");
            throw new InterfaceError('ErrorType',{message,entryPoints});
        }
    }
   /* merge(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let errorsStack=[];
        if(!(criteria instanceof Object.getPrototypeOf(this).constructor)){
            let message=`Criteria must meet ${Object.getPrototypeOf(this).constructor.name} class.`;
            throw new InterfaceError('ErrorType',{message,entryPoints});
        }
        for(let k in this.arguments){
            k=Number(k);
            if(!(k in criteria.arguments)){
                let message=`Argument undeclared`;
                let error= new InterfaceError('ErrorType',{message,entryPoints:[`argument ${k+1}`]});
                errorsStack.push(error.message);
            } else {
                try {
                    this.arguments[k].merge(criteria.arguments[k],[`argument ${k+1}`]);
                }catch (error) {
                    if(error instanceof InterfaceError && error.type==='ErrorType'){
                        errorsStack.push(error.message);
                    } else {
                        throw error;
                    }
                }
            }
        }
        for(let k in criteria.arguments){
            k=Number(k);
            let argument=criteria.arguments[k];
            if(!(k in this.arguments)){
                this.arguments.push(argument);
            }
        }
        try {
            this.return.merge(criteria.return,[`return`]);
        } catch (error) {
            if(error instanceof InterfaceError && error.type==='ErrorType'){
                errorsStack.push(error.message);
            } else {
                throw error;
            }
        }
        if(errorsStack.length>0){
            let message="\n "+errorsStack.join("\n  ");
            throw new InterfaceError('ErrorType',{message,entryPoints});
        }
    }*/
    freeze(){
        Object.freeze(this);
    }
}
