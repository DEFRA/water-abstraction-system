// Test helpers
import * as LicenceHelper from '../../../support/helpers/licence.helper.js'
import * as LicenceVersionHelper from '../../../support/helpers/licence-version.helper.js'
import * as LicenceVersionPurposeConditionHelper from '../../../support/helpers/licence-version-purpose-condition.helper.js'
import * as LicenceVersionPurposeConditionTypeHelper from '../../../support/helpers/licence-version-purpose-condition-type.helper.js'
import * as LicenceVersionPurposeHelper from '../../../support/helpers/licence-version-purpose.helper.js'

// Thing under test
import FetchFullConditionService from '../../../../app/services/licence-monitoring-station/setup/fetch-full-condition.service.js'

const CES_CONDITION_TYPE = LicenceVersionPurposeConditionTypeHelper.select(20)
const NON_CES_CONDITION_TYPE = LicenceVersionPurposeConditionTypeHelper.select(19)

describe('Licence Monitoring Station Setup - Fetch Full Condition Service', () => {
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
      const results = await FetchFullConditionService(licence.id)

      const ids = results.map((condition) => {
        return condition.id
      })

      expect(ids).toEqual([conditionA.id, conditionB.id])
    })

    it('does not return conditions from other licences', async () => {
      const results = await FetchFullConditionService(licence.id)

      const ids = results.map((condition) => {
        return condition.id
      })

      expect(ids).not.toContainEqual(anotherLicenceCondition.id)
    })

    it('does not return non-CES conditions', async () => {
      const results = await FetchFullConditionService(licence.id)

      const ids = results.map((condition) => {
        return condition.id
      })

      expect(ids).not.toContainEqual(nonCessationCondition.id)
    })

    it('does not return superseded conditions', async () => {
      const results = await FetchFullConditionService(licence.id)

      const ids = results.map((condition) => {
        return condition.id
      })

      expect(ids).not.toContainEqual(supersededCondition.id)
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
