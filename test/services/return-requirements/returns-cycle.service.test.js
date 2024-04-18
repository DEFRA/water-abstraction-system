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
const ReturnsCycleService = require('../../../app/services/return-requirements/returns-cycle.service.js')

describe('Returns Cycle service', () => {
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({
      data: {
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          startDate: '2022-04-01T00:00:00.000Z'
        }
      }
    })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await ReturnsCycleService.go(session.id)

      expect(result.id).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await ReturnsCycleService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'Select the returns cycle for the requirements for returns',
        id: 'c5466e37-ef1d-447e-9281-5e4bea20a3e9',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        returnsCycle: null
      }, { skip: ['id'] })
    })
  })
})
