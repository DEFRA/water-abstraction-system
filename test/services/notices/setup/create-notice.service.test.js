'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const EventModel = require('../../../../app/models/event.model.js')
const { generateReferenceCode } = require('../../../support/helpers/notification.helper.js')

// Thing under test
const CreateNoticeService = require('../../../../app/services/notices/setup/create-notice.service.js')

describe('Notices - Setup - Create Notice service', () => {
  let event

  beforeEach(() => {
    event = {}
  })

  it('should create the notice (required values)', async () => {
    const result = await CreateNoticeService.go(event)

    const createdResult = await EventModel.query().findById(result.id)

    expect(result).equal({
      createdAt: result.createdAt,
      id: createdResult.id,
      type: 'notification',
      updatedAt: result.updatedAt
    })
  })

  describe('when the notice is for a returns notification', () => {
    const referenceCode = generateReferenceCode()

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

    it('should create the notice', async () => {
      const result = await CreateNoticeService.go(event)

      const createdResult = await EventModel.query().findById(result.id)

      expect(createdResult).equal({
        createdAt: createdResult.createdAt,
        entities: null,
        id: createdResult.id,
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
        overallStatus: null,
        referenceCode,
        status: 'started',
        statusCounts: null,
        subtype: 'returnInvitation',
        type: 'notification',
        updatedAt: createdResult.updatedAt
      })
    })
  })
})
