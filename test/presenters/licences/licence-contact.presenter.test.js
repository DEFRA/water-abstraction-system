'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Thing under test
const LicenceContactPresenter = require('../../../app/presenters/licences/licence-contact.presenter.js')

describe.only('Licence Contacts presenter', () => {
  let licenceContacts

  beforeEach(() => {
    licenceContacts = {
      id: '0a4ebb93-2e90-4e35-acd5-a5aa73466508',
      licenceRef: '00/111/222',
      licenceDocumentHeader: {
        id: '0a4ebb93-12345-4e35-acd5-987654321abc',
        metadata: {
          contacts: [
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
              name: 'Acme ltd',
              role: 'Enforcement officer',
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
          ],
          IsCurrent: false
        }
      }
    }
  })

  describe('when provided with populated licence contacts data', () => {
    it('correctly presents the data', () => {
      const result = LicenceContactPresenter.go(licenceContacts)

      expect(result).to.equal({
        licenceId: '0a4ebb93-2e90-4e35-acd5-a5aa73466508',
        licenceRef: '00/111/222',
        licenceContacts: [
          {
            address: { contactAddress: ['ENVIRONMENT AGENCY', 'HORIZON HOUSE', 'DEANERY ROAD', 'BRISTOL', 'BS1 5AH', 'United Kingdom'] },
            role: 'Licence holder',
            name: 'Acme ltd'
          },
          {
            address: { contactAddress: ['Furland', 'Crewkerne', 'Somerset', 'TA18 7TT', 'United Kingdom'] },
            role: 'Licence contact',
            name: 'Furland Farm'
          },
          {
            address: { contactAddress: ['Crinkley Bottom', 'Cricket St Thomas', 'Somerset', 'TA20 1KL', 'United Kingdom'] },
            role: 'Returns to',
            name: 'Mr N Edmonds'
          }]
      })
    })

    describe('the "licenceContacts" property', () => {
      describe('when one of the licence contacts has the role type of "Enforcement officer"', () => {
        it('returns not equal to Enforcement officer', () => {
          const result = LicenceContactPresenter.go(licenceContacts)

          expect(result.licenceContacts[1].role).to.not.equal('Enforcement officer')
        })
      })

      describe('when all the licence contacts has the role type of "Enforcement officer"', () => {
        beforeEach(() => {
          licenceContacts.licenceDocumentHeader.metadata.contacts[0].role = 'Enforcement officer'
          licenceContacts.licenceDocumentHeader.metadata.contacts[2].role = 'Enforcement officer'
          licenceContacts.licenceDocumentHeader.metadata.contacts[3].role = 'Enforcement officer'
        })

        it('returns empty array', () => {
          const result = LicenceContactPresenter.go(licenceContacts)

          expect(result.licenceContacts).to.equal([])
        })
      })

      describe('when the initials are null', () => {
        beforeEach(() => {
          licenceContacts.licenceDocumentHeader.metadata.contacts[3].initials = null
        })

        it("returns the licence contact's forename and name", () => {
          const result = LicenceContactPresenter.go(licenceContacts)

          expect(result.licenceContacts[2].name).to.equal('Mr Noel Edmonds')
        })
      })
    })
  })
})