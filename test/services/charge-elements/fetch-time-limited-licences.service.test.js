'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeElementHelper = require('../../support/helpers/water/charge-element.helper.js')
const ChargeReferenceHelper = require('../../support/helpers/water/charge-reference.helper.js')
const ChargeVersionHelper = require('../../support/helpers/water/charge-version.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/water/licence.helper.js')
const LicenceVersionHelper = require('../../support/helpers/water/licence-version.helper.js')
const RegionHelper = require('../../support/helpers/water/region.helper.js')
const WorkflowHelper = require('../../support/helpers/water/workflow.helper.js')

// Thing under test
const FetchTimeLimitedLicencesService = require('../../../app/services/charge-elements/fetch-time-limited-licences.service.js')

describe('Fetch Time Limited Licences service', () => {
  let regionId

  beforeEach(async () => {
    await DatabaseHelper.clean()

    const region = await RegionHelper.add()
    regionId = region.regionId
  })

  describe('when there are licences with elements due to expire in < 50 days that should be added to workflow', () => {
    let licenceId
    let licenceVersionId

    beforeEach(async () => {
      const licence = await LicenceHelper.add({ regionId })
      licenceId = licence.licenceId

      const licenceVersion = await LicenceVersionHelper.add({ licenceId })
      licenceVersionId = licenceVersion.licenceVersionId

      // This creates a 'current' SROC charge version
      const { chargeVersionId } = await ChargeVersionHelper.add({ licenceId })

      const { chargeElementId } = await ChargeReferenceHelper.add({ chargeVersionId })

      // This creates a charge element that is due to expire in less than 50 days (49 days)
      await ChargeElementHelper.add({ chargeElementId, timeLimitedEndDate: _offSetCurrentDateByDays(49) })
    })

    it('returns the licenceId and licenceVersionId for the SROC licence with an expiring element', async () => {
      const result = await FetchTimeLimitedLicencesService.go()

      expect(result).to.have.length(1)
      expect(result[0].licenceId).to.equal(licenceId)
      expect(result[0].licenceVersionId).to.equal(licenceVersionId)
    })

    describe('including those linked to soft-deleted workflow records', () => {
      beforeEach(async () => {
        await WorkflowHelper.add({ licenceId, dateDeleted: new Date('2022-04-01') })
      })

      it('returns the licenceId and licenceVersionId for the SROC licence with an expiring element', async () => {
        const result = await FetchTimeLimitedLicencesService.go()

        expect(result).to.have.length(1)
        expect(result[0].licenceId).to.equal(licenceId)
        expect(result[0].licenceVersionId).to.equal(licenceVersionId)
      })
    })
  })

  describe('when there are no licences that should be added to workflow', () => {
    describe('because the licence is linked to a workflow record that has not been deleted', () => {
      beforeEach(async () => {
        const { licenceId } = await LicenceHelper.add({ regionId })

        await LicenceVersionHelper.add({ licenceId })

        // This creates a 'current' SROC charge version
        const { chargeVersionId } = await ChargeVersionHelper.add({ licenceId })

        const { chargeElementId } = await ChargeReferenceHelper.add({ chargeVersionId })

        // This creates a charge element that is due to expire in less than 50 days (49 days)
        await ChargeElementHelper.add({ chargeElementId, timeLimitedEndDate: _offSetCurrentDateByDays(49) })

        // This adds the licence to the workflow
        await WorkflowHelper.add({ licenceId })
      })

      it('returns an empty array', async () => {
        const result = await FetchTimeLimitedLicencesService.go()

        expect(result).to.have.length(0)
      })
    })

    describe('because the licence has expired', () => {
      beforeEach(async () => {
        // This creates a licence that has expired
        const { licenceId } = await LicenceHelper.add({ regionId, expiredDate: new Date('2023-03-30') })

        await LicenceVersionHelper.add({ licenceId })

        // This creates a 'current' SROC charge version
        const { chargeVersionId } = await ChargeVersionHelper.add({ licenceId })

        const { chargeElementId } = await ChargeReferenceHelper.add({ chargeVersionId })

        // This creates a charge element that is due to expire in less than 50 days (49 days)
        await ChargeElementHelper.add({ chargeElementId, timeLimitedEndDate: _offSetCurrentDateByDays(49) })
      })

      it('returns an empty array', async () => {
        const result = await FetchTimeLimitedLicencesService.go()

        expect(result).to.have.length(0)
      })
    })

    describe('because the licence has been revoked', () => {
      beforeEach(async () => {
        // This creates a licence that has been revoked
        const { licenceId } = await LicenceHelper.add({ regionId, revokedDate: new Date('2023-03-30') })

        await LicenceVersionHelper.add({ licenceId })

        // This creates a 'current' SROC charge version
        const { chargeVersionId } = await ChargeVersionHelper.add({ licenceId })

        const { chargeElementId } = await ChargeReferenceHelper.add({ chargeVersionId })

        // This creates a charge element that is due to expire in less than 50 days (49 days)
        await ChargeElementHelper.add({ chargeElementId, timeLimitedEndDate: _offSetCurrentDateByDays(49) })
      })

      it('returns an empty array', async () => {
        const result = await FetchTimeLimitedLicencesService.go()

        expect(result).to.have.length(0)
      })
    })

    describe('because the licence has lapsed', () => {
      beforeEach(async () => {
        // This creates a licence that has lapsed
        const { licenceId } = await LicenceHelper.add({ regionId, lapsedDate: new Date('2023-03-30') })

        await LicenceVersionHelper.add({ licenceId })

        // This creates a 'current' SROC charge version
        const { chargeVersionId } = await ChargeVersionHelper.add({ licenceId })

        const { chargeElementId } = await ChargeReferenceHelper.add({ chargeVersionId })

        // This creates a charge element that is due to expire in less than 50 days (49 days)
        await ChargeElementHelper.add({ chargeElementId, timeLimitedEndDate: _offSetCurrentDateByDays(49) })
      })

      it('returns an empty array', async () => {
        const result = await FetchTimeLimitedLicencesService.go()

        expect(result).to.have.length(0)
      })
    })

    describe('because the charge version is not the latest', () => {
      beforeEach(async () => {
        const { licenceId } = await LicenceHelper.add({ regionId })

        await LicenceVersionHelper.add({ licenceId })

        // This creates a SROC charge version that is not the latest
        const { chargeVersionId } = await ChargeVersionHelper.add({ licenceId, endDate: new Date('2023-03-30') })

        const { chargeElementId } = await ChargeReferenceHelper.add({ chargeVersionId })

        // This creates a charge element that is due to expire in less than 50 days (49 days)
        await ChargeElementHelper.add({ chargeElementId, timeLimitedEndDate: _offSetCurrentDateByDays(49) })
      })

      it('returns an empty array', async () => {
        const result = await FetchTimeLimitedLicencesService.go()

        expect(result).to.have.length(0)
      })
    })

    describe('because the charge version scheme is alcs', () => {
      beforeEach(async () => {
        const { licenceId } = await LicenceHelper.add({ regionId })

        await LicenceVersionHelper.add({ licenceId })

        // This creates a 'current' ALCS charge version
        const { chargeVersionId } = await ChargeVersionHelper.add({ licenceId, scheme: 'alcs' })

        const { chargeElementId } = await ChargeReferenceHelper.add({ chargeVersionId })

        // This creates a charge element that is due to expire in less than 50 days (49 days)
        await ChargeElementHelper.add({ chargeElementId, timeLimitedEndDate: _offSetCurrentDateByDays(49) })
      })

      it('returns an empty array', async () => {
        const result = await FetchTimeLimitedLicencesService.go()

        expect(result).to.have.length(0)
      })
    })

    describe('because the charge element does not expire', () => {
      beforeEach(async () => {
        const { licenceId } = await LicenceHelper.add({ regionId })

        await LicenceVersionHelper.add({ licenceId })

        // This creates a 'current' SROC charge version
        const { chargeVersionId } = await ChargeVersionHelper.add({ licenceId })

        const { chargeElementId } = await ChargeReferenceHelper.add({ chargeVersionId })

        // This creates a charge element that is not due to expire
        await ChargeElementHelper.add({ chargeElementId })
      })

      it('returns an empty array', async () => {
        const result = await FetchTimeLimitedLicencesService.go()

        expect(result).to.have.length(0)
      })
    })

    describe('because the charge element expires in 50 days or more', () => {
      beforeEach(async () => {
        const { licenceId } = await LicenceHelper.add({ regionId })

        await LicenceVersionHelper.add({ licenceId })

        // This creates a 'current' SROC charge version
        const { chargeVersionId } = await ChargeVersionHelper.add({ licenceId })

        const { chargeElementId } = await ChargeReferenceHelper.add({ chargeVersionId })

        // This creates a charge element that is due to expire in exactly 50 days
        await ChargeElementHelper.add({ chargeElementId, timeLimitedEndDate: _offSetCurrentDateByDays(50) })
      })

      it('returns an empty array', async () => {
        const result = await FetchTimeLimitedLicencesService.go()

        expect(result).to.have.length(0)
      })
    })
  })
})

function _offSetCurrentDateByDays (days) {
  const date = new Date()

  date.setDate(date.getDate() + days)

  return date
}
