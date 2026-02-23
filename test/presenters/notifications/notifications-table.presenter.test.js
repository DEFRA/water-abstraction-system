'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../support/fixtures/notices.fixture.js')
const NotificationsFixture = require('../../support/fixtures/notifications.fixture.js')
const { generateUUID } = require('../../../app/lib/general.lib.js')

// Thing under test
const NotificationsTablePresenter = require('../../../app/presenters/notifications/notifications-table.presenter.js')

describe('Notifications - Notification Table presenter', () => {
  let companyContactId
  let licenceId
  let notice
  let notification
  let returnLogId

  beforeEach(() => {
    companyContactId = null
    licenceId = null
    returnLogId = null
  })

  describe('when there is a returns notice notification', () => {
    beforeEach(() => {
      notice = NoticesFixture.returnsInvitation()
      notification = NotificationsFixture.returnsInvitationEmail(notice)
      notification.event = notice
    })

    describe('and you have come from a company contact', () => {
      beforeEach(() => {
        companyContactId = generateUUID()
      })

      it('correctly presents the data', () => {
        const result = NotificationsTablePresenter.go([notification], licenceId, returnLogId, companyContactId)

        expect(result).to.equal([
          {
            link: {
              hiddenText: 'sent 2 April 2025 via email',
              href: `/system/notifications/${notification.id}?companyContactId=${companyContactId}`
            },
            method: 'Email',
            sentBy: notification.event.issuer,
            sentDate: '2 April 2025',
            status: notification.status,
            type: 'Returns invitation'
          }
        ])
      })
    })

    describe('and you have come from a return log', () => {
      beforeEach(() => {
        returnLogId = generateUUID()
      })

      it('correctly presents the data', () => {
        const result = NotificationsTablePresenter.go([notification], licenceId, returnLogId, companyContactId)

        expect(result).to.equal([
          {
            link: {
              hiddenText: 'sent 2 April 2025 via email',
              href: `/system/notifications/${notification.id}?return=${returnLogId}`
            },
            method: 'Email',
            sentBy: notification.event.issuer,
            sentDate: '2 April 2025',
            status: notification.status,
            type: 'Returns invitation'
          }
        ])
      })
    })

    describe('and you have come from a licence', () => {
      beforeEach(() => {
        licenceId = generateUUID()
      })

      it('correctly presents the data', () => {
        const result = NotificationsTablePresenter.go([notification], licenceId, returnLogId, companyContactId)

        expect(result).to.equal([
          {
            link: {
              hiddenText: 'sent 2 April 2025 via email',
              href: `/system/notifications/${notification.id}?id=${licenceId}`
            },
            method: 'Email',
            sentBy: notification.event.issuer,
            sentDate: '2 April 2025',
            status: notification.status,
            type: 'Returns invitation'
          }
        ])
      })
    })
  })

  describe('when there is an abstraction alert notification', () => {
    beforeEach(() => {
      notice = NoticesFixture.alertStop()
      notification = NotificationsFixture.abstractionAlertEmail(notice)
      notification.event = notice
    })

    describe('and you have come from a licence', () => {
      beforeEach(() => {
        licenceId = generateUUID()
        returnLogId = generateUUID()
      })

      it('correctly presents the data', () => {
        const result = NotificationsTablePresenter.go([notification], licenceId, returnLogId, companyContactId)

        expect(result).to.equal([
          {
            link: {
              hiddenText: 'sent 9 October 2025 via email',
              href: `/system/notifications/${notification.id}?id=${licenceId}`
            },
            method: 'Email',
            sentBy: notification.event.issuer,
            sentDate: '9 October 2025',
            status: notification.status,
            type: 'alert'
          }
        ])
      })
    })

    describe('and you have come from a company contact', () => {
      beforeEach(() => {
        companyContactId = generateUUID()
      })

      it('correctly presents the data', () => {
        const result = NotificationsTablePresenter.go([notification], licenceId, returnLogId, companyContactId)

        expect(result).to.equal([
          {
            link: {
              hiddenText: 'sent 9 October 2025 via email',
              href: `/system/notifications/${notification.id}?companyContactId=${companyContactId}`
            },
            method: 'Email',
            sentBy: notification.event.issuer,
            sentDate: '9 October 2025',
            status: notification.status,
            type: 'alert'
          }
        ])
      })
    })
  })

  describe('when someone has removed the query params from the url', () => {
    describe('and neither licenceId,  returnLogId or companyContactId are present', () => {
      it('correctly presents the data', () => {
        const result = NotificationsTablePresenter.go([notification], licenceId, returnLogId, companyContactId)

        expect(result).to.equal([
          {
            link: {
              hiddenText: 'sent 9 October 2025 via email',
              href: `/system/notifications/${notification.id}`
            },
            method: 'Email',
            sentBy: notification.event.issuer,
            sentDate: '9 October 2025',
            status: notification.status,
            type: 'alert'
          }
        ])
      })
    })
  })

  describe('when there are no notifications', () => {
    beforeEach(() => {
      licenceId = generateUUID()
    })

    it('returns an empty array', () => {
      const result = NotificationsTablePresenter.go([], licenceId, returnLogId, companyContactId)

      expect(result).to.equal([])
    })
  })
})
