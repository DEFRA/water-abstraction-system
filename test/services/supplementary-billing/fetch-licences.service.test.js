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
const FetchLicencesService = require('../../../app/services/supplementary-billing/fetch-licences.service.js')

describe('Fetch Licences service', () => {
  const region = { regionId: LicenceHelper.defaults().regionId }
  let testLicence

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there are licences for the matching region', () => {
    describe('that are flagged to be included in supplementary billing', () => {
      beforeEach(async () => {
        testLicence = await LicenceHelper.add({ includeInSupplementaryBilling: 'yes' })
      })

      describe('and that have an SROC charge version', () => {
        beforeEach(async () => {
          await ChargeVersionHelper.add({}, testLicence)
        })

        it('returns results', async () => {
          const result = await FetchLicencesService.go(region)

          expect(result.length).to.equal(1)
          expect(result[0].licenceId).to.equal(testLicence.licenceId)
        })
      })

      describe('and that have multiple SROC charge versions', () => {
        beforeEach(async () => {
          await ChargeVersionHelper.add({}, testLicence)
          await ChargeVersionHelper.add({}, testLicence)
        })

        it('returns a licence only once in the results', async () => {
          const result = await FetchLicencesService.go(region)

          expect(result.length).to.equal(1)
          expect(result[0].licenceId).to.equal(testLicence.licenceId)
        })
      })

      describe('but do not have an SROC charge version', () => {
        it('returns no results', async () => {
          const result = await FetchLicencesService.go(region)

          expect(result.length).to.equal(0)
        })
      })
    })

    describe('that are not flagged to be included in supplementary billing', () => {
      beforeEach(async () => {
        await LicenceHelper.add()
      })

      it('returns no results', async () => {
        const result = await FetchLicencesService.go(region)

        expect(result.length).to.equal(0)
      })
    })
  })

  describe('when there are no licences for the matching region', () => {
    beforeEach(async () => {
      await LicenceHelper.add({ regionId: '000446bd-182a-4340-be6b-d719855ace1a' })
    })

    it('returns no results', async () => {
      const result = await FetchLicencesService.go(region)

      expect(result.length).to.equal(0)
    })
  })
})
