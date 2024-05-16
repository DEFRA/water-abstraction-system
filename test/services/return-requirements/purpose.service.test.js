'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const LicenceVersionHelper = require('../../support/helpers/licence-version.helper.js')
const LicenceVersionPurposeHelper = require('../../support/helpers/licence-version-purpose.helper.js')
const PurposeHelper = require('../../support/helpers/purpose.helper.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Thing under test
const PurposeService = require('../../../app/services/return-requirements/purpose.service.js')

describe('Return Requirements - Purpose service', () => {
  const requirementIndex = 0

  let licenceVersion
  let purposes
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

    // Create the initial licenceVersion
    licenceVersion = await LicenceVersionHelper.add()

    // Create 3 descriptions for the purposes
    purposes = await Promise.all([
      await PurposeHelper.add({ id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f', description: 'Heat Pump' }),
      await PurposeHelper.add({ id: '49088608-ee9f-491a-8070-6831240945ac', description: 'Horticultural Watering' })
    ])

    // Create the licenceVersionPurposes with the purposes and licenceVersion
    for (const purpose of purposes) {
      await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })
    }

    session = await SessionHelper.add({
      data: {
        checkPageVisited: false,
        licence: {
          id: licenceVersion.licenceId,
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
        licenceId: licenceVersion.licenceId,
        licencePurposes: [
          { id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f', description: 'Heat Pump' },
          { id: '49088608-ee9f-491a-8070-6831240945ac', description: 'Horticultural Watering' }
        ],
        licenceRef: '01/ABC',
        purposes: '',
        sessionId: session.id
      }, { skip: ['sessionId'] })
    })
  })
})
