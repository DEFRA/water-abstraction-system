'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillHelper = require('../../support/helpers/bill.helper.js')

// Things we need to stub
const LegacyDeleteBillRequest = require('../../../app/requests/legacy/delete-bill.request.js')

// Thing under test
const SubmitRemoveBillService = require('../../../app/services/bills/submit-remove-bill.service.js')

describe('Submit Remove Bill service', () => {
  const user = { id: '0aa9dcaa-9a26-4a77-97ab-c17db54d38a1', useremail: 'carol.shaw@atari.com' }

  let bill
  let legacyDeleteBillRequestStub

  beforeEach(async () => {
    bill = await BillHelper.add()

    legacyDeleteBillRequestStub = Sinon.stub(LegacyDeleteBillRequest, 'send').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('sends a request to the legacy service to delete the bill', async () => {
      await SubmitRemoveBillService.go(bill.id, user)

      expect(legacyDeleteBillRequestStub.called).to.be.true()
    })

    it('returns the path to the legacy bill run processing page', async () => {
      const result = await SubmitRemoveBillService.go(bill.id, user)

      expect(result).to.equal(`/billing/batch/${bill.billRunId}/processing`)
    })
  })
})
