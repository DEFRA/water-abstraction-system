'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const StaticLookups = require('../../app/lib/static-lookups.lib.js')

describe('Static Lookups', () => {
  describe('#NoticeJourney', () => {
    it('should return the frozen object', () => {
      const result = StaticLookups.NoticeJourney

      expect(result).equal({
        ALERTS: 'alerts',
        STANDARD: 'standard'
      })
    })

    describe('when trying to mutate the object', () => {
      it('throws an error with the correct message', () => {
        const result = StaticLookups.NoticeJourney

        expect(() => {
          result.ALERTS = 'broken'
        }).to.throw(TypeError, "Cannot assign to read only property 'ALERTS' of object '#<Object>'")
      })
    })
  })

  describe('#NoticeType', () => {
    it('should return the frozen object', () => {
      const result = StaticLookups.NoticeType

      expect(result).equal({
        ABSTRACTION_ALERTS: 'abstractionAlerts',
        INVITATIONS: 'invitations',
        PAPER_RETURN: 'paperReturn',
        REMINDERS: 'reminders'
      })
    })

    describe('when trying to mutate the object', () => {
      it('throws an error with the correct message', () => {
        const result = StaticLookups.NoticeType

        expect(() => {
          result.ABSTRACTION_ALERTS = 'broken'
        }).to.throw(TypeError, "Cannot assign to read only property 'ABSTRACTION_ALERTS' of object '#<Object>'")
      })
    })
  })
})
