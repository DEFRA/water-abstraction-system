'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const ReadingsService = require('../../../../app/services/return-logs/setup/readings.service.js')

describe('Return Logs Setup - Readings service', () => {
  const yearMonth = '2023-3'

  let session

  before(async () => {
    session = await SessionHelper.add({
      data: {
        lines: [
          {
            endDate: '2023-04-30T00:00:00.000Z',
            reading: 100,
            startDate: '2023-04-01T00:00:00.000Z'
          },
          {
            endDate: '2023-05-31T00:00:00.000Z',
            startDate: '2023-05-01T00:00:00.000Z'
          }
        ],
        returnsFrequency: 'month',
        returnReference: '1234'
      }
    })
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ReadingsService.go(session.id, yearMonth)

      expect(result).to.equal({
        activeNavBar: 'search',
        backLink: {
          href: `/system/return-logs/setup/${session.id}/check`,
          text: 'Back'
        },
        inputLines: [
          {
            endDate: '2023-04-30T00:00:00.000Z',
            label: 'April 2023',
            reading: 100
          }
        ],
        pageTitle: 'Water abstracted April 2023',
        pageTitleCaption: 'Return reference 1234'
      })
    })
  })
})
