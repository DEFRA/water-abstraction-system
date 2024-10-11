'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeElementHelper = require('../../../support/helpers/charge-element.helper.js')
const ChargeReferenceHelper = require('../../../support/helpers/charge-reference.helper.js')
const ChargeVersionHelper = require('../../../support/helpers/charge-version.helper.js')
const LicenceHelper = require('../../../support/helpers/licence.helper.js')

// Thing under test
const FetchExistingLicenceDetailsService = require('../../../../app/services/licences/supplementary/fetch-existing-licence-details.service.js')

describe('Fetch Existing Licence Details Service', () => {
  describe('when given a licence ID for a licence that exists', () => {
    let licence

    describe('and that has pre sroc charge versions', () => {
      describe('and the licence already has end dates', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add({
            revokedDate: new Date('2024-08-01'),
            lapsedDate: new Date('2024-06-01'),
            expiredDate: new Date('2024-04-01')
          })

          await ChargeVersionHelper.add({ licenceId: licence.id, startDate: new Date('2018-04-01') })
        })

        it('returns the licence correctly', async () => {
          const result = await FetchExistingLicenceDetailsService.go(licence.id)

          expect(result).to.equal({
            id: licence.id,
            expired_date: new Date('2024-04-01'),
            lapsed_date: new Date('2024-06-01'),
            revoked_date: new Date('2024-08-01'),
            flagged_for_presroc: false,
            flagged_for_sroc: false,
            pre_sroc_charge_versions: true,
            sroc_charge_versions: false,
            two_part_tariff_charge_versions: false
          })
        })
      })
    })

    describe('and that has sroc charge versions', () => {
      describe('and the licence is already flagged for pre sroc billing', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add({
            includeInSrocBilling: true,
            includeInPresrocBilling: 'yes'
          })

          await ChargeVersionHelper.add({ licenceId: licence.id })
        })

        it('returns the licence correctly', async () => {
          const result = await FetchExistingLicenceDetailsService.go(licence.id)

          expect(result).to.equal({
            id: licence.id,
            expired_date: null,
            lapsed_date: null,
            revoked_date: null,
            flagged_for_presroc: true,
            flagged_for_sroc: true,
            pre_sroc_charge_versions: false,
            sroc_charge_versions: true,
            two_part_tariff_charge_versions: false
          })
        })
      })
    })

    describe('and that has sroc charge versions with two-part tariff indicators', () => {
      describe('and the licence is already flagged for sroc billing', () => {
        beforeEach(async () => {
          licence = await LicenceHelper.add()
          const chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id })
          const chargeReference = await ChargeReferenceHelper.add(
            { chargeVersionId: chargeVersion.id, adjustments: { s127: true } }
          )

          await ChargeElementHelper.add({ chargeReferenceId: chargeReference.id })
        })

        it('returns the licence correctly', async () => {
          const result = await FetchExistingLicenceDetailsService.go(licence.id)

          expect(result).to.equal({
            id: licence.id,
            expired_date: null,
            lapsed_date: null,
            revoked_date: null,
            flagged_for_presroc: false,
            flagged_for_sroc: false,
            pre_sroc_charge_versions: false,
            sroc_charge_versions: true,
            two_part_tariff_charge_versions: true
          })
        })
      })
    })
  })
})
