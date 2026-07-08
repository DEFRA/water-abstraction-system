// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitNoteService from '../../../../app/services/return-logs/setup/submit-note.service.js'

describe('Return Logs Setup - Submit Note service', () => {
  const user = { username: 'carol.shaw@atari.com' }
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = { returnReference: '1234' }

    session = SessionModelStub(sessionData)

    vi.mock('../../../../app/dal/fetch-session.dal.js')
    FetchSessionDal.mockResolvedValue(session)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      describe('that is a new note', () => {
        beforeEach(() => {
          payload = { note: 'A new note related to return logs' }
        })

        it('saves the submitted value', async () => {
          await SubmitNoteService(session.id, payload, user, yarStub)

          expect(session.note).toEqual({
            content: 'A new note related to return logs',
            userEmail: 'carol.shaw@atari.com'
          })
          expect(session.$update.called).toBe(true)
        })

        it('returns the correct details the controller needs to redirect the journey', async () => {
          const result = await SubmitNoteService(session.id, payload, user, yarStub)

          expect(result).toEqual({})
        })

        it('sets the notification message to "Added"', async () => {
          await SubmitNoteService(session.id, payload, user, yarStub)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({ title: 'Added', text: 'Note added' })
        })
      })

      describe('that is an updated note', () => {
        beforeEach(() => {
          sessionData = {
            note: {
              content: 'A old note related to return requirement',
              userEmail: 'carol.shaw@atari.com'
            }
          }

          session = SessionModelStub(sessionData)

          FetchSessionDal.mockResolvedValue(session)

          payload = { note: 'An updated note related to return requirement' }
        })

        it('saves the submitted value', async () => {
          await SubmitNoteService(session.id, payload, user, yarStub)

          expect(session.note).toEqual({
            content: 'An updated note related to return requirement',
            userEmail: 'carol.shaw@atari.com'
          })
        })

        it('returns the journey to redirect the page', async () => {
          const result = await SubmitNoteService(session.id, payload, user, yarStub)

          expect(result).toEqual({})
        })

        it('sets the notification message to "Updated"', async () => {
          await SubmitNoteService(session.id, payload, user, yarStub)

          const [flashType, notification] = yarStub.flash.mock.calls[0]

          expect(flashType).toEqual('notification')
          expect(notification).toEqual({ title: 'Updated', text: 'Note updated' })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitNoteService(session.id, payload, user, yarStub)

        expect(result).toEqual({
          backLink: {
            href: `/system/return-logs/setup/${session.id}/check`,
            text: 'Back'
          },
          error: {
            errorList: [
              {
                href: '#note',
                text: 'Enter details'
              }
            ],
            note: {
              text: 'Enter details'
            }
          },
          note: null,
          pageTitle: 'Add a note',
          pageTitleCaption: 'Return reference 1234',
          sessionId: session.id
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
            note: {
              text: 'Enter details'
            }
          })
        })
      })

      describe('because the user has entered a note more than 500 characters', () => {
        beforeEach(() => {
          payload = {
            note: `Lorem ipsum dolor sit amet consectetur adipiscing elit
              Lorem ipsum dolor sit amet consectetur adipiscing elit
              Lorem ipsum dolor sit amet consectetur adipiscing elit
              Lorem ipsum dolor sit amet consectetur adipiscing elit
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
            note: {
              text: 'Enter no more than 500 characters'
            }
          })
        })
      })
    })
  })
})
