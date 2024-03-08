'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../support/helpers/database.helper.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const SelectPurposeService = require('../../../app/services/return-requirements/purpose.service.js')

describe('Select Purpose service', () => {
  let session

  beforeEach(async () => {
    await DatabaseHelper.clean()
    session = await SessionHelper.add({
      data: {
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          startDate: '2022-04-01T00:00:00.000Z',
          licencePurposes: []
        }
      }
    })
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await SelectPurposeService.go(session.id)

      expect(result.id).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await SelectPurposeService.go(session.id)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'Select the purpose for the requirements for returns',
        licenceRef: '01/ABC',
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licencePurposes: []
      }, { skip: ['id'] })
    })
  })
})
