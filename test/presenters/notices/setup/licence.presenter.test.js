'use strict'

// Test helpers
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')

// Thing under test
const LicencePresenter = require('../../../../app/presenters/notices/setup/licence.presenter.js')

describe('Notices - Setup - Licence presenter', () => {
  let session

  beforeEach(() => {
    session = { id: generateUUID() }
  })

  it('correctly presents the data', () => {
    const result = LicencePresenter.go(session)

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
      const result = LicencePresenter.go(session)

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
        const result = LicencePresenter.go(session)

        expect(result.backLink).toEqual({
          href: `/system/notices/setup/${session.id}/check-notice-type`,
          text: 'Back'
        })
      })
    })
  })
})
