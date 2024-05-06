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

// Thing under test
const SubmitNoteService = require('../../../app/services/return-requirements/submit-note.service.js')

describe('Submit Note service', () => {
  let payload
  let session
  let yarStub
  const user = { username: 'carol.shaw@atari.com' }

  beforeEach(async () => {
    await DatabaseSupport.clean()

    session = await SessionHelper.add({
      data: {
        checkAnswersVisited: true,
        licence: {
          id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          currentVersionStartDate: '2023-01-01T00:00:00.000Z',
          endDate: null,
          licenceRef: '01/ABC',
          licenceHolder: 'Turbo Kid',
          startDate: '2022-04-01T00:00:00.000Z'
        },
        journey: 'no-returns-required',
        returnsRequired: 'new-licence'
      }
    })

    yarStub = { flash: Sinon.stub() }
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('with a new note', () => {
        beforeEach(() => {
          payload = {
            note: 'A note related to return requirement'
          }
        })

        it('saves the submitted value', async () => {
          await SubmitNoteService.go(session.id, payload, user, yarStub)

          const refreshedSession = await session.$query()

          expect(refreshedSession.note).to.equal({
            content: 'A note related to return requirement',
            userEmail: 'carol.shaw@atari.com'
          })
        })

        it('returns the journey to redirect the page', async () => {
          const result = await SubmitNoteService.go(session.id, payload, user, yarStub)

          expect(result).to.equal({
            journey: 'no-returns-required'

          }, { skip: ['id'] })
        })

        it("sets the notification message to 'Added' for a new note", async () => {
          await SubmitNoteService.go(session.id, payload, user, yarStub)

          const [flashType, notification] = yarStub.flash.args[0]

          expect(flashType).to.equal('notification')
          expect(notification).to.equal({ title: 'Added', text: 'Changes made' })
        })
      })

      describe('with an updated note', () => {
        beforeEach(async () => {
          session = await SessionHelper.add({
            data: {
              note: {
                content: 'A old note related to return requirement',
                userEmail: 'carol.shaw@atari.com'
              }
            }
          })
          payload = {
            note: 'A new note related to return requirement'
          }
        })

        it("sets the notification message to 'Updated' for an updated note", async () => {
          await SubmitNoteService.go(session.id, payload, user, yarStub)

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

      it('returns page data with an error', async () => {
        const result = await SubmitNoteService.go(session.id, payload, user, yarStub)

        expect(result).to.equal({
          id: session.id,
          activeNavBar: 'search',
          error: {
            text: 'Enter details'
          },
          licenceRef: '01/ABC',
          note: '',
          pageTitle: 'Add a note'
        })
      })
    })
  })
})
