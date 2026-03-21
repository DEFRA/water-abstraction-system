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
const CommunicationsPresenter = require('../../../app/presenters/company-contacts/communications.presenter.js')

describe('Company Contacts - Communications presenter', () => {
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
      const result = CommunicationsPresenter.go(company, companyContact, notifications)

      expect(result).to.equal({
        backLink: {
          href: `/system/companies/${company.id}/contacts`,
          text: 'Go back to contacts'
        },
        pageTitle: 'Communications for Rachael Tyrell',
        pageTitleCaption: 'Tyrell Corporation',
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

    describe('the "notifications" property', () => {
      it('returns the notifications with the company id as query string in the link', () => {
        const result = CommunicationsPresenter.go(company, companyContact, notifications)

        expect(result.notifications[0].link.href).to.equal(
          `/system/notifications/${notification.id}?companyContactId=${companyContact.id}`
        )
      })
    })
  })
})
