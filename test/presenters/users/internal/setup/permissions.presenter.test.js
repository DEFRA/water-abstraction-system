'use strict'

// Test helpers
const { generateUUID } = require('../../../../../app/lib/general.lib.js')

// Thing under test
const PermissionsPresenter = require('../../../../../app/presenters/users/internal/setup/permissions.presenter.js')

describe('Users - Internal - Setup - Permissions Presenter', () => {
  let session

  beforeEach(() => {
    session = { id: generateUUID(), permission: 'super' }
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = PermissionsPresenter.go(session)

      expect(result).toEqual({
        activeNavBar: 'users',
        backLink: {
          href: `/system/users/internal/setup/${session.id}/email`,
          text: 'Back'
        },
        pageTitle: 'Select permissions for the user',
        pageTitleCaption: 'Internal',
        permission: 'super'
      })
    })

    describe('"backLink" property', () => {
      describe('when check page has not been visited', () => {
        it('returns the correct back link', () => {
          const result = PermissionsPresenter.go(session)

          expect(result.backLink.href).toEqual(`/system/users/internal/setup/${session.id}/email`)
        })
      })

      describe('when check page has been visited', () => {
        beforeEach(() => {
          session.checkPageVisited = true
        })

        it('returns the correct back link', () => {
          const result = PermissionsPresenter.go(session)

          expect(result.backLink.href).toEqual(`/system/users/internal/setup/${session.id}/check`)
        })
      })
    })
  })
})
