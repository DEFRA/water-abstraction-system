'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const LicenceVersionPurposeConditionsPresenter =
  require('../../../../app/presenters/import/legacy/licence-version-purpose-conditions.presenter.js')

describe('Import Legacy Licence Version Purpose presenter', () => {
  let legacyLicenceVersionPurposeConditions

  beforeEach(() => {
    legacyLicenceVersionPurposeConditions = _legacyLicenceVersionPurposeConditions()
  })

  it('correctly transforms the data', () => {
    const results = LicenceVersionPurposeConditionsPresenter.go(legacyLicenceVersionPurposeConditions)

    expect(results).to.equal([
      {
        code: 'GW',
        param1: null,
        param2: null,
        notes: 'At each abstraction borehole',
        externalId: '172640:6:10000004'
      }
    ])
  })
})

function _legacyLicenceVersionPurposeConditions () {
  return [
    {
      code: 'GW',
      param1: null,
      param2: null,
      notes: 'At each abstraction borehole',
      external_id: '172640:6:10000004'
    }
  ]
}
