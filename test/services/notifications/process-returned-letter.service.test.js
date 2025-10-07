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

// Thing under test
const ProcessReturnedLetterService = require('../../../app/services/notifications/process-returned-letter.service.js')

describe('Notifications - Process Returned Letter service', () => {
  const todaysDate = today()

  let eventId
  let notifyId
  let notifierStub

  beforeEach(async () => {
    const event = await EventHelper.add({
      type: 'notification',
      subtype: 'returnsInvitation'
    })

    eventId = event.id
    notifyId = generateUUID()

    await NotificationHelper.add({ eventId, notifyId, createdAt: timestampForPostgres() })

    notifierStub = { omg: Sinon.stub() }
    global.GlobalNotifier = notifierStub
  })

  afterEach(() => {
    delete global.GlobalNotifier
  })

  describe('when called with a valid notifyId', () => {
    it('updates the returnedAt date for the provided notification id', async () => {
      await ProcessReturnedLetterService.go(notifyId)

      const updatedResult = await NotificationModel.query().where('notifyId', notifyId)

      expect(updatedResult[0].returnedAt).to.equal(todaysDate)
      expect(notifierStub.omg.called).to.be.false()
    })
  })

  describe('when called with a valid notifyId', () => {
    it('updates the returnedAt date for the provided notification id', async () => {
      await ProcessReturnedLetterService.go(generateUUID())

      expect(notifierStub.omg.calledWith('No matching notification found for returned letter request')).to.be.true()
    })
  })
})
