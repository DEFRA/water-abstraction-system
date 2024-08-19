'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ReturnLogModel = require('../../../../app/models/return-log.model.js')

// Thing under test
const CreateReturnLogsService = require('../../../../app/services/jobs/return-logs/create-return-logs.service.js')

describe('Create return logs service', () => {
  const testData = [{
    createdAt: new Date(),
    dueDate: '2025-04-28',
    endDate: '2025-03-31',
    id: 'v1:1:8/37/23/*S/0081:10061618:2024-04-01:2025-03-31',
    licenceRef: '8/37/23/*S/0081',
    metadata: {
      isCurrent: true,
      isFinal: false,
      isTwoPartTariff: false,
      isUpload: false,
      nald: {
        regionCode: 1,
        formatId: 10061618,
        periodStartDay: 1,
        periodStartMonth: 11,
        periodEndDay: 31,
        periodEndMonth: 3
      },
      points: [{
        name: 'OLD HOUSE FARM, WAKES COLNE',
        ngr1: 'TL 898 286',
        ngr2: null,
        ngr3: null,
        ngr4: null
      }],
      purposes: [{
        alias: null,
        primary: {
          code: 'A',
          description: 'Agriculture'
        },
        tertiary: {
          code: '420',
          description: 'Spray Irrigation - Storage'
        },
        secondary: {
          code: 'AGR',
          description: 'General Agriculture'
        }
      }],
      version: 1
    },
    returnsFrequency: 'week',
    startDate: '2024-04-01',
    status: 'due',
    source: 'WRLS',
    returnReference: '10061618'
  }]

  describe('Basic query', () => {
    it('can successfully return a formatted response when there is only one', async () => {
      await CreateReturnLogsService.go(testData)

      const result = await ReturnLogModel.query().where('licenceRef', testData[0].licenceRef)

      expect(result.length).to.equal(1)
      expect(result[0].id).to.equal(testData[0].id)
      expect(result[0].licenceRef).to.equal(testData[0].licenceRef)
      expect(result[0].returnReference).to.equal(testData[0].returnReference)
      expect(result[0].returnsFrequency).to.equal(testData[0].returnsFrequency)
      expect(result[0].status).to.equal(testData[0].status)
      expect(result[0].source).to.equal(testData[0].source)
    })
  })
})
