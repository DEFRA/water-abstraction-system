// Thing under test
import * as StaticLookups from '../../app/lib/static-lookups.lib.js'

describe('Static Lookups', () => {
  describe('#NoticeJourney', () => {
    it('should return the frozen object', () => {
      const result = StaticLookups.NoticeJourney

      expect(result).toEqual({
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
        }).toThrow("Cannot assign to read only property 'ALERTS' of object '#<Object>'")
      })
    })
  })

  describe('#NoticeType', () => {
    it('should return the frozen object', () => {
      const result = StaticLookups.NoticeType

      expect(result).toEqual({
        ABSTRACTION_ALERTS: 'abstractionAlerts',
        ALTERNATE_INVITATION: 'alternateInvitations',
        INVITATIONS: 'invitations',
        PAPER_RETURN: 'paperReturn',
        REMINDERS: 'reminders',
        RENEWAL_INVITATIONS: 'renewalInvitations'
      })
    })

    describe('when trying to mutate the object', () => {
      it('throws an error with the correct message', () => {
        const result = StaticLookups.NoticeType

        expect(() => {
          result.ABSTRACTION_ALERTS = 'broken'
        }).toThrow("Cannot assign to read only property 'ABSTRACTION_ALERTS' of object '#<Object>'")
      })
    })
  })

  describe('#Roles', () => {
    it('should return the frozen object', () => {
      const result = StaticLookups.roles

      expect(result).toEqual({
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

    describe('immutability check', () => {
      const result = StaticLookups.roles

      it('throws TypeError when mutating "abstraction-alerts"', () => {
        expect(() => {
          result['abstraction-alerts'].name = 'mutated'
        }).toThrow(TypeError)

        expect(Object.isFrozen(result['abstraction-alerts'])).toBe(true)
      })

      it('throws TypeError when mutating "additional-contact"', () => {
        expect(() => {
          result['additional-contact'].name = 'mutated'
        }).toThrow(TypeError)

        expect(Object.isFrozen(result['additional-contact'])).toBe(true)
      })

      it('throws TypeError when mutating "basic-user"', () => {
        expect(() => {
          result['basic-user'].name = 'mutated'
        }).toThrow(TypeError)

        expect(Object.isFrozen(result['basic-user'])).toBe(true)
      })

      it('throws TypeError when mutating "billing"', () => {
        expect(() => {
          result['billing'].name = 'mutated'
        }).toThrow(TypeError)

        expect(Object.isFrozen(result['billing'])).toBe(true)
      })

      it('throws TypeError when mutating "licence-holder"', () => {
        expect(() => {
          result['licence-holder'].name = 'mutated'
        }).toThrow(TypeError)
        expect(Object.isFrozen(result['licence-holder'])).toBe(true)
      })

      it('throws TypeError when mutating "primary-user"', () => {
        expect(() => {
          result['primary-user'].name = 'mutated'
        }).toThrow(TypeError)

        expect(Object.isFrozen(result['primary-user'])).toBe(true)
      })

      it('throws TypeError when mutating "returns-to"', () => {
        expect(() => {
          result['returns-to'].name = 'mutated'
        }).toThrow(TypeError)

        expect(Object.isFrozen(result['returns-to'])).toBe(true)
      })

      it('throws TypeError when mutating "returns-user"', () => {
        expect(() => {
          result['returns-user'].name = 'mutated'
        }).toThrow(TypeError)

        expect(Object.isFrozen(result['returns-user'])).toBe(true)
      })
    })

    describe('when trying to mutate the top-level object', () => {
      it('throws a TypeError when adding a new role', () => {
        const result = StaticLookups.roles

        expect(() => {
          result['new-role'] = { name: 'test' }
        }).toThrow(TypeError)
      })
    })
  })
})
