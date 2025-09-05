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
      session = { referenceCode: 'RINV-CPFRQ4' }
    })

    it('returns page data for the view', () => {
      const result = ContactTypePresenter.go(session)k

      expect(result).to.equal({
        backLink: {
          href: `/system/notices/setup/${session.id}/select-recipients`,
          text: 'Back'
        },
        email: null,
        name: null,
        pageTitle: 'Select how to contact the recipient',
        pageTitleCaption: 'Notice RINV-CPFRQ4',
        type: null
      })
    })
  })

  describe('when called with an email address', () => {
    beforeEach(() => {
      session = {
        email: 'test@test.gov.uk',
        contactType: 'email',
        referenceCode: 'RINV-CPFRQ4'
      }
    })

    it('returns page data for the view', () => {
      const result = ContactTypePresenter.go(session)

      expect(result).to.equal({
        backLink: {
          href: `/system/notices/setup/${session.id}/select-recipients`,
          text: 'Back'
        },
        email: 'test@test.gov.uk',
        name: null,
        pageTitle: 'Select how to contact the recipient',
        pageTitleCaption: 'Notice RINV-CPFRQ4',
        type: 'email'
      })
    })
  })

  describe('when called with a name', () => {
    beforeEach(() => {
      session = {
        contactName: 'Fake Person',
        contactType: 'post',
        referenceCode: 'RINV-CPFRQ4'
      }
    })

    it('returns page data for the view', () => {
      const result = ContactTypePresenter.go(session)

      expect(result).to.equal({
        backLink: {
          href: `/system/notices/setup/${session.id}/select-recipients`,
          text: 'Back'
        },
        email: null,
        name: 'Fake Person',
        pageTitle: 'Select how to contact the recipient',
        pageTitleCaption: 'Notice RINV-CPFRQ4',
        type: 'post'
      })
    })
  })
})
