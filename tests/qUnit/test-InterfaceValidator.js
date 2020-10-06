import {
    InterfaceRules,
    Descriptors,
    InterfaceValidator,
    InterfaceError} from "../../src/export.js";

QUnit.module( 'Class InterfaceValidator');

QUnit.test('Methods test InterfaceValidator class',function(assert){

    // validateDescriptors
    {
        class InterfaceTest{
            method(){
                return {
                    arguments:[
                        {
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            /*get react (){
                return {
                    types:'mixed'
                };
            }*/
            set react(v){
                v.types='mixed';
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            static get static_react (){
                return {
                    types:'mixed'
                };
            }
            static set static_react(v){
                v.types='mixed';
            }
        }
        InterfaceTest.prototype.prop={
            types:'number'
        };
        InterfaceTest.static_prop={
            types:'number'
        };
        InterfaceTest.isInterface=true;
        let rules=InterfaceRules.init(InterfaceTest);
        {
            class Test{

            }
            InterfaceRules.init(Test,rules);
            let staticDescs=Descriptors.get(Test);
            let protoDescs=Descriptors.get(Test.prototype);
            let result={
                staticProps:InterfaceValidator.validateDescriptors(staticDescs,rules.staticProps,true),
                protoProps:InterfaceValidator.validateDescriptors(protoDescs,rules.protoProps)
            };
            result.staticProps.forEach((value,key,self)=>{
                self[key]=value.message;
            });
            result.protoProps.forEach((value,key,self)=>{
                self[key]=value.message;
            });
            let match={
                staticProps:[
                    new InterfaceError('ValidateMemberDeclared',{entryPoints:['~InterfaceTest~','.static_method']}).message,
                    new InterfaceError('ValidateMemberDeclared',{entryPoints:['~InterfaceTest~','.static_react']}).message,
                    new InterfaceError('ValidateMemberDeclared',{entryPoints:['~InterfaceTest~','.static_prop']}).message
                ],
                protoProps:[

                    new InterfaceError('ValidateMemberDeclared',{entryPoints:['~InterfaceTest~','#method']}).message,
                    new InterfaceError('ValidateMemberDeclared',{entryPoints:['~InterfaceTest~','#react']}).message,
                    new InterfaceError('ValidateMemberDeclared',{entryPoints:['~InterfaceTest~','#prop']}).message

                ]
            };
            assert.deepEqual(result,match,'validateDescriptors - The property must be declared (Warn:reproduces the match by error message.)');
        }
        {
            class Test{
                set method(a){
                    return 1;
                }
                get react (){
                    return 1;
                }
                static static_method(a=1){
                    return 1;
                }
                static static_react (){
                    return 1;
                }
            }
            Test.prototype.prop='1';
            Test.static_prop='1';
            InterfaceRules.init(Test,rules);
            let staticDescs=Descriptors.get(Test);
            let protoDescs=Descriptors.get(Test.prototype);
            let result={
                staticProps:InterfaceValidator.validateDescriptors(staticDescs,rules.staticProps,true),
                protoProps:InterfaceValidator.validateDescriptors(protoDescs,rules.protoProps)
            };
            result.staticProps.forEach((value,key,self)=>{
                self[key]=value.message;
            });
            result.protoProps.forEach((value,key,self)=>{
                self[key]=value.message;
            });
            let match={
                staticProps:[
                    new InterfaceError('ValidateReactDeclared',{entryPoints:['~InterfaceTest~','.static_react',"get/set"],react_type:"getter/setter"}).message,
                    new InterfaceError('ValidateType',{errors:[],entryPoints:['~InterfaceTest~','.static_prop'],expectedTypes:'[number]',definedType:"string"}).message
                ],
                protoProps:[
                    new InterfaceError('ValidateMethodDeclared',{entryPoints:['~InterfaceTest~','#method']}).message,
                    new InterfaceError('ValidateReactDeclared',{entryPoints:['~InterfaceTest~','#react','get'],react_type:'getter',not:'not'}).message,
                    new InterfaceError('ValidateReactDeclared',{entryPoints:['~InterfaceTest~','#react','set'],react_type:'setter'}).message,
                    new InterfaceError('ValidateType',{errors:[],entryPoints:['~InterfaceTest~','#prop'],expectedTypes:'[number]',definedType:"string"}).message
                ]
            };
            assert.deepEqual(result,match,'validateDescriptors - test other throws error (Warn:reproduces the match by error message.');
        }
    }

    // validateObject
    {
        class InterfaceTest{
            static static_method(){
                return {
                    arguments:[
                        {
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            static get static_react (){
                return {
                    types:'mixed'
                };
            }
            static set static_react(v){
                v.types='mixed';
            }
        }
        InterfaceTest.static_prop={
            types:'number'
        };
        InterfaceTest.isInterface=true;
        let rules=InterfaceRules.init(InterfaceTest);
        class Test {
            set method(a){
                return 1;
            }
            get react (){
                return 1;
            }
            static static_method(a=1){
                return 1;
            }
            static static_react (){
                return 1;
            }
        }
        Test.static_prop='1';
        InterfaceRules.init(Test,rules);
        let errors=InterfaceValidator.validateObject(Test,rules.staticProps);
        errors.forEach((error,key)=>{
            errors[key]=error.type;
        });
        let match=[
            'ValidateReactDeclared',
            'ValidateType',
        ];
        assert.propEqual(errors,match,'method validateObject');
    }
    // validateClass
    {
        class InterfaceTest{
            method(){
                return {
                    arguments:[
                        {
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            /*get react (){
                return {
                    types:'mixed'
                };
            }*/
            set react(v){
                v.types='mixed';
            }
            static static_method(){
                return {
                    arguments:[
                        {
                            types:'mixed'
                        }
                    ],
                    return:{
                        types:'mixed'
                    }
                };
            }
            static get static_react (){
                return {
                    types:'mixed'
                };
            }
            static set static_react(v){
                v.types='mixed';
            }
        }
        InterfaceTest.prototype.prop={
            types:'number'
        };
        InterfaceTest.static_prop={
            types:'number'
        };
        InterfaceTest.isInterface=true;
        let rules=InterfaceRules.init(InterfaceTest);
        class Test{
            set method(a){
                return 1;
            }
            get react (){
                return 1;
            }
            static static_method(a=1){
                return 1;
            }
            static static_react (){
                return 1;
            }
        }
        Test.prototype.prop='1';
        Test.static_prop='1';
        InterfaceRules.init(Test,rules);
        let errors=[];
        assert.throws(function(){
            errors=InterfaceValidator.validateClass(Test,rules);
        },function (e) {
            return e instanceof InterfaceError && e.type==='Validate_BadMembers'
        },'validateClass');
    }


});