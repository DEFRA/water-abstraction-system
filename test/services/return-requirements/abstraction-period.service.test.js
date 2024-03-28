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
const AbstractionPeriodService = require('../../../app/services/return-requirements/abstraction-period.service.js')

describe('Abstraction Period service', () => {
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
      const result = await AbstractionPeriodService.go(session.id)

      expect(result.id).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await AbstractionPeriodService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'Enter the abstraction period for the requirements for returns',
        id: '465c6792-dd84-4163-a808-cbb834a779be',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceRef: '01/ABC',
        abstractionPeriod: {
          fromDay: null,
          fromMonth: null,
          toDay: null,
          toMonth: null
        }
      }, { skip: ['id'] })
    })
  })
})
