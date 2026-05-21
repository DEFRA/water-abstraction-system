'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ProcessRenewalDates = require('../../../../../app/services/notices/setup/renewal-notice/process-renewal-dates.service.js')

describe('Notices - Setup - Renewal Notice - Process Renewal Dates service', () => {
  let clock

  beforeEach(() => {
    clock = Sinon.useFakeTimers(new Date('2026-04-15'))
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with no argument', () => {
    it('returns today as the expiry date', () => {
      const expectedExpiryDate = new Date('2026-04-15')

      const { expiryDate } = ProcessRenewalDates.go()

      expect(expiryDate).to.equal(expectedExpiryDate)
    })

    it('returns a renewal date 90 days before today', () => {
      const expectedRenewalDate = new Date('2026-01-15')

      const { renewalDate } = ProcessRenewalDates.go()

      expect(renewalDate).to.equal(expectedRenewalDate)
    })
  })

  describe('when called with a days argument', () => {
    describe('and today is "2026-04-15"', () => {
      it('returns an expiry date that many days in the future', () => {
        const expectedExpiryDate = new Date('2027-02-09')

        const { expiryDate } = ProcessRenewalDates.go('300')

        expect(expiryDate).to.equal(expectedExpiryDate)
      })

      it('returns a renewal date 90 days before the expiry date', () => {
        const expectedRenewalDate = new Date('2026-11-11')

        const { renewalDate } = ProcessRenewalDates.go('300')

        expect(renewalDate).to.equal(expectedRenewalDate)
      })
    })

    describe('and today is "2026-10-10"', () => {
      beforeEach(() => {
        clock.setSystemTime(new Date('2026-10-10'))
      })

      it('returns an expiry date that many days in the future', () => {
        const expectedExpiryDate = new Date('2027-08-06')

        const { expiryDate } = ProcessRenewalDates.go('300')

        expect(expiryDate).to.equal(expectedExpiryDate)
      })
    })
  })
})
