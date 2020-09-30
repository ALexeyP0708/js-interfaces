import {Descriptors,InterfaceData} from '../../src/export.js';
QUnit.module( 'Class Descriptors');

QUnit.test('Methods test Descriptors class',function(assert){
    // get
    {
        class A{
            static staticMethod(){};
            static get staticReact(){
                return 1;
            };
            static set staticReact(v){

            };
            method(){};
            get react(){
                return 1;
            };
            set react(v){

            };
        };
        let interfaces=InterfaceData.init(A);
        let staticMatch=Object.assign({
            staticMethod:Object.assign({
                constructor:A,
            },Object.getOwnPropertyDescriptor(A,'staticMethod')),
            staticReact:Object.assign({
                constructor:A,
            },Object.getOwnPropertyDescriptor(A,'staticReact')),
        });
        assert.deepEqual(Descriptors.get(A),staticMatch,'get - static properties');
        let match=Object.assign({
            method:Object.assign({
                constructor:A,
            },Object.getOwnPropertyDescriptor(A.prototype,'method')),
            react:Object.assign({
                constructor:A,
            },Object.getOwnPropertyDescriptor(A.prototype,'react')),
        });
        assert.deepEqual(Descriptors.get(A.prototype),match,'get - proto properties');
    }

    // getAll
    {
        class A{
            method_A(){}
            static static_method_A(){}
        }
        class B extends A{
            method_B(){}
            static static_method_B(){}
        }
        class C extends B{
            method_C(){}
            static static_method_C(){}
        }
        let static_match={
            static_method_A:Object.assign({
                constructor:A,
            },Object.getOwnPropertyDescriptor(A,'static_method_A')),
            static_method_B:Object.assign({
                constructor:B,
            },Object.getOwnPropertyDescriptor(B,'static_method_B')),
            static_method_C:Object.assign({
                constructor:C,
            },Object.getOwnPropertyDescriptor(C,'static_method_C')),
        };
        let interfaces_A=InterfaceData.init(A);
        assert.deepEqual(Descriptors.getAll(C),static_match,'getAll static properties');
    }

});