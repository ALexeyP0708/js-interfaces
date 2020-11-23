/**
 * @module @alexeyp0708/interface-manager
 */


import {
    CriteriaType,
    CriteriaPropertyType,
    Descriptors,
    InterfaceError,
    InterfaceData
    
} from "./export.js";

/**
 * performs class validation according to the rules set by the interfaces
 */
export class InterfaceValidator {

    /**
     * Checks descriptors according to interface rules
     * @param descriptors See {@Descriptors.get}
     * @param rules Rules interface for prototype to class or   for  properties to class (static)
     * @return {Array} errors stack
     */
    static validateDescriptors(descriptors, rules = {},isStatic=false) {
        let errors = [];
        let prefix=isStatic?'.':'#';
        for (let prop of Object.getOwnPropertyNames(rules)) {
            let last = rules[prop].length - 1;
            if (!descriptors.hasOwnProperty(prop)) {
                if(
                    !(rules[prop][last].criteria instanceof CriteriaPropertyType) ||
                    !rules[prop][last].criteria.types.includes('undefined') &&
                    !rules[prop][last].criteria.types.includes('mixed')
                ){
                    let entryPoints = ['~'+rules[prop][last].criteria.getOwner().name+'~', `${prefix}${prop}`];
                    let error = new InterfaceError('ValidateMemberDeclared', {entryPoints});
                    errors.push(error);
                }  
                continue;
            }
            for (let rule of rules[prop]) {
                let entryPoints = ['~'+rule.criteria.getOwner().name+'~', `${prefix}${prop}`];
                let criteria=rule.criteria;
                let value;
                if(descriptors[prop].hasOwnProperty('value')){
                    value=descriptors[prop].value;
                } else{
                    value={};
                    if(descriptors[prop].hasOwnProperty('get')){
                        value.get=descriptors[prop].get;
                    }
                    if(descriptors[prop].hasOwnProperty('set')){
                        value.set=descriptors[prop].set;
                    }
                }
                if (rule.criteria instanceof CriteriaType) {
                    try {
                        criteria.validate(value,entryPoints);
                    } catch (error) {
                        if (error instanceof InterfaceError) {
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
     * Checks the object for compliance with the rules (set of criteria)
     * @param {object|function} object
     * @param rules
     * @param {boolean} isStatic
     * @returns {Array}  If errors occur, it will display a set of errors
     */
    static validateObject(object,rules,isStatic=false){
        let descs=Descriptors.getAll(object);
        return this.validateDescriptors(descs, rules,isStatic);
    }



    /**
     * Checks if the Class passes the established rules.
     * @param {function} ProtoClass  Constructor - Class
     * @param { InterfaceData } rules 
     * @throws {InterfaceError} -  Throws if properties validation fails

     */
    static validateClass(ProtoClass, rules = new InterfaceData()) {
        let protoErrorsStack = this.validateObject(ProtoClass.prototype, rules.protoProps);
        let staticErrorsStack = this.validateObject(ProtoClass, rules.staticProps,true);
        let entryPoints = [ProtoClass.name];
        let errors = [];
        errors.splice(errors.length, 0, ...protoErrorsStack);
        errors.splice(errors.length, 0, ...staticErrorsStack);
        if (errors.length > 0) {
            try{
                new InterfaceError('Validate_BadMembers', {errors, entryPoints}).throw(true);
            }catch(e){
                if(e instanceof InterfaceError){
                    e.renderErrors();
                }
                throw e;
            }
        }
    }
}
InterfaceData.addGlobalEndPoints(InterfaceValidator);