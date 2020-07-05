import {InterfaceError,InterfaceManager} from "./export.js";

export class CriteriaPropertyType {
    constructor(criteria = {}) {
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
            },
            options: {
                enumerable: true,
                configurable: true,
                writable: true,
                value: {}
            }
        });
        this.initOptions(criteria.options);
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

    initOptions(options={}){
        this.options={};
        this.options.entryPoints='entryPoints' in options?options.entryPoints:['not_defined'];
        this.options.owner=options.hasOwnProperty('owner')?options.owner:class not_defined {};
    }
    setOwner(owner){
        this.options.owner=owner;
    }
    getOwner(){
        return this.options.owner;
    }

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

    validateType(value, entryPoints = ['not_defined']) {
        entryPoints = Object.assign([], entryPoints);
        let tv = typeof value;
        let types_string = [];
        if (value === null) {
            tv = 'null'
        }

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
            throw new InterfaceError('ValidateType', {entryPoints, expectedTypes:`[${types_string.join(',')}]`,definedType:tv});
        }
        return true;
    }

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
     * compare criteria with  own criteria
     * @param criteria
     * @param entryPoints
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

    instanceOfInterface(value, EqualClass) {
        return InterfaceManager.instanceOfInterface(value,EqualClass);
    }

    freeze() {
        Object.freeze(this);
    }
}
