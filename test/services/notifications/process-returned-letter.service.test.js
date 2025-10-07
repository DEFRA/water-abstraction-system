'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

const { generateUUID, timestampForPostgres, today } = require('../../../app/lib/general.lib.js')

// Test helpers
const EventHelper = require('../../support/helpers/event.helper.js')
const NotificationHelper = require('../../support/helpers/notification.helper.js')
const NotificationModel = require('../../../app/models/notification.model.js')

// Thing under test
const ProcessReturnedLetterService = require('../../../app/services/notifications/process-returned-letter.service.js')

describe('Submit Returned Letter Service', () => {
  const todaysDate = today()

  let eventId
  let notifyId

  beforeEach(async () => {
    const event = await EventHelper.add({
      type: 'notification',
      subtype: 'returnsInvitation'
    })

    eventId = event.id
    notifyId = generateUUID()

    await NotificationHelper.add({ eventId, notifyId, createdAt: timestampForPostgres() })
  })

  describe('when called with a valid notifyId', () => {
    it('updates the returnedAt date for the provided notification id', async () => {
      await ProcessReturnedLetterService.go(notifyId)

      const updatedResult = await NotificationModel.query().where('notifyId', notifyId)

      expect(updatedResult[0].returnedAt).to.equal(todaysDate)
    })
  })
})
