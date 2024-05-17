'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const EventHelper = require('../../support/helpers/event.helper.js')
const ScheduledNotificationModel = require('../../support/helpers/scheduled-notification.helper.js')

// Thing under test
const FetchCommunicationsService =
  require('../../../app/services/licences/fetch-communications.service.js')

describe('Fetch Communications service', () => {
  const licenceRef = '01/01'

  let testRecord

  beforeEach(async () => {
    await DatabaseSupport.clean()

    testRecord = await ScheduledNotificationModel.add({
      licences: JSON.stringify([licenceRef])
    })

    await EventHelper.add({
      licences: JSON.stringify([licenceRef])
    })
  })

  describe('when the licence has communications', () => {

    it('returns the matching communication', async () => {
      const result = await FetchCommunicationsService.go(licenceRef)

      expect(result.pagination).to.equal({
        total: 1
      })

      expect(result.communications).to.equal(
        [{
          event: null,
          id: testRecord.id,
          messageRef: null,
          messageType: null
        }]
      )
    })
  })

  describe('when the licence has no communications', () => {

    it('returns no communications', async () => {
      const result = await FetchCommunicationsService.go('01/02')

      expect(result.pagination).to.equal({
        total: 0
      })

      expect(result.communications).to.be.empty()
    })
  })
})
