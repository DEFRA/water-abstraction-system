'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const SessionHelper = require('../../../support/helpers/session.helper.js')

// Thing under test
const SubmitNoteService = require('../../../../app/services/return-versions/setup/submit-note.service.js')

describe('Return Versions Setup - Submit Note service', () => {
  const user = { username: 'carol.shaw@atari.com' }

  let payload
  let session
  let yarStub

  beforeEach(async () => {
    session = await SessionHelper.add({
      data: {
        checkPageVisited: false,
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          returnVersions: [
            {
              id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
              startDate: '2023-01-01T00:00:00.000Z',
              reason: null,
              modLogs: []
            }
          ],
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'returns-required',
        requirements: [{}],
        startDateOptions: 'licenceStartDate',
        reason: 'major-change'
      }
    })

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('that is a new note', () => {
        beforeEach(() => {
          payload = {
            note: 'A new note related to return requirement'
          }
        })

        it('saves the submitted value', async () => {
          await SubmitNoteService.go(session.id, payload, user, yarStub)

          const refreshedSession = await session.$query()

          expect(refreshedSession.note).to.equal({
            content: 'A new note related to return requirement',
            userEmail: 'carol.shaw@atari.com'
          })
        })

        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitNoteService.go(session.id, payload, user, yarStub)

          expect(result).to.equal({})
        })

        it('sets the notification message to "Added"', async () => {
          await SubmitNoteService.go(session.id, payload, user, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ text: 'Note added', title: 'Added' })
        })
      })

      describe('that is an updated note', () => {
        beforeEach(async () => {
          await session.$query().patch({
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
              reason: 'major-change',
              note: {
                content: 'A old note related to return requirement',
                userEmail: 'carol.shaw@atari.com'
              }
            }
          })

          payload = {
            note: 'An updated note related to return requirement'
          }
        })

        it('saves the submitted value', async () => {
          await SubmitNoteService.go(session.id, payload, user, yarStub)

          const refreshedSession = await session.$query()

          expect(refreshedSession.note).to.equal({
            content: 'An updated note related to return requirement',
            userEmail: 'carol.shaw@atari.com'
          })
        })

        it('returns the journey to redirect the page', async () => {
          const result = await SubmitNoteService.go(session.id, payload, user, yarStub)

          expect(result).to.equal({})
        })

        it('sets the notification message to "Updated"', async () => {
          await SubmitNoteService.go(session.id, payload, user, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Updated', text: 'Note updated' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitNoteService.go(session.id, payload, user, yarStub)

        expect(result).to.equal(
          {
            activeNavBar: 'search',
            pageTitle: 'Add a note',
            backLink: `/system/return-versions/setup/${session.id}/check`,
            licenceRef: '01/ABC',
            note: null
          },
          { skip: ['sessionId', 'error'] }
        )
      })

      describe('because the user has not entered anything', () => {
        it('includes an error for the input element', async () => {
          const result = await SubmitNoteService.go(session.id, payload, user, yarStub)

          expect(result.error).to.equal({
            text: 'Enter details'
          })
        })
      })

      describe('because the user has entered a note more than 500 characters', () => {
        beforeEach(() => {
          payload = {
            note: `Lorem ipsum dolor sit amet consectetur adipiscing elitLorem ipsum dolor sit amet consectetur adipiscing elitLorem ipsum dolor sit amet consectetur adipiscing elitLorem ipsum dolor sit amet consectetur adipiscing elit

            Lorem ipsum dolor sit amet consectetur adipiscing elit

            Lorem ipsum dolor sit amet consectetur adipiscing elit

            Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit

            Lorem ipsum dolor sit amet consectetur adipiscing elit
            Lorem ipsum dolor sit amet consectetur adipiscing elit`
          }
        })

        it('includes an error for the input element', async () => {
          const result = await SubmitNoteService.go(session.id, payload, user, yarStub)

          expect(result.error).to.equal({
            text: 'Enter no more than 500 characters'
          })
        })
      })
    })
  })
})
