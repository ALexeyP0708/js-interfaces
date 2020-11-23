
import {
    CriteriaMethodType,
    CriteriaPropertyType,
    CriteriaReactType,
    InterfaceError,
    InterfaceData,
    Descriptors,
    InterfaceRules,
    InterfaceTools
} from "./export.js";


export class InterfaceManager{

 /*   static buildFunction(func,rule,isExpand){
        let end_points = self.getAllEndPoints();
        if(end_points.includes(func)){
            return func;
        }
        let entryPoints = [`function ${func.name}`, `~${rule.criteria.getOwner().name}~`];
        let ruleFunc=InterfaceManager.initInterfaceData(func);
        if (ruleFunc.isBuilt === true) {
            
        }
        if (isExpand) {
            this.expandAndSetRule(interfaceData.protoProps, prop, rule[0], ProtoClass);
        } else {
            
        }
       
        InterfaceManager.addRules();
        rule.isBuilt = true;
        let newFunc= function (...args) {
            if (args[0] === Symbol.for('get_own_descriptor')) {
                return func;
            }
            try{
                rule.criteria.validateArguments(args, entryPoints);
            }catch(e){
                if(e instanceof InterfaceError){
                    e.renderErrors();
                }
                throw e;
            }
            let answer = func.call(this, ...args);
            try{
                rule.criteria.validateReturn(answer, entryPoints);
            }catch(e){
                if(e instanceof InterfaceError){
                    e.renderErrors();
                }
                throw e;
            }
            return answer;
        };
    };
    static extendFuncInterfaces(func,...RestInterfaces){
        let rule=InterfaceManager.initInterfaceData(func);
        if(rule.isBuilt){
            func = func(Symbol.for('get_own_descriptor'));
        }
        for(let iFunc of RestInterfaces){
            if(!iFunc.isInterface && !InterfaceManager.hasInterfaceData(iFunc)){
                continue;
            } 
            let i_rule;
            if(iFunc.isInterface){
                if(!InterfaceManager.hasInterfaceData(iFunc)){
                    i_rule=InterfaceManager.initInterfaceData(iFunc).ownRule;
                    let criteria=iFunc();
                    if (typeof criteria !== 'object' || criteria === null) {
                        criteria = {};
                    }
                    if (criteria.options === undefined) {
                        criteria.options = {};
                    }
                    criteria.options = Object.assign({}, criteria.options, {
                        entryPoints,
                        owner: iFunc
                    });
                    criteria = new CriteriaMethodType(criteria);
                    i_rule.criteria=criteria;
                }
            }
            i_rule=InterfaceManager.getInterfaceData(iFunc);
            let buf={rule};
            this.compareAndSetRule(buf, 'rule', {i_rule});
            rule=buf.rule;
        }
        rule.isBuilt = true;
        let newFunc= {[func.name]:function (...args) {
            if (args[0] === Symbol.for('get_own_descriptor')) {
                return func;
            }
            try{
                rule.criteria.validateArguments(args, entryPoints);
            }catch(e){
                if(e instanceof InterfaceError){
                    e.renderErrors();
                }
                throw e;
            }
            let answer = func.call(this, ...args);
            try{
                rule.criteria.validateReturn(answer, entryPoints);
            }catch(e){
                if(e instanceof InterfaceError){
                    e.renderErrors();
                }
                throw e;
            }
            return answer;
        }}[func.name];
    }*/
    static generateFuncRules(Func){
        let rules = {
            interfaces: [],
            ownRules:[]
        };
        if (Func.hasOwnProperty('isInterface') && Func.isInterface) {
            let criteria = Func.call({});
            if (typeof criteria !== 'object' || criteria === null) {
                criteria = {};
            }
            if (criteria.options === undefined) {
                criteria.options = {};
            }
            criteria.options = Object.assign({}, criteria.options, {
                entryPoints,
                owner: Func
            });
            criteria = new CriteriaMethodType(criteria);
            rules.ownRules = [{criteria}];
            rules.interfaces.push(Func);
        }
        return rules;
    }
    static addFuncRules(Func,rules = {interfaces: [], ownRules:[]}){
        let interfaceData = InterfaceData.init(Func);
        let equal_rule = rules.ownRules[0];
        let equal_criteria=equal_rule.criteria;
        let criteria=interfaceData.ownRules[0].criteria;
        let ep=entryPoints.concat([`~${criteria.getOwner().name}~`,`~${equal_criteria.getOwner().name}~`]);
        criteria.compare(equal_criteria,ep);
        rules.ownRules = [equal_rule];
    }
    static buildFunc(Func,){
        if (Func.hasOwnProperty('isInterface') && Func.isInterface) {
            return;
        }
    }
    static extendFuncInterfaces(ProtoClass, ...RestInterfaces){
        let rules = this.buildInterface(ProtoClass);
        let isExtend = false;
        let isExpand = false;
        if (typeof RestInterfaces[0] === 'boolean') {
            isExpand = RestInterfaces[0];
            if (typeof RestInterfaces[1] === 'boolean') {
                isExtend = RestInterfaces[1];
                RestInterfaces.splice(1, 1);
            } else if (Array.isArray(RestInterfaces[1])) {

            }
            RestInterfaces.splice(0, 1);
        } else if (typeof RestInterfaces[1] === 'boolean') {
            RestInterfaces.splice(1, 1);
        }
        if (RestInterfaces.length > 0) {
            for (let Interface of RestInterfaces) {
                if (!rules.interfaces.includes(Interface)) {
                    let rulesInterface = this.buildInterface(Interface);
                    rules = this.addRules(ProtoClass, rulesInterface, isExpand);
                }
            }
            rules = InterfaceData.get(ProtoClass);
            if (isExtend) {
                let staticProps = Object.getOwnPropertyNames(rules.staticProps);
                let protoProps = Object.getOwnPropertyNames(rules.protoProps);
                this.extendOwnPropertiesFromPrototypes(ProtoClass, protoProps, staticProps);
            }
            this.buildPropsClass(ProtoClass, rules);
        } else if (isExtend) {
            let staticProps = Object.getOwnPropertyNames(rules.staticProps);
            let protoProps = Object.getOwnPropertyNames(rules.protoProps);
            this.extendOwnPropertiesFromPrototypes(ProtoClass, protoProps, staticProps);
            this.buildPropsClass(ProtoClass, rules);
        }
        return rules;
    }
}

/**
 * The global endpoints at which the analysis of objects along the prototype chain should stop
 * @type {Function[]} 
 */
