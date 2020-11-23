
import {
    CriteriaMethodType, InterfaceBuilder, InterfaceData, InterfaceError,
    InterfaceFuncBuilder
} from '../../src/export.js';
QUnit.module( 'Class InterfaceFuncBuilder');

QUnit.test('Methods test InterfaceFuncBuilder class',function(assert){
    //generateRules for interface
    {
        let func=function(){
            return {
                arguments:[
                    {
                        types:'number'
                    }
                ],
                return:{
                    types:'number'
                }
            };
        };
        func.isInterface=true;
        let rules = InterfaceFuncBuilder.generateRules(func);
        let results=[
            rules.interfaces[0]===func,
            rules.ownRules[0].criteria instanceof CriteriaMethodType,
            InterfaceData.get(func)===rules,
        ];
        let matches=[];    
        results.forEach(()=>{matches.push(true);});
        assert.propEqual(results,matches,'generateRules for interface');
    }

    //generateRules for function
    {
        let func=function(){
            
        };
        let rules = InterfaceFuncBuilder.generateRules(func);
        let results=[
            InterfaceData.get(func)===undefined,
        ];
        let matches=[];
        results.forEach(()=>{matches.push(true);});
        assert.propEqual(results,matches,'generateRules for function');
    }
    
    // addRules
    {
        let iFunc=function(){
            return {
                arguments:[
                    {types:'number'}
                ]                
            };
            
        };
        iFunc.isInterface=true;
        let iFunc2=function(){
            return {
                arguments:[
                    {types:'number'}
                ]
            };
        };
        iFunc2.isInterface=true;
        let iFunc3=function(){
            return {
                arguments:[
                    {types:'string'}// error compare
                ]
            };
        };
        iFunc3.isInterface=true;
        let iRules=InterfaceFuncBuilder.generateRules(iFunc);
        let iRules2=InterfaceFuncBuilder.generateRules(iFunc2);
        let iRules3=InterfaceFuncBuilder.generateRules(iFunc3);
        let func=function(){};
        let rules=InterfaceData.init(func);
        InterfaceFuncBuilder.addRules(func,iRules);
        InterfaceFuncBuilder.addRules(func,iRules2);
        
        let check=false;
        try { 
            InterfaceFuncBuilder.addRules(func,iRules3);
        } catch (e) {
            if(e instanceof InterfaceError){
                check=true;
            } else {
                throw e;
            }
        }
        let results=[
            rules.interfaces.includes(iFunc)&&rules.interfaces.includes(iFunc2),
            InterfaceData.get(func).ownRules[0]===InterfaceData.get(iFunc2).ownRules[0],
            check
        ];
        
        let matches=[];
        results.forEach(()=>{matches.push(true);});
        assert.propEqual(results,matches,'addRules');
    }   
    
    //buildFunc
    {
        let func=()=>{};
        let criteria=new CriteriaMethodType({
            arguments:[
                {
                    types:['number']
                }
            ]
        });
        let sandbox=InterfaceFuncBuilder.buildFunc(func,criteria);
        let results=[
            sandbox!==func,
            InterfaceBuilder.getOwnerOfSandbox(sandbox)===func,
            sandbox.name===func.name
        ];

        let matches=[];
        results.forEach(()=>{matches.push(true);});
        assert.propEqual(results,matches,'buildFunc');
    }
    
    //extendsInterfaces
    {
        let iFunc=()=>{
            //return Object.assign([a,b,c],{return:{types:['string','number']}});
            return {
                arguments:[
                    {
                        types:['number','string']
                    },
                    {
                        types:['number','string']
                    },
                    {
                        types:['number','string']
                    },
                ],
                return:{types:['string','number']}
            };
        };
        iFunc.isInterface=true;
        let iFunc2=()=>{
            return {
                arguments:[
                    {
                        types:['number','string']
                    },
                    {
                        types:['number','string']
                    },
                    {
                        types:['number','string']
                    },
                    {
                        types:['undefined','number','string']
                    },
                ],
                return:{types:['string','number']}
            };
        };
        iFunc2.isInterface=true;
        let func=function(){};
        let sandbox=InterfaceFuncBuilder.extendsInterfaces(func,iFunc,iFunc2);
        let results=[
            InterfaceData.get(sandbox).interfaces.includes(iFunc)&& InterfaceData.get(sandbox).interfaces.includes(iFunc2),
            InterfaceData.get(sandbox).ownRules[0]===InterfaceData.get(iFunc2).ownRules[0],
            
            sandbox!==func,
            InterfaceBuilder.getOwnerOfSandbox(sandbox)===func,
            sandbox.name===func.name
        ];
        let matches=[];
        results.forEach(()=>{matches.push(true);});
        assert.propEqual(results,matches,'extendsInterfaces');
    }
});
