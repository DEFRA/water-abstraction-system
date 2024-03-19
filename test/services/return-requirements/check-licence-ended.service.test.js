'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const CheckLicenceEndedService = require('../../../app/services/return-requirements/check-licence-ended.service.js')

describe('Check Licence Ended Service', () => {
  describe('when the licence has not ended', () => {
    it('returns false', async () => {
      // tomorrow
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)

      const licenceData = {
        ends: {
          date: futureDate.toISOString()
        }
      }

      const result = await CheckLicenceEndedService.checkLicenceEnded(licenceData)
      expect(result).to.be.false()
    })
  })

  describe('when the licence has ended', () => {
    it('returns true', async () => {
      // a date in the past
      const pastDate = new Date('2024-02-14')

      const licenceData = {
        ends: {
          date: pastDate.toISOString()
        }
      }

      const result = await CheckLicenceEndedService.checkLicenceEnded(licenceData)
      expect(result).to.be.true()
    })
  })

  describe('when the licence ends data is not available', () => {
    it('returns false', async () => {
      const licenceData = {}

      const result = await CheckLicenceEndedService.checkLicenceEnded(licenceData)
      expect(result).to.be.false()
    })
  })
})
