'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../support/helpers/licence.helper.js')
const ChargeVersionHelper = require('../../support/helpers/charge-version.helper.js')
const ChargeReferenceHelper = require('../../support/helpers/charge-reference.helper.js')
const ChargeElementHelper = require('../../support/helpers/charge-element.helper.js')

// Thing under test
const FetchLicenceChargeVersionsService = require('../../../app/services/import/fetch-licence-charge-versions.service.js')

describe('Fetch Licence Charge Versions service', () => {
  let clock
  let testDate

  beforeEach(() => {
    testDate = new Date('2024-03-31')
    clock = Sinon.useFakeTimers(testDate)
  })

  afterEach(() => {
    clock.restore()
  })

  describe('when given a valid licence id', () => {
    let licence
    let chargeVersion
    let chargeReference
    let chargeElement

    beforeEach(async () => {
      licence = await LicenceHelper.add()
    })

    describe('and the licence has charge version data over 6 years old', () => {
      beforeEach(async () => {
        chargeVersion = await ChargeVersionHelper.add({
          licenceId: licence.id,
          licenceRef: licence.licenceRef,
          startDate: new Date('2010-04-01'),
          endDate: new Date('2015-03-31')
        })

        chargeReference = await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id })

        chargeElement = await ChargeElementHelper.add({ chargeReferenceId: chargeReference.id })
      })

      it('returns the licence and charge version data from the past 6 years', async () => {
        const result = await FetchLicenceChargeVersionsService.go(licence.id)

        expect(result).to.equal({
          id: licence.id,
          licenceRef: licence.licenceRef,
          includeInPresrocBilling: 'no',
          includeInSrocBilling: false,
          revokedDate: null,
          lapsedDate: null,
          expiredDate: null,
          chargeVersions: []
        })
      })
    })

    describe('and the licence has charge version data with no end date', () => {
      beforeEach(async () => {
        chargeVersion = await ChargeVersionHelper.add({
          licenceId: licence.id,
          licenceRef: licence.licenceRef,
          startDate: new Date('2010-04-01')
        })

        chargeReference = await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id })

        chargeElement = await ChargeElementHelper.add({ chargeReferenceId: chargeReference.id })
      })

      it('returns the licence and charge version data from the past 6 years', async () => {
        const result = await FetchLicenceChargeVersionsService.go(licence.id)

        expect(result).to.equal({
          id: licence.id,
          licenceRef: licence.licenceRef,
          includeInPresrocBilling: 'no',
          includeInSrocBilling: false,
          revokedDate: null,
          lapsedDate: null,
          expiredDate: null,
          chargeVersions: [{
            id: chargeVersion.id,
            startDate: chargeVersion.startDate,
            endDate: null,
            chargeReferences: [{
              id: chargeReference.id,
              s127: 'false',
              chargeElements: [{
                id: chargeElement.id,
                section127Agreement: true
              }]
            }]
          }]
        })
      })
    })

    describe('and the licence has charge versions data that ended within the last 6 years', () => {
      beforeEach(async () => {
        chargeVersion = await ChargeVersionHelper.add({
          licenceId: licence.id,
          licenceRef: licence.licenceRef,
          startDate: new Date('2010-04-01'),
          endDate: new Date('2023-03-31')
        })

        chargeReference = await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id })

        chargeElement = await ChargeElementHelper.add({ chargeReferenceId: chargeReference.id })
      })

      it('returns the licence and charge version data from the past 6 years', async () => {
        const result = await FetchLicenceChargeVersionsService.go(licence.id)

        expect(result).to.equal({
          id: licence.id,
          licenceRef: licence.licenceRef,
          includeInPresrocBilling: 'no',
          includeInSrocBilling: false,
          revokedDate: null,
          lapsedDate: null,
          expiredDate: null,
          chargeVersions: [{
            id: chargeVersion.id,
            startDate: chargeVersion.startDate,
            endDate: chargeVersion.endDate,
            chargeReferences: [{
              id: chargeReference.id,
              s127: 'false',
              chargeElements: [{
                id: chargeElement.id,
                section127Agreement: true
              }]
            }]
          }]
        })
      })
    })
  })
})
