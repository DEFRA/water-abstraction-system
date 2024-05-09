'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const CancelRequirementsService = require('../../../app/services/return-requirements/cancel-requirements.service.js')

describe('Cancel Requirements service', () => {
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({
      id: '61e07498-f309-4829-96a9-72084a54996d',
      data: {
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          startDate: '2022-04-01T00:00:00.000Z'
        },
        reason: 'abstraction-below-100-cubic-metres-per-day',
        startDateOptions: 'licenceStartDate',
        returnsCycle: 'winter-and-all-year',
        frequencyReported: 'monthly',
        siteDescription: 'This is a valid site description'
      }
    })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await CancelRequirementsService.go(session.id)

      expect(result.id).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await CancelRequirementsService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'You are about to cancel these requirements for returns',
        id: '465c6792-dd84-4163-a808-cbb834a779be',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        reason: 'abstraction-below-100-cubic-metres-per-day',
        startDate: '1 January 2023',
        returnRequirements: 'Winter and all year monthly requirements for returns, This is a valid site description.'
      }, { skip: ['id'] })
    })
  })
})
