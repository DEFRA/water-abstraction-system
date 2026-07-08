// Test helpers
import { generateUUID } from '../../../../app/lib/general.lib.js'
import { generateReturnId } from '../../../support/helpers/return-log.helper.js'
import ReviewLicenceModel from '../../../../app/models/review-licence.model.js'

// Thing under test
import PersistAllocatedLicenceToResultsService from '../../../../app/services/bill-runs/match/persist-allocated-licence-to-results.service.js'

describe('Persist Allocated Licence to Results service', () => {
  const billRunId = generateUUID()

  describe('when there are records to be persisted', () => {
    let testLicence

    describe('with a charge element that has been matched to a return', () => {
      beforeEach(() => {
        testLicence = _generateData()
      })

      it('persists the data into the results tables', async () => {
        await PersistAllocatedLicenceToResultsService(billRunId, testLicence)

        const result = await ReviewLicenceModel.query()
          .where('licenceId', testLicence.id)
          .withGraphFetched('reviewReturns')
          .withGraphFetched('reviewChargeVersions')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.reviewReturns')

        // Check the licence persisted correctly
        expect(result[0].billRunId).toEqual(billRunId)
        expect(result[0].licenceId).toEqual(testLicence.id)
        expect(result[0].licenceRef).toEqual(testLicence.licenceRef)
        expect(result[0].licenceHolder).toEqual(testLicence.licenceHolder)
        expect(result[0].issues).toEqual('')
        expect(result[0].status).toEqual(testLicence.status)

        // Check the licence return logs persisted correctly
        const { reviewReturns } = result[0]

        expect(reviewReturns).toHaveLength(1)
        expect(reviewReturns[0].reviewLicenceId).toEqual(result[0].id)
        expect(reviewReturns[0].returnId).toEqual(testLicence.returnLogs[0].returnId)
        expect(reviewReturns[0].returnLogId).toEqual(testLicence.returnLogs[0].id)
        expect(reviewReturns[0].returnReference).toEqual(testLicence.returnLogs[0].returnReference)
        expect(reviewReturns[0].quantity).toEqual(testLicence.returnLogs[0].quantity)
        expect(reviewReturns[0].allocated).toEqual(testLicence.returnLogs[0].allocatedQuantity)
        expect(reviewReturns[0].underQuery).toEqual(testLicence.returnLogs[0].underQuery)
        expect(reviewReturns[0].returnStatus).toEqual(testLicence.returnLogs[0].status)
        expect(reviewReturns[0].nilReturn).toEqual(testLicence.returnLogs[0].nilReturn)
        expect(reviewReturns[0].abstractionOutsidePeriod).toEqual(testLicence.returnLogs[0].abstractionOutsidePeriod)
        expect(reviewReturns[0].receivedDate).toEqual(testLicence.returnLogs[0].receivedDate)
        expect(reviewReturns[0].dueDate).toEqual(testLicence.returnLogs[0].dueDate)
        expect(reviewReturns[0].purposes).toEqual(testLicence.returnLogs[0].purposes)
        expect(reviewReturns[0].description).toEqual(testLicence.returnLogs[0].description)
        expect(reviewReturns[0].startDate).toEqual(testLicence.returnLogs[0].startDate)
        expect(reviewReturns[0].endDate).toEqual(testLicence.returnLogs[0].endDate)
        expect(reviewReturns[0].issues).toEqual('')

        // Check the charge version persisted correctly
        const { reviewChargeVersions } = result[0]
        const { chargeVersions: testChargeVersions } = testLicence

        expect(reviewChargeVersions).toHaveLength(1)
        expect(reviewChargeVersions[0].reviewLicenceId).toEqual(result[0].id)
        expect(reviewChargeVersions[0].chargeVersionId).toEqual(testChargeVersions[0].id)
        expect(reviewChargeVersions[0].changeReason).toEqual(testChargeVersions[0].changeReason.description)
        expect(reviewChargeVersions[0].chargePeriodStartDate).toEqual(testChargeVersions[0].chargePeriod.startDate)
        expect(reviewChargeVersions[0].chargePeriodEndDate).toEqual(testChargeVersions[0].chargePeriod.endDate)

        // Check the charge reference persisted correctly
        // NOTE: As the aggregate is null on the charge reference the service returns 1
        const { reviewChargeReferences } = reviewChargeVersions[0]

        expect(reviewChargeReferences).toHaveLength(1)
        expect(reviewChargeReferences[0].reviewChargeVersionId).toEqual(result[0].reviewChargeVersions[0].id)
        expect(reviewChargeReferences[0].chargeReferenceId).toEqual(testChargeVersions[0].chargeReferences[0].id)
        expect(reviewChargeReferences[0].aggregate).toEqual(1)
        expect(reviewChargeReferences[0].authorisedVolume).toEqual(testChargeVersions[0].chargeReferences[0].volume)
        expect(reviewChargeReferences[0].amendedAuthorisedVolume).toEqual(
          testChargeVersions[0].chargeReferences[0].volume
        )

        // Check the charge element persisted correctly
        const { reviewChargeElements } = reviewChargeReferences[0]
        const { chargeReferences } = testChargeVersions[0]

        expect(reviewChargeElements).toHaveLength(1)
        expect(reviewChargeElements[0].reviewChargeReferenceId).toEqual(
          result[0].reviewChargeVersions[0].reviewChargeReferences[0].id
        )
        expect(reviewChargeElements[0].allocated).toEqual(chargeReferences[0].chargeElements[0].allocatedQuantity)
        expect(reviewChargeElements[0].amendedAllocated).toEqual(
          chargeReferences[0].chargeElements[0].allocatedQuantity
        )
        expect(reviewChargeElements[0].chargeElementId).toEqual(chargeReferences[0].chargeElements[0].id)
        expect(reviewChargeElements[0].chargeDatesOverlap).toEqual(
          chargeReferences[0].chargeElements[0].chargeDatesOverlap
        )
        expect(reviewChargeElements[0].issues).toEqual('')
        expect(reviewChargeElements[0].status).toEqual(chargeReferences[0].chargeElements[0].status)

        // Check the charge elements relationship to the return persisted
        expect(reviewChargeElements[0].reviewReturns).toHaveLength(1)
        expect(reviewChargeElements[0].reviewReturns[0].returnLogId).toEqual(testLicence.returnLogs[0].id)
      })
    })

    describe('with an aggregate value set and a charge element that has NOT been matched to a return', () => {
      beforeEach(() => {
        const returnMatched = false

        testLicence = _generateData(returnMatched)
        testLicence.chargeVersions[0].chargeReferences[0].aggregate = 0.5
      })

      it('persists the aggregate value on the charge reference', async () => {
        await PersistAllocatedLicenceToResultsService(billRunId, testLicence)

        const result = await ReviewLicenceModel.query()
          .where('licenceId', testLicence.id)
          .withGraphFetched('reviewReturns')
          .withGraphFetched('reviewChargeVersions')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.reviewReturns')

        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].chargeReferenceId).toEqual(
          testLicence.chargeVersions[0].chargeReferences[0].id
        )
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].aggregate).toEqual(0.5)

        // NOTE: At the time of persisting the data the aggregate and amendedAggregate columns are both persisted with
        // the source data. The amended column is then used for if the user updates the value during the bill-runs
        // review process
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].amendedAggregate).toEqual(0.5)
      })

      it('persists the charge element with no matched return', async () => {
        await PersistAllocatedLicenceToResultsService(billRunId, testLicence)

        const result = await ReviewLicenceModel.query()
          .where('licenceId', testLicence.id)
          .withGraphFetched('reviewReturns')
          .withGraphFetched('reviewChargeVersions')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.reviewReturns')

        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements).toHaveLength(1)
        expect(
          result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].chargeElementId
        ).toEqual(testLicence.chargeVersions[0].chargeReferences[0].chargeElements[0].id)

        expect(
          result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].reviewReturns
        ).toHaveLength(0)
        expect(
          result[0].reviewChargeVersions[0].reviewChargeReferences[0].reviewChargeElements[0].reviewReturns
        ).toEqual([])
      })
    })

    describe('with a charge adjustment set', () => {
      beforeEach(() => {
        testLicence = _generateData()
        testLicence.chargeVersions[0].chargeReferences[0].charge = 0.25
      })

      it('persists the charge adjustment on the charge reference', async () => {
        await PersistAllocatedLicenceToResultsService(billRunId, testLicence)

        const result = await ReviewLicenceModel.query()
          .where('licenceId', testLicence.id)
          .withGraphFetched('reviewReturns')
          .withGraphFetched('reviewChargeVersions')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.reviewReturns')

        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].chargeReferenceId).toEqual(
          testLicence.chargeVersions[0].chargeReferences[0].id
        )
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].chargeAdjustment).toEqual(0.25)

        // NOTE: At the time of persisting the data the chargeAdjustment and amendedChargeAdjustment columns are both
        // persisted with the source data. The amended column is then used for if the user updates the value during the
        // bill-runs review process
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].amendedChargeAdjustment).toEqual(0.25)
      })
    })

    describe('with a abatement agreement set', () => {
      beforeEach(() => {
        testLicence = _generateData()
        testLicence.chargeVersions[0].chargeReferences[0].s126 = 0.17
      })

      it('persists the abatement agreement on the charge reference', async () => {
        await PersistAllocatedLicenceToResultsService(billRunId, testLicence)

        const result = await ReviewLicenceModel.query()
          .where('licenceId', testLicence.id)
          .withGraphFetched('reviewReturns')
          .withGraphFetched('reviewChargeVersions')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements')
          .withGraphFetched('reviewChargeVersions.reviewChargeReferences.reviewChargeElements.reviewReturns')

        // NOTE: A user cannot update the abatement agreement on the UI, hence no amendedAbatementAgreement column
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].chargeReferenceId).toEqual(
          testLicence.chargeVersions[0].chargeReferences[0].id
        )
        expect(result[0].reviewChargeVersions[0].reviewChargeReferences[0].abatementAgreement).toEqual(0.17)
      })
    })
  })
})

function _generateData(returnMatched = true) {
  const returnLogId = generateUUID()

  const chargeElementReturnLogs = [
    {
      allocatedQuantity: 32,
      returnLogId
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
        id: returnLogId,
        returnId: generateReturnId(),
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
