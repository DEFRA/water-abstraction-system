// Test framework dependencies

// Test helpers
import * as RecipientsFixture from '../../../support/fixtures/recipients.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateNoticeReferenceCode } from '../../../../app/lib/general.lib.js'

// Test helpers
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import FetchRecipientsService from '../../../../app/services/notices/setup/fetch-recipients.service.js'
import FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitSelectRecipientsService from '../../../../app/services/notices/setup/submit-select-recipients.service.js'

describe('Notices - Setup - Submit Select Recipients service', () => {
  let payload
  let recipients
  let referenceCode
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    payload = { recipients: ['123'] }

    referenceCode = generateNoticeReferenceCode('RINV-')

    sessionData = { referenceCode }

    session = SessionModelStub(sessionData)

    vi.mock('../../../../app/dal/fetch-session.dal.js')
    FetchSessionDal.mockResolvedValue(session)

    recipients = RecipientsFixture.recipients()

    vi.mock('../../../../app/services/notices/setup/fetch-recipients.service.js')
    FetchRecipientsService.mockResolvedValue([recipients.primaryUser])

    yarStub = YarStub()
    yarStub.flash.mockReturnValue([{ title: 'Test', text: 'Notification' }])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitSelectRecipientsService(session.id, payload, yarStub)

      expect(session.selectedRecipients).toEqual(['123'])
      expect(session.$update.called).toBe(true)
    })

    it('sets a flash message', async () => {
      await SubmitSelectRecipientsService(session.id, payload, yarStub)

      // Check we add the flash message
      const [flashType, bannerMessage] = yarStub.flash.mock.calls[0]

      expect(flashType).toEqual('notification')
      expect(bannerMessage).toEqual({
        text: 'The recipients have been changed. Check details before sending invitations.',
        titleText: 'Updated'
      })
    })

    it('continues the journey', async () => {
      const result = await SubmitSelectRecipientsService(session.id, payload, yarStub)

      expect(result).toEqual({})
    })
  })

  describe('when validation fails', () => {
    describe('because there are no recipients', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view, with errors', async () => {
        const result = await SubmitSelectRecipientsService(session.id, payload, yarStub)

        expect(result).toEqual({
          backLink: {
            href: `/system/notices/setup/${session.id}/check`,
            text: 'Back'
          },
          error: {
            errorList: [
              {
                href: '#recipients',
                text: 'Select at least one recipient'
              }
            ],
            recipients: {
              text: 'Select at least one recipient'
            }
          },

          pageTitle: 'Select Recipients',
          pageTitleCaption: `Notice ${referenceCode}`,
          recipients: [
            {
              checked: false,
              contact: [recipients.primaryUser.email],
              contact_hash_id: recipients.primaryUser.contact_hash_id
            }
          ],
          setupAddress: {
            href: `/system/notices/setup/${session.id}/contact-type`,
            text: 'Set up a single use address or email address'
          }
        })
      })
    })
  })
})
