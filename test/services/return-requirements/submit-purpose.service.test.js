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
const SubmitPurposeService = require('../../../app/services/return-requirements/submit-purpose.service.js')

describe('Return Requirements - Submit Purpose service', () => {
  const requirementIndex = 0

  let licenceVersion
  let payload
  let purposes
  let session

  beforeEach(async () => {
    await DatabaseSupport.clean()

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

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(async () => {
        payload = {
          purposes: ['14794d57-1acf-4c91-8b48-4b1ec68bfd6f']
        }

        // Create the initial licenceVersion
        licenceVersion = await LicenceVersionHelper.add()

        // Create 3 descriptions for the purposes
        purposes = await Promise.all([
          await PurposeHelper.add({ id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f', description: 'Heat Pump' }),
          await PurposeHelper.add({ id: '49088608-ee9f-491a-8070-6831240945ac', description: 'Horticultural Watering' }),
          await PurposeHelper.add({ id: '8290bb6a-4265-4cc8-b9bb-37cde1357d5d', description: 'Large Garden Watering' })
        ])

        // Create the licenceVersionPurposes with the purposes and licenceVersion
        for (const purpose of purposes) {
          await LicenceVersionPurposeHelper.add({
            licenceVersionId: licenceVersion.id,
            purposeId: purpose.id
          })
        }
      })

      it('saves the submitted value', async () => {
        await SubmitPurposeService.go(session.id, requirementIndex, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.requirements[0].purposes).to.equal(['14794d57-1acf-4c91-8b48-4b1ec68bfd6f'])
      })

      it('returns the correct details the controller needs to redirect the journey', async () => {
        const result = await SubmitPurposeService.go(session.id, requirementIndex, payload)

        expect(result).to.equal({
          checkPageVisited: false
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(async () => {
        payload = {}

        // Create the initial licenceVersion
        licenceVersion = await LicenceVersionHelper.add()

        // Create 3 descriptions for the purposes
        purposes = await Promise.all([
          await PurposeHelper.add({ id: '14794d57-1acf-4c91-8b48-4b1ec68bfd6f', description: 'Heat Pump' }),
          await PurposeHelper.add({ id: '49088608-ee9f-491a-8070-6831240945ac', description: 'Horticultural Watering' }),
          await PurposeHelper.add({ id: '8290bb6a-4265-4cc8-b9bb-37cde1357d5d', description: 'Large Garden Watering' })
        ])

        // Create the licenceVersionPurposes with the purposes and licenceVersion
        for (const purpose of purposes) {
          await LicenceVersionPurposeHelper.add({
            licenceVersionId: licenceVersion.id,
            purposeId: purpose.id
          })
        }
      })

      it('returns page data for the view', async () => {
        const result = await SubmitPurposeService.go(session.id, requirementIndex, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          pageTitle: 'Select the purpose for the requirements for returns',
          backLink: `/system/return-requirements/${session.id}/setup`,
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          error: {
            text: 'Select any purpose for the requirements for returns'
          },
          licencePurposes: [],
          licenceRef: '01/ABC',
          purposes: '',
          sessionId: session.id
        }, { skip: ['sessionId', 'error'] })
      })
    })
  })
})
