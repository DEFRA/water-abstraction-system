'use strict'

// Test helpers
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const CancelPresenter = require('../../../../../app/presenters/users/internal/setup/cancel.presenter.js')

describe('Users - Internal - Setup - Cancel Presenter', () => {
  let session

  beforeEach(() => {
    session = { email: 'bob.bobbles@environment-agency.gov.uk', id: generateUUID(), permission: 'billing_and_data' }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = CancelPresenter.go(session)

      expect(result).toEqual({
        activeNavBar: 'users',
        backLink: {
          href: `/system/users/internal/setup/${session.id}/check`,
          text: 'Back'
        },
        email: session.email,
        pageTitle: 'You are about to cancel this user',
        pageTitleCaption: 'Internal',
        permission: 'Billing and Data'
      })
    })
  })
})
