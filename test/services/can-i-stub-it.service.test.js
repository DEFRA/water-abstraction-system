'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const RegionModel = require('../../app/models/region.model.js')

// Thing under test
const CanIStubItService = require('../../app/services/can-i-stub-it.service.js')

describe('Can I Stub It (yes we can) service', () => {
  beforeEach(() => {
    const queryStub = Sinon.stub(RegionModel, 'query')
    const whereStub = Sinon.stub()

    whereStub.returnsThis()
    // The `onCall` numbers work like array indexes so 2 is the third call
    whereStub.onCall(2).resolves('Here is my mock data')

    queryStub.returns({
      select: Sinon.stub().returnsThis(),
      where: whereStub
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('returns my mock data', async () => {
    const result = await CanIStubItService.go()

    expect(result).to.equal('Here is my mock data')
  })
})
