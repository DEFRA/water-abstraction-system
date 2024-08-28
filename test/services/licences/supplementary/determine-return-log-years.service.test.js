'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const LicenceHelper = require('../../../support/helpers/licence.helper.js')
const ReturnLogHelper = require('../../../support/helpers/return-log.helper.js')

// Thing under test
const DetermineReturnLogYearsService = require('../../../../app/services/licences/supplementary/determine-return-log-years.service.js')

describe('Determine Return Log Years Service', () => {
  describe('when given a valid returnLogId', () => {
    let returnLog
    let licence

    beforeEach(async () => {
      licence = await LicenceHelper.add()
      returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef })
    })

    it('always returns the licence, startDate and endDate', async () => {
      const result = await DetermineReturnLogYearsService.go(returnLog.id)

      expect(result.licence).to.equal({ id: licence.id, regionId: licence.regionId })
      expect(result.startDate).to.equal(returnLog.startDate)
      expect(result.endDate).to.equal(returnLog.endDate)
    })

    describe('that has a start date after the SROC billing start date', () => {
      beforeEach(async () => {
        returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef })
      })

      describe('and two-part tariff is false', () => {
        it('returns flagForBilling and twoPartTariff as false', async () => {
          const result = await DetermineReturnLogYearsService.go(returnLog.id)

          expect(result.flagForBilling).to.equal(false)
          expect(result.twoPartTariff).to.equal(false)
        })
      })

      describe('and two-part tariff is true', () => {
        beforeEach(async () => {
          returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef, metadata: { isTwoPartTariff: true } })
        })

        it('returns flagForBilling and twoPartTariff as true', async () => {
          const result = await DetermineReturnLogYearsService.go(returnLog.id)

          expect(result.flagForBilling).to.equal(true)
          expect(result.twoPartTariff).to.equal(true)
        })
      })
    })

    describe('that has a start date before the SROC billing start date', () => {
      beforeEach(async () => {
        returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef, startDate: new Date('2022-03-01') })
      })

      it('returns flagForBilling and twoPartTariff as false', async () => {
        const result = await DetermineReturnLogYearsService.go(returnLog.id)

        expect(result.flagForBilling).to.equal(false)
        expect(result.twoPartTariff).to.equal(false)
      })
    })
  })
})
