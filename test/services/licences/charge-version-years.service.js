'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const ChargeVersionHelper = require('../../support/helpers/charge-version.helper.js')
const ChargeReferenceHelper = require('../../support/helpers/charge-reference.helper.js')
const LicenceHelper = require('../../support/helpers/licence.helper.js')

// Thing under test
const ChargeVersionYearsService = require('../../../app/services/licences/charge-version-years.service.js')

describe('Charge Version Years Service', () => {
  let chargeVersion
  let licence

  describe('when given a valid chargeVersionId', () => {
    describe('that has a related charge reference with two-part tariff indicators', () => {
      beforeEach(async () => {
        licence = await LicenceHelper.add()
      })

      describe('and the charge version has an "endDate" beginning before April', () => {
        beforeEach(async () => {
          chargeVersion = await ChargeVersionHelper.add({ endDate: '2023-03-31', licenceId: licence.id })

          await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id, adjustments: { s127: true } })
        })

        it('returns a list of financial year ends that the charge version covers', async () => {
          const result = await ChargeVersionYearsService.go(chargeVersion.id)

          expect(result.years).to.equal([2023])
        })

        it('returns details about the associated licence', async () => {
          const result = await ChargeVersionYearsService.go(chargeVersion.id)

          expect(result.licence.id).to.equal(licence.id)
          expect(result.licence.regionId).to.equal(licence.regionId)
        })
      })

      describe('and the charge version has an "endDate" beginning after April', () => {
        beforeEach(async () => {
          chargeVersion = await ChargeVersionHelper.add({ endDate: '2023-04-20', licenceId: licence.id })

          await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id, adjustments: { s127: true } })
        })

        it('returns a list of financial year ends that the charge version covers', async () => {
          const result = await ChargeVersionYearsService.go(chargeVersion.id)

          expect(result.years).to.equal([2023, 2024])
        })
      })

      describe('and the charge version has no "endDate"', () => {
        beforeEach(async () => {
          chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id })

          await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id, adjustments: { s127: true } })
        })

        it('returns a list of financial year ends that the charge version covers', async () => {
          const result = await ChargeVersionYearsService.go(chargeVersion.id)

          const financialYears = _financialYears()

          expect(result.years).to.equal(financialYears)
        })
      })

      describe('and the charge versions startDate is before April', () => {
        beforeEach(async () => {
          chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id, startDate: '2022-03-20', endDate: '2024-04-20' })

          await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id, adjustments: { s127: true } })
        })

        it('returns a list of financial year ends that the charge version covers', async () => {
          const result = await ChargeVersionYearsService.go(chargeVersion.id)

          // NOTE: This service will never flag a year before 2023 as this is the first financial year end for SROC
          // billing
          expect(result.years).to.equal([2023, 2024, 2025])
        })
      })

      describe('and the charge versions startDate is after April', () => {
        beforeEach(async () => {
          chargeVersion = await ChargeVersionHelper.add({ licenceId: licence.id, startDate: '2022-04-20', endDate: '2023-04-20' })

          await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id, adjustments: { s127: true } })
        })

        it('returns a list of financial year ends that the charge version covers', async () => {
          const result = await ChargeVersionYearsService.go(chargeVersion.id)

          expect(result.years).to.equal([2023, 2024])
        })
      })
    })

    describe('that has a related charge reference with no two-part tariff indicators', () => {
      beforeEach(async () => {
        chargeVersion = await ChargeVersionHelper.add()

        await ChargeReferenceHelper.add({ chargeVersionId: chargeVersion.id })
      })

      it('returns an empty array', async () => {
        const result = await ChargeVersionYearsService.go(chargeVersion.id)

        expect(result).to.equal([])
      })
    })
  })
})

function _financialYears () {
  let currentDate = new Date().getFullYear()

  if (new Date().getMonth() >= 3) {
    currentDate++
  }
  const years = []

  for (let year = 2023; year <= currentDate; year++) {
    years.push(year)
  }

  return years
}
