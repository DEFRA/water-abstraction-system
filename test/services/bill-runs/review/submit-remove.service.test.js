'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const BillRunsReviewFixture = require('../../../fixtures/bill-runs-review.fixture.js')

// Things we need to stub
const CreateLicenceSupplementaryYearService = require('../../../../app/services/licences/supplementary/create-licence-supplementary-year.service.js')
const FetchRemoveReviewLicenceService = require('../../../../app/services/bill-runs/review/fetch-remove-review-licence.service.js')
const ProcessBillRunPostRemove = require('../../../../app/services/bill-runs/review/process-bill-run-post-remove.service.js')
const RemoveReviewLicenceService = require('../../../../app/services/bill-runs/review/remove-review-licence.service.js')

// Thing under test
const SubmitRemoveService = require('../../../../app/services/bill-runs/review/submit-remove.service.js')

describe('Bill Runs Review - Submit Remove service', () => {
  let createLicenceSupplementaryYearStub
  let removeReviewLicence
  let removeReviewLicenceStub
  let yarStub

  beforeEach(() => {
    removeReviewLicence = BillRunsReviewFixture.removeReviewLicence()

    Sinon.stub(FetchRemoveReviewLicenceService, 'go').resolves(removeReviewLicence)

    removeReviewLicenceStub = Sinon.stub(RemoveReviewLicenceService, 'go').withArgs(removeReviewLicence.id).resolves()

    createLicenceSupplementaryYearStub = Sinon.stub(CreateLicenceSupplementaryYearService, 'go')
      .withArgs(removeReviewLicence.licenceId, [removeReviewLicence.billRun.toFinancialYearEnding], true)
      .resolves()

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and this is the last licence in the bill run', () => {
      beforeEach(() => {
        Sinon.stub(ProcessBillRunPostRemove, 'go').withArgs(removeReviewLicence.billRun.id).resolves(true)
      })

      it('removes the review licence, flags the licence for supplementary billing, does not add a flash message, and returns `empty: true`', async () => {
        const result = await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

        // Confirm we called the remove review licence service with the correct ID
        expect(removeReviewLicenceStub.called).to.be.true()

        // Confirm we flagged the licence for the next two-part tariff supplementary bill run
        expect(createLicenceSupplementaryYearStub.called).to.be.true()

        // Check we didn't add the flash message
        expect(yarStub.flash.called).to.be.false()

        // Check we return empty true in our result so the controller knows to redirect to the bill runs page
        expect(result).to.equal({
          billRunId: '287aeb25-cf11-429d-8c6f-f98f06db021d',
          empty: true
        })
      })
    })

    describe('and this is not the last licence in the bill run', () => {
      beforeEach(() => {
        Sinon.stub(ProcessBillRunPostRemove, 'go').withArgs(removeReviewLicence.billRun.id).resolves(false)
      })

      it('removes the review licence, flags the licence for supplementary billing, adds a flash message, and returns `empty: false`', async () => {
        const result = await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

        // Confirm we called the remove review licence service with the correct ID
        expect(removeReviewLicenceStub.called).to.be.true()

        // Confirm we flagged the licence for the next two-part tariff supplementary bill run
        expect(createLicenceSupplementaryYearStub.called).to.be.true()

        // Check we add the flash message
        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('banner')
        expect(bannerMessage).to.equal('Licence 1/11/11/*11/1111 removed from the bill run.')

        // Check we return empty true in our result so the controller knows to redirect to the bill runs page
        expect(result).to.equal({
          billRunId: '287aeb25-cf11-429d-8c6f-f98f06db021d',
          empty: false
        })
      })
    })
  })
})
