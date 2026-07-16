// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import CustomersFixtures from '../../../support/fixtures/customers.fixture.js'
import LicenceFixture from '../../../support/fixtures/licence.fixture.js'
import { generateUUID } from '../../../support/generators.js'
import { yesterday } from '../../../support/general.js'

// Thing under test
import CheckPresenter from '../../../../app/presenters/company-contacts/setup/check.presenter.js'

describe('Company Contacts - Setup - Check Presenter', () => {
  let company
  let companyContact
  let email
  let licences
  let name
  let savedCompanyContacts
  let sentNotification
  let session

  beforeEach(() => {
    company = CustomersFixtures.company()
    companyContact = CustomersFixtures.companyContact()

    companyContact.contact.contactType = 'department'

    savedCompanyContacts = []

    name = companyContact.contact.department
    email = companyContact.contact.email

    licences = [LicenceFixture.licence()]

    sentNotification = undefined

    session = {
      abstractionAlertLicences: null,
      abstractionAlerts: 'yes',
      company,
      email,
      id: generateUUID(),
      licences,
      name
    }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

      expect(result).toEqual({
        abstractionAlertsLabel: 'Yes, for all licences',
        email,
        emailInUse: null,
        licences: [],
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
            const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

            expect(result.emailInUse).toBeNull()
          })
        })

        describe('and the email has been used for notifications', () => {
          beforeEach(() => {
            sentNotification = { id: generateUUID() }
          })

          it('still returns null', () => {
            const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

            expect(result.emailInUse).toBeNull()
          })
        })
      })

      describe('when editing an existing contact', () => {
        beforeEach(() => {
          session.companyContact = companyContact
        })

        describe('and the email has not been used for notifications', () => {
          it('returns null', () => {
            const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

            expect(result.emailInUse).toBeNull()
          })
        })

        describe('and the email has been used for notifications', () => {
          beforeEach(() => {
            sentNotification = { id: generateUUID() }
          })

          it('returns "email address cannot be changed" message', () => {
            const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

            expect(result.emailInUse).toEqual(
              'Notifications have been sent to this contact, so the email address cannot be changed.'
            )
          })
        })
      })
    })

    describe('the "matchingContact" property', () => {
      describe('when a contact with a matching name and email does not exist', () => {
        it('returns undefined', () => {
          const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

          expect(result.matchingContact).toBeUndefined()
        })
      })

      describe('when a contact with a matching name and email exists', () => {
        describe('in the same letter case', () => {
          beforeEach(() => {
            savedCompanyContacts = [{ ...companyContact }]
          })

          it('returns the matching contact', () => {
            const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

            expect(result.matchingContact).toEqual(savedCompanyContacts[0])
          })
        })

        describe('in a different letter case', () => {
          beforeEach(() => {
            const matchingCompanyContact = { ...companyContact }

            matchingCompanyContact.contact.department.toUpperCase()

            savedCompanyContacts = [matchingCompanyContact]
          })

          it('returns the matching contact', () => {
            const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

            expect(result.matchingContact).toEqual(savedCompanyContacts[0])
          })
        })
      })
    })

    describe('the "warning" property', () => {
      describe('when the user has selected "Yes, for some licences" but not selected any licences', () => {
        beforeEach(() => {
          session.abstractionAlerts = 'some'
        })

        describe('and there are no "abstractionAlertLicences"', () => {
          beforeEach(() => {
            session.abstractionAlertLicences = null
          })

          it('returns "select licences" warning', () => {
            const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

            expect(result.warning).toEqual({
              text: 'Select the licences they should get water abstraction alert emails for or change should they get abstraction alerts.',
              iconFallbackText: 'Warning'
            })
          })
        })
      })

      describe('when creating a new contact', () => {
        describe('and a contact with a matching name and email does not exist', () => {
          it('returns null', () => {
            const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

            expect(result.warning).toBeNull()
          })
        })

        describe('and a contact with a matching name and email exists', () => {
          describe('in the same letter case', () => {
            beforeEach(() => {
              savedCompanyContacts = [{ ...companyContact }]
            })

            describe('and the contact is not deleted', () => {
              it('returns "contact already exists" message', () => {
                const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

                expect(result.warning).toEqual({
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
                const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

                expect(result.warning).toEqual({
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
                const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

                expect(result.warning).toEqual({
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
                const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

                expect(result.warning).toEqual({
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
            const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

            expect(result.warning).toBeNull()
          })
        })

        describe('and a contact with a matching name and email exists', () => {
          describe('in the same letter case', () => {
            beforeEach(() => {
              savedCompanyContacts = [{ ...companyContact }]
            })

            describe('and the contact is not deleted', () => {
              it('returns "contact already exists" message', () => {
                const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

                expect(result.warning).toEqual({
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
                const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

                expect(result.warning).toEqual({
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
                const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

                expect(result.warning).toEqual({
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
                const result = CheckPresenter(session, savedCompanyContacts, sentNotification)

                expect(result.warning).toEqual({
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
