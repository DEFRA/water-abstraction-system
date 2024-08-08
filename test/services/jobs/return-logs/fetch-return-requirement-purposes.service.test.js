'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const primaryPurposesData = require('../../../support/seeders/data/primary-purposes.data.js')
const purposeData = require('../../../support/seeders/data/purposes.data.js')
const ReturnRequirementPurposeHelper = require('../../../support/helpers/return-requirement-purpose.helper.js')
const secondaryPurposeData = require('../../../support/seeders/data/secondary-purposes.data.js')

// Thing under test
const FetchReturnRequirementPurposesService = require('../../../../app/services/jobs/return-logs/fetch-return-requirement-purposes.service.js')

function _findPurpose (purposes, id) {
  return purposes.find((item) => {
    return item.id === id
  })
}

describe('Fetch Return Requirement Purposes service', () => {
  let testRecord1
  let testRecord2
  let testRecord3

  describe('Basic query', () => {
    before(async () => {
      testRecord1 = await ReturnRequirementPurposeHelper.add()
      testRecord2 = await ReturnRequirementPurposeHelper.add({ returnRequirementId: '9338e87e-0b8c-411b-8975-8e1d859642bc' })
      testRecord3 = await ReturnRequirementPurposeHelper.add({ returnRequirementId: '9338e87e-0b8c-411b-8975-8e1d859642bc' })
    })

    it('can successfully return a formatted response when there is only one', async () => {
      const result = await FetchReturnRequirementPurposesService.go(testRecord1.returnRequirementId)

      const primary = _findPurpose(primaryPurposesData, testRecord1.primaryPurposeId)
      const secondary = _findPurpose(secondaryPurposeData, testRecord1.secondaryPurposeId)
      const purpose = _findPurpose(purposeData, testRecord1.purposeId)

      expect(result).to.equal([{
        alias: testRecord1.alias,
        primary: {
          code: primary.legacyId,
          description: primary.description
        },
        tertiary: {
          code: purpose.legacyId,
          description: purpose.description
        },
        secondary: {
          code: secondary.legacyId,
          description: secondary.description
        }
      }])
    })

    it('can successfully return a formatted response when there is more than one', async () => {
      const result = await FetchReturnRequirementPurposesService.go(testRecord2.returnRequirementId)

      const primary2 = _findPurpose(primaryPurposesData, testRecord2.primaryPurposeId)
      const secondary2 = _findPurpose(secondaryPurposeData, testRecord2.secondaryPurposeId)
      const purpose2 = _findPurpose(purposeData, testRecord2.purposeId)
      const primary3 = _findPurpose(primaryPurposesData, testRecord3.primaryPurposeId)
      const secondary3 = _findPurpose(secondaryPurposeData, testRecord3.secondaryPurposeId)
      const purpose3 = _findPurpose(purposeData, testRecord3.purposeId)

      expect(result).to.equal([{
        alias: testRecord2.alias,
        primary: {
          code: primary2.legacyId,
          description: primary2.description
        },
        tertiary: {
          code: purpose2.legacyId,
          description: purpose2.description
        },
        secondary: {
          code: secondary2.legacyId,
          description: secondary2.description
        }
      }, {
        alias: testRecord2.alias,
        primary: {
          code: primary3.legacyId,
          description: primary3.description
        },
        tertiary: {
          code: purpose3.legacyId,
          description: purpose3.description
        },
        secondary: {
          code: secondary3.legacyId,
          description: secondary3.description
        }
      }])
    })

    it('should return an empty array if there are none found', async () => {
      const result = await FetchReturnRequirementPurposesService.go('1338e87e-0b8c-411b-8975-8e1d859642be')

      expect(result).to.equal([])
    })
  })
})
