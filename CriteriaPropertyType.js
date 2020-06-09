import {InterfaceError,ExtObject} from "./export.js";

export class CriteriaPropertyType {
    constructor(type_of='mixed',values=[],options={})
    {
        let params;
        if(typeof type_of ==='object'){
            params=ExtObject.collectorArguments(['typeof','values'],['mixed',values], type_of);
            Object.assign(params,ExtObject.collectorArguments(['options'],[options], type_of,true));
        } else {
            params=ExtObject.collectorArguments(['typeof','values','options'],[type_of,values,options]);
        }
        Object.defineProperties(this,{
            type:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:'property',
            },
            typeof:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:'mixed',
            },
            values:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:[]
            },
            options:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:{}
            }
        });
        this.initOptions(params.options);
        this.initTypeof(params.typeof,this.options.entryPoints);
        this.initValues(params.values,this.options.entryPoints);
        //this.freeze();
    }

    initOptions(options){
        this.options={};
        this.options.entryPoints='entryPoints' in options?Object.assign([],options.entryPoints):['not_defined'];
    }
   /* initTypeof(type_of='mixed',entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let self=this;
        if( !['null','undefined','object','boolean','number','string','symbol','function','class','mixed'].includes(type_of)){
            let class_name=Object.getPrototypeOf(this).constructor.name;
            let message=`Invalid parameter passed to ${class_name}.typeof.`;
            throw new InterfaceError('ErrorType',{entryPoints,message});
        }
        self.typeof=type_of;
    }*/
    initTypeof(types='mixed',entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(!Array.isArray(types)){
            types=[types];
        }
        let self=this;
        let type_class;
        for (let type_of of types){
            if(type_of===undefined){
                type_of='undefined';
            }else if(type_of === null){
                type_of='null';
            }
            if(typeof type_of==='function' && type_class===undefined){
                type_class=true;
            } else if(type_class===undefined){
                type_class=false;
            }else if(type_class){
                // ошибка
            }
            if(!type_class &&  !['null','undefined','object','boolean','number','string','symbol','function','class','mixed'].includes(type_of)){
                let class_name=Object.getPrototypeOf(this).constructor.name;
                let message=`Invalid parameter passed to ${class_name}.typeof.`;
                throw new InterfaceError('ErrorType',{entryPoints,message});
            } else if(type_class){

            }
        }
        self.typeof=types;
    }
    initValues(values=[],entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let self=this;
        let type_of=self.typeof;
        let class_name=Object.getPrototypeOf(this).constructor.name;
        if(!Array.isArray(values)){
            let message=`Invalid parameter passed to ${class_name}.values. Must be of type Array.`;
            throw new InterfaceError('ErrorType',{entryPoints,message});
        }
        if(values.length>0){
            for(let value of values){
                if(typeof value ==='object' && value!==null){
                    let message=`Objects must not be in the ${class_name}.values ​​parameter.`;
                    throw new InterfaceError('ErrorType',{entryPoints,message});
                }
            }
            switch (self.typeof) {
                case 'undefined':
                case 'boolean':
                    values=[];
                    break;
                case 'class':
                    type_of='function';
                case 'number':
                case 'string':
                case 'symbol':
                case 'function':
                    for(let value of values){
                        if(![undefined,null].includes(value) && typeof value!==type_of){
                            let message = `In ${class_name}.values property, one of the values ​​does not match the declared type in ${class_name}.typeof property.`;
                            throw new InterfaceError('ErrorType',{entryPoints,message});
                        }
                    }
                    break;
                case 'object':
                    for(let value of values){
                        if(![undefined,null].includes(value) && typeof value!=='function'){
                            let message=`The ${class_name}.values ​​property should list the classes (constructors) if ${class_name}.typeof === 'object'.`;
                            throw new InterfaceError('ErrorType',{entryPoints,message});
                        }
                    }
                    break;
                case 'mixed':
                    break;
            }
            Object.assign(self.values,values);
        }
    }
    validate(value,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let typeof_value=typeof value;
        let type_of=this.typeof;
        switch (this.typeof) {
            case 'undefined':
            case 'boolean':
                if(typeof_value!==this.typeof){
                    let message=`Expected type of "${this.typeof}"  but defined by "${typeof_value}".`;
                    throw new InterfaceError('ErrorType',{entryPoints,message});
                }
                break;
            case 'class':
                type_of='function';
            case 'number':
            case 'string':
            case 'symbol':
            case 'function':
            case 'object':
                if(value===undefined && !this.values.includes(undefined)
                    || value===null && !this.values.includes(null)
                    || ![undefined,null].includes(value) && typeof_value!==type_of ){
                    let message=`Expected type of "${this.typeof}"  but defined by "${typeof_value}".`;
                    throw new InterfaceError('ErrorType',{entryPoints,message});
                }

                break;
            case 'mixed':
                break;
        }
        if(this.values.length>0 && !['undefined','boolean'].includes(this.typeof)){
            let check=false;
            let other_values=Object.assign([],this.values);
            let index=other_values.indexOf(undefined);
            if(index>-1){
                other_values.splice(index,1);
            }
            index=other_values.indexOf(null);
            if(index>-1){
                other_values.splice(index,1);
            }
            if(value===null && this.values.includes(null)
                || value===undefined && this.values.includes(undefined)
                || ![undefined,null].includes(value) && other_values.length===0
            ){
                check=true;
            } else {
                cycle:
                for(let el of other_values){
                    let typeof_el=typeof el;
                    switch (this.typeof) {
                        case 'number':
                        case 'string':
                        case 'symbol':
                        case 'function':
                            if(el===value){
                                check=true;
                                break cycle;
                            }
                            break;
                        case 'class':{
                            if(typeof_value==='function' && typeof_el==='function' && el.isPrototypeOf(value) || el===value){
                                check=true;
                                break cycle;
                            }
                        }
                            break;
                        case 'object':
                            if(typeof_el ==='function' && value instanceof el ){
                                check=true;
                                break cycle;
                            }
                            break;
                        case 'mixed':
                            if(typeof_value ==='object' && value !==null && typeof_el ==='function' && value instanceof el || typeof_value ==='function' && typeof_el==='function' &&  el.isPrototypeOf(value) || el===value || el==value){
                                check=true;
                                break cycle;
                            }
                            break;
                    }
                }
            }
            if(!check){
                let values=[];
                for(let el of this.values){
                    if(typeof el === 'symbol'){
                        values.push(el.toString());
                    } else
                    if(typeof el ==='function'){
                        let type_of=this.typeof!=='mixed'?this.typeof:'function';
                        values.push(`${type_of} ${el.name}`);
                    } else if(el===null){
                        values.push('null');
                    } else if(el===undefined){
                        values.push('undefined');
                    } else {
                        values.push(el);
                    }
                }
                values=values.join(',');
                let message=`Does not match the values [${values}].`;
                throw new InterfaceError('ErrorType',{entryPoints,message});
            }
        };
    }
    expand(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(!(this instanceof Object.getPrototypeOf(criteria).constructor)){
            let message=`Criteria must meet ${Object.getPrototypeOf(criteria).constructor.name} class.`;
            throw new InterfaceError('ErrorType',{message,entryPoints});
        }
        if(this.typeof!==criteria.typeof){
            let message=`Types do not match in criteria`;
            throw  new InterfaceError('ErrorType',{message,entryPoints});
        }
        for(let value of criteria.values){
            if(!this.values.includes(value)){
                this.values.push(value);
            }
        }
    }
    /*merge(criteria,entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(!(criteria instanceof Object.getPrototypeOf(this).constructor)){
            let message=`Criteria must meet ${Object.getPrototypeOf(this).constructor.name} class.`;
            throw new InterfaceError('ErrorType',{message,entryPoints});
        }
        if(this.typeof!==criteria.typeof){
            let message=`Types do not match in criteria`;
            throw  new InterfaceError('ErrorType',{message,entryPoints});
        }
        for(let value of criteria.values){
            if(!this.values.includes(value)){
                this.values.push(value);
            }
        }
    }*/
    freeze(){
        Object.freeze(this);
    }
}
