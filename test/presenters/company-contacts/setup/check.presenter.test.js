'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../../support/fixtures/customers.fixture.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { yesterday } = require('../../../support/general.js')

// Thing under test
const CheckPresenter = require('../../../../app/presenters/company-contacts/setup/check.presenter.js')

describe('Company Contacts - Setup - Check Presenter', () => {
  let company
  let companyContact
  let email
  let name
  let savedCompanyContacts
  let session
  let sentNotification

  beforeEach(() => {
    company = CustomersFixtures.company()
    companyContact = CustomersFixtures.companyContact()

    companyContact.contact.contactType = 'department'

    savedCompanyContacts = []

    name = companyContact.contact.department
    email = companyContact.contact.email

    sentNotification = undefined

    session = { id: generateUUID(), company, abstractionAlerts: 'yes', name, email }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

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

    describe('the "emailInUse" property', () => {
      describe('when creating a new contact', () => {
        describe('and the email has not been used for notifications', () => {
          it('returns null', () => {
            const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

            expect(result.emailInUse).to.be.null()
          })
        })

        describe('and the email has been used for notifications', () => {
          beforeEach(() => {
            sentNotification = { id: generateUUID() }
          })

          it('still returns null', () => {
            const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

            expect(result.emailInUse).to.be.null()
          })
        })
      })

      describe('when editing an existing contact', () => {
        beforeEach(() => {
          session.companyContact = companyContact
        })

        describe('and the email has not been used for notifications', () => {
          it('returns null', () => {
            const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

            expect(result.emailInUse).to.be.null()
          })
        })

        describe('and the email has been used for notifications', () => {
          beforeEach(() => {
            sentNotification = { id: generateUUID() }
          })

          it('returns "email address cannot be changed" message', () => {
            const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

            expect(result.emailInUse).to.equal(
              'Notifications have been sent to this contact, so the email address cannot be changed.'
            )
          })
        })
      })
    })

    describe('the "matchingContact" property', () => {
      describe('when a contact with a matching name and email does not exist', () => {
        it('returns undefined', () => {
          const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

          expect(result.matchingContact).to.be.undefined()
        })
      })

      describe('when a contact with a matching name and email exists', () => {
        describe('in the same letter case', () => {
          beforeEach(() => {
            savedCompanyContacts = [{ ...companyContact }]
          })

          it('returns the matching contact', () => {
            const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

            expect(result.matchingContact).to.equal(savedCompanyContacts[0])
          })
        })

        describe('in a different letter case', () => {
          beforeEach(() => {
            const matchingCompanyContact = { ...companyContact }

            matchingCompanyContact.contact.department.toUpperCase()

            savedCompanyContacts = [matchingCompanyContact]
          })

          it('returns the matching contact', () => {
            const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

            expect(result.matchingContact).to.equal(savedCompanyContacts[0])
          })
        })
      })
    })

    describe('the "warning" property', () => {
      describe('when creating a new contact', () => {
        describe('and a contact with a matching name and email does not exist', () => {
          it('returns null', () => {
            const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

            expect(result.warning).to.be.null()
          })
        })

        describe('and a contact with a matching name and email exists', () => {
          describe('in the same letter case', () => {
            beforeEach(() => {
              savedCompanyContacts = [{ ...companyContact }]
            })

            describe('and the contact is not deleted', () => {
              it('returns "contact already exists" message', () => {
                const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

                expect(result.warning).to.equal({
                  text: 'A contact with this name and email already exists. Change the name or email, or cancel.',
                  iconFallbackText: 'Warning'
                })
              })
            })

            describe('and the contact is deleted', () => {
              beforeEach(() => {
                savedCompanyContacts[0].deletedAt = yesterday()
              })

              it('returns "deleted contact already exists" message', () => {
                const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

                expect(result.warning).to.equal({
                  text: 'A deleted contact with this name and email already exists. Change the name or email, or restore the existing contact.',
                  iconFallbackText: 'Warning'
                })
              })
            })
          })

          describe('in a different letter case', () => {
            beforeEach(() => {
              const matchingCompanyContact = { ...companyContact }

              // NOTE: In this test we change the department. In the next we change the email. It ensures we cover all
              // scenarios
              matchingCompanyContact.contact.department.toUpperCase()

              savedCompanyContacts = [matchingCompanyContact]
            })

            describe('and the contact is not deleted', () => {
              it('returns "contact already exists" message', () => {
                const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

                expect(result.warning).to.equal({
                  text: 'A contact with this name and email already exists. Change the name or email, or cancel.',
                  iconFallbackText: 'Warning'
                })
              })
            })

            describe('and the contact is deleted', () => {
              beforeEach(() => {
                savedCompanyContacts[0].deletedAt = yesterday()
              })

              it('returns "deleted contact already exists" message', () => {
                const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

                expect(result.warning).to.equal({
                  text: 'A deleted contact with this name and email already exists. Change the name or email, or restore the existing contact.',
                  iconFallbackText: 'Warning'
                })
              })
            })
          })
        })
      })

      describe('when editing an existing contact', () => {
        beforeEach(() => {
          session.companyContact = companyContact
        })

        describe('and a contact with a matching name and email does not exist', () => {
          it('returns null', () => {
            const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

            expect(result.warning).to.be.null()
          })
        })

        describe('and a contact with a matching name and email exists', () => {
          describe('in the same letter case', () => {
            beforeEach(() => {
              savedCompanyContacts = [{ ...companyContact }]
            })

            describe('and the contact is not deleted', () => {
              it('returns "contact already exists" message', () => {
                const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

                expect(result.warning).to.equal({
                  text: 'A contact with this name and email already exists. Change the name or email, or cancel.',
                  iconFallbackText: 'Warning'
                })
              })
            })

            describe('and the contact is deleted', () => {
              beforeEach(() => {
                savedCompanyContacts[0].deletedAt = yesterday()
              })

              it('returns "deleted contact already exists" message', () => {
                const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

                expect(result.warning).to.equal({
                  text: 'A deleted contact with this name and email already exists. Change the name or email, or restore the existing contact.',
                  iconFallbackText: 'Warning'
                })
              })
            })
          })

          describe('in a different letter case', () => {
            beforeEach(() => {
              const matchingCompanyContact = { ...companyContact }

              // NOTE: In this test we change the email. In the previous we change the department. It ensures we cover
              // all scenarios
              matchingCompanyContact.contact.email.toUpperCase()

              savedCompanyContacts = [matchingCompanyContact]
            })

            describe('and the contact is not deleted', () => {
              it('returns "contact already exists" message', () => {
                const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

                expect(result.warning).to.equal({
                  text: 'A contact with this name and email already exists. Change the name or email, or cancel.',
                  iconFallbackText: 'Warning'
                })
              })
            })

            describe('and the contact is deleted', () => {
              beforeEach(() => {
                savedCompanyContacts[0].deletedAt = yesterday()
              })

              it('returns "deleted contact already exists" message', () => {
                const result = CheckPresenter.go(session, savedCompanyContacts, sentNotification)

                expect(result.warning).to.equal({
                  text: 'A deleted contact with this name and email already exists. Change the name or email, or restore the existing contact.',
                  iconFallbackText: 'Warning'
                })
              })
            })
          })
        })
      })
    })
  })
})
