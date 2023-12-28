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
const ReviewChargeElementResultModel = require('../../../../app/models/review-charge-element-result.model.js')
const ReviewReturnResultModel = require('../../../../app/models/review-return-result.model.js')
const ReviewResultModel = require('../../../../app/models/review-result.model.js')

// Thing under test
const PersistAllocatedLicencesToResultsService = require('../../../../app/services/bill-runs/two-part-tariff/persist-allocated-licences-to-results.service.js')

describe('Persist Allocated Licences to Results service', () => {
  const billRunId = generateUUID()

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there are valid records to be persisted', () => {
    let licences

    describe('with charge elements that have been matched to returns', () => {
      beforeEach(() => {
        licences = _generateData()
      })

      it.only('persists the data into the results tables', async () => {
        await PersistAllocatedLicencesToResultsService.go(billRunId, licences)
      })
    })
  })
})

function _generateData () {
  const returnId = generateReturnLogId()
  const reviewReturnResultId = generateUUID()

  // All data not required for the tests has been excluded from the generated data
  const dataToPersist = [
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
              aggregate: null,
              chargeElements: [
                {
                  id: generateUUID(),
                  returnLogs: [
                    {
                      allocatedQuantity: 32,
                      returnId,
                      reviewReturnResultId
                    }
                  ],
                  allocatedQuantity: 32,
                  chargeDatesOverlap: false
                }
              ],
              allocatedQuantity: 32
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
          returnRequirement: '10021668',
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
          allocatedQuantity: 32,
          abstractionOutsidePeriod: false,
          matched: true,
          reviewReturnResultId
        }
      ]
    }
  ]

  return dataToPersist
}
