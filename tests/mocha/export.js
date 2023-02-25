import * as chaiMod from '../../node_modules/chai/chai.js'
const isNode = typeof process !== 'undefined' && process?.versions?.node
let assert
let expect
if (isNode) {
  assert = chaiMod.default.assert
  expect = chaiMod.default.expect
} else {
  assert = globalThis.chai.assert
  expect = globalThis.chai.expect
}

export {assert,expect,isNode}