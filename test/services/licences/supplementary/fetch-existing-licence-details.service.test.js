'use strict'

// Test framework dependencies
const { describe, it, before, after } = require('node:test')
const { expect } = require('@hapi/code')

// Test helpers
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const { closeConnection } = require('../../../support/database.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const FetchExistingLicenceDetailsService = require('../../../../app/services/licences/supplementary/fetch-existing-licence-details.service.js')

describe('Fetch Existing Licence Details Service', () => {
  after(async () => {
    await closeConnection()
  })

  describe('when passed a licence ID for a licence that exists', () => {
    let licence

    describe('and the licence has no charge versions', () => {
      before(async () => {
        licence = await LicenceHelper.add({
          revokedDate: new Date('2024-08-01'),
          lapsedDate: new Date('2024-06-01'),
          expiredDate: new Date('2024-04-01'),
          includeInSrocBilling: true,
          includeInPresrocBilling: 'yes'
        })
      })

      it('fetches the licence data', async () => {
        const result = await FetchExistingLicenceDetailsService.go(licence.id)

        expect(result.id).to.equal(licence.id)
        expect(result.region_id).to.equal(licence.regionId)
        expect(result.revoked_date).to.equal(new Date('2024-08-01'))
        expect(result.lapsed_date).to.equal(new Date('2024-06-01'))
        expect(result.expired_date).to.equal(new Date('2024-04-01'))
        expect(result.flagged_for_presroc).to.equal(true)
        expect(result.flagged_for_sroc).to.equal(true)
      })

      it('outlines which charge versions the licence does not have', async () => {
        const result = await FetchExistingLicenceDetailsService.go(licence.id)

        expect(result.pre_sroc_charge_versions).to.equal(false)
        expect(result.sroc_charge_versions).to.equal(false)
        expect(result.two_part_tariff_charge_versions).to.equal(false)
      })
    })

    describe('and the licence has charge versions', () => {
      before(async () => {
        licence = await LicenceHelper.add()
        // pre sroc charge versions
        await ChargeVersionHelper.add({ licenceId: licence.id, startDate: new Date('2018-04-01') })

        // sroc charge version
        const chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id })

        // two-part tariff indicators
        const chargeReference = await ChargeReferenceHelper.add({
          chargeVersionId: chargeVersion.id,
          adjustments: { s127: true }
        })

        await ChargeElementHelper.add({ chargeReferenceId: chargeReference.id })
      })

      it('fetches the licence data', async () => {
        const result = await FetchExistingLicenceDetailsService.go(licence.id)

        expect(result.id).to.equal(licence.id)
        expect(result.region_id).to.equal(licence.regionId)
        expect(result.revoked_date).to.equal(null)
        expect(result.lapsed_date).to.equal(null)
        expect(result.expired_date).to.equal(null)
        expect(result.flagged_for_presroc).to.equal(false)
        expect(result.flagged_for_sroc).to.equal(false)
      })

      it('outlines which charge versions the licence has', async () => {
        const result = await FetchExistingLicenceDetailsService.go(licence.id)

        expect(result.pre_sroc_charge_versions).to.equal(true)
        expect(result.sroc_charge_versions).to.equal(true)
        expect(result.two_part_tariff_charge_versions).to.equal(true)
      })
    })
  })
})
