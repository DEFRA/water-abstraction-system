import { generateAccountNumber, generateLicenceRef, generateUUID } from 'water-abstraction-engine/test/generators.js'

/**
 * Represents a bill run object with generated UUIDs for the ID and external ID
 *
 * @param {string} regionId - UUID of the region the bill run is for
 *
 * @returns {object} Bill run object with generated UUIDs
 */
function billRun(regionId) {
  return {
    externalId: generateUUID(),
    id: generateUUID(),
    regionId
  }
}

/**
 * Represents a billing account object with a generated UUID for the ID and a generated account number
 *
 * @returns {object} Billing account object with generated UUID and account number
 */
function billingAccount() {
  return {
    accountNumber: generateAccountNumber(),
    id: generateUUID()
  }
}

/**
 * Generates a mock response object from the Charging Module API
 *
 * @param {string} transactionId - UUID of the transaction
 *
 * @returns {object} Mock response object from the Charging Module API
 */
function chargingModuleResponse(transactionId) {
  return {
    response: {
      body: { transaction: { id: transactionId } }
    },
    succeeded: true
  }
}

/**
 * Represents a complete response from `FetchChargeVersionsService`
 *
 * We are faking an Objection model which comes with a toJSON() method that gets called as part of processing the
 * billing account.
 *
 * @param {string} billingAccountId - UUID of the billing account
 * @param {object} licence - Licence object with a generated UUID, licence reference and a region with a generated UUID
 * and charge region ID
 *
 * @returns {object} Charge version object with generated UUID and licence
 */
function chargeVersion(billingAccountId, licence) {
  // NOTE: We are faking an Objection model which comes with a toJSON() method that gets called as part
  // of processing the billing account.
  const toJSON = () => {
    return '{}'
  }

  return {
    billingAccountId,
    chargeReferences: [
      {
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
        id: generateUUID(),
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
    ],
    endDate: null,
    id: generateUUID(),
    licence,
    scheme: 'sroc',
    startDate: new Date('2022-04-01'),
    status: 'current'
  }
}

/**
 * Represents a licence object with generated UUIDs for the ID and a generated licence reference
 *
 * @param {object} region - Region object with generated UUIDs for the ID and charge region ID
 *
 * @returns {object} Licence object with generated UUID and licence reference
 */
function licence(region) {
  return {
    expiredDate: null,
    historicalAreaCode: 'SAAR',
    id: generateUUID(),
    lapsedDate: null,
    licenceRef: generateLicenceRef(),
    region: {
      chargeRegionId: region.chargeRegionId,
      id: region.id
    },
    regionalChargeArea: 'Southern',
    revokedDate: null,
    startDate: new Date('2022-01-01'),
    waterUndertaker: true
  }
}

export default {
  billingAccount,
  billRun,
  chargeVersion,
  chargingModuleResponse,
  licence
}
