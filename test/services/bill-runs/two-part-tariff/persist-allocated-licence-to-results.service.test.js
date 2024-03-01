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
const ReviewResultModel = require('../../../../app/models/review-result.model.js')

// Thing under test
const PersistAllocatedLicenceToResultsService = require('../../../../app/services/bill-runs/two-part-tariff/persist-allocated-licence-to-results.service.js')

describe('Persist Allocated Licence to Results service', () => {
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

        const result = await ReviewResultModel.query()
          .where('licenceId', testLicence.id)
          .withGraphFetched('reviewChargeElementResults')
          .withGraphFetched('reviewReturnResults')

        expect(result[0].billRunId).to.equal(billRunId)
        expect(result[0].licenceId).to.equal(testLicence.id)
        expect(result[0].chargeVersionId).to.equal(testLicence.chargeVersions[0].id)
        expect(result[0].chargeReferenceId).to.equal(testLicence.chargeVersions[0].chargeReferences[0].id)
        expect(result[0].chargePeriodStartDate).to.equal(testLicence.chargeVersions[0].chargePeriod.startDate)
        expect(result[0].chargePeriodEndDate).to.equal(testLicence.chargeVersions[0].chargePeriod.endDate)
        expect(result[0].chargeVersionChangeReason).to.equal(testLicence.chargeVersions[0].changeReason.description)

        expect(result[0].reviewChargeElementResults.chargeElementId).to.equal(
          testLicence.chargeVersions[0].chargeReferences[0].chargeElements[0].id
        )
        expect(result[0].reviewChargeElementResults.allocated).to.equal(
          testLicence.chargeVersions[0].chargeReferences[0].chargeElements[0].allocatedQuantity
        )
        // As the aggregate is null on the charge reference the service returns 1
        expect(result[0].reviewChargeElementResults.aggregate).to.equal(1)
        expect(result[0].reviewChargeElementResults.chargeDatesOverlap).to.equal(
          testLicence.chargeVersions[0].chargeReferences[0].chargeElements[0].chargeDatesOverlap
        )

        expect(result[0].reviewReturnResults.returnId).to.equal(testLicence.returnLogs[0].id)
        expect(result[0].reviewReturnResults.returnReference).to.equal(testLicence.returnLogs[0].returnReference)
        expect(result[0].reviewReturnResults.startDate).to.equal(testLicence.returnLogs[0].startDate)
        expect(result[0].reviewReturnResults.endDate).to.equal(testLicence.returnLogs[0].endDate)
        expect(result[0].reviewReturnResults.dueDate).to.equal(testLicence.returnLogs[0].dueDate)
        expect(result[0].reviewReturnResults.receivedDate).to.equal(testLicence.returnLogs[0].receivedDate)
        expect(result[0].reviewReturnResults.status).to.equal(testLicence.returnLogs[0].status)
        expect(result[0].reviewReturnResults.underQuery).to.equal(testLicence.returnLogs[0].underQuery)
        expect(result[0].reviewReturnResults.nilReturn).to.equal(testLicence.returnLogs[0].nilReturn)
        expect(result[0].reviewReturnResults.description).to.equal(testLicence.returnLogs[0].description)
        expect(result[0].reviewReturnResults.purposes).to.equal(testLicence.returnLogs[0].purposes)
        expect(result[0].reviewReturnResults.quantity).to.equal(testLicence.returnLogs[0].quantity)
        expect(result[0].reviewReturnResults.allocated).to.equal(testLicence.returnLogs[0].allocatedQuantity)
        expect(result[0].reviewReturnResults.abstractionOutsidePeriod).to.equal(
          testLicence.returnLogs[0].abstractionOutsidePeriod
        )
      })
    })

    describe('with an aggregate value set and a charge element that has NOT been matched to a return', () => {
      beforeEach(() => {
        const aggregate = 0.5
        const returnMatched = false

        testLicence = _generateData(aggregate, returnMatched)
      })

      it('persists the return logs data into the results tables', async () => {
        await PersistAllocatedLicenceToResultsService.go(billRunId, testLicence)

        const result = await ReviewResultModel.query()
          .where('licenceId', testLicence.id)
          .withGraphFetched('reviewChargeElementResults')
          .withGraphFetched('reviewReturnResults')

        expect(result[0].billRunId).to.equal(billRunId)
        expect(result[0].licenceId).to.equal(testLicence.id)
        expect(result[0].chargeVersionId).to.be.null()
        expect(result[0].chargeReferenceId).to.be.null()
        expect(result[0].chargePeriodStartDate).to.be.null()
        expect(result[0].chargePeriodEndDate).to.be.null()
        expect(result[0].chargeVersionChangeReason).to.be.null()
        expect(result[0].reviewChargeElementResultId).to.be.null()

        expect(result[0].reviewChargeElementResults).to.be.null()

        expect(result[0].reviewReturnResults.returnId).to.equal(testLicence.returnLogs[0].id)
        expect(result[0].reviewReturnResults.returnReference).to.equal(testLicence.returnLogs[0].returnReference)
        expect(result[0].reviewReturnResults.startDate).to.equal(testLicence.returnLogs[0].startDate)
        expect(result[0].reviewReturnResults.endDate).to.equal(testLicence.returnLogs[0].endDate)
        expect(result[0].reviewReturnResults.dueDate).to.equal(testLicence.returnLogs[0].dueDate)
        expect(result[0].reviewReturnResults.receivedDate).to.equal(testLicence.returnLogs[0].receivedDate)
        expect(result[0].reviewReturnResults.status).to.equal(testLicence.returnLogs[0].status)
        expect(result[0].reviewReturnResults.underQuery).to.equal(testLicence.returnLogs[0].underQuery)
        expect(result[0].reviewReturnResults.nilReturn).to.equal(testLicence.returnLogs[0].nilReturn)
        expect(result[0].reviewReturnResults.description).to.equal(testLicence.returnLogs[0].description)
        expect(result[0].reviewReturnResults.purposes).to.equal(testLicence.returnLogs[0].purposes)
        expect(result[0].reviewReturnResults.quantity).to.equal(testLicence.returnLogs[0].quantity)
        expect(result[0].reviewReturnResults.allocated).to.equal(testLicence.returnLogs[0].allocatedQuantity)
        expect(result[0].reviewReturnResults.abstractionOutsidePeriod).to.equal(
          testLicence.returnLogs[0].abstractionOutsidePeriod
        )
      })

      it('persists the charge element data into the results tables', async () => {
        await PersistAllocatedLicenceToResultsService.go(billRunId, testLicence)

        const result = await ReviewResultModel.query()
          .where('licenceId', testLicence.id)
          .withGraphFetched('reviewChargeElementResults')
          .withGraphFetched('reviewReturnResults')

        expect(result[1].billRunId).to.equal(billRunId)
        expect(result[1].licenceId).to.equal(testLicence.id)
        expect(result[1].chargeVersionId).to.equal(testLicence.chargeVersions[0].id)
        expect(result[1].chargeReferenceId).to.equal(testLicence.chargeVersions[0].chargeReferences[0].id)
        expect(result[1].chargePeriodStartDate).to.equal(testLicence.chargeVersions[0].chargePeriod.startDate)
        expect(result[1].chargePeriodEndDate).to.equal(testLicence.chargeVersions[0].chargePeriod.endDate)
        expect(result[1].chargeVersionChangeReason).to.equal(testLicence.chargeVersions[0].changeReason.description)
        expect(result[1].reviewReturnResultId).to.be.null()

        expect(result[1].reviewChargeElementResults.chargeElementId).to.equal(
          testLicence.chargeVersions[0].chargeReferences[0].chargeElements[0].id
        )
        expect(result[1].reviewChargeElementResults.allocated).to.equal(
          testLicence.chargeVersions[0].chargeReferences[0].chargeElements[0].allocatedQuantity
        )
        expect(result[1].reviewChargeElementResults.aggregate).to.equal(
          testLicence.chargeVersions[0].chargeReferences[0].aggregate
        )
        expect(result[1].reviewChargeElementResults.chargeDatesOverlap).to.equal(
          testLicence.chargeVersions[0].chargeReferences[0].chargeElements[0].chargeDatesOverlap
        )

        expect(result[1].reviewReturnResults).to.be.null()
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
                chargeDatesOverlap: false
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
        matched: returnMatched
      }
    ]
  }

  return dataToPersist
}
