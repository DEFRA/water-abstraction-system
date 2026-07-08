'use strict'

// Thing under test
const ContactTypePresenter = require('../../../../app/presenters/notices/setup/contact-type.presenter.js')

describe('Notices - Setup - Contact Type presenter', () => {
  let session

  describe('when called with no session data', () => {
    beforeEach(() => {
      session = { referenceCode: 'RINV-CPFRQ4' }
    })

    it('returns page data for the view', () => {
      const result = ContactTypePresenter(session)

      expect(result).toEqual({
        backLink: {
          href: `/system/notices/setup/${session.id}/select-recipients`,
          text: 'Back'
        },
        contactEmail: null,
        contactName: null,
        contactType: null,
        pageTitle: 'Select how to contact the recipient',
        pageTitleCaption: 'Notice RINV-CPFRQ4'
      })
    })
  })

  describe('when called with an email address', () => {
    beforeEach(() => {
      session = {
        contactEmail: 'test@test.gov.uk',
        contactType: 'email',
        referenceCode: 'RINV-CPFRQ4'
      }
    })

    it('returns page data for the view', () => {
      const result = ContactTypePresenter(session)

      expect(result).toEqual({
        backLink: {
          href: `/system/notices/setup/${session.id}/select-recipients`,
          text: 'Back'
        },
        contactEmail: 'test@test.gov.uk',
        contactName: null,
        contactType: 'email',
        pageTitle: 'Select how to contact the recipient',
        pageTitleCaption: 'Notice RINV-CPFRQ4'
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
      const result = ContactTypePresenter(session)

      expect(result).toEqual({
        backLink: {
          href: `/system/notices/setup/${session.id}/select-recipients`,
          text: 'Back'
        },
        contactEmail: null,
        contactName: 'Fake Person',
        contactType: 'post',
        pageTitle: 'Select how to contact the recipient',
        pageTitleCaption: 'Notice RINV-CPFRQ4'
      })
    })
  })
})
