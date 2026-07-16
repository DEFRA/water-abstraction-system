// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import RecipientsFixture from '../../../support/fixtures/recipients.fixture.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { generateNoticeReferenceCode } from '../../../support/generators.js'

// Things we need to stub
import * as FetchRecipientsService from '../../../../app/services/notices/setup/fetch-recipients.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import ViewSelectRecipientsService from '../../../../app/services/notices/setup/view-select-recipients.service.js'

describe('Notices - Setup - View Select Recipients service', () => {
  let session
  let sessionData
  let recipients
  let referenceCode

  beforeEach(() => {
    recipients = RecipientsFixture.recipients()

    referenceCode = generateNoticeReferenceCode('RINV-')

    sessionData = {
      referenceCode,
      selectedRecipients: [recipients.primaryUser.contact_hash_id]
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchRecipientsService, 'default').mockResolvedValue([recipients.primaryUser])
    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewSelectRecipientsService(session.id)

      expect(result).toEqual({
        activeNavBar: 'notices',
        backLink: {
          href: `/system/notices/setup/${session.id}/check`,
          text: 'Back'
        },
        pageTitle: 'Select Recipients',
        pageTitleCaption: `Notice ${referenceCode}`,
        recipients: [
          {
            checked: true,
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
