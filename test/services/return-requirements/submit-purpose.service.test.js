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
          licencePurposes: [
            'Transfer Between Sources (Pre Water Act 2003)',
            'Potable Water Supply - Direct'
          ],
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
          licencePurposes: 'Potable Water Supply - Direct'
        }

        Sinon.stub(FetchPurposesService, 'go').resolves(
          'Potable Water Supply - Direct'
        )

        Sinon.stub(PurposeValidation, 'go').resolves(null)
      })

      it('fetches the current setup session record', async () => {
        const result = await SubmitPurposeService.go(session.id, payload)

        expect(result.id).to.equal(session.id)
      })

      it('returns page data for the view', async () => {
        const result = await SubmitPurposeService.go(session.id, payload)

        expect(result).to.equal({
          activeNavBar: 'search',
          error: null,
          pageTitle: 'Select the purpose for the requirements for returns',
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          licencePurposes: 'Potable Water Supply - Direct'
        }, { skip: ['id'] })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not selected anything', () => {
        beforeEach(() => {
          payload = {}
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
            licencePurposes: []
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
