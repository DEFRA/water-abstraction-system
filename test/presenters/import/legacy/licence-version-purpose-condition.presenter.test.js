'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const LicenceVersionPurposeConditionsPresenter =
  require('../../../../app/presenters/import/legacy/licence-version-purpose-condition.presenter.js')

describe('Import Legacy Licence Version Purpose Conditions presenter', () => {
  let legacyLicenceVersionPurposeCondition

  beforeEach(() => {
    legacyLicenceVersionPurposeCondition = _legacyLicenceVersionPurposeCondition()
  })

  it('correctly transforms the data', () => {
    const results = LicenceVersionPurposeConditionsPresenter.go(legacyLicenceVersionPurposeCondition)

    expect(results).to.equal({
      externalId: '172640:6:10000004',
      licenceVersionPurposeConditionTypeId: 'b10cc9d1-d46f-465d-a74a-26b2e567c699',
      notes: 'At each abstraction borehole',
      param1: null,
      param2: null
    })
  })
})

function _legacyLicenceVersionPurposeCondition () {
  return {
    external_id: '172640:6:10000004',
    licence_version_purpose_condition_type_id: 'b10cc9d1-d46f-465d-a74a-26b2e567c699',
    notes: 'At each abstraction borehole',
    param1: null,
    param2: null
  }
}
