/**
 * @module @alexeyp0708/interface-manager
 */

import { InterfaceError, InterfaceData, InterfaceBuilder, InterfaceValidator} from "./export.js";

/**
 * An interface that is inherited by other interfaces in order to create a "mirror" check for objects or classes.
 * Object / Class will match the mirror rules.
 * The mirror interface assigns rules, but does not make changes to the object / class being checked. 
 * Thus, it will not be possible to validate arguments and return values ​​for methods and reactive properties.
 */
export class MirrorInterface  {
    /**
     * Validation the object for matching properties according to the criteria of the current interface
     * @param {object|Function} object
     * @param entryPoints
     */
   static validate (object,entryPoints = ['not_defined']){
       //let ProtoClass=Object.getPrototypeOf(this);// parent
       let ProtoClass=this;//this.prototype.constructor;
       if(!InterfaceData.has(ProtoClass)){
           ProtoClass.isInterface=true;
           InterfaceBuilder.extendInterfaces(ProtoClass);
       }
       let rules=InterfaceData.get(ProtoClass);
       let errors=[];
       if(typeof object === 'function' ){
           try{
               InterfaceValidator.validateClass(object,rules);
           } catch(e){
               if(!(e instanceof InterfaceError)){
                   throw e;
               }
               errors.push(e);
           }
       } else {
           errors=InterfaceValidator.validateObject(object,rules.protoProps);
       }
       if (errors.length > 0) {
           throw new InterfaceError('Validate_BadMirrorProperties', {errors, entryPoints});
       }
   }

    /**
     * Creates an interface that inherits the current interface (class MirrorInterface) 
     * Creates a class if string, and assigns instance properties and static properties to this class.
     * @param {string|class|undefined} NewClass  Class name or class. 
     * @param {} protoProp
     * @param {} staticProp
     */
   static createInterface(NewClass,protoProp={},staticProp={}){
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
       let descs=Object.getOwnPropertyDescriptors(protoProp);
        for(let prop in descs){
            if('set' in descs[prop] || 'get' in descs[prop] || typeof descs[prop].value==='function'){
                descs[prop].enumerable=false;
            }
        }
        Object.defineProperties(NewClass.prototype,descs);
        
        descs=Object.getOwnPropertyDescriptors(staticProp);
        for(let prop in descs){
            if('set' in descs[prop] || 'get' in descs[prop] || typeof descs[prop].value==='function'){
                descs[prop].enumerable=false;
            }
        }
        Object.defineProperties(NewClass,descs);
        NewClass.isInterface=true;
        InterfaceBuilder.extendInterfaces(NewClass);
        return NewClass;
   }
}
InterfaceData.addGlobalEndPoints(MirrorInterface);