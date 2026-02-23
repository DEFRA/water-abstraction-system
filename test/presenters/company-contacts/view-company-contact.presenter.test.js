'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const CustomersFixtures = require('../../support/fixtures/customers.fixture.js')
const NoticesFixture = require('../../support/fixtures/notices.fixture.js')
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')

// Thing under test
const ViewCompanyContactPresenter = require('../../../app/presenters/company-contacts/view-company-contact.presenter.js')

describe('Company Contacts - View Company Contact presenter', () => {
  let companyContact
  let company
  let notification
  let notifications

  beforeEach(() => {
    companyContact = CustomersFixtures.companyContact()

    company = CustomersFixtures.company()

    const notice = NoticesFixture.alertStop()
    const { createdAt, id, messageType, status } = NotificationsFixture.abstractionAlertEmail(notice)

    notification = {
      createdAt,
      id,
      messageType,
      status,
      event: {
        id: notice.id,
        issuer: notice.issuer,
        subtype: notice.subtype,
        sendingAlertType: notice.metadata.options.sendingAlertType
      }
    }

    notifications = [notification]
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ViewCompanyContactPresenter.go(company, companyContact, notifications)

      expect(result).to.equal({
        additionalContact: true,
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Go back to contacts'
        },
        contact: {
          abstractionAlerts: 'No',
          created: '1 January 2022 by nexus6.hunter@offworld.net',
          email: 'rachael.tyrell@tyrellcorp.com',
          lastUpdated: '1 January 2022 by void.kampff@tyrell.com',
          name: 'Rachael Tyrell'
        },
        editContactLink: `/system/company-contacts/setup/${companyContact.id}/edit`,
        pageTitle: 'Contact details for Rachael Tyrell',
        pageTitleCaption: 'Tyrell Corporation',
        removeContactLink: `/system/company-contacts/${companyContact.id}/remove`,
        notifications: [
          {
            link: {
              hiddenText: 'sent 9 October 2025 via email',
              href: `/system/notifications/${notification.id}?companyContactId=${companyContact.id}`
            },
            method: 'Email',
            sentBy: 'admin-internal@wrls.gov.uk',
            sentDate: '9 October 2025',
            status: 'sent',
            type: 'Stop alert'
          }
        ]
      })
    })

    describe('the "contact" property', () => {
      describe('the "created" property', () => {
        describe('when there is "createdByUser"', () => {
          it('returns the created text with the created at date and the created by username', () => {
            const result = ViewCompanyContactPresenter.go(company, companyContact, notifications)

            expect(result.contact.created).to.equal('1 January 2022 by nexus6.hunter@offworld.net')
          })
        })

        describe('when there is no "createdByUser"', () => {
          beforeEach(() => {
            companyContact.createdByUser = null
          })

          it('returns the created text with the created at date', () => {
            const result = ViewCompanyContactPresenter.go(company, companyContact, notifications)

            expect(result.contact.created).to.equal('1 January 2022')
          })
        })
      })

      describe('the "abstractionAlerts" property', () => {
        describe('when the contact is an additional contact', () => {
          it('returns true', () => {
            const result = ViewCompanyContactPresenter.go(company, companyContact, notifications)

            expect(result.additionalContact).to.be.true()
          })
        })

        describe('when the contact is not an additional contact', () => {
          beforeEach(() => {
            companyContact.licenceRole.name = 'licenceHolder'
          })

          it('returns false', () => {
            const result = ViewCompanyContactPresenter.go(company, companyContact, notifications)

            expect(result.additionalContact).to.be.false()
          })
        })
      })

      describe('the "lastUpdated" property', () => {
        describe('when there is "updatedByUser"', () => {
          it('returns the created text with the updated at date and the updated by username', () => {
            const result = ViewCompanyContactPresenter.go(company, companyContact, notifications)

            expect(result.contact.lastUpdated).to.equal('1 January 2022 by void.kampff@tyrell.com')
          })
        })

        describe('when there is no "updatedByUser"', () => {
          beforeEach(() => {
            companyContact.updatedByUser = null
          })

          it('returns the created text with the created at date', () => {
            const result = ViewCompanyContactPresenter.go(company, companyContact, notifications)

            expect(result.contact.lastUpdated).to.equal('1 January 2022')
          })
        })
      })
    })

    describe('the "notifications" property', () => {
      it('returns the notifications with the company id as query string in the link', () => {
        const result = ViewCompanyContactPresenter.go(company, companyContact, notifications)

        expect(result.notifications[0].link.href).to.equal(
          `/system/notifications/${notification.id}?companyContactId=${companyContact.id}`
        )
      })
    })
  })
})
