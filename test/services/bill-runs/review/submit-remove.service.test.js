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
const UnassignLicencesToBillRunService = require('../../../../app/services/bill-runs/unassign-licences-to-bill-run.service.js')

// Thing under test
const SubmitRemoveService = require('../../../../app/services/bill-runs/review/submit-remove.service.js')

describe('Bill Runs - Review - Submit Remove service', () => {
  let createLicenceSupplementaryYearStub
  let removeReviewLicence
  let removeReviewLicenceStub
  let unassignLicencesToBillRunStub
  let yarStub

  beforeEach(() => {
    removeReviewLicence = BillRunsReviewFixture.removeReviewLicence()

    removeReviewLicenceStub = Sinon.stub(RemoveReviewLicenceService, 'go').withArgs(removeReviewLicence.id).resolves()

    unassignLicencesToBillRunStub = Sinon.stub(UnassignLicencesToBillRunService, 'go').resolves()

    createLicenceSupplementaryYearStub = Sinon.stub(CreateLicenceSupplementaryYearService, 'go')
      .withArgs(removeReviewLicence.licenceId, [removeReviewLicence.billRun.toFinancialYearEnding], true)
      .resolves()

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('and the bill run is two-part tariff annual', () => {
      describe('and this is not the last licence in the bill run', () => {
        beforeEach(() => {
          Sinon.stub(FetchRemoveReviewLicenceService, 'go').resolves(removeReviewLicence)
          Sinon.stub(ProcessBillRunPostRemove, 'go').withArgs(removeReviewLicence.billRun.id).resolves(false)
        })

        it('removes the review licence', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(removeReviewLicenceStub.called).to.be.true()
        })

        it('does not attempt to unassign the licence from the bill run', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(unassignLicencesToBillRunStub.called).to.be.false()
        })

        it('flags the licence for supplementary billing', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(createLicenceSupplementaryYearStub.called).to.be.true()
        })

        it('does add a flash message', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(yarStub.flash.called).to.be.true()

          const [flashType, bannerMessage] = yarStub.flash.args[0]

          expect(flashType).to.equal('banner')
          expect(bannerMessage).to.equal('Licence 1/11/11/*11/1111 removed from the bill run.')
        })

        it('returns the bill run ID and a flag to indicate the bill run is not empty', async () => {
          const result = await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(result).to.equal({
            billRunId: '287aeb25-cf11-429d-8c6f-f98f06db021d',
            empty: false
          })
        })
      })

      describe('and this is the last licence in the bill run', () => {
        beforeEach(() => {
          Sinon.stub(FetchRemoveReviewLicenceService, 'go').resolves(removeReviewLicence)
          Sinon.stub(ProcessBillRunPostRemove, 'go').withArgs(removeReviewLicence.billRun.id).resolves(true)
        })

        it('removes the review licence', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(removeReviewLicenceStub.called).to.be.true()
        })

        it('does not attempt to unassign the licence from the bill run', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(unassignLicencesToBillRunStub.called).to.be.false()
        })

        it('flags the licence for supplementary billing', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(createLicenceSupplementaryYearStub.called).to.be.true()
        })

        it('does not add a flash message', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(yarStub.flash.called).to.be.false()
        })

        it('returns the bill run ID and a flag to indicate the bill run is empty', async () => {
          const result = await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(result).to.equal({
            billRunId: '287aeb25-cf11-429d-8c6f-f98f06db021d',
            empty: true
          })
        })
      })
    })

    describe('and the bill run is for two-part tariff supplementary', () => {
      describe('and this is not the last licence in the bill run', () => {
        beforeEach(() => {
          removeReviewLicence.billRun.batchType = 'two_part_supplementary'
          Sinon.stub(FetchRemoveReviewLicenceService, 'go').resolves(removeReviewLicence)
          Sinon.stub(ProcessBillRunPostRemove, 'go').withArgs(removeReviewLicence.billRun.id).resolves(false)
        })

        it('removes the review licence', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(removeReviewLicenceStub.called).to.be.true()
        })

        it('does attempt to unassign the licence from the bill run', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(unassignLicencesToBillRunStub.called).to.be.true()
        })

        it('does not flag the licence for supplementary billing', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(createLicenceSupplementaryYearStub.called).to.be.false()
        })

        it('does add a flash message', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(yarStub.flash.called).to.be.true()

          const [flashType, bannerMessage] = yarStub.flash.args[0]

          expect(flashType).to.equal('banner')
          expect(bannerMessage).to.equal('Licence 1/11/11/*11/1111 removed from the bill run.')
        })

        it('returns the bill run ID and a flag to indicate the bill run is not empty', async () => {
          const result = await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(result).to.equal({
            billRunId: '287aeb25-cf11-429d-8c6f-f98f06db021d',
            empty: false
          })
        })
      })

      describe('and this is the last licence in the bill run', () => {
        beforeEach(() => {
          removeReviewLicence.billRun.batchType = 'two_part_supplementary'
          Sinon.stub(FetchRemoveReviewLicenceService, 'go').resolves(removeReviewLicence)
          Sinon.stub(ProcessBillRunPostRemove, 'go').withArgs(removeReviewLicence.billRun.id).resolves(true)
        })

        it('removes the review licence', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(removeReviewLicenceStub.called).to.be.true()
        })

        it('does attempt to unassign the licence from the bill run', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(unassignLicencesToBillRunStub.called).to.be.true()
        })

        it('does not flag the licence for supplementary billing', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(createLicenceSupplementaryYearStub.called).to.be.false()
        })

        it('does not add a flash message', async () => {
          await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(yarStub.flash.called).to.be.false()
        })

        it('returns the bill run ID and a flag to indicate the bill run is empty', async () => {
          const result = await SubmitRemoveService.go(removeReviewLicence.id, yarStub)

          expect(result).to.equal({
            billRunId: '287aeb25-cf11-429d-8c6f-f98f06db021d',
            empty: true
          })
        })
      })
    })
  })
})
