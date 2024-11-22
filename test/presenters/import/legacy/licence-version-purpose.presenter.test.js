'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const LicenceVersionPurposePresenter = require('../../../../app/presenters/import/legacy/licence-version-purpose.presenter.js')

describe('Import Legacy Licence Version Purpose presenter', () => {
  let legacyLicenceVersionPurpose

  beforeEach(() => {
    legacyLicenceVersionPurpose = _legacyLicenceVersionPurpose()
  })

  it('correctly transforms the data', () => {
    const results = LicenceVersionPurposePresenter.go(legacyLicenceVersionPurpose)

    expect(results).to.equal({
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 3,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 4,
      annualQuantity: 545520,
      dailyQuantity: 1500.2,
      externalId: '6:10000004',
      hourlyQuantity: 140.929,
      instantQuantity: null,
      licenceVersionPurposeConditions: [],
      notes: null,
      primaryPurposeId: '8d9d407c-3da7-4977-84a0-97738c9b44cc',
      purposeId: '025bfdc9-d7f4-46b5-a7e0-451dec1a34a6',
      secondaryPurposeId: '04bdc9f6-a4e7-41de-831c-9ebf15b92782',
      timeLimitedEndDate: null,
      timeLimitedStartDate: null
    })
  })
})

function _legacyLicenceVersionPurpose() {
  return {
    abstraction_period_end_day: 31,
    abstraction_period_end_month: 3,
    abstraction_period_start_day: 1,
    abstraction_period_start_month: 4,
    annual_quantity: 545520,
    daily_quantity: 1500.2,
    external_id: '6:10000004',
    hourly_quantity: 140.929,
    instant_quantity: null,
    notes: null,
    primary_purpose_id: '8d9d407c-3da7-4977-84a0-97738c9b44cc',
    purpose_id: '025bfdc9-d7f4-46b5-a7e0-451dec1a34a6',
    secondary_purpose_id: '04bdc9f6-a4e7-41de-831c-9ebf15b92782',
    time_limited_end_date: null,
    time_limited_start_date: null,
    version_external_id: '6:2113:100:0'
  }
}
