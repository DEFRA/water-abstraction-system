'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillHelper = require('../../support/helpers/bill.helper.js')
const BillLicenceHelper = require('../../support/helpers/bill-licence.helper.js')

// Things we need to stub
const LegacyDeleteBillLicenceRequest = require('../../../app/requests/legacy/delete-bill-licence.request.js')

// Thing under test
const SubmitRemoveBillLicenceService = require('../../../app/services/bill-licences/submit-remove-bill-licence.service.js')

describe('Submit Remove Bill Licence service', () => {
  const user = { id: '0aa9dcaa-9a26-4a77-97ab-c17db54d38a1', useremail: 'carol.shaw@atari.com' }

  let bill
  let billLicence
  let legacyDeleteBillLicenceRequestStub

  beforeEach(async () => {
    bill = await BillHelper.add()
    billLicence = await BillLicenceHelper.add({ billId: bill.id })

    legacyDeleteBillLicenceRequestStub = Sinon.stub(LegacyDeleteBillLicenceRequest, 'send').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('sends a request to the legacy service to delete the bill licence', async () => {
      await SubmitRemoveBillLicenceService.go(billLicence.id, user)

      expect(legacyDeleteBillLicenceRequestStub.called).to.be.true()
    })

    it('returns the path to the legacy bill run processing page with invoice ID option', async () => {
      const result = await SubmitRemoveBillLicenceService.go(billLicence.id, user)

      expect(result).to.equal(`/billing/batch/${bill.billRunId}/processing?invoiceId=${bill.id}`)
    })
  })
})
