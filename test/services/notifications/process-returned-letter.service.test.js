'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID, timestampForPostgres, today } = require('../../../app/lib/general.lib.js')

// Test helpers
const EventHelper = require('../../support/helpers/event.helper.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')
const NotificationModel = require('../../../app/models/notification.model.js')

// Things we need to stub
const UpdateEventService = require('../../../app/services/jobs/notification-status/update-event.service.js')

// Thing under test
const ProcessReturnedLetterService = require('../../../app/services/notifications/process-returned-letter.service.js')

describe('Notifications - Process Returned Letter service', () => {
  const todaysDate = today()

  let eventId
  let notifyId
  let notifierStub
  let updateEventStub

  beforeEach(async () => {
    const event = await EventHelper.add({
      type: 'notification',
      subtype: 'returnsInvitation'
    })

    eventId = event.id
    notifyId = generateUUID()

    await NotificationHelper.add({ eventId, notifyId, createdAt: timestampForPostgres() })

    updateEventStub = Sinon.stub(UpdateEventService, 'go').resolves()

    notifierStub = { omg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    Sinon.restore()

    delete global.GlobalNotifier
  })

  describe('when called with a matching "notifyId"', () => {
    it('updates "status" to returned and sets "returnedAt" for the matching notification, and updates the notice', async () => {
      await ProcessReturnedLetterService.go(notifyId)

      const updatedResult = await NotificationModel.query().where('notifyId', notifyId)

      expect(updatedResult[0].returnedAt).to.equal(todaysDate)
      expect(notifierStub.omg.called).to.be.false()
      expect(updateEventStub.calledWith([eventId])).to.be.true()
    })
  })

  describe('when called with a "notifyId" that finds no match', () => {
    it('logs that no match was found', async () => {
      await ProcessReturnedLetterService.go(generateUUID())

      expect(notifierStub.omg.calledWith('No matching notification found for returned letter request')).to.be.true()
    })
  })
})
