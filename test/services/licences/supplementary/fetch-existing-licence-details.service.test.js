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
  describe('when given a valid licenceId', () => {
    let licence

    describe('that has charge versions', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add()
      })

      describe('that are pre-sroc', () => {
        beforeEach(async () => {
          await ChargeVersionHelper.add({ licenceId: licence.id, startDate: new Date('2018-04-01') })
        })

        it('returns "pre_sroc_charge_versions" as true', async () => {
          const result = await FetchExistingLicenceDetailsService.go(licence.id)

          expect(result).to.equal({
            id: licence.id,
            expired_date: null,
            lapsed_date: null,
            revoked_date: null,
            flagged_for_presroc: false,
            flagged_for_sroc: false,
            pre_sroc_charge_versions: true,
            sroc_charge_versions: false,
            two_part_tariff_charge_versions: false
          })
        })
      })

      describe('that are sroc', () => {
        beforeEach(async () => {
          await ChargeVersionHelper.add({ licenceId: licence.id })
        })

        it('returns "sroc_charge_versions" as true', async () => {
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
            two_part_tariff_charge_versions: false
          })
        })
      })

      describe('that are sroc two-part tariff', () => {
        beforeEach(async () => {
          const chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id })
          const chargeReference = await ChargeReferenceHelper.add(
            { chargeVersionId: chargeVersion.id, adjustments: { s127: true } }
          )

          await ChargeElementHelper.add({ chargeReferenceId: chargeReference.id })
        })

        it('returns "two_part_tariff_charge_versions" as true', async () => {
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

    describe('that is flagged for sroc billing', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ includeInSrocBilling: true })
      })

      it('returns "flagged_for_sroc" as true', async () => {
        const result = await FetchExistingLicenceDetailsService.go(licence.id)

        expect(result.flagged_for_sroc).to.equal(true)
      })
    })

    describe('that is flagged for pre sroc billing', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ includeInPresrocBilling: 'yes' })
      })

      it('returns "flagged_for_presroc" as true', async () => {
        const result = await FetchExistingLicenceDetailsService.go(licence.id)

        expect(result.flagged_for_presroc).to.equal(true)
      })
    })

    describe('that already has an expired date', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ expiredDate: new Date('2024-04-01') })
      })

      it('returns the expired date', async () => {
        const result = await FetchExistingLicenceDetailsService.go(licence.id)

        expect(result.expired_date).to.equal(new Date('2024-04-01'))
      })
    })

    describe('that already has an lapsed date', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ lapsedDate: new Date('2024-06-01') })
      })

      it('returns the lapsed date', async () => {
        const result = await FetchExistingLicenceDetailsService.go(licence.id)

        expect(result.lapsed_date).to.equal(new Date('2024-06-01'))
      })
    })

    describe('that already has an revoked date', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add({ revokedDate: new Date('2024-08-01') })
      })

      it('returns the revoked date', async () => {
        const result = await FetchExistingLicenceDetailsService.go(licence.id)

        expect(result.revoked_date).to.equal(new Date('2024-08-01'))
      })
    })
  })
})
