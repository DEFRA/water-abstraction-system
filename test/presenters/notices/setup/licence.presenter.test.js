'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const LicencePresenter = require('../../../../app/presenters/notices/setup/licence.presenter.js')

describe('Notices - Setup - Licence presenter', () => {
  let session

  beforeEach(() => {
    session = { id: '123' }
  })

  it('correctly presents the data', () => {
    const result = LicencePresenter.go(session)

    expect(result).to.equal({
      backLink: '/manage',
      licenceRef: null,
      pageTitle: 'Enter a licence number'
    })
  })

  describe('where the user has previously entered a licence ref', () => {
    beforeEach(() => {
      session.licenceRef = '01/111'
    })

    it('correctly presents the data', () => {
      const result = LicencePresenter.go(session)

      expect(result).to.equal({
        backLink: '/manage',
        licenceRef: '01/111',
        pageTitle: 'Enter a licence number'
      })
    })

    describe('and the page has been visited', () => {
      beforeEach(() => {
        session.checkPageVisited = true
      })

      it('correctly set the back link to the check page', () => {
        const result = LicencePresenter.go(session)

        expect(result.backLink).to.equal('/system/notices/setup/123/check-notice-type')
      })
    })
  })
})
