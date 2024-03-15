'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const LicenceVersionPurposeConditionHelper = require('../../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionTypesHelper = require('../../support/helpers/licence-version-purpose-condition-type.helper.js')

// Thing under test
const FetchLicenceVersionPurposeConstionService = require('../../../app/services/licences/fetch-licence-version-purpose-condition.service.js')

describe('Fetch licence version purpose condition service', () => {
  let abstractConditions
  let abstractConditionsTypes

  beforeEach(async () => {
    await DatabaseSupport.clean()
  })

  describe('when there is no optional data in the model', () => {
    beforeEach(async () => {
      abstractConditionsTypes = await LicenceVersionPurposeConditionTypesHelper.add()
      abstractConditions = await LicenceVersionPurposeConditionHelper.add({
        licenceVersionPurposeConditionTypeId: abstractConditionsTypes.id
      })
    })

    it('returns results', async () => {
      const result = await FetchLicenceVersionPurposeConstionService.go(abstractConditions.licenceVersionPurposeId)

      expect(result.abstractionConditions).to.equal(['Link between split licences'])
    })
  })
})
