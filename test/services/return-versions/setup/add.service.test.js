'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const AddService = require('../../../../app/services/return-versions/setup/add.service.js')

describe('Return Versions Setup - Add service', () => {
  let session

  beforeEach(async () => {
    session = await SessionHelper.add({
      data: {
        checkPageVisited: false,
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    })
  })

  describe('when called', () => {
    it('adds another empty object to the requirement array in the current setup session record', async () => {
      await AddService.go(session.id)

      const refreshedSession = await session.$query()

      expect(refreshedSession.data.requirements.length).to.equal(2)
      expect(refreshedSession.data.requirements).to.equal([{}, {}])
    })

    it('returns the index of the new requirement', async () => {
      const result = await AddService.go(session.id)

      expect(result).to.equal(1)
    })
  })
})
