'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const NoticeSessionFixture = require('../../../fixtures/notice-session.fixture.js')

// Things we need to stub
const FetchRecipientsService = require('../../../../app/services/notices/setup/fetch-recipients.service.js')
const SessionModel = require('../../../../app/models/session.model.js')

// Thing under test
const ViewCheckService = require('../../../../app/services/notices/setup/view-check.service.js')

describe('Notices - Setup - View Check service', () => {
  let session
  let sessionUpdateStub
  let recipient
  let yarStub

  beforeEach(async () => {
    recipient = RecipientsFixture.returnsNoticePrimaryUser()

    session = NoticeSessionFixture.standardInvitation(recipient.licence_refs[0])
    sessionUpdateStub = Sinon.stub().resolves()
    session.$update = sessionUpdateStub

    Sinon.stub(SessionModel, 'query').returns({
      findById: Sinon.stub().resolves(session)
    })

    yarStub = { flash: Sinon.stub().returns([{ title: 'Test', text: 'Notification' }]) }

    Sinon.stub(FetchRecipientsService, 'go').resolves([recipient])
  })

  afterEach(() => {
    Sinon.restore()
  })

  it('correctly presents the data', async () => {
    const result = await ViewCheckService.go(session.id, yarStub)

    expect(result).to.equal({
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
        numberOfPages: 1
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
      await ViewCheckService.go(session.id, yarStub)

      expect(sessionUpdateStub.called).to.be.true()
    })
  })

  describe('when the page has been visited before', () => {
    beforeEach(() => {
      session.selectedRecipients = [recipient.contact_hash_id]
    })

    it('leaves the "selectedRecipients" property alone', async () => {
      await ViewCheckService.go(session.id, yarStub)

      expect(sessionUpdateStub.called).to.be.false()
    })
  })
})
