'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const ReturnRequirementPointHelper = require('../../support/helpers/return-requirement-point.helper.js')

// Thing under test
const FetchReturnRequirementPointsService = require('../../../app/services/return-logs/fetch-return-requirement-points.service.js')

describe('Fetch Return Requirement Points service', () => {
  let testRecord1
  let testRecord2
  let testRecord3

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('Basic query', () => {
    beforeEach(async () => {
      testRecord1 = await ReturnRequirementPointHelper.add({ description: 'POND B OF BEESTON' })
      testRecord2 = await ReturnRequirementPointHelper.add({ description: 'POND S OF BEESTON', returnRequirementId: '9338e87e-0b8c-411b-8975-8e1d859642be' })
      testRecord3 = await ReturnRequirementPointHelper.add({ description: 'POND A OF BEESTON', returnRequirementId: '9338e87e-0b8c-411b-8975-8e1d859642be' })
    })

    it('can successfully return a formatted response when there is only one', async () => {
      const result = await FetchReturnRequirementPointsService.go(testRecord1.returnRequirementId)

      expect(result).to.equal([{
        name: testRecord1.description,
        ngr1: testRecord1.ngr1,
        ngr2: testRecord1.ngr2,
        ngr3: testRecord1.ngr3,
        ngr4: testRecord1.ngr4
      }])
    })

    it('can successfully return a formatted response when there is more than one', async () => {
      const result = await FetchReturnRequirementPointsService.go(testRecord2.returnRequirementId)

      expect(result).to.equal([{
        name: testRecord2.description,
        ngr1: testRecord2.ngr1,
        ngr2: testRecord2.ngr2,
        ngr3: testRecord2.ngr3,
        ngr4: testRecord2.ngr4
      }, {
        name: testRecord3.description,
        ngr1: testRecord3.ngr1,
        ngr2: testRecord3.ngr2,
        ngr3: testRecord3.ngr3,
        ngr4: testRecord3.ngr4
      }])
    })

    it('should return an empty array if there are none found', async () => {
      const result = await FetchReturnRequirementPointsService.go('1338e87e-0b8c-411b-8975-8e1d859642be')

      expect(result).to.equal([])
    })
  })
})
