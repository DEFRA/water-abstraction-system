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
const SubmitAddNoteService = require('../../../app/services/return-requirements/submit-add-note.service.js')

describe('Submit Add Note service', () => {
  let payload
  let session
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
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          note: 'A note related to return requirement'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAddNoteService.go(session.id, payload, user)

        const refreshedSession = await session.$query()

        expect(refreshedSession.data.note).to.equal({
          content: 'A note related to return requirement',
          status: 'Added',
          userEmail: 'carol.shaw@atari.com'
        })
      })

      it('returns the journey to redirect the page', async () => {
        const result = await SubmitAddNoteService.go(session.id, payload, user)

        expect(result).to.equal({
          journey: 'no-returns-required'

        }, { skip: ['id'] })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data with an error', async () => {
        const result = await SubmitAddNoteService.go(session.id, payload, user)

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
