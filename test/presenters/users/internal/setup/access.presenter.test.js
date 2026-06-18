'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

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
      const result = AccessPresenter.go(session)

      expect(result).to.equal({
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
