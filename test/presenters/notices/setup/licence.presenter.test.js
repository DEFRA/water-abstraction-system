// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import { generateLicenceRef, generateUUID } from '../../../support/generators.js'

// Thing under test
import LicencePresenter from '../../../../app/presenters/notices/setup/licence.presenter.js'

describe('Notices - Setup - Licence presenter', () => {
  let session

  beforeEach(() => {
    session = { id: generateUUID() }
  })

  it('correctly presents the data', () => {
    const result = LicencePresenter(session)

    expect(result).toEqual({
      backLink: {
        href: `/system/notices/setup/${session.id}/notice-type`,
        text: 'Back'
      },
      licenceRef: null,
      pageTitle: 'Enter a licence number'
    })
  })

  describe('where the user has previously entered a licence ref', () => {
    let licenceRef

    beforeEach(() => {
      licenceRef = generateLicenceRef()

      session.licenceRef = licenceRef
    })

    it('correctly presents the data', () => {
      const result = LicencePresenter(session)

      expect(result).toEqual({
        backLink: {
          href: `/system/notices/setup/${session.id}/notice-type`,
          text: 'Back'
        },
        licenceRef,
        pageTitle: 'Enter a licence number'
      })
    })

    describe('and the page has been visited', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('correctly set the back link to the check page', () => {
        const result = LicencePresenter(session)

        expect(result.backLink).toEqual({
          href: `/system/notices/setup/${session.id}/check-notice-type`,
          text: 'Back'
        })
      })
    })
  })
})
