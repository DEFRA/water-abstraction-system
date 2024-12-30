'use strict'

// Test framework dependencies
const { describe, it, before, beforeEach, afterEach } = require('node:test')
const { expect } = require('@hapi/code')
const Sinon = require('sinon')

// Things we need to stub
const FetchExistingLicenceDetailsService = require('../../../../app/services/licences/supplementary/fetch-existing-licence-details.service.js')

// Thing under test
const DetermineImportedLicenceFlagsService = require('../../../../app/services/licences/supplementary/determine-imported-licence-flags.service.js')

describe('Determine Imported Licence Flags Service', () => {
  const licenceId = 'aad74a3d-59ea-4c18-8091-02b0f8b0a147'

  let clock
  let testDate

  beforeEach(() => {
    testDate = new Date('2024-10-31')
    clock = Sinon.useFakeTimers(testDate)
  })

  afterEach(() => {
    clock.restore()
    Sinon.restore()
  })

  describe('when given an imported licence', () => {
    let importedLicence

    describe('with a future revoked date', () => {
      before(() => {
        importedLicence = {
          expiredDate: null,
          lapsedDate: null,
          revokedDate: new Date('2030-04-01')
        }
      })

      describe('and a licenceId', () => {
        describe('for a licence with no charge versions', () => {
          describe('and the licence is already flagged for billing', () => {
            beforeEach(async () => {
              Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_licenceData(true, false))
            })

            it('always returns the licenceId, regionId, startDate and endDate', async () => {
              const result = await DetermineImportedLicenceFlagsService.go(importedLicence, licenceId)

              expect(result.licenceId).to.equal('aad74a3d-59ea-4c18-8091-02b0f8b0a147')
              expect(result.regionId).to.equal('ff92e0b1-3934-430b-8b16-5b89a3ea258f')
              expect(result.startDate).to.equal(null)
              expect(result.endDate).to.equal(new Date('2025-03-31'))
            })

            it('returns the correct flags', async () => {
              const result = await DetermineImportedLicenceFlagsService.go(importedLicence, licenceId)

              expect(result.flagForPreSrocSupplementary).to.equal(false)
              expect(result.flagForSrocSupplementary).to.equal(false)
              expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
            })
          })

          describe('and the licence is not already flagged for billing', () => {
            beforeEach(async () => {
              Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_licenceData(false, false))
            })

            it('always returns the licenceId, regionId, startDate and endDate', async () => {
              const result = await DetermineImportedLicenceFlagsService.go(importedLicence, licenceId)

              expect(result.licenceId).to.equal('aad74a3d-59ea-4c18-8091-02b0f8b0a147')
              expect(result.regionId).to.equal('ff92e0b1-3934-430b-8b16-5b89a3ea258f')
              expect(result.startDate).to.equal(null)
              expect(result.endDate).to.equal(new Date('2025-03-31'))
            })

            it('returns the correct flags', async () => {
              const result = await DetermineImportedLicenceFlagsService.go(importedLicence, licenceId)

              expect(result.flagForPreSrocSupplementary).to.equal(false)
              expect(result.flagForSrocSupplementary).to.equal(false)
              expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
            })
          })
        })

        describe('for a licence with pre-sroc and sroc charge versions', () => {
          describe('and the licence is already flagged for billing', () => {
            beforeEach(async () => {
              Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_licenceData(true, true))
            })

            it('returns the correct flags', async () => {
              const result = await DetermineImportedLicenceFlagsService.go(importedLicence, licenceId)

              expect(result.flagForPreSrocSupplementary).to.equal(true)
              expect(result.flagForSrocSupplementary).to.equal(true)
              expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
            })
          })

          describe('and the licence is not already flagged for billing', () => {
            beforeEach(async () => {
              Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_licenceData(false, true))
            })

            it('returns the correct flags', async () => {
              const result = await DetermineImportedLicenceFlagsService.go(importedLicence, licenceId)

              expect(result.flagForPreSrocSupplementary).to.equal(false)
              expect(result.flagForSrocSupplementary).to.equal(false)
              expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
            })
          })
        })
      })
    })

    describe('with an sroc lapsed date of "2022-04-01"', () => {
      before(() => {
        importedLicence = {
          expiredDate: null,
          lapsedDate: new Date('2022-04-01'),
          revokedDate: null
        }
      })

      describe('for a licence with no charge versions', () => {
        describe('and the licence is already flagged for billing', () => {
          beforeEach(async () => {
            Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_licenceData(true, false))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService.go(importedLicence, licenceId)

            expect(result.flagForPreSrocSupplementary).to.equal(false)
            expect(result.flagForSrocSupplementary).to.equal(false)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
          })
        })

        describe('and the licence is not already flagged for billing', () => {
          beforeEach(async () => {
            Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_licenceData(false, false))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService.go(importedLicence, licenceId)

            expect(result.flagForPreSrocSupplementary).to.equal(false)
            expect(result.flagForSrocSupplementary).to.equal(false)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
          })
        })
      })

      describe('for a licence with pre-sroc and sroc charge versions', () => {
        describe('and the licence is already flagged for billing', () => {
          beforeEach(async () => {
            Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_licenceData(true, true))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService.go(importedLicence, licenceId)

            expect(result.flagForPreSrocSupplementary).to.equal(true)
            expect(result.flagForSrocSupplementary).to.equal(true)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(true)
          })
        })

        describe('and the licence is not already flagged for billing', () => {
          beforeEach(async () => {
            Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_licenceData(false, true))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService.go(importedLicence, licenceId)

            expect(result.flagForPreSrocSupplementary).to.equal(false)
            expect(result.flagForSrocSupplementary).to.equal(true)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(true)
          })
        })
      })
    })

    describe('with a pre-sroc expired date of "2019-01-01"', () => {
      before(() => {
        importedLicence = {
          expiredDate: new Date('2019-01-01'),
          lapsedDate: null,
          revokedDate: null
        }
      })

      describe('for a licence with no charge versions', () => {
        describe('and the licence is already flagged for billing', () => {
          beforeEach(async () => {
            Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_licenceData(true, false))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService.go(importedLicence, licenceId)

            expect(result.flagForPreSrocSupplementary).to.equal(false)
            expect(result.flagForSrocSupplementary).to.equal(false)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
          })
        })

        describe('and the licence is not already flagged for billing', () => {
          beforeEach(async () => {
            Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_licenceData(false, false))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService.go(importedLicence, licenceId)

            expect(result.flagForPreSrocSupplementary).to.equal(false)
            expect(result.flagForSrocSupplementary).to.equal(false)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(false)
          })
        })
      })

      describe('for a licence with pre-sroc and sroc charge versions', () => {
        describe('and the licence is already flagged for billing', () => {
          beforeEach(async () => {
            Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_licenceData(true, true))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService.go(importedLicence, licenceId)

            expect(result.flagForPreSrocSupplementary).to.equal(true)
            expect(result.flagForSrocSupplementary).to.equal(true)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(true)
          })
        })

        describe('and the licence is not already flagged for billing', () => {
          beforeEach(async () => {
            Sinon.stub(FetchExistingLicenceDetailsService, 'go').resolves(_licenceData(false, true))
          })

          it('returns the correct flags', async () => {
            const result = await DetermineImportedLicenceFlagsService.go(importedLicence, licenceId)

            expect(result.flagForPreSrocSupplementary).to.equal(true)
            expect(result.flagForSrocSupplementary).to.equal(true)
            expect(result.flagForTwoPartTariffSupplementary).to.equal(true)
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
