'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach, before } = (exports.lab = Lab.script())
const { expect } = Code

// Things to stub
const FetchNoticesService = require('../../../app/services/notices/fetch-notices.service.js')
const NoticesIndexPresenter = require('../../../app/presenters/notices/index-notices.presenter.js')

// Thing under test
const NoticesIndexService = require('../../../app/services/notices/index.service.js')

describe.only('Notices - view', () => {
  let yarStub

  beforeEach(async () => {})

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with no filters and no notices', () => {
    before(() => {
      yarStub = { get: Sinon.stub().returns({}) }
      Sinon.stub(FetchNoticesService, 'go').resolves({ results: [], total: 0 })
      Sinon.stub(NoticesIndexPresenter, 'go').resolves({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [],
        pageTitle: 'View sent notices'
      })
    })

    it('returns the data to be displayed on the page', async () => {
      const result = await NoticesIndexService.go(yarStub, 1)

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
        pagination: {
          numberOfPages: 0
        },
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when called with no filters and some notices', () => {
    before(() => {
      yarStub = { get: Sinon.stub().returns() }
      Sinon.stub(FetchNoticesService, 'go').resolves({ results: [], total: 1 })
      Sinon.stub(NoticesIndexPresenter, 'go').resolves({
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
      const result = await NoticesIndexService.go(yarStub, 1)

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
        pagination: {
          numberOfPages: 1
        },
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when called with filters and some notices', () => {
    before(() => {
      yarStub = {
        get: Sinon.stub().returns({
          filterNotificationTypes: [
            'ad-hoc-reminders',
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
      Sinon.stub(FetchNoticesService, 'go').resolves({ results: [], total: 1 })
      Sinon.stub(NoticesIndexPresenter, 'go').resolves({
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
      const result = await NoticesIndexService.go(yarStub, 1)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: null,
        filter: {
          filterNotificationTypes: [
            'ad-hoc-reminders',
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
            adHocReminders: true,
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
        pagination: {
          numberOfPages: 1
        },
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
      Sinon.stub(FetchNoticesService, 'go').resolves({ results: [], total: 0 })
      Sinon.stub(NoticesIndexPresenter, 'go').resolves({
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
      const result = await NoticesIndexService.go(yarStub, 1)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          sentByError: {
            message: 'Enter a valid email'
          },
          summary: [
            {
              href: '#sent-by',
              text: 'Enter a valid email'
            }
          ]
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
        pagination: {
          numberOfPages: 0
        },
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when called with filters and there is no error with the email', () => {
    before(() => {
      yarStub = {
        get: Sinon.stub().returns({
          sentBy: 'test@test.com'
        })
      }
      Sinon.stub(FetchNoticesService, 'go').resolves({ results: [], total: 0 })
      Sinon.stub(NoticesIndexPresenter, 'go').resolves({
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
      const result = await NoticesIndexService.go(yarStub, 1)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: null,
        filter: {
          notifications: undefined,
          sentBy: 'test@test.com',
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
        pagination: {
          numberOfPages: 0
        },
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
      Sinon.stub(FetchNoticesService, 'go').resolves({ results: [], total: 1 })
      Sinon.stub(NoticesIndexPresenter, 'go').resolves({
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
      const result = await NoticesIndexService.go(yarStub, 1)

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
        pagination: {
          numberOfPages: 1
        },
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
      Sinon.stub(FetchNoticesService, 'go').resolves([])
      Sinon.stub(NoticesIndexPresenter, 'go').resolves({
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
      const result = await NoticesIndexService.go(yarStub, 1)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          fromFullDate: {
            message: 'Enter a valid from date'
          },
          summary: [
            {
              href: '#sent-from',
              text: 'Enter a valid from date'
            }
          ]
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
        pagination: {
          numberOfPages: 0
        },
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
      Sinon.stub(FetchNoticesService, 'go').resolves([])
      Sinon.stub(NoticesIndexPresenter, 'go').resolves({
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
      const result = await NoticesIndexService.go(yarStub, 1)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          fromFullDate: {
            message: 'Enter a valid from date'
          },
          summary: [
            {
              href: '#sent-from',
              text: 'Enter a valid from date'
            }
          ]
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
        pagination: {
          numberOfPages: 0
        },
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
      Sinon.stub(FetchNoticesService, 'go').resolves([])
      Sinon.stub(NoticesIndexPresenter, 'go').resolves({
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
      const result = await NoticesIndexService.go(yarStub, 1)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          fromFullDate: {
            message: 'Enter a valid from date'
          },
          summary: [
            {
              href: '#sent-from',
              text: 'Enter a valid from date'
            }
          ]
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
        pagination: {
          numberOfPages: 0
        },
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
      Sinon.stub(FetchNoticesService, 'go').resolves([])
      Sinon.stub(NoticesIndexPresenter, 'go').resolves({
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
      const result = await NoticesIndexService.go(yarStub, 1)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          fromFullDate: {
            message: 'Enter a valid from date'
          },
          summary: [
            {
              href: '#sent-from',
              text: 'Enter a valid from date'
            }
          ]
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
        pagination: {
          numberOfPages: 0
        },
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
      Sinon.stub(FetchNoticesService, 'go').resolves([])
      Sinon.stub(NoticesIndexPresenter, 'go').resolves({
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
      const result = await NoticesIndexService.go(yarStub, 1)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          toFullDate: {
            message: 'Enter a valid to date'
          },
          summary: [
            {
              href: '#sent-to',
              text: 'Enter a valid to date'
            }
          ]
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
        pagination: {
          numberOfPages: 0
        },
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
      Sinon.stub(FetchNoticesService, 'go').resolves([])
      Sinon.stub(NoticesIndexPresenter, 'go').resolves({
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
      const result = await NoticesIndexService.go(yarStub, 1)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          toFullDate: {
            message: 'Enter a valid to date'
          },
          summary: [
            {
              href: '#sent-to',
              text: 'Enter a valid to date'
            }
          ]
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
        pagination: {
          numberOfPages: 0
        },
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
      Sinon.stub(FetchNoticesService, 'go').resolves([])
      Sinon.stub(NoticesIndexPresenter, 'go').resolves({
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
      const result = await NoticesIndexService.go(yarStub, 1)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: {
          toFullDate: {
            message: 'Enter a valid to date'
          },
          summary: [
            {
              href: '#sent-to',
              text: 'Enter a valid to date'
            }
          ]
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
        pagination: {
          numberOfPages: 0
        },
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when called with all the filters with no errors', () => {
    before(() => {
      yarStub = {
        get: Sinon.stub().returns({
          filterNotificationTypes: [
            'ad-hoc-reminders',
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
            adHocReminders: true,
            legacyNotifications: true,
            returnInvitation: true,
            returnReminders: true,
            returnsPaperForm: true,
            waterAbstractionAlertReduce: true,
            waterAbstractionAlertResume: true,
            waterAbstractionAlertStop: true,
            waterAbstractionAlertWarning: true
          },
          sentFromDay: '31',
          sentFromMonth: '12',
          sentFromYear: '2023',
          sentToDay: '31',
          sentToMonth: '12',
          sentToYear: '2024',
          openFilter: true
        })
      }
      Sinon.stub(FetchNoticesService, 'go').resolves({ results: [], total: 1 })
      Sinon.stub(NoticesIndexPresenter, 'go').resolves({
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
      const result = await NoticesIndexService.go(yarStub, 1)

      expect(result).to.equal({
        activeNavBar: 'manage',
        error: null,
        filter: {
          filterNotificationTypes: [
            'ad-hoc-reminders',
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
            adHocReminders: true,
            legacyNotifications: true,
            returnInvitation: true,
            returnReminders: true,
            returnsPaperForm: true,
            waterAbstractionAlertReduce: true,
            waterAbstractionAlertResume: true,
            waterAbstractionAlertStop: true,
            waterAbstractionAlertWarning: true
          },
          sentFromDay: '31',
          sentFromMonth: '12',
          sentFromYear: '2023',
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
        pagination: {
          numberOfPages: 1
        },
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
