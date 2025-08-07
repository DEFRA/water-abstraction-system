'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const crypto = require('crypto')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitContactTypeService = require('../../../../app/services/notices/setup/submit-contact-type.service.js')

describe('Notices - Setup - Submit Contact Type Service', () => {
  let payload
  let session
  let sessionData
  let yarStub

  const testEmailHash = _createMD5Hash('test@test.gov.uk')

  beforeEach(() => {
    yarStub = { flash: Sinon.stub().returns([{ title: 'Test', text: 'Notification' }]) }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a valid', () => {
    beforeEach(() => {
      sessionData = {
        selectedRecipients: ['123']
      }
    })

    describe('email payload', () => {
      beforeEach(async () => {
        payload = {
          type: 'email',
          email: 'test@test.gov.uk'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitContactTypeService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactType).to.equal(undefined)
        expect(refreshedSession.additionalRecipients).to.equal([
          {
            contact_hash_id: _createMD5Hash(payload.email),
            email: payload.email
          }
        ])
      })

      it('saves the recipients "contact_hash_id" to the sessions "selectedRecipients" array', async () => {
        await SubmitContactTypeService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.selectedRecipients).to.equal(['123', _createMD5Hash(payload.email)])
      })

      it('continues the journey', async () => {
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          type: 'email'
        })
      })
    })

    describe('email payload with no existing additionalRecipients', () => {
      beforeEach(async () => {
        payload = {
          type: 'email',
          email: 'test@test.gov.uk'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitContactTypeService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactType).to.equal(undefined)
        expect(refreshedSession.additionalRecipients).to.equal([
          {
            contact_hash_id: _createMD5Hash(payload.email),
            email: payload.email
          }
        ])
      })

      it('continues the journey', async () => {
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          type: 'email'
        })
      })
    })

    describe('email payload with no existing additionalRecipients with the address capitalised', () => {
      beforeEach(async () => {
        payload = {
          type: 'email',
          email: 'TEST@TEST.GOV.UK'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value with the email address in lowercase', async () => {
        await SubmitContactTypeService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactType).to.equal(undefined)
        expect(refreshedSession.additionalRecipients).to.equal([
          {
            contact_hash_id: testEmailHash,
            email: 'test@test.gov.uk'
          }
        ])
      })

      it('continues the journey', async () => {
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          type: 'email'
        })
      })
    })

    describe('email payload with an existing additionalRecipients', () => {
      beforeEach(async () => {
        payload = {
          type: 'email',
          email: 'other.test@test.gov.uk'
        }

        sessionData.additionalRecipients = [
          {
            contact_hash_id: testEmailHash,
            email: 'test@test.gov.uk'
          }
        ]

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitContactTypeService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactType).to.equal(undefined)
        expect(refreshedSession.additionalRecipients).to.equal([
          {
            contact_hash_id: testEmailHash,
            email: 'test@test.gov.uk'
          },
          {
            contact_hash_id: _createMD5Hash(payload.email),
            email: payload.email
          }
        ])
      })

      it('continues the journey', async () => {
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          type: 'email'
        })
      })
    })

    describe('post payload', () => {
      beforeEach(async () => {
        payload = {
          type: 'post',
          name: 'Fake Name'
        }

        session = await SessionHelper.add({ data: sessionData })
      })

      it('saves the submitted value', async () => {
        await SubmitContactTypeService.go(session.id, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.contactType).to.equal(payload.type)
        expect(refreshedSession.name).to.equal(payload.name)
      })

      it('continues the journey', async () => {
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          type: 'post'
        })
      })
    })
  })

  describe('when validation fails', () => {
    describe('when validation fails because no type is selected', () => {
      beforeEach(async () => {
        payload = {}
        sessionData = {}

        session = await SessionHelper.add({ data: sessionData })
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

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
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

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
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

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
})

function _createMD5Hash(email) {
  return crypto.createHash('md5').update(email).digest('hex')
}
