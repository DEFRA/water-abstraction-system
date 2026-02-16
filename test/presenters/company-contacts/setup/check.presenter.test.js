'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const CheckPresenter = require('../../../../app/presenters/company-contacts/setup/check.presenter.js')

describe('Company Contacts - Setup - Check Presenter', () => {
  let company
  let companyContact
  let companyContacts
  let email
  let name
  let session

  beforeEach(() => {
    company = CustomersFixtures.company()
    companyContact = CustomersFixtures.companyContact()

    companyContact.contact.contactType = 'department'

    companyContacts = [companyContact]

    name = companyContact.contact.department
    email = companyContact.contact.email

    session = { id: generateUUID(), company, abstractionAlerts: 'yes', name, email }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckPresenter.go(session, companyContacts)

      expect(result).to.equal({
        abstractionAlerts: 'Yes',
        email,
        links: {
          abstractionAlerts: `/system/company-contacts/setup/${session.id}/abstraction-alerts`,
          cancel: `/system/company-contacts/setup/${session.id}/cancel`,
          email: `/system/company-contacts/setup/${session.id}/contact-email`,
          name: `/system/company-contacts/setup/${session.id}/contact-name`
        },
        name,
        pageTitle: 'Check contact',
        pageTitleCaption: 'Tyrell Corporation',
        warning: {
          iconFallbackText: 'Warning',
          text: 'A contact with this name and email already exist. Change the name or email, or cancel.'
        }
      })
    })

    describe('the "warning" property', () => {
      describe('when creating a new company contact', () => {
        describe('and a contact with a matching name and email exists', () => {
          describe('in the same case', () => {
            it('returns a warning', () => {
              const result = CheckPresenter.go(session, companyContacts)

              expect(result.warning).to.equal({
                text: 'A contact with this name and email already exist. Change the name or email, or cancel.',
                iconFallbackText: 'Warning'
              })
            })
          })

          describe('in a different case (TYRELL CORPORATION)', () => {
            beforeEach(() => {
              session.name = companyContact.contact.department.toUpperCase()
            })

            it('still returns a warning', () => {
              const result = CheckPresenter.go(session, companyContacts)

              expect(result.warning).to.equal({
                text: 'A contact with this name and email already exist. Change the name or email, or cancel.',
                iconFallbackText: 'Warning'
              })
            })
          })
        })

        describe('and a contact with a matching name and email does not exist', () => {
          beforeEach(() => {
            session.name = 'Eric'
            session.email = 'Eric@test.com'
          })

          it('returns no warning', () => {
            const result = CheckPresenter.go(session, companyContacts)

            expect(result.warning).to.be.null()
          })
        })
      })

      describe('when editing an existing company contact', () => {
        describe('and a contact with a matching name and email exists', () => {
          describe('and its a different contact to the one being edited', () => {
            beforeEach(() => {
              session.companyContact = companyContact

              companyContacts = [
                {
                  ...companyContact,
                  id: generateUUID()
                }
              ]
            })

            describe('in the same case', () => {
              it('returns a warning', () => {
                const result = CheckPresenter.go(session, companyContacts)

                expect(result.warning).to.equal({
                  text: 'A contact with this name and email already exist. Change the name or email, or cancel.',
                  iconFallbackText: 'Warning'
                })
              })
            })

            describe('in a different case (TYRELL CORPORATION)', () => {
              beforeEach(() => {
                session.name = companyContact.contact.department.toUpperCase()
              })

              it('still returns a warning', () => {
                const result = CheckPresenter.go(session, companyContacts)

                expect(result.warning).to.equal({
                  text: 'A contact with this name and email already exist. Change the name or email, or cancel.',
                  iconFallbackText: 'Warning'
                })
              })
            })
          })
        })

        describe('and a contact with a matching name and email does not exist', () => {
          beforeEach(() => {
            session.name = 'Eric'
            session.email = 'Eric@test.com'
          })

          it('returns no warning', () => {
            const result = CheckPresenter.go(session, companyContacts)

            expect(result.warning).to.be.null()
          })
        })
      })
    })
  })
})
