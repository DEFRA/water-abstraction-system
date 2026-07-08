'use strict'

// Test helpers
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const AccessPresenter = require('../../../../../app/presenters/users/internal/setup/access.presenter.js')

describe('Users - Internal - Setup - Access Presenter', () => {
  let session

  beforeEach(() => {
    session = { access: 'enabled', id: generateUUID() }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = AccessPresenter(session)

      expect(result).toEqual({
        access: 'enabled',
        activeNavBar: 'users',
        backLink: {
          href: `/system/users/internal/setup/${session.id}/check`,
          text: 'Back'
        },
        pageTitle: 'Select access for the user',
        pageTitleCaption: 'Internal'
      })
    })
  })
})
