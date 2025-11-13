'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const NoticesFixture = require('../../../fixtures/notices.fixture.js')
const NotificationsFixture = require('../../../fixtures/notifications.fixture.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../../support/helpers/licence.helper.js')
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')

// Things we need to stub
const CreateNoticeService = require('../../../../app/services/notices/setup/create-notice.service.js')
const CreateNotificationsService = require('../../../../app/services/notices/setup/create-notifications.service.js')
const FetchRecipientsService = require('../../../../app/services/notices/setup/fetch-recipients.service.js')
const SendNoticeService = require('../../../../app/services/notices/setup/send-notice.service.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/notices/setup/submit-check.service.js')

describe('Notices - Setup - Submit Check service', () => {
  const auth = {
    credentials: {
      user: {
        username: 'hello@world.com'
      }
    }
  }

  let createNoticeStub
  let createNotificationsStub
  let referenceCode
  let recipients
  let sendNoticeStub
  let session

  beforeEach(async () => {
    const fixtureData = RecipientsFixture.recipients()
    const sessionId = generateUUID()
    const licenceRef = generateLicenceRef()
    const dueReturns = [
      {
        dueDate: '2025-04-28T00:00:00.000Z',
        endDate: '2025-03-31T00:00:00.000Z',
        naldAreaCode: 'RIDIN',
        purpose: 'Spray Irrigation - Direct',
        regionCode: 3,
        regionName: 'North East',
        returnId: generateUUID(),
        returnLogId: `v1:3:${licenceRef}:10059610:2024-04-01:2025-03-31`,
        returnReference: '10059610',
        returnsFrequency: 'month',
        siteDescription: 'BOREHOLE AT AVALON',
        startDate: '2024-04-01T00:00:00.000Z',
        twoPartTariff: false
      }
    ]

    recipients = [
      {
        ...fixtureData.primaryUser,
        licence_refs: [licenceRef],
        return_log_ids: [dueReturns[0].returnId]
      }
    ]
    Sinon.stub(FetchRecipientsService, 'go').resolves(recipients)

    referenceCode = generateReferenceCode('RINV-')
    session = await SessionHelper.add({
      id: sessionId,
      data: {
        addressJourney: {
          address: {},
          backLink: {
            href: `/system/notices/setup/${sessionId}/recipient-name`,
            text: 'Back'
          },
          redirectUrl: `/system/notices/setup/${sessionId}/add-recipient`,
          activeNavBar: 'notices',
          pageTitleCaption: `Notice ${referenceCode}`
        },
        checkPageVisited: true,
        dueReturns,
        licenceRef,
        journey: 'adhoc',
        name: 'Returns: invitation',
        notificationType: 'Returns invitation',
        noticeType: 'invitations',
        referenceCode,
        selectedRecipients: [...recipients[0].contact_hash_id],
        subType: 'returnInvitation'
      }
    })

    const notice = NoticesFixture.returnsInvitation()

    notice.referenceCode = session.referenceCode
    notice.metadata.recipients = 1
    createNoticeStub = Sinon.stub(CreateNoticeService, 'go').resolves(notice)

    const notification = NotificationsFixture.returnsInvitationEmail(notice)

    createNotificationsStub = Sinon.stub(CreateNotificationsService, 'go').resolves([notification])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    beforeEach(() => {
      sendNoticeStub = Sinon.stub(SendNoticeService, 'go').resolves()
    })

    it('creates a notice record', async () => {
      await SubmitCheckService.go(session.id, auth)

      expect(createNoticeStub.called).to.be.true()
    })

    it('creates notification records', async () => {
      await SubmitCheckService.go(session.id, auth)

      expect(createNotificationsStub.called).to.be.true()
    })

    it('deletes the session record', async () => {
      await SubmitCheckService.go(session.id, auth)

      const refreshedSession = session.$query()

      expect(refreshedSession.id).to.be.undefined()
    })

    it('sends the notice', async () => {
      await SubmitCheckService.go(session.id, auth)

      expect(sendNoticeStub.called).to.be.true()
    })
  })
})
