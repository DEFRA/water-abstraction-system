'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventModel = require('../../../../app/models/event.model.js')
const NotificationModel = require('../../../../app/models/notification.model.js')
const RecipientsFixture = require('../../../fixtures/recipients.fixtures.js')
const SessionHelper = require('../../../support/helpers/session.helper.js')
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')

// Things we need to stub
const BatchNotificationsService = require('../../../../app/services/notices/setup/batch-notifications.service.js')
const DetermineRecipientsService = require('../../../../app/services/notices/setup/determine-recipients.service.js')
const FetchReturnsRecipientsService = require('../../../../app/services/notices/setup/fetch-returns-recipients.service.js')

// Thing under test
const SubmitCheckService = require('../../../../app/services/notices/setup/submit-check.service.js')

describe('Notices - Setup - Submit Check service', () => {
  let auth
  let notifierStub
  let referenceCode
  let session
  let testRecipients

  beforeEach(async () => {
    auth = {
      credentials: {
        user: {
          username: 'hello@world.com'
        }
      }
    }

    const recipients = RecipientsFixture.recipients()

    testRecipients = [recipients.primaryUser]

    referenceCode = generateReferenceCode()

    session = await SessionHelper.add({
      data: {
        journey: 'standard',
        referenceCode,
        returnsPeriod: 'quarterFour',
        determinedReturnsPeriod: {
          name: 'allYear',
          dueDate: '2025-04-28',
          endDate: '2023-03-31',
          summer: 'false',
          startDate: '2022-04-01'
        },
        noticeType: 'invitations',
        subType: 'returnInvitation',
        name: 'A person'
      }
    })

    Sinon.stub(DetermineRecipientsService, 'go').returns(testRecipients)
    Sinon.stub(FetchReturnsRecipientsService, 'go').resolves(testRecipients)

    notifierStub = { omg: Sinon.stub(), omfg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()
    delete global.GlobalNotifier
  })

  describe('when a successful batch process has been triggered', () => {
    beforeEach(() => {
      Sinon.stub(BatchNotificationsService, 'go').resolves({ sent: 1, error: 0 })
    })

    it('should batch notifications', async () => {
      const result = await SubmitCheckService.go(session.id, auth)

      const notifications = await NotificationModel.query().where({
        eventId: result
      })

      const event = await EventModel.query().findById(result)
      delete event.entities

      const args = BatchNotificationsService.go.firstCall.args

      expect(args[0]).to.equal([
        {
          id: notifications[0].id,
          messageRef: 'returns_invitation_primary_user_email',
          messageType: 'email',
          pdf: null,
          personalisation: {
            periodEndDate: '31 March 2023',
            returnDueDate: '28 April 2025',
            periodStartDate: '1 April 2022'
          },
          recipient: 'primary.user@important.com',
          returnLogIds: null,
          templateId: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f'
        }
      ])

      expect(args[1]).to.equal(event, { skip: ['createdAt', 'updatedAt'] })

      expect(args[2]).to.equal(referenceCode)
    })

    it('correctly returns the event id', async () => {
      const result = await SubmitCheckService.go(session.id, auth)

      const event = await EventModel.query().findById(result)

      expect(result).to.equal(event.id)
    })

    it('should not throw an error', async () => {
      await SubmitCheckService.go(session.id, auth)

      expect(notifierStub.omfg.called).to.be.false()
    })
  })

  describe('when a batch process fails', { timeout: 1000000 }, () => {
    beforeEach(() => {
      const specificError = new Error('Batch failed due to XYZ reason')

      Sinon.stub(BatchNotificationsService, 'go').rejects(specificError)
    })

    it('should throw an error', async () => {
      await SubmitCheckService.go(session.id, auth)

      expect(notifierStub.omfg.called).to.be.true()

      expect(notifierStub.omfg.calledWith('Send notifications failed')).to.be.true()
    })
  })
})
