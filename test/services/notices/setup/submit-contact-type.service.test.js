// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test framework dependencies
import crypto from 'crypto'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import SubmitContactTypeService from '../../../../src/services/notices/setup/submit-contact-type.service.js'

describe('Notices - Setup - Submit Contact Type service', () => {
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

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called with a valid', () => {
    beforeEach(() => {})

    describe('email payload', () => {
      beforeEach(() => {
        payload = {
          contactEmail: 'test@test.gov.uk',
          contactType: 'email'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitContactTypeService(session.id, payload, yarStub)

        expect(session.contactType).toBeUndefined()
        expect(session.additionalRecipients).toEqual([
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
        expect(session.$update).toHaveBeenCalled()
      })

      it('saves the recipients "contact_hash_id" to the sessions "selectedRecipients" array', async () => {
        await SubmitContactTypeService(session.id, payload, yarStub)

        expect(session.selectedRecipients).toEqual(['123', _createMD5Hash(payload.contactEmail)])
      })

      it('continues the journey', async () => {
        const result = await SubmitContactTypeService(session.id, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('notification')
        expect(bannerMessage).toEqual({ text: 'Additional recipient added', titleText: 'Updated' })

        expect(result).toEqual({
          contactType: 'email'
        })
      })
    })

    describe('email payload with no existing additionalRecipients', () => {
      beforeEach(() => {
        payload = {
          contactEmail: 'test@test.gov.uk',
          contactType: 'email'
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactTypeService(session.id, payload, yarStub)

        expect(session.contactType).toBeUndefined()
        expect(session.additionalRecipients).toEqual([
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
        const result = await SubmitContactTypeService(session.id, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('notification')
        expect(bannerMessage).toEqual({ text: 'Additional recipient added', titleText: 'Updated' })

        expect(result).toEqual({
          contactType: 'email'
        })
      })
    })

    describe('email payload with no existing additionalRecipients with the address capitalised', () => {
      beforeEach(() => {
        payload = {
          contactEmail: 'TEST@TEST.GOV.UK',
          contactType: 'email'
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value with the email address in lowercase', async () => {
        await SubmitContactTypeService(session.id, payload, yarStub)

        expect(session.contactType).toBeUndefined()
        expect(session.additionalRecipients).toEqual([
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
        const result = await SubmitContactTypeService(session.id, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('notification')
        expect(bannerMessage).toEqual({ text: 'Additional recipient added', titleText: 'Updated' })

        expect(result).toEqual({
          contactType: 'email'
        })
      })
    })

    describe('email payload with an existing additionalRecipients', () => {
      beforeEach(() => {
        payload = {
          contactEmail: 'other.test@test.gov.uk',
          contactType: 'email'
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

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactTypeService(session.id, payload, yarStub)

        expect(session.contactType).toBeUndefined()
        expect(session.additionalRecipients).toEqual([
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
        const result = await SubmitContactTypeService(session.id, payload, yarStub)

        const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('notification')
        expect(bannerMessage).toEqual({ text: 'Additional recipient added', titleText: 'Updated' })

        expect(result).toEqual({
          contactType: 'email'
        })
      })
    })

    describe('post payload', () => {
      beforeEach(() => {
        payload = {
          contactName: 'Fake Name',
          contactType: 'post'
        }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('saves the submitted value', async () => {
        await SubmitContactTypeService(session.id, payload, yarStub)

        expect(session.contactType).toEqual(payload.contactType)
        expect(session.contactName).toEqual(payload.contactName)
      })

      it('continues the journey', async () => {
        const result = await SubmitContactTypeService(session.id, payload, yarStub)

        expect(yarStub.flash).not.toHaveBeenCalled()
        expect(result).toEqual({
          contactType: 'post'
        })
      })
    })
  })

  describe('when validation fails', () => {
    describe('when validation fails because no type is selected', () => {
      beforeEach(() => {
        sessionData = { referenceCode: 'RINV-CPFRQ4' }

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitContactTypeService(session.id, payload, yarStub)

        expect(result).toEqual({
          activeNavBar: 'notices',
          backLink: {
            href: `/system/notices/setup/${session.id}/select-recipients`,
            text: 'Back'
          },
          contactEmail: null,
          contactName: null,
          contactType: null,
          error: {
            contactType: {
              text: 'Select how to contact the recipient'
            },
            errorList: [
              {
                href: '#contactType',
                text: 'Select how to contact the recipient'
              }
            ]
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

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitContactTypeService(session.id, payload, yarStub)

        expect(result).toEqual({
          activeNavBar: 'notices',
          backLink: {
            href: `/system/notices/setup/${session.id}/select-recipients`,
            text: 'Back'
          },
          contactEmail: null,
          contactName: null,
          contactType: 'email',
          error: {
            contactEmail: {
              text: 'Enter an email address'
            },
            errorList: [
              {
                href: '#contactEmail',
                text: 'Enter an email address'
              }
            ]
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

        session = SessionModelStub(sessionData)

        vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitContactTypeService(session.id, payload, yarStub)

        expect(result).toEqual({
          activeNavBar: 'notices',
          backLink: {
            href: `/system/notices/setup/${session.id}/select-recipients`,
            text: 'Back'
          },
          contactEmail: null,
          contactName: null,
          contactType: 'post',
          error: {
            contactName: {
              text: 'Enter the recipients name'
            },
            errorList: [
              {
                href: '#contactName',
                text: 'Enter the recipients name'
              }
            ]
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
