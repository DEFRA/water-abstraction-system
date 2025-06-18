'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const LicenceVersionHelper = require('../../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../../support/helpers/licence-version-purpose.helper.js')
const LicenceVersionPurposeConditionHelper = require('../../../support/helpers/licence-version-purpose-condition.helper.js')
const LicenceVersionPurposeConditionTypeHelper = require('../../../support/helpers/licence-version-purpose-condition-type.helper.js')

// Thing under test
const FetchFullConditionService = require('../../../../app/services/licence-monitoring-station/setup/fetch-full-condition.service.js')

const CES_CONDITION_TYPE = LicenceVersionPurposeConditionTypeHelper.select(20)
const NON_CES_CONDITION_TYPE = LicenceVersionPurposeConditionTypeHelper.select(19)

describe('Fetch Full Condition Service', () => {
  let licence

  beforeEach(async () => {
    licence = await LicenceHelper.add()
  })

  describe('when called', () => {
    let conditionA
    let conditionB
    let anotherLicenceCondition
    let nonCessationCondition
    let supersededCondition

    beforeEach(async () => {
      conditionA = await _generateData(licence.id, 'current', CES_CONDITION_TYPE.id, { notes: 'CONDITION_A' })
      conditionB = await _generateData(licence.id, 'current', CES_CONDITION_TYPE.id, { notes: 'CONDITION_B' })

      // Generate a condition with an earlier createdAt date to test distinctOn
      await _generateData(licence.id, 'current', CES_CONDITION_TYPE.id, {
        notes: conditionA.notes,
        licenceVersionPurposeCondition: { createdAt: new Date(conditionA.createdAt.getTime() - 1000) }
      })

      const anotherLicence = await LicenceHelper.add()
      anotherLicenceCondition = await _generateData(anotherLicence.id, 'current', CES_CONDITION_TYPE.id, {
        notes: 'CONDITION_ON_ANOTHER_LICENCE'
      })

      nonCessationCondition = await _generateData(licence.id, 'current', NON_CES_CONDITION_TYPE.id, {
        notes: 'NON_CES_CONDITION'
      })

      supersededCondition = await _generateData(licence.id, 'superseded', CES_CONDITION_TYPE.id, {
        notes: 'SUPERSEDED_CONDITION'
      })
    })

    it('returns current CES conditions for the specified licence', async () => {
      const results = await FetchFullConditionService.go(licence.id)

      const ids = results.map((condition) => {
        return condition.id
      })

      expect(ids).to.equal([conditionA.id, conditionB.id])
    })

    it('does not return conditions from other licences', async () => {
      const results = await FetchFullConditionService.go(licence.id)

      const ids = results.map((condition) => {
        return condition.id
      })

      expect(ids).to.not.include(anotherLicenceCondition.id)
    })

    it('does not return non-CES conditions', async () => {
      const results = await FetchFullConditionService.go(licence.id)

      const ids = results.map((condition) => {
        return condition.id
      })

      expect(ids).to.not.include(nonCessationCondition.id)
    })

    it('does not return superseded conditions', async () => {
      const results = await FetchFullConditionService.go(licence.id)

      const ids = results.map((condition) => {
        return condition.id
      })

      expect(ids).to.not.include(supersededCondition.id)
    })
  })
})

async function _generateData(licenceId, status, conditionTypeId, options = {}) {
  const licenceVersion = await LicenceVersionHelper.add({
    licenceId,
    status
  })

  const licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
    licenceVersionId: licenceVersion.id
  })

  return LicenceVersionPurposeConditionHelper.add({
    licenceVersionPurposeId: licenceVersionPurpose.id,
    licenceVersionPurposeConditionTypeId: conditionTypeId,
    notes: options.notes,
    param1: options.param1,
    param2: options.param2,
    ...options.licenceVersionPurposeCondition
  })
}
