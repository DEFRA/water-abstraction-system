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
  let singleNotification

  beforeEach(() => {
    company = CustomersFixtures.company()
    companyContact = CustomersFixtures.companyContact()

    companyContact.contact.contactType = 'department'

    companyContacts = []

    name = companyContact.contact.department
    email = companyContact.contact.email

    singleNotification = undefined

    session = { id: generateUUID(), company, abstractionAlerts: 'yes', name, email }
  })

  describe('when called', () => {
    describe('when editing a company contact', () => {
      beforeEach(() => {
        session.companyContact = companyContact
      })

      it('returns page data for the view', () => {
        const result = CheckPresenter.go(session, companyContacts, singleNotification)

        expect(result).to.equal({
          abstractionAlerts: 'Yes',
          email,
          emailInUse: null,
          links: {
            abstractionAlerts: `/system/company-contacts/setup/${session.id}/abstraction-alerts`,
            cancel: `/system/company-contacts/setup/${session.id}/cancel`,
            email: `/system/company-contacts/setup/${session.id}/contact-email`,
            name: `/system/company-contacts/setup/${session.id}/contact-name`,
            restoreContact: null
          },
          matchingContact: undefined,
          name,
          pageTitle: 'Check contact',
          pageTitleCaption: 'Tyrell Corporation',
          warning: null
        })
      })

      describe('when the email has not been used for notifications', () => {
        describe('the "emailInUse" property', () => {
          it('returns null', () => {
            const result = CheckPresenter.go(session, companyContacts, singleNotification)

            expect(result.emailInUse).to.be.null()
          })
        })

        describe('when the email has been used for notifications', () => {
          beforeEach(() => {
            singleNotification = {
              id: generateUUID()
            }
          })

          describe('the "emailInUse" property', () => {
            it('returns null', () => {
              const result = CheckPresenter.go(session, companyContacts, singleNotification)

              expect(result.emailInUse).to.equal(
                'Notifications have been sent to this contact, so the email address cannot be changed.'
              )
            })
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

            describe('the "warning" property', () => {
              describe('in the same case', () => {
                it('returns a warning', () => {
                  const result = CheckPresenter.go(session, companyContacts, singleNotification)

                  expect(result.warning).to.equal({
                    text: 'A contact with this name and email already exists. Change the name or email, or cancel.',
                    iconFallbackText: 'Warning'
                  })
                })
              })

              describe('in a different case (TYRELL CORPORATION)', () => {
                beforeEach(() => {
                  session.name = companyContact.contact.department.toUpperCase()
                })

                it('still returns a warning', () => {
                  const result = CheckPresenter.go(session, companyContacts, singleNotification)

                  expect(result.warning).to.equal({
                    text: 'A contact with this name and email already exists. Change the name or email, or cancel.',
                    iconFallbackText: 'Warning'
                  })
                })
              })
            })
          })

          describe('and the company contact can be restored', () => {
            beforeEach(() => {
              session.companyContact = companyContact

              companyContacts = [
                {
                  ...companyContact,
                  id: generateUUID(),
                  deletedAt: new Date()
                }
              ]
            })

            describe('the "warning" property', () => {
              describe('in the same case', () => {
                it('returns a warning', () => {
                  const result = CheckPresenter.go(session, companyContacts, singleNotification)

                  expect(result.warning).to.equal({
                    text: 'A deleted contact with this name and email already exists. Change the name or email, or restore the existing contact.',
                    iconFallbackText: 'Warning'
                  })
                })
              })

              describe('in a different case (TYRELL CORPORATION)', () => {
                beforeEach(() => {
                  session.name = companyContact.contact.department.toUpperCase()
                })

                it('still returns a warning', () => {
                  const result = CheckPresenter.go(session, companyContacts, singleNotification)

                  expect(result.warning).to.equal({
                    text: 'A deleted contact with this name and email already exists. Change the name or email, or restore the existing contact.',
                    iconFallbackText: 'Warning'
                  })
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
            const result = CheckPresenter.go(session, companyContacts, singleNotification)

            expect(result.warning).to.be.null()
          })
        })

        describe('and a contact with a matching name and no email (email is null)', () => {
          beforeEach(() => {
            session.name = 'Eric'
            // The session will have been initialised with a company contact email, which can be null
            session.email = null

            companyContact.contact.email = null
          })

          it('returns no warning', () => {
            const result = CheckPresenter.go(session, companyContacts, singleNotification)

            expect(result.warning).to.be.null()
          })
        })
      })
    })

    describe('when creating a new company contact', () => {
      it('returns page data for the view', () => {
        const result = CheckPresenter.go(session, companyContacts, singleNotification)

        expect(result).to.equal({
          abstractionAlerts: 'Yes',
          email,
          emailInUse: null,
          links: {
            abstractionAlerts: `/system/company-contacts/setup/${session.id}/abstraction-alerts`,
            cancel: `/system/company-contacts/setup/${session.id}/cancel`,
            email: `/system/company-contacts/setup/${session.id}/contact-email`,
            name: `/system/company-contacts/setup/${session.id}/contact-name`,
            restoreContact: null
          },
          matchingContact: undefined,
          name,
          pageTitle: 'Check contact',
          pageTitleCaption: 'Tyrell Corporation',
          warning: null
        })
      })

      describe('and a contact with a matching name and email exists', () => {
        beforeEach(() => {
          companyContacts = [companyContact]
        })

        describe('and the company contact can be restored', () => {
          describe('the "links" property', () => {
            beforeEach(() => {
              companyContacts = [
                {
                  ...companyContact,
                  deletedAt: new Date()
                }
              ]
            })

            it('returns link to the restore contact page', () => {
              const result = CheckPresenter.go(session, companyContacts, singleNotification)

              expect(result.links.restoreContact).to.equal(`/system/company-contacts/setup/${session.id}/restore`)
            })
          })

          describe('the "matchingContact" property', () => {
            it('returns the matching contact', () => {
              const result = CheckPresenter.go(session, companyContacts, singleNotification)

              expect(result.matchingContact).to.equal(companyContact)
            })
          })
        })

        describe('the "warning" property', () => {
          describe('in the same case', () => {
            it('returns a warning', () => {
              const result = CheckPresenter.go(session, companyContacts, singleNotification)

              expect(result.warning).to.equal({
                text: 'A contact with this name and email already exists. Change the name or email, or cancel.',
                iconFallbackText: 'Warning'
              })
            })
          })

          describe('in a different case (TYRELL CORPORATION)', () => {
            beforeEach(() => {
              session.name = companyContact.contact.department.toUpperCase()
            })

            it('still returns a warning', () => {
              const result = CheckPresenter.go(session, companyContacts, singleNotification)

              expect(result.warning).to.equal({
                text: 'A contact with this name and email already exists. Change the name or email, or cancel.',
                iconFallbackText: 'Warning'
              })
            })
          })

          describe('and the company contact can be restored', () => {
            beforeEach(() => {
              companyContacts = [
                {
                  ...companyContact,
                  deletedAt: new Date()
                }
              ]
            })

            describe('in the same case', () => {
              it('returns a warning', () => {
                const result = CheckPresenter.go(session, companyContacts, singleNotification)

                expect(result.warning).to.equal({
                  text: 'A deleted contact with this name and email already exists. Change the name or email, or restore the existing contact.',
                  iconFallbackText: 'Warning'
                })
              })
            })

            describe('in a different case (TYRELL CORPORATION)', () => {
              beforeEach(() => {
                session.name = companyContact.contact.department.toUpperCase()
              })

              it('still returns a warning', () => {
                const result = CheckPresenter.go(session, companyContacts, singleNotification)

                expect(result.warning).to.equal({
                  text: 'A deleted contact with this name and email already exists. Change the name or email, or restore the existing contact.',
                  iconFallbackText: 'Warning'
                })
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

        describe('the "warning" property', () => {
          it('returns no warning', () => {
            const result = CheckPresenter.go(session, companyContacts, singleNotification)

            expect(result.warning).to.be.null()
          })
        })
      })

      describe('and a contact with a matching name and no email (email is null)', () => {
        beforeEach(() => {
          session.name = 'Eric'
          session.email = 'Eric@test.com'

          companyContact.contact.email = null
        })

        describe('the "warning" property', () => {
          it('returns no warning', () => {
            const result = CheckPresenter.go(session, companyContacts, singleNotification)

            expect(result.warning).to.be.null()
          })
        })
      })
    })
  })
})
