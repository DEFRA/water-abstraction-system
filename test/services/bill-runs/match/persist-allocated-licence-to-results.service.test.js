'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { generateReturnLogId } = require('../../../support/helpers/return-log.helper.js')
const ReviewLicenceModel = require('../../../../app/models/review-licence.model.js')

// Thing under test
const PersistAllocatedLicenceToResultsService = require('../../../../app/services/bill-runs/match/persist-allocated-licence-to-results.service.js')

describe('Persist Allocated Licence to Results service', () => {
  const billRunId = generateUUID()

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
        const { reviewReturns } = result[0]

        expect(reviewReturns).to.have.length(1)
        expect(reviewReturns[0].reviewLicenceId).to.equal(result[0].id)
        expect(reviewReturns[0].returnId).to.equal(testLicence.returnLogs[0].id)
        expect(reviewReturns[0].returnReference).to.equal(testLicence.returnLogs[0].returnReference)
        expect(reviewReturns[0].quantity).to.equal(testLicence.returnLogs[0].quantity)
        expect(reviewReturns[0].allocated).to.equal(testLicence.returnLogs[0].allocatedQuantity)
        expect(reviewReturns[0].underQuery).to.equal(testLicence.returnLogs[0].underQuery)
        expect(reviewReturns[0].returnStatus).to.equal(testLicence.returnLogs[0].status)
        expect(reviewReturns[0].nilReturn).to.equal(testLicence.returnLogs[0].nilReturn)
        expect(reviewReturns[0].abstractionOutsidePeriod).to.equal(testLicence.returnLogs[0].abstractionOutsidePeriod)
        expect(reviewReturns[0].receivedDate).to.equal(testLicence.returnLogs[0].receivedDate)
        expect(reviewReturns[0].dueDate).to.equal(testLicence.returnLogs[0].dueDate)
        expect(reviewReturns[0].purposes).to.equal(testLicence.returnLogs[0].purposes)
        expect(reviewReturns[0].description).to.equal(testLicence.returnLogs[0].description)
        expect(reviewReturns[0].startDate).to.equal(testLicence.returnLogs[0].startDate)
        expect(reviewReturns[0].endDate).to.equal(testLicence.returnLogs[0].endDate)
        expect(reviewReturns[0].issues).to.equal('')

        // Check the charge version persisted correctly
        const { reviewChargeVersions } = result[0]
        const { chargeVersions: testChargeVersions } = testLicence

        expect(reviewChargeVersions).to.have.length(1)
        expect(reviewChargeVersions[0].reviewLicenceId).to.equal(result[0].id)
        expect(reviewChargeVersions[0].chargeVersionId).to.equal(testChargeVersions[0].id)
        expect(reviewChargeVersions[0].changeReason).to.equal(testChargeVersions[0].changeReason.description)
        expect(reviewChargeVersions[0].chargePeriodStartDate).to.equal(testChargeVersions[0].chargePeriod.startDate)
        expect(reviewChargeVersions[0].chargePeriodEndDate).to.equal(testChargeVersions[0].chargePeriod.endDate)

        // Check the charge reference persisted correctly
        // NOTE: As the aggregate is null on the charge reference the service returns 1
        const { reviewChargeReferences } = reviewChargeVersions[0]

        expect(reviewChargeReferences).to.have.length(1)
        expect(reviewChargeReferences[0].reviewChargeVersionId).to.equal(result[0].reviewChargeVersions[0].id)
        expect(reviewChargeReferences[0].chargeReferenceId).to.equal(testChargeVersions[0].chargeReferences[0].id)
        expect(reviewChargeReferences[0].aggregate).to.equal(1)
        expect(reviewChargeReferences[0].authorisedVolume).to.equal(testChargeVersions[0].chargeReferences[0].volume)
        expect(reviewChargeReferences[0].amendedAuthorisedVolume).to.equal(
          testChargeVersions[0].chargeReferences[0].volume
        )

        // Check the charge element persisted correctly
        const { reviewChargeElements } = reviewChargeReferences[0]
        const { chargeReferences } = testChargeVersions[0]

        expect(reviewChargeElements).to.have.length(1)
        expect(reviewChargeElements[0].reviewChargeReferenceId).to.equal(
          result[0].reviewChargeVersions[0].reviewChargeReferences[0].id
        )
        expect(reviewChargeElements[0].allocated).to.equal(chargeReferences[0].chargeElements[0].allocatedQuantity)
        expect(reviewChargeElements[0].amendedAllocated).to.equal(
          chargeReferences[0].chargeElements[0].allocatedQuantity
        )
        expect(reviewChargeElements[0].chargeElementId).to.equal(chargeReferences[0].chargeElements[0].id)
        expect(reviewChargeElements[0].chargeDatesOverlap).to.equal(
          chargeReferences[0].chargeElements[0].chargeDatesOverlap
        )
        expect(reviewChargeElements[0].issues).to.equal('')
        expect(reviewChargeElements[0].status).to.equal(chargeReferences[0].chargeElements[0].status)

        // Check the charge elements relationship to the return persisted
        expect(reviewChargeElements[0].reviewReturns).to.have.length(1)
        expect(reviewChargeElements[0].reviewReturns[0].returnId).to.equal(testLicence.returnLogs[0].id)
      })
    })

    describe('with an aggregate value set and a charge element that has NOT been matched to a return', () => {
      beforeEach(() => {
        const returnMatched = false

        testLicence = _generateData(returnMatched)
        testLicence.chargeVersions[0].chargeReferences[0].aggregate = 0.5
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

        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].chargeReferenceId).to.equal(
          testLicence.chargeVersions[0].chargeReferences[0].id
        )
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].aggregate).to.equal(0.5)

        // NOTE: At the time of persisting the data the aggregate and amendedAggregate columns are both persisted with
        // the source data. The amended column is then used for if the user updates the value during the bill-runs
        // review process
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].amendedAggregate).to.equal(0.5)
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
        expect(
          result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].chargeElementId
        ).to.equal(testLicence.chargeVersions[0].chargeReferences[0].chargeElements[0].id)

        expect(
          result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].reviewReturns
        ).to.have.length(0)
        expect(
          result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].reviewReturns
        ).to.equal([])
      })
    })

    describe('with a charge adjustment set', () => {
      beforeEach(() => {
        testLicence = _generateData()
        testLicence.chargeVersions[0].chargeReferences[0].charge = 0.25
      })

      it('persists the charge adjustment on the charge reference', async () => {
        await PersistAllocatedLicenceToResultsService.go(billRunId, testLicence)

        const result = await ReviewLicenceModel.query()
          .where('licenceId', testLicence.id)
          .withGraphFetched('reviewReturns')
          .withGraphFetched('reviewChargeVersions')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.reviewReturns')

        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].chargeReferenceId).to.equal(
          testLicence.chargeVersions[0].chargeReferences[0].id
        )
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].chargeAdjustment).to.equal(0.25)

        // NOTE: At the time of persisting the data the chargeAdjustment and amendedChargeAdjustment columns are both
        // persisted with the source data. The amended column is then used for if the user updates the value during the
        // bill-runs review process
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].amendedChargeAdjustment).to.equal(0.25)
      })
    })

    describe('with a abatement agreement set', () => {
      beforeEach(() => {
        testLicence = _generateData()
        testLicence.chargeVersions[0].chargeReferences[0].s126 = 0.17
      })

      it('persists the abatement agreement on the charge reference', async () => {
        await PersistAllocatedLicenceToResultsService.go(billRunId, testLicence)

        const result = await ReviewLicenceModel.query()
          .where('licenceId', testLicence.id)
          .withGraphFetched('reviewReturns')
          .withGraphFetched('reviewChargeVersions')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.reviewReturns')

        // NOTE: A user cannot update the abatement agreement on the UI, hence no amendedAbatementAgreement column
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].chargeReferenceId).to.equal(
          testLicence.chargeVersions[0].chargeReferences[0].id
        )
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].abatementAgreement).to.equal(0.17)
      })
    })
  })
})

function _generateData(returnMatched = true) {
  const returnId = generateReturnLogId()

  const chargeElementReturnLogs = [
    {
      allocatedQuantity: 32,
      returnId
    }
  ]

  // All data not required for the tests has been excluded from the generated data
  const dataToPersist = {
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
            aggregate: null,
            winter: true,
            charge: null,
            s126: null,
            s127: true,
            s130: false,
            volume: 200,
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
