
import {
    CriteriaMethodType,
    InterfaceData,
    InterfaceBuilder, InterfaceError
} from "./export.js";

export class InterfaceFuncBuilder {
    static generateRules(Func){
        let rules =InterfaceData.get(Func);
        let entryPoints=[];
        if (rules===undefined){
            if(InterfaceBuilder.isInterface(Func)){
                rules=new InterfaceData(Func);
                entryPoints.push(Func.name);
                let criteria = Func.call({});
                criteria=CriteriaMethodType.formatToObject(criteria);
                if (criteria.options === undefined) {
                    criteria.options = {};
                }
                criteria.options = Object.assign({}, criteria.options, {
                    entryPoints,
                    owner: Func
                });
                criteria = new CriteriaMethodType(criteria);
                rules.ownRules =[{criteria}];
                rules.interfaces.push(Func);
                Func.isFuncInterface=true;
            } else {
                rules=new InterfaceData();
            }
        }
        return rules;
    }

    /**
     * 
     * @param Func
     * @param {InterfaceData} rules
     */
    static addRules(Func,rules,entryPoints=[]){
        let interfaceData;
        if(Func instanceof InterfaceData){
            interfaceData=Func;
        } else {
            interfaceData = InterfaceData.get(Func);
            entryPoints=[Func.name];
        }
        let equal_rule = rules.ownRules[0];
        if(equal_rule!==undefined){
            let equal_criteria=equal_rule.criteria;
            if(interfaceData.ownRules.length>0 && interfaceData.ownRules[0].criteria!==undefined){
                let criteria=interfaceData.ownRules[0].criteria;
                entryPoints=entryPoints.concat([`~${criteria.getOwner().name}~`,`~${equal_criteria.getOwner().name}~`]);
                criteria.compare(equal_criteria,entryPoints);
            }
            interfaceData.ownRules = [equal_rule];
        }
        if(rules.interfaces.length>0){
            for (let val of rules.interfaces) {
                if (!interfaceData.interfaces.includes(val)) {
                    interfaceData.interfaces.push(val);
                }
            }
        }
    }
    
    
    static buildFunc(Func,criteria){
        if (InterfaceBuilder.isInterface(Func)){
            return Func;
        }
        let entryPoints=[Func.name];
        return InterfaceBuilder.generateSandbox(Func,criteria,entryPoints);
    }
    
    
    static extendsInterfaces(Func,...RestInterfaces) {
        let rules=this.generateRules(Func);
        let sandbox;
        try{
            for(let iface of RestInterfaces){
                let interfaceData=this.generateRules(iface);
                this.addRules(rules,interfaceData,[Func.name]);
            };
            sandbox=this.buildFunc(Func,rules.ownRules[0].criteria);
        } catch(e){
            if(e instanceof InterfaceError){
                e.renderErrors();
            }
            throw e;
        }
        InterfaceData.set(sandbox,rules);
        
        return sandbox;
    };
};