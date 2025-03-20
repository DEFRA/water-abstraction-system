'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const BillModel = require('../../../app/models/bill.model.js')
const LegacyDeleteBillRequest = require('../../../app/requests/legacy/delete-bill.request.js')
const ProcessBillingFlagService = require('../../../app/services/licences/supplementary/process-billing-flag.service.js')
const UnassignLicencesToBillRunService = require('../../../app/services/bill-runs/unassign-licences-to-bill-run.service.js')

// Thing under test
const SubmitRemoveBillService = require('../../../app/services/bills/submit-remove-bill.service.js')

describe('Bills - Submit Remove Bill service', () => {
  const user = { id: '0aa9dcaa-9a26-4a77-97ab-c17db54d38a1', useremail: 'carol.shaw@atari.com' }

  let bill
  let billStub
  let legacyDeleteBillRequestStub
  let processBillingFlagsStub
  let unassignLicencesToBillRunStub

  beforeEach(async () => {
    bill = {
      id: '274a3c01-42fe-4ed0-9212-c703ea5feaab',
      billRunId: '340c0f17-6e01-4d6c-b2ba-e1ab027364bb',
      billLicences: [
        { id: '9d75e160-fe4c-4f1a-bce9-ecc6b35316cb', licenceId: '0716ad45-f5f0-4f3f-b8cb-f24956dcd10d' },
        { id: '1c61e430-ac5a-43ed-a2e0-854ceb45fce5', licenceId: 'eafe888c-ed7a-405b-8df7-616c8d17e91a' }
      ]
    }

    billStub = Sinon.stub().resolves(bill)
    Sinon.stub(BillModel, 'query').returns({
      findById: Sinon.stub().returnsThis(),
      select: Sinon.stub().returnsThis(),
      withGraphFetched: Sinon.stub().returnsThis(),
      modifyGraph: billStub
    })

    legacyDeleteBillRequestStub = Sinon.stub(LegacyDeleteBillRequest, 'send').resolves()
    processBillingFlagsStub = Sinon.stub(ProcessBillingFlagService, 'go').resolves()
    unassignLicencesToBillRunStub = Sinon.stub(UnassignLicencesToBillRunService, 'go').resolves()
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('unassigns any two-part tariff supplementary licences in the bill from the bill run', async () => {
      await SubmitRemoveBillService.go(bill.id, user)

      expect(unassignLicencesToBillRunStub.called).to.be.true()
    })

    it('flags the two licences in the bill for supplementary billing', async () => {
      await SubmitRemoveBillService.go(bill.id, user)

      expect(processBillingFlagsStub.calledTwice).to.be.true()
    })

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
