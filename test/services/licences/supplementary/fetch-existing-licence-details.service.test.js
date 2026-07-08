'use strict'

// Test helpers
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const FetchExistingLicenceDetailsService = require('../../../../app/services/licences/supplementary/fetch-existing-licence-details.service.js')

describe('Fetch Existing Licence Details Service', () => {
  describe('when passed a licence ID for a licence that exists', () => {
    let licence

    describe('and the licence has no charge versions', () => {
      beforeAll(async () => {
        licence = await LicenceHelper.add({
          revokedDate: new Date('2024-08-01'),
          lapsedDate: new Date('2024-06-01'),
          expiredDate: new Date('2024-04-01'),
          includeInSrocBilling: true,
          includeInPresrocBilling: 'yes'
        })
      })

      it('fetches the licence data', async () => {
        const result = await FetchExistingLicenceDetailsService(licence.id)

        expect(result.id).toEqual(licence.id)
        expect(result.region_id).toEqual(licence.regionId)
        expect(result.revoked_date).toEqual(new Date('2024-08-01'))
        expect(result.lapsed_date).toEqual(new Date('2024-06-01'))
        expect(result.expired_date).toEqual(new Date('2024-04-01'))
        expect(result.flagged_for_presroc).toEqual(true)
        expect(result.flagged_for_sroc).toEqual(true)
      })

      it('outlines which charge versions the licence does not have', async () => {
        const result = await FetchExistingLicenceDetailsService(licence.id)

        expect(result.pre_sroc_charge_versions).toEqual(false)
        expect(result.sroc_charge_versions).toEqual(false)
        expect(result.two_part_tariff_charge_versions).toEqual(false)
      })
    })

    describe('and the licence has charge versions', () => {
      beforeAll(async () => {
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
        const result = await FetchExistingLicenceDetailsService(licence.id)

        expect(result.id).toEqual(licence.id)
        expect(result.region_id).toEqual(licence.regionId)
        expect(result.revoked_date).toEqual(null)
        expect(result.lapsed_date).toEqual(null)
        expect(result.expired_date).toEqual(null)
        expect(result.flagged_for_presroc).toEqual(false)
        expect(result.flagged_for_sroc).toEqual(false)
      })

      it('outlines which charge versions the licence has', async () => {
        const result = await FetchExistingLicenceDetailsService(licence.id)

        expect(result.pre_sroc_charge_versions).toEqual(true)
        expect(result.sroc_charge_versions).toEqual(true)
        expect(result.two_part_tariff_charge_versions).toEqual(true)
      })
    })
  })
})
