'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Things we need to stub
const ReviewChargeReferenceModel = require('../../app/models/review-charge-reference.model.js')

// Thing under test
const CanIStubThisOneService = require('../../app/services/can-i-stub-this-one.service.js')

describe('Can I Stub It (yes we can) service', () => {
  beforeEach(() => {
    const queryStub = Sinon.stub(ReviewChargeReferenceModel, 'query')
    const modifyGraphStub = Sinon.stub()

    modifyGraphStub.returnsThis()
    // The `onCall` numbers work like array indexes so 3 is the fourth call
    modifyGraphStub.onCall(3).resolves('Here is my mock data')

    queryStub.returns({
      findById: Sinon.stub().returnsThis(),
      select: Sinon.stub().returnsThis(),
      withGraphFetched: Sinon.stub().returnsThis(),
      modifyGraph: modifyGraphStub
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('returns my mock data', async () => {
    const result = await CanIStubThisOneService.go()

    expect(result).to.equal('Here is my mock data')
  })
})
