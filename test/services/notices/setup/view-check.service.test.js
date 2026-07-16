// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import * as NoticeSessionFixture from '../../../support/fixtures/notice-session.fixture.js'
import * as RecipientsFixture from '../../../support/fixtures/recipients.fixture.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchRecipientsService from '../../../../app/services/notices/setup/fetch-recipients.service.js'
import SessionModel from '../../../../app/models/session.model.js'

// Thing under test
import ViewCheckService from '../../../../app/services/notices/setup/view-check.service.js'

describe('Notices - Setup - View Check service', () => {
  let session
  let sessionUpdateStub
  let recipient
  let yarStub

  beforeEach(async () => {
    recipient = RecipientsFixture.returnsNoticePrimaryUser()

    session = NoticeSessionFixture.standardInvitation(recipient.licence_refs[0])
    sessionUpdateStub = vi.fn().mockResolvedValue()
    session.$update = sessionUpdateStub

    vi.spyOn(SessionModel, 'query').mockReturnValue({
      findById: vi.fn().mockResolvedValue(session)
    })

    yarStub = YarStub()
    yarStub.flash.mockReturnValue([{ title: 'Test', text: 'Notification' }])

    vi.spyOn(FetchRecipientsService, 'default').mockResolvedValue([recipient])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('correctly presents the data', async () => {
    const result = await ViewCheckService(session.id, yarStub)

    expect(result).toEqual({
      activeNavBar: 'notices',
      canSendNotice: true,
      links: {
        cancel: `/system/notices/setup/${session.id}/cancel`,
        download: `/system/notices/setup/${session.id}/download`,
        removeLicences: `/system/notices/setup/${session.id}/remove-licences`
      },
      notification: {
        text: 'Notification',
        title: 'Test'
      },
      page: 1,
      pageTitle: 'Check the recipients',
      pageTitleCaption: session.addressJourney.pageTitleCaption,
      pagination: {
        currentPageNumber: 1,
        numberOfPages: 1,
        showingMessage: 'Showing all 1 undefined'
      },
      readyToSend: 'Returns invitations are ready to send.',
      recipients: [
        {
          contact: [recipient.email],
          licences: recipient.licence_refs,
          method: 'Email - primary user',
          previewLink: `/system/notices/setup/${session.id}/preview/${recipient.contact_hash_id}`
        }
      ],
      tableCaption: 'Showing all 1 recipients',
      warning: null
    })
  })

  describe('when this is the first time visiting the check page', () => {
    it('initialises the "selectedRecipients" property in the session', async () => {
      await ViewCheckService(session.id, yarStub)

      expect(sessionUpdateStub).toHaveBeenCalled()
    })
  })

  describe('when the page has been visited before', () => {
    beforeEach(() => {
      session.selectedRecipients = [recipient.contact_hash_id]
    })

    it('leaves the "selectedRecipients" property alone', async () => {
      await ViewCheckService(session.id, yarStub)

      expect(sessionUpdateStub).not.toHaveBeenCalled()
    })
  })
})
