'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SignedOutPresenter = require('../../../app/presenters/authentication/signed-out.presenter.js')

describe('Signed Out Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = SignedOutPresenter.go(session)

      expect(result).to.equal({
        backLink: {
          href: '',
          text: 'Back'
        },
        pageTitle: ''
      })
    })
  })
})
