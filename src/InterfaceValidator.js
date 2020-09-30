import {
    CriteriaPropertyType,
    CriteriaReactType,
    CriteriaMethodType,
    Descriptors,
    InterfaceError,
    InterfaceData
    
} from "./export.js";

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

        //let sc=new SilentConsole();
        //sc.denyToSpeak();
        for (let prop of Object.getOwnPropertyNames(rules)) {
            let last = rules[prop].length - 1;
            if (!descriptors.hasOwnProperty(prop)) {
                if(!(rules[prop][0] instanceof CriteriaPropertyType) ||
                    !rules[prop][0].types.includes('undefined') && !rules[prop][0].types.includes('mixed')){
                    let entryPoints = ['~'+rules[prop][last].criteria.getOwner().name+'~', `${prefix}${prop}`];
                    let error = new InterfaceError('ValidateMemberDeclared', {entryPoints});
                    errors.push(error);
                }
                continue;
            }
            for (let rule of rules[prop]) {
                let entryPoints = ['~'+rule.criteria.getOwner().name+'~', `${prefix}${prop}`];
                if (rule.criteria instanceof CriteriaReactType) {
                    if (!('get' in descriptors[prop]) && !('set' in descriptors[prop])) {
                        let error = new InterfaceError('ValidateReactDeclared', {
                            entryPoints: entryPoints.concat(['get/set']),
                            react_type: 'getter/setter'
                        });
                        errors.push(error);
                        continue;
                    }
                    if (rule.criteria.get !== undefined && descriptors[prop].get === undefined) {
                        let error = new InterfaceError('ValidateReactDeclared', {
                            entryPoints: entryPoints.concat(['get']),
                            react_type: 'getter'
                        });
                        errors.push(error.message);
                    } else if (rule.criteria.get === undefined && descriptors[prop].get !== undefined) {
                        let error = new InterfaceError('ValidateReactDeclared', {
                            entryPoints: entryPoints.concat(['get']),
                            not: 'not',
                            react_type: 'getter'
                        });
                        errors.push(error);
                    }
                    if (rule.criteria.set !== undefined && descriptors[prop].set === undefined) {
                        let error = new InterfaceError('ValidateReactDeclared', {
                            entryPoints: entryPoints.concat(['set']),
                            react_type: 'setter'
                        });
                        errors.push(error);
                    } else if (rule.criteria.set === undefined && descriptors[prop].set !== undefined) {
                        let error = new InterfaceError('ValidateReactDeclared', {
                            entryPoints: entryPoints.concat(['set']),
                            not: 'not',
                            react_type: 'setter'
                        });
                        errors.push(error);
                    }
                } else if (rule.criteria instanceof CriteriaMethodType) {
                    if (typeof descriptors[prop].value !== 'function') {
                        let error = new InterfaceError('ValidateMethodDeclared', {entryPoints});
                        errors.push(error);
                    }
                } else if (rule.criteria instanceof CriteriaPropertyType) {
                    try {
                        rule.criteria.validate(descriptors[prop].value, entryPoints);
                    } catch (error) {
                        if (error instanceof InterfaceError) {
                            errors.push(error);
                        } else {
                            //sc.allowToSpeak();
                            throw error;
                        }
                    }
                }
            }
        }
        //sc.allowToSpeak();
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
     * @param { InterfaceData } rules {class,criteria}
     *          class- constructor Interface that generated the criteria
     *          criteria -  CriteriaPropertyType|CriteriaMethodType|CriteriaReactType []
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