'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ContactTypeService = require('../../../../app/services/notices/setup/contact-type.service.js')

describe('Notices - Setup - Contact Type Service', () => {
  let session
  let sessionData

  describe('when called with no saved data', () => {
    beforeEach(async () => {
      sessionData = { referenceCode: 'RINV-CPFRQ4' }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view', async () => {
      const result = await ContactTypeService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
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

  describe('when called with a saved name', () => {
    beforeEach(async () => {
      sessionData = {
        contactName: 'Fake Person',
        contactType: 'post',
        referenceCode: 'RINV-CPFRQ4'
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view', async () => {
      const result = await ContactTypeService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
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

  describe('when called with a saved email', () => {
    beforeEach(async () => {
      sessionData = {
        contactEmail: 'fake@person.com',
        contactType: 'email',
        referenceCode: 'RINV-CPFRQ4'
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view', async () => {
      const result = await ContactTypeService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: {
          href: `/system/notices/setup/${session.id}/select-recipients`,
          text: 'Back'
        },
        contactEmail: 'fake@person.com',
        contactName: null,
        contactType: 'email',
        pageTitle: 'Select how to contact the recipient',
        pageTitleCaption: 'Notice RINV-CPFRQ4'
      })
    })
  })
})
