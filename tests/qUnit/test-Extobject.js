import {ExtObject} from './../../export.js';

QUnit.module('Class ExtObject');
QUnit.test('тест  ExtObject.collectorArguments',function(assert){
    let params=ExtObject.collectorArguments(
        ['hello','hello1','hello2','hello3'],
        [
            'qwer',{a:1,b:1},{},'ner ner'
        ],
        {
            hello:'asdf',
            hello1:{
                a:2,c:2
            },
            hello2:'привет'
        }
        true
    );
    let match={
        hello:'asdf',
        hello1:{
            a:2,
            b:1,
            c:2
        },
        hello2:'привет',
        hello3:'ner ner'
    };
    assert.propEqual(params,match,'Тест сборки аргументов в обьект');
});