'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const RecipientsFixture = require('../../../../fixtures/recipients.fixtures.js')
const SessionHelper = require('../../../../support/helpers/session.helper.js')

// Things we need to stub
const DetermineRecipientsService = require('../../../../../app/services/notices/setup/determine-recipients.service.js')
const FetchRecipientsService = require('../../../../../app/services/notices/setup/fetch-recipients.service.js')
const NotifyPreviewRequest = require('../../../../../app/requests/notify/notify-preview.request.js')

// Thing under test
const PreviewService = require('../../../../../app/services/notices/setup/preview/preview.service.js')

describe('Notices - Setup - Preview service', () => {
  let recipients
  let session
  let testRecipient
  let testRecipients

  beforeEach(() => {
    // As the services presenter uses Notify to generate the template preview contents, we need to stub the request
    Sinon.stub(NotifyPreviewRequest, 'send').resolves({ plaintext: 'Preview of the notification contents' })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when the journey is a return journey', () => {
    beforeEach(async () => {
      recipients = RecipientsFixture.recipients()

      testRecipients = [recipients.primaryUser]
      testRecipient = testRecipients[0]

      session = await SessionHelper.add({
        data: {
          journey: 'standard',
          noticeType: 'invitations',
          returnsPeriod: 'quarterFour',
          determinedReturnsPeriod: {
            name: 'allYear',
            dueDate: '2025-04-28',
            endDate: '2023-03-31',
            summer: 'false',
            startDate: '2022-04-01'
          },
          referenceCode: 'RINV-0Q7AD8'
        }
      })

      Sinon.stub(DetermineRecipientsService, 'go').returns(testRecipients)
      Sinon.stub(FetchRecipientsService, 'go').resolves(testRecipients)
    })

    it('returns the page data for the view', async () => {
      const result = await PreviewService.go(testRecipient.contact_hash_id, session.id)

      expect(result).to.equal({
        activeNavBar: 'manage',
        address: null,
        backLink: `/system/notices/setup/${session.id}/check`,
        caption: 'Notice RINV-0Q7AD8',
        contents: 'Preview of the notification contents',
        messageType: 'email',
        pageTitle: 'Returns invitation primary user email',
        refreshPageLink: `/system/notices/setup/${session.id}/preview/${testRecipient.contact_hash_id}`
      })
    })
  })
})
