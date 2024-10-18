'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ChargeVersionModel = require('../../app/models/charge-version.model.js')

// Thing under test
const CanIStubThisBeastService = require('../../app/services/can-i-stub-this-beast.service.js')

describe.only('Can I Stub It (yes we can) service', () => {
  beforeEach(() => {
    const queryStub = Sinon.stub(ChargeVersionModel, 'query')
    const modifyGraphStub = Sinon.stub()

    modifyGraphStub.returnsThis()
    modifyGraphStub.onCall(5).resolves('Here is my mock data')

    queryStub.returns({
      select: Sinon.stub().returnsThis(),
      innerJoinRelated: Sinon.stub().returnsThis(),
      where: Sinon.stub().returnsThis(),
      whereNotExists: Sinon.stub().returnsThis(),
      whereExists: Sinon.stub().returnsThis(),
      orderBy: Sinon.stub().returnsThis(),
      withGraphFetched: Sinon.stub().returnsThis(),
      modifyGraph: modifyGraphStub
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('returns my mock data', async () => {
    const result = await CanIStubThisBeastService.go()

    expect(result).to.equal('Here is my mock data')
  })
})
