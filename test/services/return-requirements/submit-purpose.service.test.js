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
const PurposeValidation = require('../../../app/validators/return-requirements/purpose.validator.js')

// Thing under test
const SubmitPurposeService = require('../../../app/services/return-requirements/submit-purpose.service.js')

describe('Submit Purpose service', () => {
  let payload
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

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          purposes: [
            'Potable Water Supply - Direct'
          ]
        }

        Sinon.stub(FetchPurposesService, 'go').resolves([
          'Potable Water Supply - Direct',
          'Transfer Between Sources (Pre Water Act 2003)'
        ]
        )

        Sinon.stub(PurposeValidation, 'go').resolves(null)
      })

      it('saves the submitted value', async () => {
        await SubmitPurposeService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data.purposes).to.equal('Potable Water Supply - Direct')
      })

      it('returns an empty object (no page data needed for a redirect)', async () => {
        const result = await SubmitPurposeService.go(session.id, payload)

        expect(result).to.equal({})
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        beforeEach(() => {
          payload = {}

          Sinon.stub(FetchPurposesService, 'go').resolves(
            [
              'Transfer Between Sources (Pre Water Act 2003)',
              'Potable Water Supply - Direct'
            ]
          )
        })

        it('fetches the current setup session record', async () => {
          const result = await SubmitPurposeService.go(session.id, payload)

          expect(result.id).to.equal(session.id)
        })

        it('returns the page data for the view', async () => {
          const result = await SubmitPurposeService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            pageTitle: 'Select the purpose for the requirements for returns',
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            licencePurposes: [
              'Transfer Between Sources (Pre Water Act 2003)',
              'Potable Water Supply - Direct'
            ],
            selectedPurposes: ''
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error', async () => {
          const result = await SubmitPurposeService.go(session.id, payload)

          expect(result.error).to.equal({
            text: 'Select any uses for the return requirement'
          })
        })
      })
    })
  })
})
