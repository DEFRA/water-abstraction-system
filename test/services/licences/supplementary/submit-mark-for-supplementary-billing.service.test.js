'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceSupplementaryYearModel = require('../../../../app/models/licence-supplementary-year.model.js')

// Things we need to stub
const DetermineExistingBillRunYearsService = require('../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js')
const LegacyRequest = require('../../../../app/requests/legacy.request.js')

// Thing under test
const SubmitMarkForSupplementaryBillingService = require('../../../../app/services/licences/supplementary/submit-mark-for-supplementary-billing.service.js')

describe('Submit Mark For Supplementary Billing Service', () => {
  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a valid licenceId', () => {
    let licence
    let payload
    let testDate

    const user = { id: '1c4ce580-9053-4531-ba23-d0cf0caf0562', username: 'test-user@water.com' }

    beforeEach(async () => {
      licence = await LicenceHelper.add()

      Sinon.stub(LegacyRequest, 'post').resolves({
        succeeded: true,
        response: {
          statusCode: 200,
          body: null
        }
      })

      Sinon.stub(DetermineExistingBillRunYearsService, 'go').resolves([2023])
    })

    describe('and a mix of pre sroc and sroc years selected', () => {
      beforeEach(async () => {
        payload = {
          supplementaryYears: ['2023', 'preSroc']
        }
      })

      describe('that should be flagged for supplementary billing', () => {
        it('flags the licence for supplementary billing for the sroc years', async () => {
          const result = await SubmitMarkForSupplementaryBillingService.go(licence.id, payload, user)

          const licenceSupplementaryYears = await LicenceSupplementaryYearModel.query().where('licenceId', licence.id)

          expect(result).to.equal({ error: null })
          expect(licenceSupplementaryYears[0]).to.equal({
            licenceId: licence.id,
            billRunId: null,
            twoPartTariff: true,
            financialYearEnd: 2023
          }, { skip: ['id', 'createdAt', 'updatedAt'] })
        })

        it('flags the licence for supplementary billing for the pre sroc years', async () => {
          await SubmitMarkForSupplementaryBillingService.go(licence.id, payload, user)

          expect(LegacyRequest.post.calledWith(
            'water',
            `licences/${licence.id}/mark-for-supplementary-billing`,
            user.id)
          ).to.be.true()
        })
      })
    })

    describe('and only pre sroc years selected', () => {
      beforeEach(() => {
        payload = {
          supplementaryYears: 'preSroc'
        }
      })

      describe('that should be flagged for supplementary billing', () => {
        it('flags the licence for supplementary billing for the pre sroc years', async () => {
          const result = await SubmitMarkForSupplementaryBillingService.go(licence.id, payload, user)

          expect(result).to.equal({ error: null })
          expect(LegacyRequest.post.calledWith(
            'water',
            `licences/${licence.id}/mark-for-supplementary-billing`,
            user.id)
          ).to.be.true()
        })
      })
    })

    describe('and only a single sroc year selected', () => {
      beforeEach(() => {
        payload = {
          supplementaryYears: '2023'
        }
      })

      describe('that should be flagged for supplementary billing', () => {
        it('flags the licence for supplementary billing for the sroc years', async () => {
          const result = await SubmitMarkForSupplementaryBillingService.go(licence.id, payload, user)

          const licenceSupplementaryYears = await LicenceSupplementaryYearModel.query().where('licenceId', licence.id)

          expect(result).to.equal({ error: null })
          expect(licenceSupplementaryYears[0]).to.equal({
            licenceId: licence.id,
            billRunId: null,
            twoPartTariff: true,
            financialYearEnd: 2023
          }, { skip: ['id', 'createdAt', 'updatedAt'] })
        })

        it('does not flag the licence for supplementary billing for the pre sroc years', async () => {
          await SubmitMarkForSupplementaryBillingService.go(licence.id, payload, user)

          expect(LegacyRequest.post.called).to.be.false()
        })
      })
    })

    describe('but no years selected', () => {
      let clock

      beforeEach(() => {
        payload = {}

        testDate = new Date('2024-03-31')
        clock = Sinon.useFakeTimers(testDate)
      })

      afterEach(() => {
        clock.restore()
      })

      describe('because the user did not select any', () => {
        it('returns the page data with an error for the view', async () => {
          const result = await SubmitMarkForSupplementaryBillingService.go(licence.id, payload, user)

          expect(result).to.equal({
            activeNavBar: 'search',
            pageTitle: 'Mark for the supplementary bill run',
            error: { text: 'Select at least one financial year' },
            licenceId: licence.id,
            licenceRef: licence.licenceRef,
            financialYears: [
              { text: '2023 to 2024', value: 2024 },
              { text: '2022 to 2023', value: 2023 },
              { text: 'Before 2022', value: 'preSroc', hint: { text: 'Old charge scheme' } }
            ]
          })
        })
      })
    })
  })
})
