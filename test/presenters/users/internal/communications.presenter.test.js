'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NotificationsFixture = require('../../../support/fixtures/notifications.fixture.js')
const UserFixture = require('../../../support/fixtures/users.fixture.js')

// Thing under test
const CommunicationsPresenter = require('../../../../app/presenters/users/internal/communications.presenter.js')

describe('Users - Internal - Communications presenter', () => {
  let notifications
  let user

  beforeEach(() => {
    user = UserFixture.billingAndData()

    notifications = [NotificationsFixture.userNewInternalEmail(user.username)]
  })

  it('correctly presents the data', () => {
    const result = CommunicationsPresenter.go(user, notifications)

    expect(result).to.equal({
      backLink: {
        href: '/system/users',
        text: 'Go back to users'
      },
      notifications: [
        {
          link: {
            hiddenText: 'sent 18 April 2025 via email',
            href: `/system/users/internal/${user.id}/notifications/${notifications[0].id}`,
            text: 'New internal user'
          },
          method: 'Email',
          sentDate: '18 April 2025',
          status: 'sent'
        }
      ],
      pageTitle: `Communications for ${user.username}`,
      pageTitleCaption: 'Internal'
    })
  })
})
