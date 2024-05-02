'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const DatabaseSupport = require('../../../support/database.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceModel = require('../../../../app/models/licence.model.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')

// Things we need to stub
const RemoveReviewDataService = require('../../../../app/services/bill-runs/two-part-tariff/remove-review-data.service.js')

// Thing under test
const SubmitRemoveBillRunLicenceService = require('../../../../app/services/bill-runs/two-part-tariff/submit-remove-bill-run-licence.service.js')

describe.only('Submit Remove Bill Run Licence service', () => {
  let yarStub

  beforeEach(async () => {
    await DatabaseSupport.clean()

    Sinon.stub(RemoveReviewDataService, 'go').resolves()
    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a valid billRunId & licenceId', () => {
    let billRunId
    let licenceId

    beforeEach(async () => {
      const billRun = await BillRunHelper.add({ status: 'review' })
      billRunId = billRun.id

      const licence = await LicenceHelper.add({ licenceRef: '01/123/ABC' })
      licenceId = licence.id
    })

    describe('which has at least one licence remaining in the bill run after the licence is removed', () => {
      beforeEach(async () => {
        // add an extra record to the `reviewLicence` table so that it isn't empty when the licence is removed
        await ReviewLicenceHelper.add({ billRunId })
      })

      it('will return false as all licences are not removed and generate a banner message', async () => {
        const result = await SubmitRemoveBillRunLicenceService.go(billRunId, licenceId, yarStub)
        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(result).to.be.false()

        expect(yarStub.flash.called).to.be.true()
        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('Licence 01/123/ABC removed from the bill run.')
      })
    })

    describe('which has NO licences remain in the bill run after the licence is removed', () => {
      it('will return true as no licences remain in the bill run and NO banner message is generated', async () => {
        const result = await SubmitRemoveBillRunLicenceService.go(billRunId, licenceId, yarStub)

        expect(result).to.be.true()
        expect(yarStub.flash.called).to.be.false()
      })

      it('will set the bill run status to empty', async () => {
        await SubmitRemoveBillRunLicenceService.go(billRunId, licenceId, yarStub)
        const { status } = await BillRunModel.query().findById(billRunId).select('status')

        expect(status).to.equal('empty')
      })

      it('will mark the licence for two-part tariff supplementary billing', async () => {
        await SubmitRemoveBillRunLicenceService.go(billRunId, licenceId, yarStub)
        const { includeInSrocTptBilling } = await LicenceModel.query().findById(licenceId).select('includeInSrocTptBilling')

        expect(includeInSrocTptBilling).to.be.true()
      })
    })
  })
})
