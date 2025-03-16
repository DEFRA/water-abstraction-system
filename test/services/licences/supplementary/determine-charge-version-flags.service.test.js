'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Things we need to stub
const GeneralLib = require('../../../../app/lib/general.lib.js')
const FetchChargeVersionBillingDataService = require('../../../../app/services/licences/supplementary/fetch-charge-version-billing-data.service.js')

// Thing under test
const DetermineChargeVersionFlagsService = require('../../../../app/services/licences/supplementary/determine-charge-version-flags.service.js')

describe('Licences - Supplementary - Determine Charge Version Flags service', () => {
  const chargeVersionId = '41187430-6a49-43a8-b12d-35a657dd1048'

  let chargeVersion
  let fetchChargeVersionBillingDataStub
  let srocBillRuns

  beforeEach(() => {
    chargeVersion = {
      id: chargeVersionId,
      chargeReferences: [{ twoPartTariff: false }],
      endDate: null,
      startDate: new Date('2023-04-01'),
      licence: {
        id: 'e516d678-4c04-45cf-8bde-4591bcdedce6',
        regionId: 'c4b61c55-d795-4cb2-8393-513bea525bd8',
        includeInPresrocBilling: 'no',
        includeInSrocBilling: false
      }
    }

    // Control what the 'current financial year' is for the purpose of testing
    Sinon.stub(GeneralLib, 'determineCurrentFinancialYear').returns({
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31')
    })

    fetchChargeVersionBillingDataStub = Sinon.stub(FetchChargeVersionBillingDataService, 'go')
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the start date of the charge version', () => {
    describe('is before the end of the current financial year', () => {
      beforeEach(() => {
        chargeVersion.startDate = new Date('2024-04-01')
      })

      describe('and the scheme is PRE-SROC', () => {
        beforeEach(() => {
          chargeVersion.scheme = 'alcs'

          srocBillRuns = []

          fetchChargeVersionBillingDataStub.resolves({ chargeVersion, srocBillRuns })
        })

        it('returns the result with the PRE-SROC flag set to true and the other flags unchanged', async () => {
          const result = await DetermineChargeVersionFlagsService.go(chargeVersionId)

          expect(result).to.equal({
            licenceId: 'e516d678-4c04-45cf-8bde-4591bcdedce6',
            startDate: chargeVersion.startDate,
            endDate: null,
            regionId: 'c4b61c55-d795-4cb2-8393-513bea525bd8',
            flagForPreSrocSupplementary: true,
            flagForSrocSupplementary: false,
            flagForTwoPartTariffSupplementary: false
          })
        })
      })

      describe('and the scheme is SROC', () => {
        beforeEach(() => {
          chargeVersion.scheme = 'sroc'
        })

        describe('and it is chargeable but not two-part tariff', () => {
          describe('and the licence has only been in some "standard" bill runs', () => {
            beforeEach(() => {
              srocBillRuns = [{ batchType: 'annual' }]

              fetchChargeVersionBillingDataStub.resolves({ chargeVersion, srocBillRuns })
            })

            it('returns the result with the SROC flag set to true and the other flags unchanged', async () => {
              const result = await DetermineChargeVersionFlagsService.go(chargeVersionId)

              expect(result).to.equal({
                licenceId: 'e516d678-4c04-45cf-8bde-4591bcdedce6',
                startDate: chargeVersion.startDate,
                endDate: null,
                regionId: 'c4b61c55-d795-4cb2-8393-513bea525bd8',
                flagForPreSrocSupplementary: false,
                flagForSrocSupplementary: true,
                flagForTwoPartTariffSupplementary: false
              })
            })
          })

          describe('and the licence has only been in some "two-part tariff" bill runs', () => {
            beforeEach(() => {
              srocBillRuns = [{ batchType: 'two_part_tariff' }]

              fetchChargeVersionBillingDataStub.resolves({ chargeVersion, srocBillRuns })
            })

            it('returns the result with the SROC flag and two-part tariff set to true', async () => {
              const result = await DetermineChargeVersionFlagsService.go(chargeVersionId)

              expect(result).to.equal({
                licenceId: 'e516d678-4c04-45cf-8bde-4591bcdedce6',
                startDate: chargeVersion.startDate,
                endDate: null,
                regionId: 'c4b61c55-d795-4cb2-8393-513bea525bd8',
                flagForPreSrocSupplementary: false,
                flagForSrocSupplementary: true,
                flagForTwoPartTariffSupplementary: true
              })
            })
          })

          describe('and the licence has not been in any bill runs', () => {
            beforeEach(() => {
              srocBillRuns = []

              fetchChargeVersionBillingDataStub.resolves({ chargeVersion, srocBillRuns })
            })

            it('returns the result with the SROC flag set to true and the other flags unchanged', async () => {
              const result = await DetermineChargeVersionFlagsService.go(chargeVersionId)

              expect(result).to.equal({
                licenceId: 'e516d678-4c04-45cf-8bde-4591bcdedce6',
                startDate: chargeVersion.startDate,
                endDate: null,
                regionId: 'c4b61c55-d795-4cb2-8393-513bea525bd8',
                flagForPreSrocSupplementary: false,
                flagForSrocSupplementary: true,
                flagForTwoPartTariffSupplementary: false
              })
            })
          })
        })

        describe('and it is two-part tariff', () => {
          beforeEach(() => {
            chargeVersion.chargeReferences[0].twoPartTariff = true
          })

          describe('and the licence has only been in some "standard" bill runs', () => {
            beforeEach(() => {
              srocBillRuns = [{ batchType: 'annual' }]

              fetchChargeVersionBillingDataStub.resolves({ chargeVersion, srocBillRuns })
            })

            it('returns the result with the SROC flag and two-part tariff set to true', async () => {
              const result = await DetermineChargeVersionFlagsService.go(chargeVersionId)

              expect(result).to.equal({
                licenceId: 'e516d678-4c04-45cf-8bde-4591bcdedce6',
                startDate: chargeVersion.startDate,
                endDate: null,
                regionId: 'c4b61c55-d795-4cb2-8393-513bea525bd8',
                flagForPreSrocSupplementary: false,
                flagForSrocSupplementary: true,
                flagForTwoPartTariffSupplementary: true
              })
            })
          })

          describe('and the licence has only been in some "two-part tariff" bill runs', () => {
            beforeEach(() => {
              srocBillRuns = [{ batchType: 'two_part_tariff' }]

              fetchChargeVersionBillingDataStub.resolves({ chargeVersion, srocBillRuns })
            })

            it('returns the result with the SROC flag and two-part tariff set to true', async () => {
              const result = await DetermineChargeVersionFlagsService.go(chargeVersionId)

              expect(result).to.equal({
                licenceId: 'e516d678-4c04-45cf-8bde-4591bcdedce6',
                startDate: chargeVersion.startDate,
                endDate: null,
                regionId: 'c4b61c55-d795-4cb2-8393-513bea525bd8',
                flagForPreSrocSupplementary: false,
                flagForSrocSupplementary: true,
                flagForTwoPartTariffSupplementary: true
              })
            })
          })

          describe('and the licence has not been in any bill runs', () => {
            beforeEach(() => {
              srocBillRuns = []

              fetchChargeVersionBillingDataStub.resolves({ chargeVersion, srocBillRuns })
            })

            it('returns the result with the SROC flag and two-part tariff set to true', async () => {
              const result = await DetermineChargeVersionFlagsService.go(chargeVersionId)

              expect(result).to.equal({
                licenceId: 'e516d678-4c04-45cf-8bde-4591bcdedce6',
                startDate: chargeVersion.startDate,
                endDate: null,
                regionId: 'c4b61c55-d795-4cb2-8393-513bea525bd8',
                flagForPreSrocSupplementary: false,
                flagForSrocSupplementary: true,
                flagForTwoPartTariffSupplementary: true
              })
            })
          })
        })

        describe('and it is non-chargeable', () => {
          beforeEach(() => {
            chargeVersion.chargeReferences = []
          })

          describe('and the licence has only been in some "standard" bill runs', () => {
            beforeEach(() => {
              srocBillRuns = [{ batchType: 'annual' }]

              fetchChargeVersionBillingDataStub.resolves({ chargeVersion, srocBillRuns })
            })

            it('returns the result with the SROC flag set to true and the other flags unchanged', async () => {
              const result = await DetermineChargeVersionFlagsService.go(chargeVersionId)

              expect(result).to.equal({
                licenceId: 'e516d678-4c04-45cf-8bde-4591bcdedce6',
                startDate: chargeVersion.startDate,
                endDate: null,
                regionId: 'c4b61c55-d795-4cb2-8393-513bea525bd8',
                flagForPreSrocSupplementary: false,
                flagForSrocSupplementary: true,
                flagForTwoPartTariffSupplementary: false
              })
            })
          })

          describe('and the licence has only been in some "two-part tariff" bill runs', () => {
            beforeEach(() => {
              srocBillRuns = [{ batchType: 'two_part_tariff' }]

              fetchChargeVersionBillingDataStub.resolves({ chargeVersion, srocBillRuns })
            })

            it('returns the result with only the two-part tariff set to true', async () => {
              const result = await DetermineChargeVersionFlagsService.go(chargeVersionId)

              expect(result).to.equal({
                licenceId: 'e516d678-4c04-45cf-8bde-4591bcdedce6',
                startDate: chargeVersion.startDate,
                endDate: null,
                regionId: 'c4b61c55-d795-4cb2-8393-513bea525bd8',
                flagForPreSrocSupplementary: false,
                flagForSrocSupplementary: false,
                flagForTwoPartTariffSupplementary: true
              })
            })
          })

          describe('and the licence has not been in any bill runs', () => {
            beforeEach(() => {
              srocBillRuns = []

              fetchChargeVersionBillingDataStub.resolves({ chargeVersion, srocBillRuns })
            })

            it('returns the result with the PRE-SROC and SROC flags unchanged and the two-part tariff flag as false', async () => {
              const result = await DetermineChargeVersionFlagsService.go(chargeVersionId)

              expect(result).to.equal({
                licenceId: 'e516d678-4c04-45cf-8bde-4591bcdedce6',
                startDate: chargeVersion.startDate,
                endDate: null,
                regionId: 'c4b61c55-d795-4cb2-8393-513bea525bd8',
                flagForPreSrocSupplementary: false,
                flagForSrocSupplementary: false,
                flagForTwoPartTariffSupplementary: false
              })
            })
          })
        })
      })
    })

    describe('is after the end of the current financial year', () => {
      beforeEach(() => {
        chargeVersion.startDate = new Date('2099-04-01')

        srocBillRuns = []

        fetchChargeVersionBillingDataStub.resolves({ chargeVersion, srocBillRuns })
      })

      it('returns the result with the PRE-SROC and SROC flags unchanged and the two-part tariff flag as false', async () => {
        const result = await DetermineChargeVersionFlagsService.go(chargeVersionId)

        expect(result).to.equal({
          licenceId: 'e516d678-4c04-45cf-8bde-4591bcdedce6',
          startDate: chargeVersion.startDate,
          endDate: null,
          regionId: 'c4b61c55-d795-4cb2-8393-513bea525bd8',
          flagForPreSrocSupplementary: false,
          flagForSrocSupplementary: false,
          flagForTwoPartTariffSupplementary: false
        })
      })
    })
  })
})
