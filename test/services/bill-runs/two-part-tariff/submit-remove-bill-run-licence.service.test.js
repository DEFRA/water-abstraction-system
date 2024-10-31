'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = require('node:test')
const { expect } = Code

// Test helpers
const BillRunHelper = require('../../../support/helpers/bill-run.helper.js')
const BillRunModel = require('../../../../app/models/bill-run.model.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceSupplementaryYearModel = require('../../../../app/models/licence-supplementary-year.model.js')
const ReviewLicenceHelper = require('../../../support/helpers/review-licence.helper.js')

// Things we need to stub
const RemoveReviewDataService = require('../../../../app/services/bill-runs/two-part-tariff/remove-review-data.service.js')

// Thing under test
const SubmitRemoveBillRunLicenceService = require('../../../../app/services/bill-runs/two-part-tariff/submit-remove-bill-run-licence.service.js')

describe('Submit Remove Bill Run Licence service', () => {
  let yarStub

  beforeEach(async () => {
    Sinon.stub(RemoveReviewDataService, 'go').resolves()
    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a valid billRunId & licenceId', () => {
    let billRun
    let licence

    beforeEach(async () => {
      billRun = await BillRunHelper.add({ status: 'review' })

      licence = await LicenceHelper.add()
    })

    describe('which has at least one licence remaining in the bill run after the licence is removed', () => {
      beforeEach(async () => {
        // add an extra record to the `reviewLicence` table so that it isn't empty when the licence is removed
        await ReviewLicenceHelper.add({ billRunId: billRun.id })
      })

      it('will return false as all licences are not removed and generate a banner message', async () => {
        const result = await SubmitRemoveBillRunLicenceService.go(billRun.id, licence.id, yarStub)
        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(result).to.be.false()

        expect(yarStub.flash.called).to.be.true()
        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal(`Licence ${licence.licenceRef} removed from the bill run.`)
      })
    })

    describe('which has NO licences remain in the bill run after the licence is removed', () => {
      it('will return true as no licences remain in the bill run and NO banner message is generated', async () => {
        const result = await SubmitRemoveBillRunLicenceService.go(billRun.id, licence.id, yarStub)

        expect(result).to.be.true()
        expect(yarStub.flash.called).to.be.false()
      })

      it('will set the bill run status to empty', async () => {
        await SubmitRemoveBillRunLicenceService.go(billRun.id, licence.id, yarStub)
        const { status } = await BillRunModel.query().findById(billRun.id).select('status')

        expect(status).to.equal('empty')
      })

      it('will mark the licence for two-part tariff supplementary billing', async () => {
        await SubmitRemoveBillRunLicenceService.go(billRun.id, licence.id, yarStub)
        const includeInSrocTptBilling = await LicenceSupplementaryYearModel.query()
          .select([
            'licenceId',
            'twoPartTariff',
            'financialYearEnd'
          ])
          .where('licenceId', licence.id)

        expect(includeInSrocTptBilling[0].licenceId).to.equal(licence.id)
        expect(includeInSrocTptBilling[0].twoPartTariff).to.be.true()
        expect(includeInSrocTptBilling[0].financialYearEnd).to.equal(billRun.toFinancialYearEnding)
      })
    })
  })
})
