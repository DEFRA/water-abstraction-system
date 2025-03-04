'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const BillLicenceModel = require('../../../app/models/bill-licence.model.js')
const LegacyDeleteBillLicenceRequest = require('../../../app/requests/legacy/delete-bill-licence.request.js')
const ProcessBillingFlagService = require('../../../app/services/licences/supplementary/process-billing-flag.service.js')
const UnassignLicencesToBillRunService = require('../../../app/services/bill-runs/unassign-licences-to-bill-run.service.js')

// Thing under test
const SubmitRemoveBillLicenceService = require('../../../app/services/bill-licences/submit-remove-bill-licence.service.js')

describe('Bill Licences - Submit Remove Bill Licence service', () => {
  const user = { id: '0aa9dcaa-9a26-4a77-97ab-c17db54d38a1', useremail: 'carol.shaw@atari.com' }

  let billLicence
  let billLicenceStub
  let legacyDeleteBillLicenceRequestStub
  let processBillingFlagStub
  let unassignLicencesToBillRunStub

  beforeEach(async () => {
    billLicence = {
      id: '59f2510d-4b2f-4b09-a972-e0b2370d191d',
      licenceId: '5d358719-86b8-454e-a862-7a18a8a25103',
      bill: {
        id: '44c459a6-3610-4b84-b515-d4d8785ff87c',
        billRunId: 'c96106fa-b9a3-4f91-b35d-ec1d3108c390'
      }
    }

    billLicenceStub = Sinon.stub().resolves(billLicence)
    Sinon.stub(BillLicenceModel, 'query').returns({
      findById: Sinon.stub().returnsThis(),
      select: Sinon.stub().returnsThis(),
      withGraphFetched: Sinon.stub().returnsThis(),
      modifyGraph: billLicenceStub
    })

    legacyDeleteBillLicenceRequestStub = Sinon.stub(LegacyDeleteBillLicenceRequest, 'send').resolves()
    processBillingFlagStub = Sinon.stub(ProcessBillingFlagService, 'go').resolves()
    unassignLicencesToBillRunStub = Sinon.stub(UnassignLicencesToBillRunService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('calls the "UnassignLicencesToBillRunService" to unassign any licence supplementary year records from the bill run', async () => {
      await SubmitRemoveBillLicenceService.go(billLicence.id, user)

      expect(unassignLicencesToBillRunStub.called).to.be.true()
    })

    it('calls the "ProcessBillingFlagService" to check if the licence needs a supplementary billing flag', async () => {
      await SubmitRemoveBillLicenceService.go(billLicence.id, user)

      expect(processBillingFlagStub.called).to.be.true()
    })

    it('sends a request to the legacy service to delete the bill licence', async () => {
      await SubmitRemoveBillLicenceService.go(billLicence.id, user)

      expect(legacyDeleteBillLicenceRequestStub.called).to.be.true()
    })

    it('returns the path to the legacy bill run processing page with invoice ID option', async () => {
      const result = await SubmitRemoveBillLicenceService.go(billLicence.id, user)

      expect(result).to.equal(
        `/billing/batch/${billLicence.bill.billRunId}/processing?invoiceId=${billLicence.bill.id}`
      )
    })
  })
})
