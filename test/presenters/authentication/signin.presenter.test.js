'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const SigninPresenter = require('../../../app/presenters/authentication/signin.presenter.js')

describe('Signin Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = SigninPresenter.go(session)

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
