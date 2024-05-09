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
const SubmitCancelRequirementsService = require('../../../app/services/return-requirements/submit-cancel-requirements.service.js')

describe('Submit Cancel Requirements service', () => {
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
        },
        journey: 'returns-required'
      }
    })
  })

  describe('when a user submits the return requirements to be cancelled', () => {
    it('deletes the session data', async () => {
      await SubmitCancelRequirementsService.go(session.id)

      const refreshedSession = await session.$query()

      expect(refreshedSession).not.to.exist()
    })

    it('returns the licence id to be used to return the user to the charge information page', async () => {
      const result = await SubmitCancelRequirementsService.go(session.id)

      expect(result).to.equal('8b7f78ba-f3ad-4cb6-a058-78abc4d1383d')
    })
  })
})
