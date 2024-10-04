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
const FetchChargeVersionsService = require('../../../../app/services/licences/supplementary/fetch-charge-versions.service.js')

describe('Fetch Charge Versions service', () => {
  let licence
  let licenceId

  beforeEach(async () => {
    licence = await LicenceHelper.add()
    licenceId = licence.id
  })

  describe('when the licence has charge versions data', () => {
    let chargeVersion

    beforeEach(async () => {
      chargeVersion = await ChargeVersionHelper.add({ licenceRef: licence.licenceRef, licenceId })
    })

    describe('that does not have any two-part tariff charge references or elements', () => {
      it('returns the licence data', async () => {
        const result = await FetchChargeVersionsService.go(licenceId)

        expect(result.licence[0]).to.equal({
          id: licenceId,
          expiredDate: null,
          lapsedDate: null,
          revokedDate: null,
          includeInSrocBilling: false,
          includeInPresrocBilling: 'no',
          preSroc: 0
        })
      })

      it('returns the charge versions data', async () => {
        const result = await FetchChargeVersionsService.go(licenceId)

        expect(result.chargeVersions).to.equal([
          {
            id: chargeVersion.id,
            startDate: chargeVersion.startDate,
            endDate: null,
            twoPartTariff: null
          }
        ])
      })
    })

    describe('when there are pre sroc charge versions', () => {
      beforeEach(async () => {
        // pre sroc charge version
        await ChargeVersionHelper.add({ licenceRef: licence.licenceRef, licenceId, startDate: new Date('2019-04-01') })
      })

      it('returns a count of them with the licence data', async () => {
        const result = await FetchChargeVersionsService.go(licenceId)

        expect(result.licence[0].preSroc).to.equal(1)
      })

      it('does not return the pre sroc charge version with the charge version data', async () => {
        const result = await FetchChargeVersionsService.go(licenceId)

        expect(result.chargeVersions).to.equal([
          {
            id: chargeVersion.id,
            startDate: chargeVersion.startDate,
            endDate: null,
            twoPartTariff: null
          }
        ])
      })
    })

    describe('when the charge versions have a two-part tariff charge reference and element', () => {
      let twoPartTariffChargeVersion
      let twoPartTariffChargeReference

      beforeEach(async () => {
        // sroc two-part tariff charge version, charge reference and charge element
        twoPartTariffChargeVersion = await ChargeVersionHelper.add({ licenceRef: licence.licenceRef, licenceId })

        twoPartTariffChargeReference = await ChargeReferenceHelper.add({
          chargeVersionId: twoPartTariffChargeVersion.id,
          adjustments: { s127: true }
        })

        await ChargeElementHelper.add({
          chargeReferenceId: twoPartTariffChargeReference.id,
          section127Agreement: true
        })
      })

      it('returns twoPartTariff as true on the charge version', async () => {
        const result = await FetchChargeVersionsService.go(licenceId)

        expect(result.chargeVersions).to.equal([
          {
            id: chargeVersion.id,
            startDate: chargeVersion.startDate,
            endDate: null,
            twoPartTariff: null
          },
          {
            id: twoPartTariffChargeVersion.id,
            startDate: twoPartTariffChargeVersion.startDate,
            endDate: null,
            twoPartTariff: true
          }
        ])
      })
    })
  })

  describe('when the licence has no charge version data', () => {
    it('does not return any', async () => {
      const result = await FetchChargeVersionsService.go(licenceId)

      expect(result.chargeVersions).to.equal([])
    })
  })
})
