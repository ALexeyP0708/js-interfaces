/**
 * @module @alexeyp0708/interface-manager
 */

import {InterfaceError,InterfaceManager,CriteriaMirrorInterface,CriteriaType} from "./export.js";

/**
 *  Class CriteriaPropertyType Creates and manages criteria.
 *  Describes class properties, class method arguments, class method return value, reactive properties.
 *  @prop {string[]|object|function[]} types  the set of types to which the value must match
 *  if string, then null|undefined|object|boolean|number|string|symbol|function|mixed checking the compared value will be done by the js data type (typeof)
 *  If an object or function (class), then it will be checked if the value implements the corresponding object or function
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
 *        class AnyClass{}, // belonging to the AnyClass class
 *        class Mirror extends CriteriaMirrorInterface{}, //to check for compliance of any object with the Mirror interface
 *  ]
 *  ```
 *  
 *  @prop {[]} includes  sets a set of values ​​that the input parameters must match
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
 *  @prop {[]} excludes sets the set of values ​​that the input parameters must not match
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
     * @param criteria  Object with criteria. Must iterate object properties CriteriaPropertyType 
     * Example:
     * ```js
     * {
     *      types:[
     *          'mixed' 
     *          'number',
     *          'string',
     *          ],
     *      includes:[],
     *      excludes:[].
     *      options:{entryPoints:'MyPoint'}
     *          
     * }
     * ```
     * @throws {InterfaceError} InterfaceError.type===Init_BadIncludesOrExcludes
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
        try {
            this.initIncludes(criteria.includes, []);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                throw e;
            }
        };
        try {
            this.initExcludes(criteria.excludes, []);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                throw e;
            }
        };
        if (errors.length > 0) {
            throw new InterfaceError('Init_BadIncludesOrExcludes', {entryPoints: this.options.entryPoints, errors});
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
            throw new InterfaceError('InitTypes', {entryPoints, errors});
        }
        this.types = types;
    }

    /**
     * Define what values the property should include
     * @param values 
     * @param entryPoints  Indicate where the method call came from
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
        for (let k in values) {
            let value = values[k];
            try {
                this.validateType(value, [`includes[${k}]`]);
            } catch (e) {
                if (e instanceof InterfaceError) {
                    errors.push(e);
                } else {
                    throw e;
                }
            }
        }
        if (errors.length > 0) {
            throw  new InterfaceError('InitIncludes', {entryPoints,errors});
        }
        this.includes = values;
    }

    /**
     * Define what values the property should exclude
     * @param values
     * @param entryPoints  Indicate where the method call came from
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
        for (let k in values) {
            let value = values[k];
            try {
                this.validateType(value, [`excludes[${k}]`]);
            } catch (e) {
                if (e instanceof InterfaceError) {
                    errors.push(e);
                } else {
                    throw e;
                }
            }
        }
        if (errors.length > 0) {
            throw  new InterfaceError('InitExcludes', {errors, entryPoints});
        }
        this.excludes = values;
    }

    /**
     * Validation of incoming parameters according to the established criteria in this object
     * @param value
     * @param entryPoints Indicate where the method call came from
     * @returns {boolean}
     * @throws {InterfaceError} InterfaceError.type==='Validate'
     */
    validate(value, entryPoints = ['not_defined']) {
        entryPoints = Object.assign([], entryPoints);
        this.validateType(value, entryPoints);
        let errors = [];
        try {
            this.validateInIncludes(value, []);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                throw e;
            }
        }
        try {
            this.validateInExcludes(value, []);
        } catch (e) {
            if (e instanceof InterfaceError) {
                errors.push(e);
            } else {
                throw e;
            }
        }
        if (errors.length > 0) {
            throw new InterfaceError('Validate', {entryPoints,errors})
        }
        return true;
    }

    /**
     * Checking incoming parameters for data type according to the criteria of this object
     * @param value
     * @param entryPoints Indicate where the method call came from
     * @returns {boolean}
     * @throws {InterfaceError} InterfaceError.type==='ValidateType'
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
        for (let type of this.types) {
            let tt = typeof type;
            if(type===null){tt='null';}
            if (tt === 'string') {
                types_string.push(type);
            } else  if (tt === 'object') {
                types_string.push(`[object ${Object.getPrototypeOf(type).constructor.name}]`);
            } else {
                types_string.push(`[function ${type.name}]`);
            }

            if(tv==='object' && CriteriaMirrorInterface.isPrototypeOf(type)){
                try {
                    type.validate(value,entryPoints);
                    check = true;
                    break;
                } catch (e) {
                    if(! (e instanceof InterfaceError) || e.type!=='Validate_BadMirrorProperties'){
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
        if (!check) {
            if(tv==='object'){
                tv=`[object ${Object.getPrototypeOf(value).constructor.name}]`;
            } else if(tv==='function'){
                tv=`[function ${value.name}]`;
            }
            throw new InterfaceError('ValidateType', {entryPoints, expectedTypes:`[${types_string.join(',')}]`,definedType:tv,errors});
        }
        return true;
    }

    /**
     * Checking incoming parameters for compliance with values
     * Used when comparing interfaces and combining them.
     * @param value
     * @param {array} equalValues 
     * If the element in the array is an object or is an function,
     * then it will check whether the input parameter implements this object or function (Prototype check)
     * @param entryPoints Indicate where the method call came from
     * @returns {boolean}
     * @throws {InterfaceError} InterfaceError.type==='ValidateInValues'
     * 
     */
    validateInValues(value, equalValues = [], entryPoints = ['not_defined']) {
        if (equalValues.length > 0) {
            let check = false;
            for (let equal of equalValues) {
                let te = typeof equal;
                if (te === 'function' || te === 'object' && equal!==null) {
                    if(this.instanceOf(value, equal)){
                        check =true;
                        break;
                    }
                } else if(value === equal){
                    check = true;
                    break;
                }
            }
            if (!check) {
                //Does not match the values [${values}].
                try{
                    this.validateType(value,entryPoints);
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
                    throw new InterfaceError('ValidateInValues', {entryPoints, value});
                }catch(e){
                    if (!(e instanceof InterfaceError) || e.type === 'ValidateInValues') {
                        throw e;
                    }
                }
            }
        }
        return true;
    }

    /**
     * Checking incoming parameters for compliance with the values ​​set in the "includes" criteria
     * @param value
     * @param entryPoints Indicate where the method call came from
     * @returns {boolean}
     * @throws {InterfaceError} InterfaceError.type==='ValidateInIncludes'
     */
    validateInIncludes(value, entryPoints = ['not_defined']) {
        let equalValues = this.includes;
        if (equalValues.length > 0) {
            let check = false;
            for (let equal of equalValues) {
                let te = typeof equal;
                if (te === 'function' || te === 'object' && equal!==null) {
                    if(this.instanceOf(value, equal)){
                        check =true;
                    }
                    break;
                } else if( value === equal) {
                    check =true;
                    break;
                }
            }
            if (!check) {
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
                throw new InterfaceError('ValidateInIncludes', {entryPoints, value});
            }
        }
        return true;
    }

    /**
     * Checking incoming parameters for compliance with the values ​​set in the "excludes" criteria
     * @param value
     * @param entryPoints Indicate where the method call came from
     * @returns {boolean}
     * @throws {InterfaceError} InterfaceError.type==='ValidateInExcludes'
     */
    validateInExcludes(value, entryPoints = ['not_defined']) {
        let equalValues = this.excludes;
        if (equalValues.length > 0) {
            let check = true;
            for (let equal of equalValues) {
                let te = typeof equal;
                if (te === 'function' || te === 'object' && equal!==null) {
                    if(this.instanceOf(value, equal)){
                        check =false;
                        break;
                    }
                } else  if(value === equal){
                    check = false;
                    break;
                }
            }
            if (!check) {
                //Does not match the values [${values}].
                switch (typeof value) {
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
                throw new InterfaceError('ValidateInExcludes', {entryPoints, value});
            }
        }
        return true;
    }

    validateMirrorInterface(value,entryPoints = ['not_defined']){
   
    }
    /**
     * expands the current object with new criteria
     * @param criteria
     * @param entryPoints
     * @throws {InterfaceError} InterfaceError.type==='BadCriteria'
     */
    expand(criteria, entryPoints = ['not_defined']) {
        if (!(criteria instanceof Object.getPrototypeOf(this).constructor)) {
            throw new InterfaceError('BadCriteria', {className:Object.getPrototypeOf(this).constructor.name, entryPoints});
        }
        if (!this.types.includes('mixed')) {
            for (let type of criteria.types) {
                if (!this.types.includes(type)) {
                    this.types.push(type);
                }
            }
        }
        for (let include of criteria.includes) {
            if (!this.includes.includes(include)) {
                this.includes.push(include);
            }
        }
        for (let exclude of criteria.excludes) {
            if (!this.excludes.includes(exclude)) {
                this.excludes.push(exclude);
            }
        }
    }

    /**
     * compare criteria with  criteria current object
     * @param criteria
     * @param entryPoints
     *@throws {InterfaceError} InterfaceError.type===BadCriteria|Compare_badParams|Compare_badValues|Compare_badType
     */
    compare(criteria, entryPoints = ['not_defined']) {
        entryPoints=Object.assign([],entryPoints);
        if (!(criteria instanceof Object.getPrototypeOf(this).constructor)) {
            throw new InterfaceError('BadCriteria', {className:Object.getPrototypeOf(this).constructor.name, entryPoints});
        }
        let errors = [];
        if (!this.types.includes('mixed')) {
            if (criteria.types.length <= 0 && this.types.length > 0) {
                //let entryPoints = [`types`];
                throw new InterfaceError('Compare_badValues', {entryPoints:entryPoints.concat(['types']), name:'types'});
                //errors.push(error);
            } else {
                for (let k in criteria.types) {
                    let type = criteria.types[k];
                    let entryPoints = [`types[${k}]`];
                    try {
                        this.validateInValues(type, this.types, entryPoints);
                    } catch (e) {
                        if (e instanceof InterfaceError) {
                            errors.push(e);
                        } else {
                            throw e;
                        }
                    }
                }
            }
        }
        if (errors.length > 0) {
            throw new InterfaceError('Compare_badType', {entryPoints, errors});
        }

        if (criteria.includes.length <= 0 && this.includes.length > 0) {
            let entryPoints = [`includes`];
            let error = new InterfaceError('Compare_badValues', {name:'includes', entryPoints});
            errors.push(error);
        } else {
            for (let k in criteria.includes) {
                let include = criteria.includes[k];
                let entryPoints = [`includes[${k}]`];
                try {
                    this.validateInValues(include, this.includes, entryPoints);
                } catch (e) {
                    if (e instanceof InterfaceError) {
                        errors.push(e);
                    } else {
                        throw e;
                    }
                }
            }
        }

        for (let k in this.excludes) {
            let exclude = this.excludes[k];
            let entryPoints = [`excludes[${k}]`];
            try{
            }catch (e) {

            }
            try {
                criteria.validateInValues(exclude, criteria.excludes, entryPoints);
            } catch (e) {
                if (e instanceof InterfaceError) {
                    errors.push(e);
                } else {
                    throw e;
                }
            }
        }
        if (errors.length > 0) {
            throw new InterfaceError('Compare_badParams', {errors, entryPoints});
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
     * @param {object|class} value
     * @param {class} EqualClass
     * @returns {boolean}
     */

    instanceOfInterface(value, EqualClass) {
        return InterfaceManager.instanceOfInterface(value,EqualClass);
    }

    /**
     * Freeze the current object
     */
    freeze() {
        Object.freeze(this);
    }
}
