'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const NotificationsIndexPresenter = require('../../../app/presenters/notifications/index-notifications.presenter.js')

describe('View Notifications presenter', () => {
  describe('when the "data" is empty and there are no filters or validation results', () => {
    it('returns the correct information', () => {
      const result = NotificationsIndexPresenter.go([])

      expect(result).to.equal({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [],
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when there is some "data"', () => {
    it('returns it formatted for display on the page', () => {
      const result = NotificationsIndexPresenter.go([
        {
          id: '809aa951-e5eb-4300-8492-9e0f2bcb5b98',
          createdAt: new Date('2025-02-21T14:52:18.000Z'),
          issuer: 'billing.data@wrls.gov.uk',
          name: 'Paper returns',
          alertType: null,
          recipientCount: 1,
          errorCount: 0
        }
      ])

      expect(result).to.equal({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            {
              text: '21 February 2025'
            },
            {
              html: '<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>'
            },
            {
              text: 'billing.data@wrls.gov.uk'
            },
            {
              format: 'numeric',
              text: 1
            },
            {
              html: ''
            }
          ]
        ],
        pageTitle: 'View sent notices'
      })
    })
  })

  describe('when there is some "data" with an error', () => {
    it('returns it formatted for display on the page', () => {
      const result = NotificationsIndexPresenter.go([
        {
          id: '809aa951-e5eb-4300-8492-9e0f2bcb5b98',
          createdAt: new Date('2025-02-21T14:52:18.000Z'),
          issuer: 'billing.data@wrls.gov.uk',
          name: 'Paper returns',
          alertType: null,
          recipientCount: 1,
          errorCount: 1
        }
      ])

      expect(result).to.equal({
        backLink: '/manage',
        headers: _tableHeaders(),
        rows: [
          [
            {
              text: '21 February 2025'
            },
            {
              html: '<a href="/notifications/report/809aa951-e5eb-4300-8492-9e0f2bcb5b98">Paper returns</a>'
            },
            {
              text: 'billing.data@wrls.gov.uk'
            },
            {
              format: 'numeric',
              text: 1
            },
            {
              html: `<strong class="govuk-tag govuk-tag--orange">ERROR</strong>`
            }
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
