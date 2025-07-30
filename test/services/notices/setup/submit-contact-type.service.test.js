'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitContactTypeService = require('../../../../app/services/notices/setup/submit-contact-type.service.js')

describe('Contact Type Service', () => {
  let payload
  let session
  let sessionData

  describe('when called with a valid email payload', () => {
    beforeEach(async () => {
      payload = {
        type: 'email',
        email: 'test@test.gov.uk'
      }
      sessionData = {}

      session = await SessionHelper.add({ data: sessionData })
    })

    it('saves the submitted value', async () => {
      await SubmitContactTypeService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.contactType.type).to.equal(payload.type)
      expect(refreshedSession.contactType.email).to.equal(payload.email)
    })

    it('continues the journey', async () => {
      const result = await SubmitContactTypeService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when called with a valid post payload', () => {
    beforeEach(async () => {
      payload = {
        type: 'post',
        name: 'Fake Name'
      }
      sessionData = {}

      session = await SessionHelper.add({ data: sessionData })
    })

    it('saves the submitted value', async () => {
      await SubmitContactTypeService.go(session.id, payload)

      const refreshedSession = await session.$query()

      expect(refreshedSession.contactType.type).to.equal(payload.type)
      expect(refreshedSession.contactType.name).to.equal(payload.name)
    })

    it('continues the journey', async () => {
      const result = await SubmitContactTypeService.go(session.id, payload)

      expect(result).to.equal({})
    })
  })

  describe('when validation fails because no type is selected', () => {
    beforeEach(async () => {
      payload = {}
      sessionData = {}

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitContactTypeService.go(session.id, payload)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: `/system/notices/setup/${session.id}/select-recipients`,
        email: null,
        error: {
          errorList: [
            {
              href: '#type',
              text: 'Select how to contact the recipient'
            }
          ],
          type: 'Select how to contact the recipient'
        },
        name: null,
        pageTitle: 'Select how to contact the recipient',
        type: null
      })
    })
  })

  describe('when validation fails because type is email but no email is entered', () => {
    beforeEach(async () => {
      payload = {
        type: 'email'
      }
      sessionData = {}

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitContactTypeService.go(session.id, payload)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: `/system/notices/setup/${session.id}/select-recipients`,
        email: null,
        error: {
          errorList: [
            {
              href: '#email',
              text: 'Enter an email address'
            }
          ],
          email: 'Enter an email address'
        },
        name: null,
        pageTitle: 'Select how to contact the recipient',
        type: 'email'
      })
    })
  })

  describe('when validation fails because type is post but no name is entered', () => {
    beforeEach(async () => {
      payload = {
        type: 'post'
      }
      sessionData = {}

      session = await SessionHelper.add({ data: sessionData })
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitContactTypeService.go(session.id, payload)

      expect(result).to.equal({
        activeNavBar: 'manage',
        backLink: `/system/notices/setup/${session.id}/select-recipients`,
        email: null,
        error: {
          errorList: [
            {
              href: '#name',
              text: 'Enter the recipients name'
            }
          ],
          name: 'Enter the recipients name'
        },
        name: null,
        pageTitle: 'Select how to contact the recipient',
        type: 'post'
      })
    })
  })
})
