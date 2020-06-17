import {InterfaceError,ExtObject} from "./export.js";

export class CriteriaPropertyType {
    constructor(criteria={})
    {
        Object.defineProperties(this,{
            types:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:['mixed'],
            },
            includes:{
                enumerable:true,
                configurable:true,
                writable:true,
                value:[]
            },
            excludes:{
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
        this.initOptions(criteria.options);
        this.initTypes(criteria.types,this.options.entryPoints);
        let errors=[];
        try{
            this.initIncludes(criteria.includes,[]);
        }catch(e){
            if(e instanceof InterfaceError){
                errors.push(e.message);
            } else {
                throw e;
            }
        };
        try{
            this.initExcludes(criteria.excludes,[]);
        }catch(e){
            if(e instanceof InterfaceError){
                errors.push(e.message);
            } else {
                throw e;
            }
        };
        if(errors.length>0){
            let message="\n"+errors.join("\n");
            throw new InterfaceError('ErrorType',{entryPoints:this.options.entryPoints,message});
        }
        //this.freeze();
    }

    initOptions(options={}){
        this.options={};
        this.options.entryPoints='entryPoints' in options?Object.assign([],options.entryPoints):['not_defined'];
    }
    initTypes(types=['mixed'],entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        if(!Array.isArray(types)){
            types=[types];
        } else if(types.length===0){
            types=['mixed'];
        } else {
            types=Object.assign([],types);
        }
        if(types.includes('mixed')){
            types=['mixed'];
        }
        let errors=[];
        for (let k in types){
            if(types[k] === null){
                types[k]='null';
            }
            if(types[k]===undefined){
                types[k]='undefined';
            }
            let entryPoints=[`action:initTypes`,`types[${k}]`];
            let tt =typeof types[k];
            if(!(['function'].includes(tt) ||  tt==='string' && ['null','undefined','object','boolean','number','string','symbol','function','mixed'].includes(types[k]))){
                let class_name=Object.getPrototypeOf(this).constructor.name;
                let message=`Invalid parameter passed to ${class_name}.types.`;
                let error = new InterfaceError('ErrorType',{entryPoints,message});
                errors.push(error.message);
            }
        }
        if(errors.length>0){
            let message="\n   "+errors.join("\n   ");
            throw new InterfaceError('ErrorType',{entryPoints,message});
        }
        this.types=types;
    }
    initIncludes(values=[],entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let types=this.types;
        let class_name=Object.getPrototypeOf(this).constructor.name;
        if(!Array.isArray(values)){
            values=[values];
        }
        if(types.length===1){
            if(['null','undefined'].includes(types[0])){
                values=[];
            }
        } else if (!Array.isArray(values)){
            values=[values];
        } else {
            values=Object.assign([],values);
        }
        let errors=[];
        for(let k in values){
            let value=values[k];
            try {
                this.validateType(value,['action:init',`includes[${k}]`]);
            } catch(e){
                if(e instanceof InterfaceError){
                    errors.push(e.message);
                } else {
                    throw e;
                }
            }
        }
        if(errors.length>0){
            let message="\n   "+errors.join("\n   ");
            throw  new InterfaceError('ErrorType',{message,entryPoints});
        }
        this.includes=values;
    }
    initExcludes(values=[],entryPoints=['not_defined']){
        entryPoints=Object.assign([],entryPoints);
        let types=this.types;
        let class_name=Object.getPrototypeOf(this).constructor.name;
        if(!Array.isArray(values)){
            values=[values];
        }
        if(types.length===1){
            if(['null','undefined'].includes(types[0])){
                values=[];
            }
        } else if (!Array.isArray(values)){
            values=[values];
        } else {
            values=Object.assign([],values);
        }
        let errors=[];
        for(let k in values){
            let value=values[k];
            try {
                this.validateType(value,['action:init',`excludes[${k}]`]);
            } catch(e){
                if(e instanceof InterfaceError){
                    errors.push(e.message);
                } else {
                    throw e;
                }
            }
        }
        if(errors.length>0){
            let message="\n   "+errors.join("\n   ");
            throw  new InterfaceError('ErrorType',{message,entryPoints});
        }
        this.excludes=values;
    }
   validate(value,entryPoints=['not_defined']){
       entryPoints=Object.assign([],entryPoints);
       this.validateType(value,entryPoints.concat(['action:validate']));
       let errors=[];
       try{
           this.validateInIncludes(value,entryPoints.concat(['action:validate']));
       } catch(e){
           if(e instanceof InterfaceError){
               errors.push(e.message);
           }else{
               throw e;
           }
       }
       try{
           this.validateInExcludes(value,entryPoints.concat(['action:validate']));
       } catch(e){
           if(e instanceof InterfaceError){
               errors.push(e.message);
           }else{
               throw e;
           }

       }
       if(errors.length>0){
           let message=errors.join('');
           throw new InterfaceError('ErrorType',{message})
       }
       return true;
   }
   validateType(value,entryPoints=['not_defined']){
       entryPoints=Object.assign([],entryPoints);
       let tv=typeof value;
       let types_string=[];
       if(value===null){
           tv='null'
       }
       let check=false;
       for(let type of this.types){
           let tt=typeof type;
           if(tt==='string'){
               types_string.push(type);
           } else {
               types_string.push(`[function ${type.name}]`);
           }
           if (
               tt === 'string' && (type==='mixed'  || tv === type)
               || tt==='function' && this.instanceOf(value,type)
           ){
               check=true;
               break;
           }
       }
       if(!check){
           let message = `Expected type of "[ ${types_string.join(',')} ]"  but defined by "${tv}".`;
           throw new InterfaceError('ErrorType',{entryPoints,message});
       }
       return true;
   }
   validateInValues(value,equalValues=[],entryPoints=['not_defined']){
       if(equalValues.length>0){
           let check=false;
           for(let equal of equalValues){
               let te=typeof equal;
               if(te ==='function'){
                   if(this.instanceOf(value,equal)){
                       check=true;
                       break;
                   }
               } else if(value === equal){
                   check=true;
                   break;
               }
           }
           if(!check){
               //Does not match the values [${values}].
               switch(typeof value){
                   case 'function':
                       value=`function ${value.name}`;
                       break;
                   case 'object':
                       if(value!==null){
                           value = `object ${Object.getPrototypeOf(value).constructor.name}`
                       } else {
                           value = 'null';}
                       break;
               }
               let message = `[${value}] does not match the values ​​in stack`;
               throw new InterfaceError('ErrorType',{entryPoints,message});
           }
       }
       return true;
   }
   validateInIncludes(value,entryPoints=['not_defined']){
       let equalValues=this.includes;
       if(equalValues.length>0){
           let check=false;
           for(let equal of equalValues){
               let te=typeof equal;
               if(te ==='function'){
                   if(this.instanceOf(value,equal)){
                       check=true;
                       break;
                   }
               } else if(value === equal){
                   check=true;
                   break;
               }
           }
           if(!check){
               //Does not match the values [${values}].
               switch(typeof value){
                   case 'function':
                       value=`function ${value.name}`;
                       break;
                   case 'object':
                       if(value!==null){
                           value = `object ${Object.getPrototypeOf(value).constructor.name}`
                       } else {
                           value = 'null';}
                   break;
               }
               let message = `[${value}] is not present in 'includes' stack`;
               throw new InterfaceError('ErrorType',{entryPoints,message});
           }
       }
       return true;
   }
   validateInExcludes(value,entryPoints=['not_defined']){
       let equalValues=this.excludes;
       if(equalValues.length>0){
           let check=true;
           for(let equal of equalValues){
               let te=typeof equal;
               if(te ==='function'){
                   if(this.instanceOf(value,equal)){
                       check=false;
                       break;
                   }
               } else if(value === equal){
                   check=false;
                   break;
               }
           }
           if(!check){
               //Does not match the values [${values}].
               switch(typeof value) {
                   case 'function':
                       value = `function ${value.name}`
                       break;
                   case 'object':
                       if (value !== null) {
                           value = `object ${Object.getPrototypeOf(value).constructor.name}`
                       } else {
                           value = 'null';

                       }
                       break;
               }
               let message = `[${value}] is present on 'excludes' stack`;
               throw new InterfaceError('ErrorType',{entryPoints,message});
           }
       }
       return true;
   }
   compare(criteria,entryPoints=['not_defined']){
       if(!(criteria instanceof Object.getPrototypeOf(this).constructor)){
           let message=`Criteria must meet [object ${Object.getPrototypeOf(this).constructor.name}] .`;
           throw new InterfaceError('ErrorType',{message,entryPoints});
       }
       let errors=[];
       if(!this.types.includes('mixed')){
           if(criteria.types.length<=0 && this.types.length>0){
               let types=[];
               for(let k in this.types){
                   let type=this.types[k];
                   if(typeof type ==='string'){
                       types.criteria.push(type);
                   } else {
                       type=`function ${type.name}`;
                   }
               }
               let message=`criteria must be of values in "types" [${types.join(',')}]`;
               let entryPoints=['action:compare',`types`];
               let error = new InterfaceError('ErrorType',{message,entryPoints});
               errors.push(error.message);
           } else{
               for(let k in criteria.types){
                   let type=criteria.types[k];
                   let entryPoints=['action:compare',`types[${k}]`];
                   try {
                       this.validateInValues(type,this.types,entryPoints);
                   } catch (e) {
                       if(e instanceof InterfaceError){
                           if(typeof type ==='function'){
                               type=`function ${type.name}`;
                           }
                           let message=`Type [type] do not match in criteria`;
                           let error = new InterfaceError('ErrorType',{message,entryPoints});
                           errors.push(error.message);
                       } else {
                           throw e;
                       }
                   }
               }
           }
       }
       if(errors.length>0){
           let message="\n   "+errors.join("\n   ");
           throw new InterfaceError('ErrorType',{message,entryPoints});
       }

       if(criteria.includes.length<=0 && this.includes.length>0){
           let includes=[];
           for(let k in this.includes){
               let include=this.includes[k];
               let t=typeof include;
               if(include===null){
                   includes.push('null')
               } else if (t==='undefined'){
                   includes.push(t);
               } else
               if(t ==='object'){
                   includes.push(`object ${Object.getPrototypeOf(include).constructor.name}`);
               } else if(t ==='function'){
                   includes.push(`function ${include.name}`);
               } else if(t==='string'){
                   includes.push(`"${include}"`);
               } else{
                   includes.push(include);
               }
           }
           let message=`criteria must be of   values  in "includes" [${includes.join(',')}]`;
           let entryPoints=['action:compare',`includes`];
           let error = new InterfaceError('ErrorType',{message,entryPoints});
           errors.push(error.message);
       } else {
           for(let k in criteria.includes){
               let include=criteria.includes[k];
               let entryPoints=['action:compare',`includes[${k}]`];
               try {
                   this.validateInValues(include,this.includes,entryPoints);
               }catch(e){
                   if(e instanceof InterfaceError){
                       errors.push(e.message);
                   } else {
                       throw e;
                   }
               }
           }
       }
       if(criteria.excludes.length<=0 && this.excludes.length>0){
           let excludes=[];
           for(let k in this.excludes){
               let exclude=this.excludes[k];
               let t=typeof exclude;
               if(exclude===null){
                   excludes.push('null')
               } else if (t==='undefined'){
                   excludes.push(t);
               } else
               if(t ==='object'){
                   excludes.push(`object ${Object.getPrototypeOf(exclude).constructor.name}`);
               } else if(t ==='function'){
                   excludes.push(`function ${exclude.name}`);
               } else if(t==='string'){
                   excludes.push(`"${exclude}"`);
               } else{
                   excludes.push(exclude);
               }
           }
           let message=`criteria must be of   values  in "excludes" [${excludes.join(',')}]`;
           let entryPoints=['action:compare',`excludes`];
           let error = new InterfaceError('ErrorType',{message,entryPoints});
           errors.push(error.message);
       }else{
           for(let k in criteria.excludes){
               let exclude=criteria.excludes[k];
               let entryPoints=['action:compare',`excludes[${k}]`];
               try {
                   this.validateInValues(exclude,this.excludes,entryPoints);
               }catch(e){
                   if(e instanceof InterfaceError){
                       errors.push(e.message);
                   } else {
                       throw e;
                   }
               }
           }
       }
       if(errors.length>0){
           let message="\n   "+errors.join("\n   ");
           throw new InterfaceError('ErrorType',{message,entryPoints});
       }
   }
    instanceOf(value,EqualClass){
        return value === EqualClass || value instanceof EqualClass || EqualClass.isPrototypeOf(value) || this.instanceOfInterface(value,EqualClass)
    }
    instanceOfInterface(value,EqualClass){
        // извлекаем интерфейсы из value,
        // сопостовляем Интерфейсы классу
        return false;
    }
    freeze(){
        Object.freeze(this);
    }
}
