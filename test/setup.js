'use strict'

const Sinon = require('sinon')

const omgStub = Sinon.stub()
const omfgStub = Sinon.stub()

global.GlobalNotifier = {
  omg: omgStub,
  omfg: omfgStub,
  // Move the function inside the object
  resetNotifier: () => {
    omgStub.resetHistory()
    omfgStub.resetHistory()
  }
}
