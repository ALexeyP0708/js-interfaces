/**
 * @module @alexeyp0708/interface-manager
 */

import {InterfaceError, InterfaceData, InterfaceBuilder, InterfaceValidator, CriteriaType} from "./export.js";

/**
 * An interface that is inherited by other interfaces in order to create a "mirror" check for objects or classes.
 * Object / Class will match the mirror rules.
 * The mirror interface assigns rules, but does not make changes to the object / class being checked. 
 * Thus, it will not be possible to validate arguments and return values ​​for methods and reactive properties.
 */
export class MirrorInterface extends CriteriaType {

   static validate (object,entryPoints = []){
       let ProtoClass=this;//this.prototype.constructor;
       /*let result={
           types:false,
           includes:false,
           excludes:false
       };*/
       if(!InterfaceData.has(ProtoClass)){
           ProtoClass.isInterface=true;
           InterfaceBuilder.extend(ProtoClass);
       }
       let rules=InterfaceData.get(ProtoClass);
       let errors=[];
        let to=typeof object;
       if(to === 'function' ){
           try{
               InterfaceValidator.validateClass(object,rules);
           } catch(e){
               if(!(e instanceof InterfaceError)){
                   throw e;
               }
               errors.push(e);
           }
       } else if(to === 'object' && object!==null){
           errors=InterfaceValidator.validateObject(object,rules.protoProps);
       }/* else {
           errors.push(new Error(`The type must be either an object or a function. Current type:${to}`));
       }*/
       if (errors.length > 0) {
           throw new InterfaceError('Validate_BadMirrorProperties', {errors, entryPoints});
       }
       /*return result;*/
   }

    /**
     * Creates an interface that inherits the current interface (class MirrorInterface) 
     * Creates a class if string, and assigns instance properties and static properties to this class.
     * @param {string|function|undefined} [NewClass]  Class name or class. 
     * @param {object|undefined} [protoProp]
     * @param {object|undefined} [staticProp]
     */
   static createInterface(NewClass,protoProp,staticProp){
       let tc= typeof NewClass;
       let ProtoClass=this;
       if(tc===undefined){
           [NewClass]=[class extends ProtoClass{}];
       } else
       if(tc==='string'){
           NewClass={[NewClass]:class extends ProtoClass{}}[NewClass];
       }
       else if(tc!=='function'){
           throw Error('Invalid parameter type');
       }
       if(protoProp!==undefined){
           let descs=Object.getOwnPropertyDescriptors(protoProp);
           for(let prop in descs){
               if('set' in descs[prop] || 'get' in descs[prop] || typeof descs[prop].value==='function'){
                   descs[prop].enumerable=false;
               }
           }
           Object.defineProperties(NewClass.prototype,descs);
       }
       
        if(staticProp!==undefined){
            let descs=Object.getOwnPropertyDescriptors(staticProp);
            for(let prop in descs){
                if('set' in descs[prop] || 'get' in descs[prop] || typeof descs[prop].value==='function'){
                    descs[prop].enumerable=false;
                }
            }
            Object.defineProperties(NewClass,descs);
        }
       
        NewClass.isInterface=true;
        InterfaceBuilder.extend(NewClass);
        return NewClass;
   }
}
InterfaceData.addGlobalEndPoints(MirrorInterface);