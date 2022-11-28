'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeVersionHelper = require('../../support/helpers/charge-version.helper.js')
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')

// Thing under test
const FetchChargeVersionsService = require('../../../app/services/supplementary-billing/fetch-charge-versions.service.js')

describe('Fetch Charge Versions service', () => {
  const { region_id: regionId } = LicenceHelper.defaults()
  let testRecords

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there are licences to be included in supplementary billing', () => {
    beforeEach(async () => {
      // This creates an SROC charge version linked to a licence marked for supplementary billing
      const srocChargeVersion = await ChargeVersionHelper.add(
        {},
        { include_in_supplementary_billing: 'yes' }
      )

      // This creates an ALCS (presroc) charge version linked to a licence marked for supplementary billing
      const alcsChargeVersion = await ChargeVersionHelper.add(
        { scheme: 'alcs' },
        { include_in_supplementary_billing: 'yes' }
      )

      testRecords = [srocChargeVersion, alcsChargeVersion]
    })

    it('returns only the current SROC charge versions that are applicable', async () => {
      const result = await FetchChargeVersionsService.go(regionId)

      expect(result.length).to.equal(1)
      expect(result[0].charge_version_id).to.equal(testRecords[0].charge_version_id)
    })
  })

  describe('when there are no licences to be included in supplementary billing', () => {
    describe("because none of them are marked 'include_in_supplementary_billing'", () => {
      beforeEach(async () => {
        // This creates an SROC charge version linked to a licence. But the licence won't be marked for supplementary
        // billing
        const srocChargeVersion = await ChargeVersionHelper.add()
        testRecords = [srocChargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId)

        expect(result.length).to.equal(0)
      })
    })

    describe("because all the applicable charge versions are 'alcs' (presroc)", () => {
      beforeEach(async () => {
        // This creates an ALCS (presroc) charge version linked to a licence marked for supplementary billing
        const alcsChargeVersion = await ChargeVersionHelper.add(
          { scheme: 'alcs' },
          { include_in_supplementary_billing: 'yes' }
        )
        testRecords = [alcsChargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId)

        expect(result.length).to.equal(0)
      })
    })

    describe('because there are no current charge versions (they all have end dates)', () => {
      beforeEach(async () => {
        // This creates an SROC charge version with an end date linked to a licence marked for supplementary billing
        const alcsChargeVersion = await ChargeVersionHelper.add(
          { end_date: new Date(2022, 2, 1) }, // 2022-03-01 - Months are zero indexed :-)
          { include_in_supplementary_billing: 'yes' }
        )
        testRecords = [alcsChargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId)

        expect(result.length).to.equal(0)
      })
    })

    describe('because there are no licences linked to the selected region', () => {
      beforeEach(async () => {
        // This creates an SROC charge version linked to a licence with an different region than selected
        const otherRegionChargeVersion = await ChargeVersionHelper.add(
          {},
          {
            include_in_supplementary_billing: 'yes',
            region_id: 'e117b501-e3c1-4337-ad35-21c60ed9ad73'
          }
        )
        testRecords = [otherRegionChargeVersion]
      })

      it('returns no applicable charge versions', async () => {
        const result = await FetchChargeVersionsService.go(regionId)

        expect(result.length).to.equal(0)
      })
    })
  })
})
