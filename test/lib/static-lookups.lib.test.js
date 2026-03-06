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
        ADHOC: 'adhoc',
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
        ALTERNATE_INVITATION: 'alternateInvitations',
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

  describe('#Roles', () => {
    it('should return the frozen object', () => {
      const result = StaticLookups.roles

      expect(result).equal({
        'abstraction-alerts': { name: 'abstractionAlerts', label: 'Abstraction alerts' },
        'additional-contact': { name: 'additionalContact', label: 'Additional contact' },
        'basic-user': { name: 'basicUser', label: 'Basic user' },
        billing: { name: 'billing', label: 'Billing' },
        'licence-holder': { name: 'licenceHolder', label: 'Licence holder' },
        'primary-user': { name: 'primaryUser', label: 'Primary user' },
        'returns-to': { name: 'returnsTo', label: 'Returns to' },
        'returns-user': { name: 'returnsUser', label: 'Returns user' }
      })
    })

    describe('#Roles Manual Immutability Check', () => {
      const result = StaticLookups.roles

      it('throws TypeError when mutating "abstraction-alerts"', () => {
        expect(() => {
          result['abstraction-alerts'].name = 'mutated'
        }).to.throw(TypeError)

        expect(Object.isFrozen(result['abstraction-alerts'])).to.be.true()
      })

      it('throws TypeError when mutating "additional-contact"', () => {
        expect(() => {
          result['additional-contact'].name = 'mutated'
        }).to.throw(TypeError)

        expect(Object.isFrozen(result['additional-contact'])).to.be.true()
      })

      it('throws TypeError when mutating "basic-user"', () => {
        expect(() => {
          result['basic-user'].name = 'mutated'
        }).to.throw(TypeError)

        expect(Object.isFrozen(result['basic-user'])).to.be.true()
      })

      it('throws TypeError when mutating "billing"', () => {
        expect(() => {
          result['billing'].name = 'mutated'
        }).to.throw(TypeError)

        expect(Object.isFrozen(result['billing'])).to.be.true()
      })

      it('throws TypeError when mutating "licence-holder"', () => {
        expect(() => {
          result['licence-holder'].name = 'mutated'
        }).to.throw(TypeError)
        expect(Object.isFrozen(result['licence-holder'])).to.be.true()
      })

      it('throws TypeError when mutating "primary-user"', () => {
        expect(() => {
          result['primary-user'].name = 'mutated'
        }).to.throw(TypeError)

        expect(Object.isFrozen(result['primary-user'])).to.be.true()
      })

      it('throws TypeError when mutating "returns-to"', () => {
        expect(() => {
          result['returns-to'].name = 'mutated'
        }).to.throw(TypeError)

        expect(Object.isFrozen(result['returns-to'])).to.be.true()
      })

      it('throws TypeError when mutating "returns-user"', () => {
        expect(() => {
          result['returns-user'].name = 'mutated'
        }).to.throw(TypeError)

        expect(Object.isFrozen(result['returns-user'])).to.be.true()
      })
    })

    describe('when trying to mutate the top-level object', () => {
      it('throws a TypeError when adding a new role', () => {
        const result = StaticLookups.roles

        expect(() => {
          result['new-role'] = { name: 'test' }
        }).to.throw(TypeError)
      })
    })
  })
})
