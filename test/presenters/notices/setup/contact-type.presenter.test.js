'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Thing under test
const ContactTypePresenter = require('../../../../app/presenters/notices/setup/contact-type.presenter.js')

describe('Contact Type Presenter', () => {
  let session

  describe('when called with no session data', () => {
    beforeEach(() => {
      session = {}
    })

    it('returns page data for the view', () => {
      const result = ContactTypePresenter.go(session)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/select-recipients`,
        email: null,
        name: null,
        pageTitle: 'Select how to contact the recipient',
        type: null
      })
    })
  })

  describe('when called with an email address', () => {
    beforeEach(() => {
      session = {
        email: 'test@test.gov.uk',
        contactType: 'email'
      }
    })

    it('returns page data for the view', () => {
      const result = ContactTypePresenter.go(session)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/select-recipients`,
        email: 'test@test.gov.uk',
        name: null,
        pageTitle: 'Select how to contact the recipient',
        type: 'email'
      })
    })
  })

  describe('when called with a name', () => {
    beforeEach(() => {
      session = {
        name: 'Fake Person',
        contactType: 'post'
      }
    })

    it('returns page data for the view', () => {
      const result = ContactTypePresenter.go(session)

      expect(result).to.equal({
        backLink: `/system/notices/setup/${session.id}/select-recipients`,
        email: null,
        name: 'Fake Person',
        pageTitle: 'Select how to contact the recipient',
        type: 'post'
      })
    })
  })
})
