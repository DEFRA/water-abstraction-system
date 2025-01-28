'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const CRMContactPresenter = require('../../app/presenters/crm-contact.presenter.js')

describe('CRM contact presenter', () => {
  let contacts

  beforeEach(() => {
    contacts = _contacts()
  })

  describe('when provided with valid contacts', () => {
    it('correctly presents the data', () => {
      const result = CRMContactPresenter.go(contacts)

      expect(result).to.equal([
        {
          address: ['ENVIRONMENT AGENCY', 'HORIZON HOUSE', 'DEANERY ROAD', 'BRISTOL', 'BS1 5AH', 'United Kingdom'],
          role: 'Licence holder',
          name: 'Acme ltd'
        },
        {
          address: ['Furland', 'Crewkerne', 'Somerset', 'TA18 7TT', 'United Kingdom'],
          role: 'Licence contact',
          name: 'Furland Farm'
        },
        {
          address: ['Crinkley Bottom', 'Cricket St Thomas', 'Somerset', 'TA20 1KL', 'United Kingdom'],
          role: 'Returns to',
          name: 'Mr N Edmonds'
        }
      ])
    })

    describe('the "name" property', () => {
      describe('and the "role" is "person"', () => {
        describe('when the initials are null', () => {
          beforeEach(() => {
            contacts[2].initials = null
          })

          it("returns the contact's forename and name", () => {
            const result = CRMContactPresenter.go(contacts)

            expect(result[2].name).to.equal('Mr Noel Edmonds')
          })
        })

        describe('when the initials are not null', () => {
          it("returns the contact's initials and name", () => {
            const result = CRMContactPresenter.go(contacts)

            expect(result[2].name).to.equal('Mr N Edmonds')
          })
        })
      })

      describe('and the "role" is NOT a "person"', () => {
        it("returns the contact's forename and name", () => {
          const result = CRMContactPresenter.go(contacts)

          expect(result[0].name).to.equal('Acme ltd')
        })
      })
    })
  })

  describe('when provided with invalid contacts', () => {
    describe('when a "role" is not a valid role', () => {
      beforeEach(() => {
        contacts = [
          {
            ...contacts[0],
            role: 'Enforcement office'
          }
        ]
      })

      it('does not return the contact', () => {
        const result = CRMContactPresenter.go(contacts)

        expect(result).to.equal([])
      })
    })
  })
})

function _contacts() {
  return [
    {
      name: 'Acme ltd',
      role: 'Licence holder',
      town: 'BRISTOL',
      type: 'Organisation',
      county: null,
      country: 'United Kingdom',
      forename: null,
      initials: null,
      postcode: 'BS1 5AH',
      salutation: null,
      addressLine1: 'ENVIRONMENT AGENCY',
      addressLine2: 'HORIZON HOUSE',
      addressLine3: 'DEANERY ROAD',
      addressLine4: null
    },
    {
      name: 'Furland Farm',
      role: 'Licence contact',
      town: 'Somerset',
      type: 'Organisation',
      county: null,
      country: 'United Kingdom',
      forename: null,
      initials: null,
      postcode: 'TA18 7TT',
      salutation: null,
      addressLine1: 'Furland',
      addressLine2: 'Crewkerne',
      addressLine3: null,
      addressLine4: null
    },
    {
      name: 'Edmonds',
      role: 'Returns to',
      town: 'Somerset',
      type: 'Person',
      county: null,
      country: 'United Kingdom',
      forename: 'Noel',
      initials: 'N',
      postcode: 'TA20 1KL',
      salutation: 'Mr',
      addressLine1: 'Crinkley Bottom',
      addressLine2: 'Cricket St Thomas',
      addressLine3: null,
      addressLine4: null
    }
  ]
}
