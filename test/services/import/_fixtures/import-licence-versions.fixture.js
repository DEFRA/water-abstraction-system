'use strict'

const { randomInteger } = require('../../../support/general.js')

function importLicenceVersionPurpose () {
  return {
    abstractionPeriodEndDay: 31,
    abstractionPeriodEndMonth: 3,
    abstractionPeriodStartDay: 1,
    abstractionPeriodStartMonth: 4,
    annualQuantity: 545520,
    dailyQuantity: 1500.2,
    externalId: `${randomInteger(1, 9)}:${randomInteger(10000004, 99999999)}`,
    hourlyQuantity: 140.929,
    instantQuantity: 120,
    notes: ' a note on purposes',
    primaryPurposeId: 'I',
    secondaryPurposeId: 'OTI',
    purposeId: '160',
    timeLimitedEndDate: '2001-01-02',
    timeLimitedStartDate: '2001-01-03'
  }
}

function importLicenceVersion () {
  return {
    endDate: '2002-01-01',
    externalId: `9:${randomInteger(10000, 99999)}:1:0`,
    increment: 0,
    issue: 100,
    startDate: '2001-01-01',
    status: 'superseded'
  }
}

function importLicenceVersionsAndPurposes () {
  return [
    { ...importLicenceVersion(), purposes: [{ ...importLicenceVersionPurpose() }] }
  ]
}

module.exports = {
  importLicenceVersionPurpose,
  importLicenceVersion,
  importLicenceVersionsAndPurposes
}
