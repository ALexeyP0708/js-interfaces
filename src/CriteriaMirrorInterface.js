import{InterfaceManager,InterfaceError} from "./export.js";
export class CriteriaMirrorInterface {
   static validate (object,entryPoints = ['not_defined']){
       //let ProtoClass=Object.getPrototypeOf(this);// parent
       let ProtoClass=this;//this.prototype.constructor;
       if(!InterfaceManager.hasInterfaceData(ProtoClass)){
           ProtoClass.isInterface=true;
           InterfaceManager.extendInterfaces(ProtoClass);
       }
       let rules=InterfaceManager.getInterfaceData(ProtoClass);
       InterfaceManager.getInterfaceData(ProtoClass);
       let errors=InterfaceManager.validatePropsObject(object,rules.protoProps);
       if (errors.length > 0) {
           throw new InterfaceError('Validate_BadMirrorProperties', {errors, entryPoints});
       }
   }

    /**
     * 
     * @param {string|class|undefined} ProtoClass
     * @param protoProp
     * @param staticProp
     */
   static createInterface(ProtoClass,protoProp={},staticProp={}){
      
        
       //------
       let tc= typeof ProtoClass;
       if(tc===undefined){
           [ProtoClass]=[class extends CriteriaMirrorInterface{}];
       } else
       if(tc==='string'){
           ProtoClass={[ProtoClass]:class extends CriteriaMirrorInterface{}}[ProtoClass];
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
        Object.defineProperties(ProtoClass.prototype,descs);
        
        descs=Object.getOwnPropertyDescriptors(staticProp);
        for(let prop in descs){
            if('set' in descs[prop] || 'get' in descs[prop] || typeof descs[prop].value==='function'){
                descs[prop].enumerable=false;
            }
        }
        Object.defineProperties(ProtoClass,descs);
        ProtoClass.isInterface=true;
        InterfaceManager.extendInterfaces(ProtoClass);
        return ProtoClass;
   }
}