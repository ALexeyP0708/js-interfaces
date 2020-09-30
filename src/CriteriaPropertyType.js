/**
 * @module @alexeyp0708/interface-manager
 */

import {
    InterfaceError,
    MirrorInterface,
    CriteriaType,
    InterfaceData
} from "./export.js";

/**
 *  An instance of the CriteriaMethodType class stores the criteria for a property and manages criteria.  
 *  Describes class properties, class method arguments, class method return value, reactive properties.
 *  @prop {string[]|object[]|function[]} types  the set of types to which the value must match
  *  ```js
 *  [
 *       'mixed' // Any type
 *       'number', // type number 
 *       'string', // type string 
 *       'boolean', // type bool
 *       'symbol', // type symbol
 *       'function', // type function
 *        null, // type null
 *        undefined, // type undefined
 *        {name:'hello'}, //  implements the given instance as a prototype (Object.create (object))
 *        class AnyClass{}, // inherited  the AnyClass class
 *        class Mirror extends MirrorInterface{}, //to check for compliance of any object/class with the Mirror interface
 *  ]
 *  ```
 *  
 *  @prop {Array} includes  sets a set of values ​​that the input parameters must match
 *  Example:
 *  ```js
 *  [
 *      1, //the value must match 1 (number type)
 *      '2', //the value must match '2' (string type)
 *      true, //the value must match true (bool type)
 *      Symbol.for('hello'), //the value must match  Symbol.for('hello') (symbol type)
 *      function(){}, // the value must match a specific function (function type)
 *      class A {}, // if the value being compared is an object or function, then it must belong to class A, 
 *      {name:hello} // if the value being compared is an object,then it must implements  this object as a prototype (Object.create({name:hello})),
 *      null, // the value must match null
 *      undefined // the value must match undefined
 *  ]
 *  ```
 *  @prop {Array} excludes sets the set of values ​​that the input parameters must not match
 *  ```js
 *  [
 *      1, //the value not must match 1 (number type)
 *      '2', //the value not must match '2' (string type)
 *      true, //the value not must match true (bool type)
 *      Symbol.for('hello'), //the value not must match  Symbol.for('hello') (symbol type)
 *      function(){}, // the value not must match a specific function (function type)
 *      class A {}, // if the value being compared is an object or function, then it not must belong to class A
 *      {name:hello} // if the value being compared is an object,then it not must implements  this object as a prototype (Object.create({name:hello})),
 *      null, // the value not must match null
 *      undefined // the value not must match undefined
 *  ]
 *  ```
 * @prop {object} options - settings for criteria
 * ```js
 * {
 *     options:{entryPoints:[],owner:''}
 * }
 * ```
 */
export class CriteriaPropertyType extends CriteriaType{
    /**
     * 
     * @param {object} criteria  Object with criteria. Must iterate object properties CriteriaPropertyType 
     * Example:
     *  ```js
     *  {
     *      types:[
     *          'mixed' 
     *          'number',
     *          'string',
     *          ],
     *      includes:[],
     *      excludes:[],
     *      options:{entryPoints:'MyPoint'}
     *  }
     *  ```
     * @throws {InterfaceError} 
     */
    constructor(criteria = {}) {
        super(criteria);
        Object.defineProperties(this, {
            types: {
                enumerable: true,
                configurable: true,
                writable: true,
                value: ['mixed'],
            },
            includes: {
                enumerable: true,
                configurable: true,
                writable: true,
                value: []
            },
            excludes: {
                enumerable: true,
                configurable: true,
                writable: true,
                value: []
            }
        });
        this.initTypes(criteria.types, this.options.entryPoints);
        let errors = [];
        //let sc=new SilentConsole();
        //sc.denyToSpeak();
        try {
            this.initIncludes(criteria.includes, []);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                //sc.allowToSpeak();
                throw e;
            }
        };
        try {
            this.initExcludes(criteria.excludes, []);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                //sc.allowToSpeak();
                throw e;
            }
        };
        //sc.allowToSpeak();
        if (errors.length > 0) {
            //throw new InterfaceError('Init_BadIncludesOrExcludes', {entryPoints: this.options.entryPoints, errors});
            new InterfaceError('Init_BadIncludesOrExcludes', {entryPoints: this.options.entryPoints, errors}).throw(true);
        }
        //this.freeze();
    }
    
    /**
     * Define the data type of the property
     * @param {string|string[]|function[]|object[]} types 
     * if string, then null|undefined|object|boolean|number|string|symbol|function|mixed 
     * @param string[] entryPoints Indicate where the method call came from

     */
    initTypes(types = ['mixed'], entryPoints = ['not_defined']) {
        entryPoints = Object.assign([], entryPoints);
        if (!Array.isArray(types)) {
            types = [types];
        } else if (types.length === 0) {
            types = ['mixed'];
        } else {
            types = Object.assign([], types);
        }
        if (types.includes('mixed')) {
            types = ['mixed'];
        }
        let errors = [];
        for (let k in types) {
            if (types[k] === null) {
                types[k] = 'null';
            }
            if (types[k] === undefined) {
                types[k] = 'undefined';
            }
            let entryPoints = [`types[${k}]`];
            let tt = typeof types[k];
            if (!(['function','object'].includes(tt) || tt === 'string' && ['null', 'undefined', 'object', 'boolean', 'number', 'string', 'symbol', 'function', 'mixed'].includes(types[k]))) {
                let error = new InterfaceError('InitTypes_badType', {entryPoints, className:Object.getPrototypeOf(this).constructor.name});
                errors.push(error);
            }
        }
        if (errors.length > 0) {
             new InterfaceError('InitTypes', {entryPoints, errors}).throw();
        }
        this.types = types;
    }

    /**
     * Define what values the property should include  
     * Rules:  
     * -Must match the types of current criteria
     * @param {Array} values 
     * @param {Array} entryPoints  Indicate where the method call came from
     */
    initIncludes(values = [], entryPoints = ['not_defined']) {
        entryPoints = Object.assign([], entryPoints);
        let types = this.types;
        if (!Array.isArray(values)) {
            values = [values];
        }
        if (types.length === 1) {
            if (['null', 'undefined'].includes(types[0])) {
                values = [];
            }
        } else if (!Array.isArray(values)) {
            values = [values];
        } else {
            values = Object.assign([], values);
        }
        let errors = [];


        //let sc=new SilentConsole();
        //sc.denyToSpeak();
        
        for (let k in values) {
            let value = values[k];
            try {
                this.validateType(value, [`includes[${k}]`]);
            } catch (e) {
                if (e instanceof InterfaceError) {
                    errors.push(e);
                } else {
                    //sc.allowToSpeak();
                    throw e;
                }
            }
        }
        
        //sc.allowToSpeak();
        
        if (errors.length > 0) {
            new InterfaceError('InitIncludes', {entryPoints,errors}).throw(true);
        }
        this.includes = values;
    }

    /**
     * Define what values the property should exclude  
     * Rules:  
     * -Must match the types of current criteria
     * @param {Array} values
     * @param {Array} entryPoints  Indicate where the method call came from
     */
    initExcludes(values = [], entryPoints = ['not_defined']) {
        entryPoints = Object.assign([], entryPoints);
        let types = this.types;
        if (!Array.isArray(values)) {
            values = [values];
        }
        if (types.length === 1) {
            if (['null', 'undefined'].includes(types[0])) {
                values = [];
            }
        } else if (!Array.isArray(values)) {
            values = [values];
        } else {
            values = Object.assign([], values);
        }
        let errors = [];
        //let sc=new SilentConsole();
        //sc.denyToSpeak();
        for (let k in values) {
            let value = values[k];
            try {
                this.validateType(value, [`excludes[${k}]`]);
            } catch (e) {
                if (e instanceof InterfaceError) {
                    errors.push(e);
                } else {
                    //sc.allowToSpeak();
                    throw e;
                }
            }
        }
        //sc.allowToSpeak();
        if (errors.length > 0) {
            new InterfaceError('InitExcludes', {errors, entryPoints}).throw(true);
        }
        this.excludes = values;
    }

    /**
     * Validation of incoming parameters according to the established current criteria (object)  
     * @param value
     * @param entryPoints Indicate where the method call came from
     * @returns {boolean}
     * @throws {InterfaceError} 
     */
    validate(value, entryPoints = ['not_defined']) {
        entryPoints = Object.assign([], entryPoints);
        this.validateType(value, entryPoints);
        let errors = [];
        //let sc=new SilentConsole();
        //sc.denyToSpeak();
        try {
            this.validateInIncludes(value, []);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                //sc.allowToSpeak();
                throw e;
            }
        }
        try {
            this.validateInExcludes(value, []);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                //sc.allowToSpeak();
                throw e;
            }
        }
        //sc.allowToSpeak();
        if (errors.length > 0) {
            new InterfaceError('Validate', {entryPoints,errors}).throw(true);
        }
        return true;
    }


    /**
     * Validation of incoming parameters by data type according to current the criteria (object) 
     * Rules:  
     * - The type of the passed value must match the criteria of the current object.
     * - If a class or object is passed, then they must inherit Class or Interface or object  specified 
     * in the types of the current criteria
     * - If the criteria set an interface inheriting the MirrorInterface interface, 
     * then any object or class passed must meet the criteria set by this interface
     * @param value
     * @param {Array} entryPoints Indicate where the method call came from
     * @returns {boolean}
     * @throws {InterfaceError} 
     */
    validateType(value, entryPoints = ['not_defined']) {
        entryPoints = Object.assign([], entryPoints);
        let tv = typeof value;
        let types_string = [];
        if (value === null) {
            tv = 'null'
        }
        let errors=[];
        let check = false;
        //let sc=new SilentConsole();
        //sc.denyToSpeak();
        for (let type of this.types) {
            let tt = typeof type;
            if(type === null){tt='null';}
            if (tt === 'string') {
                types_string.push(type);
            } else  if (tt === 'object') {
                types_string.push(`[object ${Object.getPrototypeOf(type).constructor.name}]`);
            } else {
                types_string.push(`[function ${type.name}]`);
            }

            if(['object','function'].includes(tv) && MirrorInterface.isPrototypeOf(type)){
                try {
                    type.validate(value,entryPoints);
                    check = true;
                    break;
                } catch (e) {
                    if(! (e instanceof InterfaceError) || e.type!=='Validate_BadMirrorProperties'){
                        //sc.allowToSpeak();
                        throw e;
                    }
                    errors.push(e);
                }                
            } else
            if (
                tt === 'string' && (type === 'mixed' || tv === type)
                ||  this.instanceOf(value, type)
            ) {
                check = true;
                break;
            }
        }
        //sc.allowToSpeak();
        if (!check) {
            if(tv==='object'){
                tv=`[object ${Object.getPrototypeOf(value).constructor.name}]`;
            } else if(tv==='function'){
                tv=`[function ${value.name}]`;
            }
            new InterfaceError('ValidateType', {entryPoints, expectedTypes:`[${types_string.join(',')}]`,definedType:tv,errors}).throw(true);
        }
        return true;
    }


    /**
     * Checks if a value is in an array or belongs to a Class or an object in the passed array of values  
     * @param value
     * @param {Array} equalValues
     * @returns {boolean}
     */
    isIncludeInValues(value, equalValues = []) {
        let check = false;
        for (let equal of equalValues) {
            let te = typeof equal;
            if (te === 'function' || te === 'object' && equal !== null) {
                if (this.instanceOf(value, equal)) {
                    check = true;
                    break;
                }
            } else if (value === equal) {
                check = true;
                break;
            }
        }
        return check;
    }
    
    /**
     * Validation incoming parameters for compliance with the values ​​set in the "includes" criteria  
     * @param value
     * @param {Array} entryPoints Indicate where the method call came from
     * @throws {InterfaceError} InterfaceError.type==='ValidateInIncludes'
     */
    validateInIncludes(value, entryPoints = ['not_defined']) {
        let equalValues = this.includes;
        if (equalValues.length > 0) {
            if (!this.isIncludeInValues(value,equalValues)) {
                //Does not match the values [${values}].
                switch (typeof value) {
                    case 'function':
                        value = `function ${value.name}`;
                        break;
                    case 'object':
                        if (value !== null) {
                            value = `object ${Object.getPrototypeOf(value).constructor.name}`
                        } else {
                            value = 'null';
                        }
                        break;
                }
                new InterfaceError('ValidateInIncludes', {entryPoints, value}).throw();
            }
        }
    }

    /**
     * Validation incoming parameters for compliance with the values ​​set in the "excludes" criteria  
     * @param value
     * @param {Array} entryPoints Indicate where the method call came from
     * @throws {InterfaceError} InterfaceError.type==='ValidateInExcludes'
     */
    validateInExcludes(value, entryPoints = ['not_defined']) {
        let equalValues = this.excludes;
        if (equalValues.length > 0) {
            if (this.isIncludeInValues(value,equalValues)) {
                //Does not match the values [${values}].
                switch (typeof value) {
                    case 'function':
                        value = `function ${value.name}`;
                        break;
                    case 'object':
                        if (value !== null) {
                            value = `object ${Object.getPrototypeOf(value).constructor.name}`
                        } else {
                            value = 'null';

                        }
                        break;
                }
                new InterfaceError('ValidateInExcludes', {entryPoints, value}).throw();
            }
        }
    }
    
    /**
     * expands the current object with new criteria  
     * @param {CriteriaPropertyType} criteria
     * @param {Array} entryPoints Indicate where the method call came from
     * @throws {InterfaceError} InterfaceError.type==='BadCriteria'
     */
    expand(criteria, entryPoints = ['not_defined']) {
        if (!(criteria instanceof Object.getPrototypeOf(this).constructor)) {
            new InterfaceError('BadCriteria', {className:Object.getPrototypeOf(this).constructor.name, entryPoints}).throw();
        }
        if (!this.types.includes('mixed')) {
            for (let type of criteria.types) {
                if (!this.isIncludeInValues(type,this.types)) {
                    this.types.push(type);
                }
            }
        }
        for (let include of criteria.includes) {
            if (!this.isIncludeInValues(include,this.includes)) {
                this.includes.push(include);
            }
        }
        for (let exclude of criteria.excludes) {
            if (!this.isIncludeInValues(exclude,this.excludes)) {
                this.excludes.push(exclude);
            }
        }
    }

    /**
     * compare criteria with  criteria current object  
     * @param {CriteriaPropertyType} criteria
     * @param {Array} entryPoints Indicate where the method call came from
     * @throws {InterfaceError} 
     * @see [method .#compareType]
     * @see [method .#compareIncludes]
     * @see [method .#compareExcludes]
     */
    compare(criteria, entryPoints = ['not_defined']) {
        entryPoints=Object.assign([],entryPoints);
        if (!(criteria instanceof Object.getPrototypeOf(this).constructor)) {
            new InterfaceError('BadCriteria', {className:Object.getPrototypeOf(this).constructor.name, entryPoints}).throw() ;
        }
        this.compareType(criteria, entryPoints);
        let errors = [];

        //let sc=new SilentConsole();
        //sc.denyToSpeak();
        try{
            this.compareIncludes(criteria, entryPoints);
        } catch(e){
            if(e instanceof InterfaceError){
               errors.push(e); 
            }
            else {
                //sc.allowToSpeak();
                throw e;
            }
        }
        try{
            this.compareExcludes(criteria, entryPoints);
        } catch(e){
            if(e instanceof InterfaceError){
                errors.push(e);
            }
            else {
                //sc.allowToSpeak();
                throw e;
            }
        }
        //sc.allowToSpeak();
        if (errors.length > 0) {
            new InterfaceError('Compare_badParams', {errors, entryPoints}).throw(true);
        }
    }

    /**
     * Сompares the criteria types of the interfaces.  
     * Rules:  
     * - Types restrict the Types of the current object.  
     * - If the current object is of type mixed, then no comparison is made;  
     * - The types of the compared object must be present in the types of the current object  
     * - The types of the object being compared that are a Class or an object must implement (inherit) types 
     * that are classes or objects of the current object.  
     * @param {CriteriaPropertyType} criteria
     * @param {Array}entryPoints  Indicate where the method call came from
     * @throws {InterfaceError} InterfaceError.type===Compare_badType
     */
    compareType(criteria, entryPoints = ['not_defined']){
        let errors=[];
        if (!this.types.includes('mixed')) {
            if (criteria.types.length <= 0 && this.types.length > 0) {
                //let entryPoints = [`types`];
                new InterfaceError('Compare_emptyStack', {entryPoints:entryPoints.concat(['types']), name:'types'}).throw();
                //errors.push(error);
            } else {
                for (let k in criteria.types) {
                    let type = criteria.types[k];
                    let entryPoints = [`types[${k}]`];
                    if(this.types.length>0 && !this.isIncludeInValues(type,this.types)){
                        errors.push(new InterfaceError('Compare_ValidateInTypes', {entryPoints, value:type}));
                    }
                }
            }
        }
        if (errors.length > 0) {
            new InterfaceError('Compare_badTypes', {entryPoints, errors}).throw();
        }
    }

    /**
     * Compares an array of included values ​​from the passed criteria with the current criteria (object)  
     * Rules:  
     * -Inclusions restrict the Inclusions of the current object.  
     * -The includes of the compared object must be present in the includes of the current object  
     * -The includes of the object being compared that are a Class or an object must implement (inherit) the includes 
     * that are classes or objects of the current object.  
     * @param {CriteriaPropertyType} criteria
     * @param {Array} entryPoints  Indicate where the method call came from
     */
    compareIncludes(criteria, entryPoints = ['not_defined']){
        let errors=[];
        if (criteria.includes.length <= 0 && this.includes.length > 0) {
            let entryPoints = [`includes`];
            let error = new InterfaceError('Compare_emptyStack', {name:'includes', entryPoints});
            errors.push(error);
        } else {
            for (let k in criteria.includes) {
                let include = criteria.includes[k];
                let entryPoints = [`includes[${k}]`];
                if(this.includes.length>0 &&  !this.isIncludeInValues(include,this.includes)){
                    errors.push(new InterfaceError('ValidateInIncludes', {entryPoints, value:include}));
                }  
            }
        }
        if (errors.length > 0) {
            new InterfaceError('Compare_badIncludes', {entryPoints, errors}).throw();
        }
    }

    /**
     * Compares the exclusions of the passed criteria with the exclusions of the current criteria (object).  
     * Rules:  
     * - the exceptions must extend the exceptions from the current criterion (object);  
     * - In the passed criteria, the exclusions must contain the exclusions of the current criteria (object)  
     * if the criteria by the types of the passed criteria allow this
     * -Exceptions from the passed object, which are a class or object, can be parents (prototypes) 
     * for exceptions that are classes or objects of the current object.  
     * @param {CriteriaPropertyType} criteria
     * @param  {Array} entryPoints  Indicate where the method call came from
     */

    compareExcludes(criteria, entryPoints = ['not_defined']){
        let errors=[];
        if (criteria.excludes.length <= 0 && this.excludes.length > 0) {
            let entryPoints = [`includes`];
            let error = new InterfaceError('Compare_emptyStack', {name:'excludes', entryPoints});
            errors.push(error);
        } else {
            for (let k in this.excludes) {
                let exclude = this.excludes[k];
                let entryPoints = [`excludes[${k}]`];
                if(criteria.excludes.length>0 && !criteria.isIncludeInValues(exclude,criteria.excludes)){
                    try{
                        criteria.validateType(exclude,entryPoints);
                        errors.push(new InterfaceError('ValidateInExcludes', {entryPoints, value:exclude}));
                    }catch(e){
                        if(!(e instanceof InterfaceError) || e.type!=='ValidateType'){
                            throw e;
                        }
                    }
                }
            }
        }
        if (errors.length > 0) {
            new InterfaceError('Compare_badExcludes', {entryPoints, errors}).throw();
        }
    }
    
    /**
     * Checks if a value implements a specified interface / class / object  
     * @param value
     * @param EqualClass
     * @returns {boolean}
     */
    instanceOf(value, EqualClass) {
        let tv=typeof value;
        let te=typeof EqualClass;
        if(tv==='object' && value!== null || tv==='function'){
            return value === EqualClass
                || te==='function' && value instanceof EqualClass
                || EqualClass.isPrototypeOf(value)
                || this.instanceOfInterface(value, EqualClass)
        } else if(te==='function' && ['boolean','number','string','symbol'].includes(tv)){
            return Object.getPrototypeOf(value).constructor===EqualClass;
        }
        return false;
    }

    /**
     * Checks if a class / object implements an interface  
     * @param {object|function} value
     * @param {function} EqualClass
     * @returns {boolean}
     */

    instanceOfInterface(value, EqualClass) {
        return InterfaceData.instanceOfInterface(value,EqualClass);
    }

    /**
     * Freeze the current object  
     */
    freeze() {
        Object.freeze(this);
    }
}
InterfaceData.addGlobalEndPoints(CriteriaPropertyType);
