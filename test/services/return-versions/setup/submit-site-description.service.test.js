'use strict'

// Test framework dependencies

const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Things under test
const SubmitSiteDescriptionService = require('../../../../app/services/return-versions/setup/submit-site-description.service.js')

describe('Return Versions Setup - Submit Site Description service', () => {
  const requirementIndex = 0

  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(async () => {
    sessionData = {
      data: {
        checkPageVisited: false,
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          returnVersions: [{
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            startDate: '2023-01-01T00:00:00.000Z',
            reason: null,
            modLogs: []
          }],
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    }

    session = await SessionHelper.add(sessionData)

    yarStub = { flash: Sinon.stub() }
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          siteDescription: 'This is a valid return requirement description'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitSiteDescriptionService.go(session.id, requirementIndex, payload, yarStub)

        const refreshedSession = await session.$query()

        expect(refreshedSession.requirements[0].siteDescription).to.equal('This is a valid return requirement description')
      })

      describe('and the page has been not been visited', () => {
        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, requirementIndex, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: false
          })
        })
      })

      describe('and the page has been visited', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({ data: { ...sessionData.data, checkPageVisited: true } })
        })

        it('returns the correct details the controller needs to redirect the journey to the check page', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, requirementIndex, payload, yarStub)

          expect(result).to.equal({
            checkPageVisited: true
          })
        })

        it('sets the notification message title to "Updated" and the text to "Changes made" ', async () => {
          await SubmitSiteDescriptionService.go(session.id, requirementIndex, payload, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Changes made' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitSiteDescriptionService.go(session.id, requirementIndex, payload, yarStub)

        expect(result).to.equal({
          activeNavBar: 'search',
          pageTitle: 'Enter a site description for the requirements for returns',
          backLink: `/system/return-versions/setup/${session.id}/returns-cycle/0`,
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          siteDescription: null
        }, { skip: ['sessionId', 'error'] })
      })

      describe('because the user has not entered anything', () => {
        it('includes an error for the input element', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, requirementIndex, payload, yarStub)

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

        it('includes an error for the input element', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, requirementIndex, payload, yarStub)

          expect(result.error).to.equal({
            text: 'Site description must be 10 characters or more'
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, requirementIndex, payload, yarStub)

          expect(result.siteDescription).to.equal('Too short')
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

        it('includes an error for the input element', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, requirementIndex, payload, yarStub)

          expect(result.error).to.equal({
            text: 'Site description must be 100 characters or less'
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitSiteDescriptionService.go(session.id, requirementIndex, payload, yarStub)

          expect(result.siteDescription).to.equal(invalidSiteDescription)
        })
      })
    })
  })
})
