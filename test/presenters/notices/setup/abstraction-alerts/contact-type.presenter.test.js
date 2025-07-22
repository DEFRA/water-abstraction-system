'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ContactTypePresenter = require('../../../../../app/presenters/notices/setup/abstraction-alerts/contact-type.presenter.js')

describe('Contact Type Presenter', () => {
  let session

  beforeEach(() => {
    session = {}
  })

  describe('when called', () => {
    it('returns page data for the view', () => {
      const result = ContactTypePresenter.go(session)

      expect(result).to.equal({})
    })
  })
})
