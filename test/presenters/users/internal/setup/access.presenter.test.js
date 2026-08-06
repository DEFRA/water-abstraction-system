// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { generateUUID } from 'water-abstraction-engine/test/generators.js'

// Thing under test
import AccessPresenter from '../../../../../src/presenters/users/internal/setup/access.presenter.js'

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
