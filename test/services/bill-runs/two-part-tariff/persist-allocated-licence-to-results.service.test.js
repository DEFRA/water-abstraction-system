'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { generateReturnLogId } = require('../../../support/helpers/return-log.helper.js')
const ReviewLicenceModel = require('../../../../app/models/review-licence.model.js')

// Thing under test
const PersistAllocatedLicenceToResultsService = require('../../../../app/services/bill-runs/two-part-tariff/persist-allocated-licence-to-results.service.js')

describe.only('Persist Allocated Licence to Results service', () => {
  const billRunId = generateUUID()

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there are records to be persisted', () => {
    let testLicence

    describe('with a charge element that has been matched to a return', () => {
      beforeEach(() => {
        testLicence = _generateData()
      })

      it('persists the data into the results tables', async () => {
        await PersistAllocatedLicenceToResultsService.go(billRunId, testLicence)

        const result = await ReviewLicenceModel.query()
          .where('licenceId', testLicence.id)
          .withGraphFetched('reviewReturns')
          .withGraphFetched('reviewChargeVersions')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.reviewReturns')

        // Check the licence persisted correctly
        expect(result[0].billRunId).to.equal(billRunId)
        expect(result[0].licenceId).to.equal(testLicence.id)
        expect(result[0].licenceRef).to.equal(testLicence.licenceRef)
        expect(result[0].licenceHolder).to.equal(testLicence.licenceHolder)
        expect(result[0].issues).to.equal('')
        expect(result[0].status).to.equal(testLicence.status)

        // Check the licence return logs persisted correctly
        expect(result[0].reviewReturns).to.have.length(1)
        expect(result[0].reviewReturns[0].reviewLicenceId).to.equal(result[0].id)
        expect(result[0].reviewReturns[0].returnId).to.equal(testLicence.returnLogs[0].id)
        expect(result[0].reviewReturns[0].returnReference).to.equal(testLicence.returnLogs[0].returnReference)
        expect(result[0].reviewReturns[0].quantity).to.equal(testLicence.returnLogs[0].quantity)
        expect(result[0].reviewReturns[0].allocated).to.equal(testLicence.returnLogs[0].allocatedQuantity)
        expect(result[0].reviewReturns[0].underQuery).to.equal(testLicence.returnLogs[0].underQuery)
        expect(result[0].reviewReturns[0].returnStatus).to.equal(testLicence.returnLogs[0].status)
        expect(result[0].reviewReturns[0].nilReturn).to.equal(testLicence.returnLogs[0].nilReturn)
        expect(result[0].reviewReturns[0].abstractionOutsidePeriod).to.equal(testLicence.returnLogs[0].abstractionOutsidePeriod)
        expect(result[0].reviewReturns[0].receivedDate).to.equal(testLicence.returnLogs[0].receivedDate)
        expect(result[0].reviewReturns[0].dueDate).to.equal(testLicence.returnLogs[0].dueDate)
        expect(result[0].reviewReturns[0].purposes).to.equal(testLicence.returnLogs[0].purposes)
        expect(result[0].reviewReturns[0].description).to.equal(testLicence.returnLogs[0].description)
        expect(result[0].reviewReturns[0].startDate).to.equal(testLicence.returnLogs[0].startDate)
        expect(result[0].reviewReturns[0].endDate).to.equal(testLicence.returnLogs[0].endDate)
        expect(result[0].reviewReturns[0].issues).to.equal('')

        // Check the charge version persisted correctly
        expect(result[0].reviewChargeVersions).to.have.length(1)
        expect(result[0].reviewChargeVersions[0].reviewLicenceId).to.equal(result[0].id)
        expect(result[0].reviewChargeVersions[0].chargeVersionId).to.equal(testLicence.chargeVersions[0].id)
        expect(result[0].reviewChargeVersions[0].changeReason).to.equal(testLicence.chargeVersions[0].changeReason.description)
        expect(result[0].reviewChargeVersions[0].chargePeriodStartDate).to.equal(testLicence.chargeVersions[0].chargePeriod.startDate)
        expect(result[0].reviewChargeVersions[0].chargePeriodEndDate).to.equal(testLicence.chargeVersions[0].chargePeriod.endDate)

        // Check the charge reference persisted correctly
        // NOTE: As the aggregate is null on the charge reference the service returns 1
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences).to.have.length(1)
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeVersionId).to.equal(result[0].reviewChargeVersions[0].id)
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].chargeReferenceId).to.equal(testLicence.chargeVersions[0].chargeReferences[0].id)
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].aggregate).to.equal(1)

        // Check the charge element persisted correctly
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements).to.have.length(1)
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].reviewChargeReferenceId).to.equal(result[0].reviewChargeVersions[0].reviewChargeReferences[0].id)
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].chargeElementId).to.equal(testLicence.chargeVersions[0].chargeReferences[0].chargeElements[0].id)
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].chargeDatesOverlap).to.equal(testLicence.chargeVersions[0].chargeReferences[0].chargeElements[0].chargeDatesOverlap)
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].issues).to.equal('')
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].status).to.equal(testLicence.chargeVersions[0].chargeReferences[0].chargeElements[0].status)

        // Check the charge elements relationship to the return persisted
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].reviewReturns).to.have.length(1)
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].reviewReturns[0].returnId).to.equal(testLicence.returnLogs[0].id)
      })
    })

    describe('with an aggregate value set and a charge element that has NOT been matched to a return', () => {
      beforeEach(() => {
        const aggregate = 0.5
        const returnMatched = false

        testLicence = _generateData(aggregate, returnMatched)
      })

      it('persists the aggregate value on the charge reference', async () => {
        await PersistAllocatedLicenceToResultsService.go(billRunId, testLicence)

        const result = await ReviewLicenceModel.query()
          .where('licenceId', testLicence.id)
          .withGraphFetched('reviewReturns')
          .withGraphFetched('reviewChargeVersions')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.reviewReturns')

        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].chargeReferenceId).to.equal(testLicence.chargeVersions[0].chargeReferences[0].id)
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].aggregate).to.equal(0.5)
      })

      it('persists the charge element with no matched return', async () => {
        await PersistAllocatedLicenceToResultsService.go(billRunId, testLicence)

        const result = await ReviewLicenceModel.query()
          .where('licenceId', testLicence.id)
          .withGraphFetched('reviewReturns')
          .withGraphFetched('reviewChargeVersions')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.reviewReturns')

        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements).to.have.length(1)
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].chargeElementId).to.equal(testLicence.chargeVersions[0].chargeReferences[0].chargeElements[0].id)

        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].reviewReturns).to.have.length(0)
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].reviewReturns).to.equal([])
      })
    })
  })
})

function _generateData (aggregate = null, returnMatched = true) {
  const returnId = generateReturnLogId()

  const chargeElementReturnLogs = [
    {
      allocatedQuantity: 32,
      returnId
    }
  ]

  // All data not required for the tests has been excluded from the generated data
  const dataToPersist =
  {
    id: generateUUID(),
    licenceRef: '1/11/10/*S/0084',
    licenceHolder: 'A licence holder',
    status: 'ready',
    issues: [],
    chargeVersions: [
      {
        id: generateUUID(),
        changeReason: {
          description: 'Strategic review of charges (SRoC)'
        },
        chargeReferences: [
          {
            id: generateUUID(),
            aggregate,
            chargeElements: [
              {
                id: generateUUID(),
                returnLogs: returnMatched ? chargeElementReturnLogs : [],
                allocatedQuantity: returnMatched ? 32 : 0,
                chargeDatesOverlap: false,
                status: 'ready',
                issues: []
              }
            ]
          }
        ],
        chargePeriod: {
          startDate: new Date('2022-04-01'),
          endDate: new Date('2023-03-31')
        }
      }
    ],
    returnLogs: [
      {
        id: returnId,
        returnReference: '10021668',
        description: 'DRAINS ETC-DEEPING FEN AND OTHER LINKED SITES',
        startDate: new Date('2022-04-01'),
        endDate: new Date('2023-03-31'),
        receivedDate: new Date('2023-03-01'),
        dueDate: new Date('2023-04-28'),
        status: 'completed',
        underQuery: false,
        purposes: [
          {
            tertiary: {
              code: '400',
              description: 'Spray Irrigation - Direct'
            }
          }
        ],
        nilReturn: false,
        quantity: 32,
        allocatedQuantity: returnMatched ? 32 : 0,
        abstractionOutsidePeriod: false,
        matched: returnMatched,
        issues: []
      }
    ]
  }

  return dataToPersist
}
