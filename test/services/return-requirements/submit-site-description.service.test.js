'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseSupport = require('../../support/database.js')
const SessionHelper = require('../../support/helpers/session.helper.js')

// Things under test
const SubmitSiteDescriptionService = require('../../../app/services/return-requirements/submit-site-description.service.js')

describe('Submit Site Description service', () => {
  let payload
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
        journey: 'returns-required'
      }
    })
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          siteDescription: 'This is a valid return requirement description'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitSiteDescriptionService.go(session.id, payload)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data.siteDescription).to.equal('This is a valid return requirement description')
      })

      it('returns the checkYourAnswersVisited property (no page data needed for a redirect)', async () => {
        const result = await SubmitSiteDescriptionService.go(session.id, payload)

        expect(result).to.equal({
          checkYourAnswersVisited: false
        })
      })
    })

    describe('with an invalid payload', () => {
      describe('because the user has not entered anything', () => {
        beforeEach(() => {
          payload = {}
        })

        it('fetches the current setup session record', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, payload)

          expect(result.id).to.equal(session.id)
        })

        it('returns page data for the view', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            checkYourAnswersVisited: false,
            pageTitle: 'Enter a site description for the requirements for returns',
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            siteDescription: null
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error for the text input element', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, payload)

          expect(result.error).to.equal({
            text: 'Enter a description of the site'
          })
        })
      })

      describe('because the user has entered a description less than 10 characters', () => {
        beforeEach(() => {
          payload = {
            siteDescription: 'Too short'
          }
        })

        it('fetches the current setup session record', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, payload)

          expect(result.id).to.equal(session.id)
        })

        it('returns page data for the view', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            checkYourAnswersVisited: false,
            pageTitle: 'Enter a site description for the requirements for returns',
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            siteDescription: 'Too short'
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error for the text input element', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, payload)

          expect(result.error).to.equal({
            text: 'Site description must be 10 characters or more'
          })
        })
      })

      describe('because the user has entered a description more than 100 characters', () => {
        const invalidSiteDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit' +
        ', sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis.'

        beforeEach(() => {
          payload = {
            siteDescription: invalidSiteDescription
          }
        })

        it('fetches the current setup session record', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, payload)

          expect(result.id).to.equal(session.id)
        })

        it('returns page data for the view', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, payload)

          expect(result).to.equal({
            activeNavBar: 'search',
            checkYourAnswersVisited: false,
            pageTitle: 'Enter a site description for the requirements for returns',
            licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
            licenceRef: '01/ABC',
            siteDescription: invalidSiteDescription
          }, { skip: ['id', 'error'] })
        })

        it('returns page data with an error for the text input element', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, payload)

          expect(result.error).to.equal({
            text: 'Site description must be 100 characters or less'
          })
        })
      })
    })
  })
})
