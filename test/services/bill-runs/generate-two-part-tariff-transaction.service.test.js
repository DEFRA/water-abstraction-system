// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Thing under test
import GenerateTwoPartTariffTransactionService from '../../../src/services/bill-runs/generate-two-part-tariff-transaction.service.js'

describe('Bill Runs - Generate Two Part Tariff Transaction service', () => {
  const billLicenceId = '5e2afb53-ca92-4515-ad71-36a7cefbcebb'

  let chargePeriod
  let chargeReference
  let newLicence
  let waterUndertaker

  beforeEach(async () => {
    chargeReference = _chargeReference(billLicenceId)

    chargePeriod = {
      endDate: new Date('2022-10-31'),
      startDate: new Date('2022-04-01')
    }
    newLicence = false
    waterUndertaker = false
  })

  describe('when called', () => {
    describe('with a charge reference that has volume to be billed', () => {
      it('returns a two-part tariff transaction ready to be persisted', () => {
        const result = GenerateTwoPartTariffTransactionService(
          billLicenceId,
          chargeReference,
          chargePeriod,
          newLicence,
          waterUndertaker
        )

        expect(result).toMatchObject({
          adjustmentFactor: 0.6,
          aggregateFactor: 0.75,
          authorisedDays: 0,
          authorisedQuantity: 20,
          billableDays: 0,
          billableQuantity: 15,
          billLicenceId,
          chargeCategoryCode: '4.4.5',
          chargeCategoryDescription:
            'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model',
          chargeReferenceId: '89450220-0f7f-4280-a946-1fdbe9b789c1',
          chargeType: 'standard',
          credit: false,
          description: 'Water abstraction charge: Lower Queenstown - Pittisham',
          endDate: chargePeriod.endDate,
          loss: 'low',
          newLicence,
          scheme: 'sroc',
          season: 'all year',
          secondPartCharge: true,
          section126Factor: 1,
          section127Agreement: false,
          section130Agreement: false,
          source: 'non-tidal',
          startDate: chargePeriod.startDate,
          status: 'candidate',
          supportedSource: false,
          supportedSourceName: null,
          volume: 15,
          waterCompanyCharge: false,
          waterUndertaker,
          winterOnly: false
        })
      })

      describe('and the charge reference has a two-part tariff agreement (section 127)', () => {
        beforeEach(() => {
          chargeReference.adjustments.s127 = true
        })

        it('returns the two-part tariff prefixed description', () => {
          const result = GenerateTwoPartTariffTransactionService(
            billLicenceId,
            chargeReference,
            chargePeriod,
            newLicence,
            waterUndertaker
          )

          expect(result.description).toEqual(
            'Two-part tariff second part water abstraction charge: Lower Queenstown - Pittisham'
          )
        })
      })
    })

    describe('with a charge reference that has no volume to be billed', () => {
      beforeEach(() => {
        chargeReference.chargeElements[0].reviewChargeElements[0].amendedAllocated = 0
        chargeReference.chargeElements[1].reviewChargeElements[0].amendedAllocated = 0
      })

      it('returns null', () => {
        const result = GenerateTwoPartTariffTransactionService(
          billLicenceId,
          chargeReference,
          chargePeriod,
          newLicence,
          waterUndertaker
        )

        expect(result).toBeNull()
      })
    })
  })
})

function _chargeReference() {
  // NOTE: We are faking an Objection model which comes with a toJSON() method that gets called as part
  // of processing the billing account.
  const toJSON = () => {
    return '{}'
  }

  return {
    additionalCharges: { isSupplyPublicWater: false },
    adjustments: {
      aggregate: '0.562114443',
      charge: null,
      s126: null,
      s127: false,
      s130: false,
      winter: false
    },
    chargeCategory: {
      id: 'b270718a-12c0-4fca-884b-3f8612dbe2f5',
      reference: '4.4.5',
      shortDescription: 'Low loss, non-tidal, restricted water, up to and including 5,000 ML/yr, Tier 1 model'
    },
    chargeElements: [
      {
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        id: 'e6b98712-227a-40c2-b93a-c05e9047be8c',
        reviewChargeElements: [{ amendedAllocated: 5, id: '1d9050b2-09c8-4570-8173-7f55921437cc' }],
        toJSON
      },
      {
        abstractionPeriodEndDay: 31,
        abstractionPeriodEndMonth: 3,
        abstractionPeriodStartDay: 1,
        abstractionPeriodStartMonth: 4,
        id: '9e6f3f64-78d5-441b-80fc-e01711b2f766',
        reviewChargeElements: [{ amendedAllocated: 10, id: '17f0c41e-e894-41d2-8a68-69dd2b39e9f9' }],
        toJSON
      }
    ],
    description: 'Lower Queenstown - Pittisham',
    id: '89450220-0f7f-4280-a946-1fdbe9b789c1',
    loss: 'low',
    reviewChargeReferences: [
      {
        amendedAggregate: 0.75,
        amendedAuthorisedVolume: 20,
        amendedChargeAdjustment: 0.6,
        id: '3dd04348-2c06-4559-9343-dd7dd76276ef'
      }
    ],
    source: 'non-tidal',
    volume: 20
  }
}
