// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import SubmitAdditionalSubmissionOptionsService from '../../../../app/services/return-versions/setup/submit-additional-submission-options.service.js'

describe('Return Versions Setup - Submit Additional Submission Options service', () => {
  let payload
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      checkPageVisited: false,
      journey: 'returns-required',
      licence: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Turbo Kid'
      },
      multipleUpload: false
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with no additional options ', () => {
      beforeEach(() => {
        payload = {
          additionalSubmissionOptions: 'none'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAdditionalSubmissionOptionsService(session.id, payload, yarStub)

        expect(session.noAdditionalOptions).toBe(true)
        expect(session.$update).toHaveBeenCalled()
      })

      it('sets the notification message to "Updated"', async () => {
        await SubmitAdditionalSubmissionOptionsService(session.id, payload, yarStub)

        const [flashType, notification] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('notification')
        expect(notification).toEqual({
          title: 'Updated',
          text: 'Additional submission options updated'
        })
      })
    })

    describe('with multiple upload selected', () => {
      beforeEach(() => {
        payload = {
          additionalSubmissionOptions: 'multiple-upload'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAdditionalSubmissionOptionsService(session.id, payload, yarStub)

        expect(session.multipleUpload).toBe(true)
      })

      it('sets the notification message to "Updated"', async () => {
        await SubmitAdditionalSubmissionOptionsService(session.id, payload, yarStub)

        const [flashType, notification] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('notification')
        expect(notification).toEqual({
          title: 'Updated',
          text: 'Additional submission options updated'
        })
      })
    })

    describe('with quarterly returns selected', () => {
      beforeEach(() => {
        payload = {
          additionalSubmissionOptions: 'quarterly-returns'
        }
      })

      it('saves the submitted value', async () => {
        await SubmitAdditionalSubmissionOptionsService(session.id, payload, yarStub)

        expect(session.quarterlyReturns).toBe(true)
      })

      it('sets the notification message to "Updated"', async () => {
        await SubmitAdditionalSubmissionOptionsService(session.id, payload, yarStub)

        const [flashType, notification] = yarStub.flash.mock.calls[0]

        expect(flashType).toEqual('notification')
        expect(notification).toEqual({
          title: 'Updated',
          text: 'Additional submission options updated'
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitAdditionalSubmissionOptionsService(session.id, payload, yarStub)

        expect(result).toMatchObject({
          backLink: {
            href: `/system/return-versions/setup/${session.id}/check`,
            text: 'Back'
          },
          pageTitle: 'Select any additional submission options for the return requirements',
          pageTitleCaption: 'Licence 01/ABC',
          licenceRef: '01/ABC',
          multipleUpload: false,
          noAdditionalOptions: undefined,
          quarterlyReturnSubmissions: false,
          quarterlyReturns: undefined
        })
      })

      describe('because the user has not checked anything', () => {
        it('includes an error for the checkbox element', async () => {
          const result = await SubmitAdditionalSubmissionOptionsService(session.id, payload, yarStub)

          expect(result.error).toEqual({
            errorList: [
              {
                href: '#additionalSubmissionOptions',
                text: 'Select additional submission options for the requirements for returns'
              }
            ],
            additionalSubmissionOptions: {
              text: 'Select additional submission options for the requirements for returns'
            }
          })
        })
      })
    })
  })
})
