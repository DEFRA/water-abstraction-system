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
      sessionData = {}

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view', async () => {
      const result = await ContactTypeService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: `/system/notices/setup/${session.id}/select-recipients`,
        email: null,
        name: null,
        pageTitle: 'Select how to contact the recipient',
        type: null
      })
    })
  })

  describe('when called with a saved name', () => {
    beforeEach(async () => {
      sessionData = {
        name: 'Fake Person',
        contactType: 'post'
      }

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view', async () => {
      const result = await ContactTypeService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: `/system/notices/setup/${session.id}/select-recipients`,
        email: null,
        name: 'Fake Person',
        pageTitle: 'Select how to contact the recipient',
        type: 'post'
      })
    })
  })
})
