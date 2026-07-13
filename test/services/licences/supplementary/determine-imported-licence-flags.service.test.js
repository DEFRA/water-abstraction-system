// Test framework dependencies

// Test helpers
import * as FetchExistingLicenceDetailsService from '../../../../app/services/licences/supplementary/fetch-existing-licence-details.service.js'

// Thing under test
import DetermineImportedLicenceFlagsService from '../../../../app/services/licences/supplementary/determine-imported-licence-flags.service.js'

describe('Licences - Supplementary - Determine Imported Licence Flags service', () => {
  const licenceId = 'aad74a3d-59ea-4c18-8091-02b0f8b0a147'

  let testDate

  beforeEach(() => {
    testDate = new Date('2024-10-31')
    vi.useFakeTimers({ now: testDate })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('when processing an imported licence', () => {
    let changeDate

    describe('with a future revoked date', () => {
      beforeAll(() => {
        changeDate = new Date('2030-04-01')
      })

      describe('and a licenceId', () => {
        describe('for a licence with no charge versions', () => {
          describe('and the licence is already flagged for billing', () => {
            beforeEach(async () => {
              vi.spyOn(FetchExistingLicenceDetailsService, 'default').mockResolvedValue(_licenceData(true, false))
            })

            it('always returns the licenceId, regionId, startDate and endDate', async () => {
              const result = await DetermineImportedLicenceFlagsService(licenceId, changeDate)

              expect(result.licenceId).toEqual('aad74a3d-59ea-4c18-8091-02b0f8b0a147')
              expect(result.regionId).toEqual('ff92e0b1-3934-430b-8b16-5b89a3ea258f')
              expect(result.startDate).toEqual(null)
              expect(result.endDate).toEqual(new Date('2025-03-31'))
            })

            it('returns the correct flags', async () => {
              const result = await DetermineImportedLicenceFlagsService(licenceId, changeDate)

              expect(result.flagForPreSrocSupplementary).toEqual(false)
              expect(result.flagForSrocSupplementary).toEqual(false)
              expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
            })
          })

          describe('and the licence is not already flagged for billing', () => {
            beforeEach(async () => {
              vi.spyOn(FetchExistingLicenceDetailsService, 'default').mockResolvedValue(_licenceData(false, false))
            })

            it('always returns the licenceId, regionId, startDate and endDate', async () => {
              const result = await DetermineImportedLicenceFlagsService(licenceId, changeDate)

              expect(result.licenceId).toEqual('aad74a3d-59ea-4c18-8091-02b0f8b0a147')
              expect(result.regionId).toEqual('ff92e0b1-3934-430b-8b16-5b89a3ea258f')
              expect(result.startDate).toEqual(null)
              expect(result.endDate).toEqual(new Date('2025-03-31'))
            })

            it('returns the correct flags', async () => {
              const result = await DetermineImportedLicenceFlagsService(licenceId, changeDate)

              expect(result.flagForPreSrocSupplementary).toEqual(false)
              expect(result.flagForSrocSupplementary).toEqual(false)
              expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
            })
          })
        })

        describe('for a licence with pre-sroc and sroc charge versions', () => {
          describe('and the licence is already flagged for billing', () => {
            beforeEach(async () => {
              vi.spyOn(FetchExistingLicenceDetailsService, 'default').mockResolvedValue(_licenceData(true, true))
            })

            it('returns the correct flags', async () => {
              const result = await DetermineImportedLicenceFlagsService(licenceId, changeDate)

              expect(result.flagForPreSrocSupplementary).toEqual(true)
              expect(result.flagForSrocSupplementary).toEqual(true)
              expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
            })
          })

          describe('and the licence is not already flagged for billing', () => {
            beforeEach(async () => {
              vi.spyOn(FetchExistingLicenceDetailsService, 'default').mockResolvedValue(_licenceData(false, true))
            })

            it('returns the correct flags', async () => {
              const result = await DetermineImportedLicenceFlagsService(licenceId, changeDate)

              expect(result.flagForPreSrocSupplementary).toEqual(false)
              expect(result.flagForSrocSupplementary).toEqual(false)
              expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
            })
          })
        })
      })
    })

    describe('with an sroc lapsed date of "2022-04-01"', () => {
      beforeAll(() => {
        changeDate = new Date('2022-04-01')
      })

      describe('for a licence with no charge versions', () => {
        describe('and the licence is already flagged for billing', () => {
          beforeEach(async () => {
            vi.spyOn(FetchExistingLicenceDetailsService, 'default').mockResolvedValue(_licenceData(true, false))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService(licenceId, changeDate)

            expect(result.flagForPreSrocSupplementary).toEqual(false)
            expect(result.flagForSrocSupplementary).toEqual(false)
            expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
          })
        })

        describe('and the licence is not already flagged for billing', () => {
          beforeEach(async () => {
            vi.spyOn(FetchExistingLicenceDetailsService, 'default').mockResolvedValue(_licenceData(false, false))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService(licenceId, changeDate)

            expect(result.flagForPreSrocSupplementary).toEqual(false)
            expect(result.flagForSrocSupplementary).toEqual(false)
            expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
          })
        })
      })

      describe('for a licence with pre-sroc and sroc charge versions', () => {
        describe('and the licence is already flagged for billing', () => {
          beforeEach(async () => {
            vi.spyOn(FetchExistingLicenceDetailsService, 'default').mockResolvedValue(_licenceData(true, true))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService(licenceId, changeDate)

            expect(result.flagForPreSrocSupplementary).toEqual(true)
            expect(result.flagForSrocSupplementary).toEqual(true)
            expect(result.flagForTwoPartTariffSupplementary).toEqual(true)
          })
        })

        describe('and the licence is not already flagged for billing', () => {
          beforeEach(async () => {
            vi.spyOn(FetchExistingLicenceDetailsService, 'default').mockResolvedValue(_licenceData(false, true))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService(licenceId, changeDate)

            expect(result.flagForPreSrocSupplementary).toEqual(false)
            expect(result.flagForSrocSupplementary).toEqual(true)
            expect(result.flagForTwoPartTariffSupplementary).toEqual(true)
          })
        })
      })
    })

    describe('with a pre-sroc expired date of "2019-01-01"', () => {
      beforeAll(() => {
        changeDate = new Date('2019-01-01')
      })

      describe('for a licence with no charge versions', () => {
        describe('and the licence is already flagged for billing', () => {
          beforeEach(async () => {
            vi.spyOn(FetchExistingLicenceDetailsService, 'default').mockResolvedValue(_licenceData(true, false))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService(licenceId, changeDate)

            expect(result.flagForPreSrocSupplementary).toEqual(false)
            expect(result.flagForSrocSupplementary).toEqual(false)
            expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
          })
        })

        describe('and the licence is not already flagged for billing', () => {
          beforeEach(async () => {
            vi.spyOn(FetchExistingLicenceDetailsService, 'default').mockResolvedValue(_licenceData(false, false))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService(licenceId, changeDate)

            expect(result.flagForPreSrocSupplementary).toEqual(false)
            expect(result.flagForSrocSupplementary).toEqual(false)
            expect(result.flagForTwoPartTariffSupplementary).toEqual(false)
          })
        })
      })

      describe('for a licence with pre-sroc and sroc charge versions', () => {
        describe('and the licence is already flagged for billing', () => {
          beforeEach(async () => {
            vi.spyOn(FetchExistingLicenceDetailsService, 'default').mockResolvedValue(_licenceData(true, true))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService(licenceId, changeDate)

            expect(result.flagForPreSrocSupplementary).toEqual(true)
            expect(result.flagForSrocSupplementary).toEqual(true)
            expect(result.flagForTwoPartTariffSupplementary).toEqual(true)
          })
        })

        describe('and the licence is not already flagged for billing', () => {
          beforeEach(async () => {
            vi.spyOn(FetchExistingLicenceDetailsService, 'default').mockResolvedValue(_licenceData(false, true))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService(licenceId, changeDate)

            expect(result.flagForPreSrocSupplementary).toEqual(true)
            expect(result.flagForSrocSupplementary).toEqual(true)
            expect(result.flagForTwoPartTariffSupplementary).toEqual(true)
          })
        })
      })
    })
  })
})

function _licenceData(flagged, chargeVersions) {
  return {
    id: 'aad74a3d-59ea-4c18-8091-02b0f8b0a147',
    region_id: 'ff92e0b1-3934-430b-8b16-5b89a3ea258f',
    expired_date: null,
    lapsed_date: null,
    revoked_date: null,
    flagged_for_presroc: flagged,
    flagged_for_sroc: flagged,
    pre_sroc_charge_versions: chargeVersions,
    sroc_charge_versions: chargeVersions,
    two_part_tariff_charge_versions: chargeVersions
  }
}
