// Test helpers
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import LicenceModel from '../../../../app/models/licence.model.js'
import LicenceSupplementaryYearModel from '../../../../app/models/licence-supplementary-year.model.js'

// Things we need to stub
import * as DetermineExistingBillRunYearsService from '../../../../app/services/licences/supplementary/determine-existing-bill-run-years.service.js'

// Thing under test
import SubmitMarkForSupplementaryBillingService from '../../../../app/services/licences/supplementary/submit-mark-for-supplementary-billing.service.js'

describe('Submit Mark For Supplementary Billing Service', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called with a valid licenceId', () => {
    let licence
    let payload
    let testDate

    beforeEach(async () => {
      licence = await LicenceHelper.add()

      vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
    })

    describe('and only a single sroc year selected', () => {
      beforeEach(() => {
        payload = {
          supplementaryYears: '2023'
        }
      })

      describe('that should be flagged for supplementary billing', () => {
        it('flags the licence for supplementary billing for the sroc years', async () => {
          const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

          const licenceSupplementaryYears = await LicenceSupplementaryYearModel.query().where('licenceId', licence.id)

          expect(result).toEqual({ error: null })
          expect(licenceSupplementaryYears[0]).toMatchObject({
            licenceId: licence.id,
            billRunId: null,
            twoPartTariff: true,
            financialYearEnd: 2023
          })
        })

        it('does not flag the licence for supplementary billing for the pre sroc years', async () => {
          await SubmitMarkForSupplementaryBillingService(licence.id, payload)

          const updatedLicence = await LicenceModel.query().findById(licence.id)

          expect(updatedLicence.includeInPresrocBilling).toEqual('no')
        })
      })
    })

    describe('and a mix of pre sroc and sroc years selected', () => {
      beforeEach(async () => {
        payload = {
          supplementaryYears: ['2023', 'preSroc']
        }
      })

      describe('that should be flagged for supplementary billing', () => {
        it('flags the licence for supplementary billing for the sroc years', async () => {
          const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

          const licenceSupplementaryYears = await LicenceSupplementaryYearModel.query().where('licenceId', licence.id)

          expect(result).toEqual({ error: null })
          expect(licenceSupplementaryYears[0]).toMatchObject({
            licenceId: licence.id,
            billRunId: null,
            twoPartTariff: true,
            financialYearEnd: 2023
          })
        })

        it('flags the licence for supplementary billing for the pre sroc years', async () => {
          await SubmitMarkForSupplementaryBillingService(licence.id, payload)

          const updatedLicence = await LicenceModel.query().findById(licence.id)

          expect(updatedLicence.includeInPresrocBilling).toEqual('yes')
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
          const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

          const updatedLicence = await LicenceModel.query().findById(licence.id)

          expect(result).toEqual({ error: null })
          expect(updatedLicence.includeInPresrocBilling).toEqual('yes')
        })
      })
    })

    describe('but no years selected', () => {
      beforeEach(() => {
        payload = {}

        testDate = new Date('2024-03-31')
        vi.useFakeTimers({ now: testDate })
      })

      afterEach(() => {
        vi.useRealTimers()
      })

      describe('because the user did not select any', () => {
        it('returns the page data with an error for the view', async () => {
          const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

          expect(result).toEqual({
            backLink: {
              href: `/system/licences/${licence.id}/set-up`,
              text: 'Back'
            },
            error: {
              errorList: [
                {
                  href: '#supplementaryYears',
                  text: 'Select at least one financial year'
                }
              ],
              supplementaryYears: {
                text: 'Select at least one financial year'
              }
            },
            financialYears: [
              { text: '2023 to 2024', value: 2024, attributes: { 'data-test': 'sroc-years-2024' } },
              { text: '2022 to 2023', value: 2023, attributes: { 'data-test': 'sroc-years-2023' } },
              {
                text: 'Before 2022',
                value: 'preSroc',
                hint: { text: 'Old charge scheme' },
                attributes: { 'data-test': 'pre-sroc-years' }
              }
            ],
            pageTitle: 'Select which years you need to recalculate bills for',
            pageTitleCaption: `Licence ${licence.licenceRef}`
          })
        })
      })
    })
  })
})
