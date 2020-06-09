import {InterfaceManager} from './../../export.js';

QUnit.module( 'Class InterfaceError');

QUnit.test('',function(assert){
    class InterfaceTest extends Interface {

    }
    InterfaceTest.isInterface=true;
});