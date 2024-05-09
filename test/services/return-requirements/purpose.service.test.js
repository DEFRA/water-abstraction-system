'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Things we need to stub
const FetchPurposesService = require('../../../app/services/return-requirements/fetch-purposes.service.js')

// Thing under test
const PurposeService = require('../../../app/services/return-requirements/purpose.service.js')

describe('Purpose service', () => {
  const requirementIndex = 0

  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({
      data: {
        checkYourAnswersVisited: false,
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

    Sinon.stub(FetchPurposesService, 'go').resolves([
      { description: 'Transfer Between Sources (Pre Water Act 2003)' },
      { description: 'Potable Water Supply - Direct' }
    ])
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await PurposeService.go(session.id, requirementIndex)

      expect(result.sessionId).to.equal(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await PurposeService.go(session.id, requirementIndex)

      expect(result).to.equal({
        activeNavBar: 'search',
        pageTitle: 'Select the purpose for the requirements for returns',
        backLink: `/system/return-requirements/${session.id}/setup`,
        licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licencePurposes: [
          'Transfer Between Sources (Pre Water Act 2003)',
          'Potable Water Supply - Direct'
        ],
        licenceRef: '01/ABC',
        purposes: ''
      }, { skip: ['sessionId'] })
    })
  })
})
