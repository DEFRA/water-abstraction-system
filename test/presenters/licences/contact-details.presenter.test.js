'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Thing under test
const ContactDetailsPresenter = require('../../../app/presenters/licences/contact-details.presenter.js')

describe('Licences - Contact Details presenter', () => {
  let licenceContactDetailsData
  let licenceId
  let licenceRef

  beforeEach(() => {
    licenceId = generateUUID()
    licenceRef = generateLicenceRef()

    licenceContactDetailsData = _testFetchLicenceContactDetailsData(licenceId, licenceRef)
  })

  describe('when provided with populated licence contact details data', () => {
    it('correctly presents the data', () => {
      const result = ContactDetailsPresenter.go(licenceContactDetailsData)

      expect(result).to.equal({
        backLink: {
          href: `/system/licences/${licenceId}/summary`,
          text: 'Go back to summary'
        },
        licenceContactDetails: [
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
          },
          {
            email: 'primary.user@important.com',
            role: 'Primary user'
          },
          {
            email: 'returns.agent@important.com',
            role: 'Returns agent'
          }
        ],
        pageTitle: 'Licence contact details',
        pageTitleCaption: `Licence ${licenceRef}`
      })
    })

    describe('the "licenceContactDetails" property', () => {
      describe('when the licence contact is a "contact"', () => {
        describe('the "licenceContactDetails.address" property', () => {
          it('returns the address of the property', () => {
            const result = ContactDetailsPresenter.go(licenceContactDetailsData)

            expect(result.licenceContactDetails[0].address).to.equal([
              'ENVIRONMENT AGENCY',
              'HORIZON HOUSE',
              'DEANERY ROAD',
              'BRISTOL',
              'BS1 5AH',
              'United Kingdom'
            ])
          })
        })

        describe('the "licenceContactDetails.role" property', () => {
          describe('when one of the licence contact details has the role type of "Enforcement officer"', () => {
            it('returns licenceContactDetails without the contact with the role type of "Enforcement officer"', () => {
              const result = ContactDetailsPresenter.go(licenceContactDetailsData)

              const hasEnforcementOfficer = result.licenceContactDetails.some((contact) => {
                return contact.role === 'Enforcement officer'
              })

              expect(hasEnforcementOfficer).to.be.false()
            })
          })
        })

        describe('the "licenceContacts.name" property', () => {
          describe('when the initials are null', () => {
            beforeEach(() => {
              licenceContactDetailsData.licenceDocumentHeader.metadata.contacts[3].initials = null
            })

            it("returns the licence contact's forename and name", () => {
              const result = ContactDetailsPresenter.go(licenceContactDetailsData)

              expect(result.licenceContactDetails[2].name).to.equal('Mr Noel Edmonds')
            })
          })

          describe('when the initials are not null', () => {
            it("returns the licence contact's forename and name", () => {
              const result = ContactDetailsPresenter.go(licenceContactDetailsData)

              expect(result.licenceContactDetails[2].name).to.equal('Mr N Edmonds')
            })
          })
        })
      })

      describe('when the licence contact is a "licenceEntityRole"', () => {
        describe('the "licenceContactDetails" property', () => {
          describe('and the role is "primary_user"', () => {
            it('returns the email and formatted role', () => {
              const result = ContactDetailsPresenter.go(licenceContactDetailsData)

              expect(result.licenceContactDetails[3]).to.equal({
                email: 'primary.user@important.com',
                role: 'Primary user'
              })
            })
          })

          describe('and the role is "user_returns"', () => {
            it('returns the email and formatted role', () => {
              const result = ContactDetailsPresenter.go(licenceContactDetailsData)

              expect(result.licenceContactDetails[4]).to.equal({
                email: 'returns.agent@important.com',
                role: 'Returns agent'
              })
            })
          })
        })
      })
    })
  })
})

function _testFetchLicenceContactDetailsData(licenceId, licenceRef) {
  return {
    id: licenceId,
    licenceRef,
    licenceDocumentHeader: {
      id: generateUUID(),
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
      },
      licenceEntityRoles: [
        {
          role: 'primary_user',
          licenceEntity: {
            name: 'primary.user@important.com'
          }
        },
        {
          role: 'user_returns',
          licenceEntity: {
            name: 'returns.agent@important.com'
          }
        }
      ]
    }
  }
}
