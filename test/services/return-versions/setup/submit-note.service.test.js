// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'

// Thing under test
import SubmitNoteService from '../../../../src/services/return-versions/setup/submit-note.service.js'

describe('Return Versions Setup - Submit Note service', () => {
  const user = { username: 'carol.shaw@atari.com' }

  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      checkPageVisited: false,
      journey: 'returns-required',
      licence: {
        currentVersionStartDate: '2023-01-01T00:00:00.000Z',
        endDate: null,
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        licenceHolder: 'Turbo Kid',
        licenceRef: '01/ABC',
        returnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            modLogs: [],
            reason: null,
            startDate: '2023-01-01T00:00:00.000Z'
          }
        ],
        startDate: '2022-04-01T00:00:00.000Z'
      },
      reason: 'major-change',
      requirements: [{}],
      startDateOptions: 'licenceStartDate'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
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
          await SubmitNoteService(session.id, payload, user, yarStub)

          expect(session.note).toEqual({
            content: 'A new note related to return requirement',
            userEmail: 'carol.shaw@atari.com'
          })
          expect(session.$update).toHaveBeenCalled()
        })

        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitNoteService(session.id, payload, user, yarStub)

          expect(result).toEqual({})
        })

        it('sets the notification message to "Added"', async () => {
          await SubmitNoteService(session.id, payload, user, yarStub)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({ text: 'Note added', title: 'Added' })
        })
      })

      describe('that is an updated note', () => {
        beforeEach(() => {
          sessionData = {
            checkPageVisited: false,
            journey: 'returns-required',
            licence: {
              currentVersionStartDate: '2023-01-01T00:00:00.000Z',
              endDate: null,
              id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
              licenceHolder: 'Turbo Kid',
              licenceRef: '01/ABC',
              startDate: '2022-04-01T00:00:00.000Z'
            },
            note: {
              content: 'A old note related to return requirement',
              userEmail: 'carol.shaw@atari.com'
            },
            reason: 'major-change',
            requirements: [{}],
            startDateOptions: 'licenceStartDate'
          }

          session = SessionModelStub(sessionData)

          vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

          payload = {
            note: 'An updated note related to return requirement'
          }
        })

        it('saves the submitted value', async () => {
          await SubmitNoteService(session.id, payload, user, yarStub)

          expect(session.note).toEqual({
            content: 'An updated note related to return requirement',
            userEmail: 'carol.shaw@atari.com'
          })
          expect(session.$update).toHaveBeenCalled()
        })

        it('returns the journey to redirect the page', async () => {
          const result = await SubmitNoteService(session.id, payload, user, yarStub)

          expect(result).toEqual({})
        })

        it('sets the notification message to "Updated"', async () => {
          await SubmitNoteService(session.id, payload, user, yarStub)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({ text: 'Note updated', title: 'Updated' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitNoteService(session.id, payload, user, yarStub)

        expect(result).toMatchObject({
          backLink: {
            href: `/system/return-versions/setup/${session.id}/check`,
            text: 'Back'
          },
          licenceRef: '01/ABC',
          note: null,
          pageTitle: 'Add a note',
          pageTitleCaption: 'Licence 01/ABC'
        })
      })

      describe('because the user has not entered anything', () => {
        it('includes an error for the input element', async () => {
          const result = await SubmitNoteService(session.id, payload, user, yarStub)

          expect(result.error).toEqual({
            errorList: [
              {
                href: '#note',
                text: 'Enter details'
              }
            ],
            note: { text: 'Enter details' }
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
          const result = await SubmitNoteService(session.id, payload, user, yarStub)

          expect(result.error).toEqual({
            errorList: [
              {
                href: '#note',
                text: 'Enter no more than 500 characters'
              }
            ],
            note: { text: 'Enter no more than 500 characters' }
          })
        })
      })
    })
  })
})
