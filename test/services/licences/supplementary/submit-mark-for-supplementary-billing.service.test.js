// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import LicenceHelper from 'water-abstraction-engine/test/helpers/licence.helper.js'
import LicenceModel from 'water-abstraction-engine/models/licence.model.js'
import LicenceSupplementaryYearModel from 'water-abstraction-engine/models/licence-supplementary-year.model.js'

// Things we need to stub
import * as DetermineExistingBillRunYearsService from '../../../../src/services/licences/supplementary/determine-existing-bill-run-years.service.js'

// Thing under test
import SubmitMarkForSupplementaryBillingService from '../../../../src/services/licences/supplementary/submit-mark-for-supplementary-billing.service.js'

describe('Submit Mark For Supplementary Billing Service', () => {
  let licence
  let payload

  afterEach(async () => {
    vi.restoreAllMocks()

    await LicenceSupplementaryYearModel.query().where('licenceId', licence.id).delete()
    await licence.$query().delete()
  })

  describe('when called', () => {
    describe('and only a single SROC year was selected', () => {
      beforeEach(() => {
        payload = {
          supplementaryYears: '2023'
        }
      })

      describe('and the licence has no flags set', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add()
        })

        describe('and there is an existing bill run for the selected year', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
          })

          it('does not flag the licence for SROC or PRESROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'no',
              includeInSrocBilling: false
            })
          })

          it('only flags the licence for TPT supplementary billing for the selected year', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toHaveLength(1)
            expect(licenceSupplementaryYears[0]).toMatchObject({
              licenceId: licence.id,
              billRunId: null,
              twoPartTariff: true,
              financialYearEnd: 2023
            })
          })
        })

        describe('and there are no existing bill runs for the selected year', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([])
          })

          it('does not flag the licence for SROC or PRESROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'no',
              includeInSrocBilling: false
            })
          })

          it('does not flag the licence for TPT supplementary billing', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toHaveLength(0)
          })
        })
      })

      describe('and the licence is already flagged for SROC supplementary', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add({includeInPresrocBilling: 'no', includeInSrocBilling: true})
        })

        describe('and there is an existing bill run for the selected year', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
          })

          it('leaves the licence flagged for SROC and not for PRESROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'no',
              includeInSrocBilling: true
            })
          })

          it('only flags the licence for TPT supplementary billing for the selected year', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toHaveLength(1)
            expect(licenceSupplementaryYears).toEqual([
              {
                licenceId: licence.id,
                billRunId: null,
                twoPartTariff: true,
                financialYearEnd: 2023
              }
            ])
          })
        })

        describe('and there are no existing bill runs for the selected year', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([])
          })

          it('leaves the licence flagged for SROC and not for PRESROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'no',
              includeInSrocBilling: true
            })
          })

          it('does not flag the licence for TPT supplementary billing', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toHaveLength(0)
          })
        })
      })

      describe('and the licence is already flagged for PRESROC supplementary', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add({includeInPresrocBilling: 'yes', includeInSrocBilling: false})
        })

        describe('and there is an existing bill run for the selected year', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
          })

          it('leaves the licence flagged for PRESROC and not for SROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'yes',
              includeInSrocBilling: false
            })
          })

          it('only flags the licence for TPT supplementary billing for the selected year', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toHaveLength(1)
            expect(licenceSupplementaryYears).toEqual([
              {
                licenceId: licence.id,
                billRunId: null,
                twoPartTariff: true,
                financialYearEnd: 2023
              }
            ])
          })
        })

        describe('and there are no existing bill runs for the selected year', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([])
          })

          it('leaves the licence flagged for PRESROC and not for SROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'yes',
              includeInSrocBilling: false
            })
          })

          it('does not flag the licence for TPT supplementary billing', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toHaveLength(0)
          })
        })
      })
    })

    describe('and multiple SROC years were selected', () => {
      beforeEach(() => {
        payload = {
          supplementaryYears: ['2024', '2023']
        }
      })

      describe('and the licence has no flags set', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add()
        })

        describe('and there is an existing bill run for both selected years', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2024, 2023])
          })

          it('does not flag the licence for SROC or PRESROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'no',
              includeInSrocBilling: false
            })
          })

          it('flags the licence for TPT supplementary billing for the selected years', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toEqual([
              {
                licenceId: licence.id,
                billRunId: null,
                twoPartTariff: true,
                financialYearEnd: 2024
              },
              {
                licenceId: licence.id,
                billRunId: null,
                twoPartTariff: true,
                financialYearEnd: 2023
              }
            ])
          })
        })

        describe('and there is an existing bill run for one of the selected years', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
          })

          it('does not flag the licence for SROC or PRESROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'no',
              includeInSrocBilling: false
            })
          })

          it('only flags the licence for TPT supplementary billing for the matching year', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toEqual([
              {
                licenceId: licence.id,
                billRunId: null,
                twoPartTariff: true,
                financialYearEnd: 2023
              }
            ])
          })
        })

        describe('and there are no existing bill runs for the selected years', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([])
          })

          it('does not flag the licence for SROC or PRESROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'no',
              includeInSrocBilling: false
            })
          })

          it('does not flag the licence for TPT supplementary billing', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toHaveLength(0)
          })
        })
      })

      describe('and the licence is already flagged for SROC supplementary', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add({includeInPresrocBilling: 'no', includeInSrocBilling: true})
        })

        describe('and there is an existing bill run for both selected years', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2024, 2023])
          })

          it('leaves the licence flagged for SROC and not for PRESROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'no',
              includeInSrocBilling: true
            })
          })

          it('flags the licence for TPT supplementary billing for the selected years', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toEqual([
              {
                licenceId: licence.id,
                billRunId: null,
                twoPartTariff: true,
                financialYearEnd: 2024
              },
              {
                licenceId: licence.id,
                billRunId: null,
                twoPartTariff: true,
                financialYearEnd: 2023
              }
            ])
          })
        })

        describe('and there is an existing bill run for one of the selected years', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
          })

          it('leaves the licence flagged for SROC and not for PRESROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'no',
              includeInSrocBilling: true
            })
          })

          it('only flags the licence for TPT supplementary billing for the matching year', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toEqual([
              {
                licenceId: licence.id,
                billRunId: null,
                twoPartTariff: true,
                financialYearEnd: 2023
              }
            ])
          })
        })

        describe('and there are no existing bill runs for the selected years', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([])
          })

          it('leaves the licence flagged for SROC and not for PRESROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'no',
              includeInSrocBilling: true
            })
          })

          it('does not flag the licence for TPT supplementary billing', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toHaveLength(0)
          })
        })
      })

      describe('and the licence is already flagged for PRESROC supplementary', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add({includeInPresrocBilling: 'yes', includeInSrocBilling: false})
        })

        describe('and there is an existing bill run for both selected years', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2024, 2023])
          })

          it('leaves the licence flagged for PRESROC and not for SROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'yes',
              includeInSrocBilling: false
            })
          })

          it('flags the licence for TPT supplementary billing for the selected years', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toEqual([
              {
                licenceId: licence.id,
                billRunId: null,
                twoPartTariff: true,
                financialYearEnd: 2024
              },
              {
                licenceId: licence.id,
                billRunId: null,
                twoPartTariff: true,
                financialYearEnd: 2023
              }
            ])
          })
        })

        describe('and there is an existing bill run for one of the selected years', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
          })

          it('leaves the licence flagged for PRESROC and not for SROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'yes',
              includeInSrocBilling: false
            })
          })

          it('only flags the licence for TPT supplementary billing for the matching year', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toEqual([
              {
                licenceId: licence.id,
                billRunId: null,
                twoPartTariff: true,
                financialYearEnd: 2023
              }
            ])
          })
        })

        describe('and there are no existing bill runs for the selected years', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([])
          })

          it('leaves the licence flagged for PRESROC and not for SROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'yes',
              includeInSrocBilling: false
            })
          })

          it('does not flag the licence for TPT supplementary billing', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toHaveLength(0)
          })
        })
      })
    })

    describe('and a mix of PRESROC and SROC years were selected', () => {
      beforeEach(async () => {
        payload = {
          supplementaryYears: ['2023', 'preSroc']
        }
      })

      describe('and the licence has no flags set', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add()
        })

        describe('and there is an existing bill run for the selected year', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
          })

          it('flags the licence for PRESROC but not SROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'yes',
              includeInSrocBilling: false
            })
          })

          it('only flags the licence for TPT supplementary billing for the selected year', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toHaveLength(1)
            expect(licenceSupplementaryYears[0]).toMatchObject({
              licenceId: licence.id,
              billRunId: null,
              twoPartTariff: true,
              financialYearEnd: 2023
            })
          })
        })

        describe('and there are no existing bill runs for the selected year', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([])
          })

          it('flags the licence for PRESROC but not SROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'yes',
              includeInSrocBilling: false
            })
          })

          it('does not flag the licence for TPT supplementary billing', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toHaveLength(0)
          })
        })
      })

      describe('and the licence is already flagged for SROC supplementary', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add({includeInPresrocBilling: 'no', includeInSrocBilling: true})
        })

        describe('and there is an existing bill run for the selected year', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
          })

          it('flags the licence for PRESROC and leaves the flag for SROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'yes',
              includeInSrocBilling: true
            })
          })

          it('only flags the licence for TPT supplementary billing for the selected year', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toHaveLength(1)
            expect(licenceSupplementaryYears[0]).toMatchObject({
              licenceId: licence.id,
              billRunId: null,
              twoPartTariff: true,
              financialYearEnd: 2023
            })
          })
        })

        describe('and there are no existing bill runs for the selected year', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([])
          })

          it('flags the licence for PRESROC and leaves the flag for SROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'yes',
              includeInSrocBilling: true
            })
          })

          it('does not flag the licence for TPT supplementary billing', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toHaveLength(0)
          })
        })
      })

      describe('and the licence is already flagged for PRESROC supplementary', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add({includeInPresrocBilling: 'yes', includeInSrocBilling: false})
        })

        describe('and there is an existing bill run for the selected year', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([2023])
          })

          it('flags the licence for PRESROC but not SROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'yes',
              includeInSrocBilling: false
            })
          })

          it('only flags the licence for TPT supplementary billing for the selected year', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toHaveLength(1)
            expect(licenceSupplementaryYears[0]).toMatchObject({
              licenceId: licence.id,
              billRunId: null,
              twoPartTariff: true,
              financialYearEnd: 2023
            })
          })
        })

        describe('and there are no existing bill runs for the selected year', () => {
          beforeEach(() => {
            vi.spyOn(DetermineExistingBillRunYearsService, 'default').mockResolvedValue([])
          })

          it('flags the licence for PRESROC and leaves the flag for SROC supplementary billing', async () => {
            const result = await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            expect(result).toEqual({ error: null })

            const refreshedLicence = await _fetchLicence(licence.id)

            expect(refreshedLicence).toEqual({
              includeInPresrocBilling: 'yes',
              includeInSrocBilling: false
            })
          })

          it('does not flag the licence for TPT supplementary billing', async () => {
            await SubmitMarkForSupplementaryBillingService(licence.id, payload)

            const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

            expect(licenceSupplementaryYears).toHaveLength(0)
          })
        })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(async () => {
      // When validation fails the service calls the mark-for-supplementary-billing.presenter.js, which dynamically
      // determines the years a user can select based on the current date. We 'mock' this so we can assert what options
      // we expect to see in the response
      vi.useFakeTimers({ now: new Date('2024-03-31') })

      licence = await LicenceHelper.add()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    describe('because nothing was selected', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
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

      it('does not change the supplementary billing flags already set', async () => {
        await SubmitMarkForSupplementaryBillingService(licence.id, payload)

        const refreshedLicence = await _fetchLicence(licence.id)

        expect(refreshedLicence).toEqual({
          includeInPresrocBilling: 'no',
          includeInSrocBilling: false
        })
      })

      it('does not flag the licence for TPT supplementary billing', async () => {
        await SubmitMarkForSupplementaryBillingService(licence.id, payload)

        const licenceSupplementaryYears = await _fetchLicenceSupplementaryYears(licence.id)

        expect(licenceSupplementaryYears).toHaveLength(0)
      })
    })
  })
})

async function _fetchLicence(licenceId) {
  return LicenceModel.query().select(['includeInPresrocBilling', 'includeInSrocBilling']).findById(licenceId)
}

async function _fetchLicenceSupplementaryYears(licenceId) {
  return LicenceSupplementaryYearModel.query().select(['billRunId', 'financialYearEnd', 'licenceId', 'twoPartTariff']).where('licenceId', licenceId)
}
