'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventModel = require('../../../../app/models/event.model.js')

// Thing under test
const CreateEventService = require('../../../../app/services/notifications/setup/create-event.service.js')

describe('Notifications Setup - Create event service', () => {
  let event

  beforeEach(() => {
    event = {}
  })

  it('should create the event (required values)', async () => {
    const result = await CreateEventService.go(event)

    const res = await EventModel.query().findById(result.id)

    expect(result).equal({
      id: res.id,
      type: 'notification'
    })
  })

  describe('when the event is for a returns notification', () => {
    const referenceCode = 'ABC-123'

    beforeEach(() => {
      event = {
        licences: JSON.stringify(['123', '456']),
        metadata: {
          name: 'Returns: invitation',
          sent: 2783,
          error: 18,
          options: { excludeLicences: [] },
          recipients: 2801,
          returnCycle: { dueDate: '2024-11-28', endDate: '2024-10-31', isSummer: true, startDate: '2023-11-01' }
        },
        referenceCode,
        status: 'started',
        subtype: 'returnInvitation'
      }
    })

    it('should create the event', async () => {
      const result = await CreateEventService.go(event)

      const res = await EventModel.query().findById(result.id)

      expect(res).equal({
        createdAt: null,
        entities: null,
        id: res.id,
        issuer: null,
        licences: ['123', '456'],
        metadata: {
          error: 18,
          name: 'Returns: invitation',
          options: {
            excludeLicences: []
          },
          recipients: 2801,
          returnCycle: {
            dueDate: '2024-11-28',
            endDate: '2024-10-31',
            isSummer: true,
            startDate: '2023-11-01'
          },
          sent: 2783
        },
        referenceCode: 'ABC-123',
        status: 'started',
        subtype: 'returnInvitation',
        type: 'notification',
        updatedAt: null
      })
    })
  })
})
