'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')
const crypto = require('crypto')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionModelStub = require('../../../support/stubs/session.stub.js')

// Things we need to stub
const FetchSessionDal = require('../../../../app/dal/fetch-session.dal.js')

// Thing under test
const SubmitContactTypeService = require('../../../../app/services/notices/setup/submit-contact-type.service.js')

describe('Notices - Setup - Submit Contact Type service', () => {
  let fetchSessionStub
  let payload
  let session
  let sessionData
  let yarStub

  const testEmailHash = _createMD5Hash('test@test.gov.uk')

  beforeEach(() => {
    payload = {}

    sessionData = {
      licenceRef: '12345',
      selectedRecipients: ['123']
    }

    session = SessionModelStub.build(Sinon, sessionData)

    fetchSessionStub = Sinon.stub(FetchSessionDal, 'go').resolves(session)

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called with a valid', () => {
    beforeEach(() => {})

    describe('email payload', () => {
      beforeEach(() => {
        payload = {
          contactType: 'email',
          contactEmail: 'test@test.gov.uk'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitContactTypeService.go(session.id, payload, yarStub)

        expect(session.contactType).to.equal(undefined)
        expect(session.additionalRecipients).to.equal([
          {
            contact: null,
            contact_hash_id: _createMD5Hash(payload.contactEmail),
            contact_type: 'single use',
            email: payload.contactEmail,
            licence_ref: session.licenceRef,
            licence_refs: [session.licenceRef],
            message_type: 'Email'
          }
        ])
        expect(session.$update.called).to.be.true()
      })

      it('saves the recipients "contact_hash_id" to the sessions "selectedRecipients" array', async () => {
        await SubmitContactTypeService.go(session.id, payload, yarStub)

        expect(session.selectedRecipients).to.equal(['123', _createMD5Hash(payload.contactEmail)])
      })

      it('continues the journey', async () => {
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(bannerMessage).to.equal({ titleText: 'Updated', text: 'Additional recipient added' })

        expect(result).to.equal({
          contactType: 'email'
        })
      })
    })

    describe('email payload with no existing additionalRecipients', () => {
      beforeEach(() => {
        payload = {
          contactType: 'email',
          contactEmail: 'test@test.gov.uk'
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactTypeService.go(session.id, payload, yarStub)

        expect(session.contactType).to.equal(undefined)
        expect(session.additionalRecipients).to.equal([
          {
            contact: null,
            contact_hash_id: _createMD5Hash(payload.contactEmail),
            contact_type: 'single use',
            email: payload.contactEmail,
            licence_ref: session.licenceRef,
            licence_refs: [session.licenceRef],
            message_type: 'Email'
          }
        ])
      })

      it('continues the journey', async () => {
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(bannerMessage).to.equal({ titleText: 'Updated', text: 'Additional recipient added' })

        expect(result).to.equal({
          contactType: 'email'
        })
      })
    })

    describe('email payload with no existing additionalRecipients with the address capitalised', () => {
      beforeEach(() => {
        payload = {
          contactType: 'email',
          contactEmail: 'TEST@TEST.GOV.UK'
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the submitted value with the email address in lowercase', async () => {
        await SubmitContactTypeService.go(session.id, payload, yarStub)

        expect(session.contactType).to.equal(undefined)
        expect(session.additionalRecipients).to.equal([
          {
            contact: null,
            contact_hash_id: testEmailHash,
            contact_type: 'single use',
            email: 'test@test.gov.uk',
            licence_ref: session.licenceRef,
            licence_refs: [session.licenceRef],
            message_type: 'Email'
          }
        ])
      })

      it('continues the journey', async () => {
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(bannerMessage).to.equal({ titleText: 'Updated', text: 'Additional recipient added' })

        expect(result).to.equal({
          contactType: 'email'
        })
      })
    })

    describe('email payload with an existing additionalRecipients', () => {
      beforeEach(() => {
        payload = {
          contactType: 'email',
          contactEmail: 'other.test@test.gov.uk'
        }

        sessionData.additionalRecipients = [
          {
            contact: null,
            contact_hash_id: testEmailHash,
            contact_type: 'single use',
            email: 'test@test.gov.uk',
            licence_ref: session.licenceRef,
            licence_refs: [session.licenceRef],
            message_type: 'Email'
          }
        ]

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactTypeService.go(session.id, payload, yarStub)

        expect(session.contactType).to.equal(undefined)
        expect(session.additionalRecipients).to.equal([
          {
            contact: null,
            contact_hash_id: testEmailHash,
            contact_type: 'single use',
            email: 'test@test.gov.uk',
            licence_ref: session.licenceRef,
            licence_refs: [session.licenceRef],
            message_type: 'Email'
          },
          {
            contact: null,
            contact_hash_id: _createMD5Hash(payload.contactEmail),
            contact_type: 'single use',
            email: payload.contactEmail,
            licence_ref: session.licenceRef,
            licence_refs: [session.licenceRef],
            message_type: 'Email'
          }
        ])
      })

      it('continues the journey', async () => {
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.args[0]

        expect(flashType).to.equal('notification')
        expect(bannerMessage).to.equal({ titleText: 'Updated', text: 'Additional recipient added' })

        expect(result).to.equal({
          contactType: 'email'
        })
      })
    })

    describe('post payload', () => {
      beforeEach(() => {
        payload = {
          contactType: 'post',
          contactName: 'Fake Name'
        }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactTypeService.go(session.id, payload, yarStub)

        expect(session.contactType).to.equal(payload.contactType)
        expect(session.contactName).to.equal(payload.contactName)
      })

      it('continues the journey', async () => {
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

        expect(yarStub.flash.called).to.be.false()
        expect(result).to.equal({
          contactType: 'post'
        })
      })
    })
  })

  describe('when validation fails', () => {
    describe('when validation fails because no type is selected', () => {
      beforeEach(() => {
        sessionData = { referenceCode: 'RINV-CPFRQ4' }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          activeNavBar: 'notices',
          backLink: {
            href: `/system/notices/setup/${session.id}/select-recipients`,
            text: 'Back'
          },
          contactEmail: null,
          contactName: null,
          contactType: null,
          error: {
            errorList: [
              {
                href: '#contactType',
                text: 'Select how to contact the recipient'
              }
            ],
            contactType: {
              text: 'Select how to contact the recipient'
            }
          },
          pageTitle: 'Select how to contact the recipient',
          pageTitleCaption: 'Notice RINV-CPFRQ4'
        })
      })
    })

    describe('when validation fails because type is email but no email is entered', () => {
      beforeEach(() => {
        payload = {
          contactType: 'email'
        }

        sessionData = { referenceCode: 'RINV-CPFRQ4' }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          activeNavBar: 'notices',
          backLink: {
            href: `/system/notices/setup/${session.id}/select-recipients`,
            text: 'Back'
          },
          contactEmail: null,
          contactName: null,
          contactType: 'email',
          error: {
            errorList: [
              {
                href: '#contactEmail',
                text: 'Enter an email address'
              }
            ],
            contactEmail: {
              text: 'Enter an email address'
            }
          },
          pageTitle: 'Select how to contact the recipient',
          pageTitleCaption: 'Notice RINV-CPFRQ4'
        })
      })
    })

    describe('when validation fails because type is post but no name is entered', () => {
      beforeEach(() => {
        payload = {
          contactType: 'post'
        }

        sessionData = { referenceCode: 'RINV-CPFRQ4' }

        session = SessionModelStub.build(Sinon, sessionData)

        fetchSessionStub.resolves(session)
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitContactTypeService.go(session.id, payload, yarStub)

        expect(result).to.equal({
          activeNavBar: 'notices',
          backLink: {
            href: `/system/notices/setup/${session.id}/select-recipients`,
            text: 'Back'
          },
          contactEmail: null,
          contactName: null,
          contactType: 'post',
          error: {
            errorList: [
              {
                href: '#contactName',
                text: 'Enter the recipients name'
              }
            ],
            contactName: {
              text: 'Enter the recipients name'
            }
          },
          pageTitle: 'Select how to contact the recipient',
          pageTitleCaption: 'Notice RINV-CPFRQ4'
        })
      })
    })
  })
})

function _createMD5Hash(email) {
  return crypto.createHash('md5').update(email).digest('hex')
}
