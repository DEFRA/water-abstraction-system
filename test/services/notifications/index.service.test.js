'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach, before } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const FetchEventNotificationsService = require('../../../app/services/notifications/fetch-events-notifications.service.js')
const NotificationsIndexPresenter = require('../../../app/presenters/notifications/index.presenter.js')

// Thing under test
const NotificationsIndexService = require('../../../app/services/notifications/index.service.js')

describe('Notifications - view', () => {
  let yarStub

  beforeEach(async () => {})

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with no filters and no notifications', () => {
    before(() => {
      yarStub = { get: Sinon.stub().returns({}) }
      Sinon.stub(FetchEventNotificationsService, 'go').resolves([])
      Sinon.stub(NotificationsIndexPresenter, 'go').resolves({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [],
        pageTitle: 'View sent notices'
      })
    })

    it('returns the data to be displayed on the page', async () => {
      const result = await NotificationsIndexService.go(yarStub)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: null,
        filter: {
          notifications: undefined,
          openFilter: false
        },
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [],
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when called with no filters and some notifications', () => {
    before(() => {
      yarStub = { get: Sinon.stub().returns() }
      Sinon.stub(FetchEventNotificationsService, 'go').resolves([])
      Sinon.stub(NotificationsIndexPresenter, 'go').resolves({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })

    it('returns the data to be displayed on the page', async () => {
      const result = await NotificationsIndexService.go(yarStub)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: null,
        filter: {
          notifications: undefined,
          openFilter: false
        },
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when called with filters and some notifications', () => {
    before(() => {
      yarStub = {
        get: Sinon.stub().returns({
          filterNotificationTypes: [
            'legacy-notifications',
            'returns-paper-form',
            'returns-reminders',
            'returns-invitation',
            'water-abstraction-alert-resume',
            'water-abstraction-alert-stop',
            'water-abstraction-alert-reduce',
            'water-abstraction-alert-warning'
          ]
        })
      }
      Sinon.stub(FetchEventNotificationsService, 'go').resolves([])
      Sinon.stub(NotificationsIndexPresenter, 'go').resolves({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })

    it('returns the data to be displayed on the page', async () => {
      const result = await NotificationsIndexService.go(yarStub)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: null,
        filter: {
          filterNotificationTypes: [
            'legacy-notifications',
            'returns-paper-form',
            'returns-reminders',
            'returns-invitation',
            'water-abstraction-alert-resume',
            'water-abstraction-alert-stop',
            'water-abstraction-alert-reduce',
            'water-abstraction-alert-warning'
          ],
          notifications: {
            legacyNotifications: true,
            returnInvitation: true,
            returnReminders: true,
            returnsPaperForm: true,
            waterAbstractionAlertReduce: true,
            waterAbstractionAlertResume: true,
            waterAbstractionAlertStop: true,
            waterAbstractionAlertWarning: true
          },
          openFilter: true
        },
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when called with filters and there is an error with the email', () => {
    before(() => {
      yarStub = {
        get: Sinon.stub().returns({
          sentBy: 'test@test'
        })
      }
      Sinon.stub(FetchEventNotificationsService, 'go').resolves([])
      Sinon.stub(NotificationsIndexPresenter, 'go').resolves({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })

    it('returns the data and the error to be displayed on the page', async () => {
      const result = await NotificationsIndexService.go(yarStub)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          sentBy: {
            message: 'Enter a valid email'
          },
          text: 'There was a problem with your filters.'
        },
        filter: {
          notifications: undefined,
          sentBy: 'test@test',
          openFilter: true
        },
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when called with date filters', () => {
    before(() => {
      yarStub = {
        get: Sinon.stub().returns({
          sentFromDay: '1',
          sentFromMonth: '1',
          sentFromYear: '2024',
          sentToDay: '31',
          sentToMonth: '12',
          sentToYear: '2024'
        })
      }
      Sinon.stub(FetchEventNotificationsService, 'go').resolves([])
      Sinon.stub(NotificationsIndexPresenter, 'go').resolves({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })

    it('returns the data and the error to be displayed on the page', async () => {
      const result = await NotificationsIndexService.go(yarStub)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: null,
        filter: {
          notifications: undefined,
          sentFromDay: '1',
          sentFromMonth: '1',
          sentFromYear: '2024',
          sentToDay: '31',
          sentToMonth: '12',
          sentToYear: '2024',
          openFilter: true
        },
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when called with date filters but missing sentFromDay', () => {
    before(() => {
      yarStub = {
        get: Sinon.stub().returns({
          sentFromMonth: '1',
          sentFromYear: '2025'
        })
      }
      Sinon.stub(FetchEventNotificationsService, 'go').resolves([])
      Sinon.stub(NotificationsIndexPresenter, 'go').resolves({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })

    it('returns the data and the error to be displayed on the page', async () => {
      const result = await NotificationsIndexService.go(yarStub)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          fromFullDate: {
            message: 'Enter a valid from date'
          },
          text: 'There was a problem with your filters.'
        },
        filter: {
          notifications: undefined,
          sentFromMonth: '1',
          sentFromYear: '2025',
          openFilter: true
        },
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when called with date filters but missing sentFromMonth', () => {
    before(() => {
      yarStub = {
        get: Sinon.stub().returns({
          sentFromDay: '1',
          sentFromYear: '2025'
        })
      }
      Sinon.stub(FetchEventNotificationsService, 'go').resolves([])
      Sinon.stub(NotificationsIndexPresenter, 'go').resolves({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })

    it('returns the data and the error to be displayed on the page', async () => {
      const result = await NotificationsIndexService.go(yarStub)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          fromFullDate: {
            message: 'Enter a valid from date'
          },
          text: 'There was a problem with your filters.'
        },
        filter: {
          notifications: undefined,
          sentFromDay: '1',
          sentFromYear: '2025',
          openFilter: true
        },
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when called with date filters but missing sentFromYear', () => {
    before(() => {
      yarStub = {
        get: Sinon.stub().returns({
          sentFromDay: '1',
          sentFromMonth: '1'
        })
      }
      Sinon.stub(FetchEventNotificationsService, 'go').resolves([])
      Sinon.stub(NotificationsIndexPresenter, 'go').resolves({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })

    it('returns the data and the error to be displayed on the page', async () => {
      const result = await NotificationsIndexService.go(yarStub)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          fromFullDate: {
            message: 'Enter a valid from date'
          },
          text: 'There was a problem with your filters.'
        },
        filter: {
          notifications: undefined,
          sentFromDay: '1',
          sentFromMonth: '1',
          openFilter: true
        },
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when called with date filters but missing sentFromDay, sentFromMonth', () => {
    before(() => {
      yarStub = {
        get: Sinon.stub().returns({
          sentFromYear: '2025'
        })
      }
      Sinon.stub(FetchEventNotificationsService, 'go').resolves([])
      Sinon.stub(NotificationsIndexPresenter, 'go').resolves({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })

    it('returns the data and the error to be displayed on the page', async () => {
      const result = await NotificationsIndexService.go(yarStub)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          fromFullDate: {
            message: 'Enter a valid from date'
          },
          text: 'There was a problem with your filters.'
        },
        filter: {
          notifications: undefined,
          sentFromYear: '2025',
          openFilter: true
        },
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when called with date filters but missing sentToDay', () => {
    before(() => {
      yarStub = {
        get: Sinon.stub().returns({
          sentToMonth: '12',
          sentToYear: '2025'
        })
      }
      Sinon.stub(FetchEventNotificationsService, 'go').resolves([])
      Sinon.stub(NotificationsIndexPresenter, 'go').resolves({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })

    it('returns the data and the error to be displayed on the page', async () => {
      const result = await NotificationsIndexService.go(yarStub)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          toFullDate: {
            message: 'Enter a valid to date'
          },
          text: 'There was a problem with your filters.'
        },
        filter: {
          notifications: undefined,
          sentToMonth: '12',
          sentToYear: '2025',
          openFilter: true
        },
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when called with date filters but missing sentToMonth', () => {
    before(() => {
      yarStub = {
        get: Sinon.stub().returns({
          sentToDay: '31',
          sentToYear: '2025'
        })
      }
      Sinon.stub(FetchEventNotificationsService, 'go').resolves([])
      Sinon.stub(NotificationsIndexPresenter, 'go').resolves({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })

    it('returns the data and the error to be displayed on the page', async () => {
      const result = await NotificationsIndexService.go(yarStub)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          toFullDate: {
            message: 'Enter a valid to date'
          },
          text: 'There was a problem with your filters.'
        },
        filter: {
          notifications: undefined,
          sentToDay: '31',
          sentToYear: '2025',
          openFilter: true
        },
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when called with date filters but missing sentToYear', () => {
    before(() => {
      yarStub = {
        get: Sinon.stub().returns({
          sentToDay: '31',
          sentToMonth: '12'
        })
      }
      Sinon.stub(FetchEventNotificationsService, 'go').resolves([])
      Sinon.stub(NotificationsIndexPresenter, 'go').resolves({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })

    it('returns the data and the error to be displayed on the page', async () => {
      const result = await NotificationsIndexService.go(yarStub)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          toFullDate: {
            message: 'Enter a valid to date'
          },
          text: 'There was a problem with your filters.'
        },
        filter: {
          notifications: undefined,
          sentToDay: '31',
          sentToMonth: '12',
          openFilter: true
        },
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            { text: '21 February 2025' },
            { html: `<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>` },
            { text: 'test@test.com' },
            { text: 1, format: 'numeric' },
            { text: 1, format: 'numeric' }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })
  })
})

function _tableHeaders() {
  return [
    {
      text: 'Date'
    },
    {
      text: 'Notification type'
    },
    {
      text: 'Sent by'
    },
    {
      text: 'Recipients'
    },
    {
      text: 'Problems'
    }
  ]
}
