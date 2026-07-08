// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Things we need to stub
import DetermineRelevantLicenceVersionService from '../../../../app/services/return-versions/setup/determine-relevant-licence-version.service.js'

// Thing under test
import SubmitStartDateService from '../../../../app/services/return-versions/setup/submit-start-date.service.js'

describe('Return Versions - Setup - Submit Start Date service', () => {
  let payload
  let relevantLicenceVersion
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    sessionData = {
      checkPageVisited: false,
      licence: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        currentVersionStartDate: '2023-01-01',
        endDate: null,
        licenceRef: '01/ABC',
        licenceHolder: 'Turbo Kid',
        returnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            startDate: '2023-01-01',
            reason: null,
            modLogs: []
          }
        ],
        startDate: '2019-04-01',
        waterUndertaker: false
      },
      journey: 'returns-required',
      requirements: [{}]
    }

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
      describe('and it is the first time visiting the page', () => {
        beforeEach(() => {
          // NOTE: Default to the user selected "licence start date", but override this for "another start date" tests
          payload = {
            startDateOptions: 'licenceStartDate'
          }

          relevantLicenceVersion = {
            copyableReturnVersions: session.licence.returnVersions,
            endDate: null,
            id: 'c0e59520-3164-43ac-8f64-e1d38dfb90c4',
            startDate: new Date('2023-01-01')
          }
          vi.mock('../../../../app/services/return-versions/setup/determine-relevant-licence-version.service.js')
          DetermineRelevantLicenceVersionService.mockResolvedValue(relevantLicenceVersion)
        })

        it('returns a result that tells the controller to redirect to the next page in the journey', async () => {
          const result = await SubmitStartDateService(session.id, payload, yarStub)

          expect(result).toEqual({ checkPageVisited: false, journey: 'returns-required' })
        })

        describe('where the user selected "licence start date"', () => {
          beforeEach(async () => {
            payload = {
              startDateOptions: 'licenceStartDate'
            }
          })

          it('saves the submitted date details and the relevant licence version', async () => {
            await SubmitStartDateService(session.id, payload, yarStub)

            expect(session.startDateOptions).toEqual('licenceStartDate')
            expect(session.startDateDay).toBeUndefined()
            expect(session.startDateMonth).toBeUndefined()
            expect(session.startDateYear).toBeUndefined()
            expect(new Date(session.returnVersionStartDate)).toEqual(new Date('2023-01-01'))

            expect(session.licenceVersion).toEqual({
              copyableReturnVersions: relevantLicenceVersion.copyableReturnVersions,
              endDate: relevantLicenceVersion.endDate,
              id: relevantLicenceVersion.id,
              startDate: new Date('2023-01-01')
            })

            expect(session.$update.called).toBe(true)
          })
        })

        describe('and the user selected "another start date"', () => {
          beforeEach(() => {
            payload = {
              startDateOptions: 'anotherStartDate',
              startDateDay: '26',
              startDateMonth: '11',
              startDateYear: '2023'
            }
          })

          it('saves the submitted date details and the relevant licence version', async () => {
            await SubmitStartDateService(session.id, payload, yarStub)

            expect(session.startDateOptions).toEqual('anotherStartDate')
            expect(session.startDateDay).toEqual('26')
            expect(session.startDateMonth).toEqual('11')
            expect(session.startDateYear).toEqual('2023')
            expect(new Date(session.returnVersionStartDate)).toEqual(new Date('2023-11-26'))

            expect(session.licenceVersion).toEqual({
              copyableReturnVersions: relevantLicenceVersion.copyableReturnVersions,
              endDate: relevantLicenceVersion.endDate,
              id: relevantLicenceVersion.id,
              startDate: new Date('2023-01-01')
            })

            expect(session.$update.called).toBe(true)
          })
        })

        describe('and when the licence is a water company', () => {
          beforeEach(() => {
            sessionData.licence.waterUndertaker = true

            session = SessionModelStub(sessionData)

            FetchSessionDal.mockResolvedValue(session)
          })

          describe('and the selected start date is before 1 April 2025', () => {
            it('does not set the "quarterly returns" flag in the session', async () => {
              await SubmitStartDateService(session.id, payload, yarStub)

              expect(session.quarterlyReturns).toBeUndefined()
              expect(session.$update.called).toBe(true)
            })
          })

          describe('and the selected start date is on or after 1 April 2025', () => {
            beforeEach(() => {
              payload = {
                startDateOptions: 'anotherStartDate',
                startDateDay: '01',
                startDateMonth: '04',
                startDateYear: '2025'
              }
            })

            it('sets the "quarterly returns" flag to "true" in the session', async () => {
              await SubmitStartDateService(session.id, payload, yarStub)

              expect(session.quarterlyReturns).toBe(true)
            })
          })
        })

        describe('and when the licence is not a water company', () => {
          it('does not set the "quarterly returns" flag in the session', async () => {
            await SubmitStartDateService(session.id, payload, yarStub)

            expect(session.quarterlyReturns).toBeUndefined()
          })
        })
      })

      describe('and the page has been visited previously (we are coming from the "check" page)', () => {
        beforeEach(() => {
          relevantLicenceVersion = {
            copyableReturnVersions: sessionData.licence.returnVersions,
            endDate: null,
            id: 'c0e59520-3164-43ac-8f64-e1d38dfb90c4',
            startDate: new Date('2023-01-01')
          }

          sessionData.checkPageVisited = true
          sessionData.licenceVersion = relevantLicenceVersion
          sessionData.returnVersionStartDate = new Date('2023-01-01')
          sessionData.requirements = [{ index: 1, name: 'foo' }]
          sessionData.method = 'existing'

          session = SessionModelStub(sessionData)

          FetchSessionDal.mockResolvedValue(session)
        })

        describe('and the start date is not changed (user just clicks continue)', () => {
          beforeEach(() => {
            payload = {
              startDateOptions: 'licenceStartDate'
            }
            vi.mock('../../../../app/services/return-versions/setup/determine-relevant-licence-version.service.js')
            DetermineRelevantLicenceVersionService.mockResolvedValue(relevantLicenceVersion)
          })

          it('returns a result that tells the controller to redirect back to the "check" page', async () => {
            const result = await SubmitStartDateService(session.id, payload, yarStub)

            expect(result).toEqual({
              checkPageVisited: true,
              journey: 'returns-required'
            })
          })

          it('sets the notification message title to "Updated" and the text to "Return version updated" ', async () => {
            await SubmitStartDateService(session.id, payload, yarStub)

            const [flashType, notification] = yarStub.flash.mock.calls[0]

            expect(flashType).toEqual('notification')
            expect(notification).toEqual({ titleText: 'Updated', text: 'Return version updated' })
          })

          it('does not change the relevant licence version for the session', async () => {
            await SubmitStartDateService(session.id, payload, yarStub)

            expect(session.licenceVersion).toEqual({
              copyableReturnVersions: relevantLicenceVersion.copyableReturnVersions,
              endDate: relevantLicenceVersion.endDate,
              id: relevantLicenceVersion.id,
              startDate: new Date('2023-01-01')
            })
          })
        })

        describe('and the start date is changed but the same relevant licence version is found', () => {
          beforeEach(() => {
            payload = {
              startDateOptions: 'anotherStartDate',
              startDateDay: '01',
              startDateMonth: '04',
              startDateYear: '2024'
            }

            vi.mock('../../../../app/services/return-versions/setup/determine-relevant-licence-version.service.js')
            DetermineRelevantLicenceVersionService.mockResolvedValue(relevantLicenceVersion)
          })

          it('returns a result that tells the controller to redirect back to the "check" page', async () => {
            const result = await SubmitStartDateService(session.id, payload, yarStub)

            expect(result).toEqual({
              checkPageVisited: true,
              journey: 'returns-required'
            })
          })

          it('sets the notification message title to "Updated" and the text to "Return version updated" ', async () => {
            await SubmitStartDateService(session.id, payload, yarStub)

            const [flashType, notification] = yarStub.flash.mock.calls[0]

            expect(flashType).toEqual('notification')
            expect(notification).toEqual({ titleText: 'Updated', text: 'Return version updated' })
          })

          it('does not change the relevant licence version for the session', async () => {
            await SubmitStartDateService(session.id, payload, yarStub)

            expect(session.licenceVersion).toEqual({
              copyableReturnVersions: relevantLicenceVersion.copyableReturnVersions,
              endDate: relevantLicenceVersion.endDate,
              id: relevantLicenceVersion.id,
              startDate: new Date('2023-01-01')
            })
          })
        })

        describe('and the start date is changed to one which causes a different relevant licence version to be found', () => {
          let newRelevantLicenceVersion

          beforeEach(() => {
            newRelevantLicenceVersion = {
              copyableReturnVersions: [],
              endDate: new Date('2022-12-31'),
              id: '11d8af4a-3273-4001-adc1-74b7851f7102',
              startDate: new Date('2020-04-01')
            }

            payload = {
              startDateOptions: 'anotherStartDate',
              startDateDay: '01',
              startDateMonth: '04',
              startDateYear: '2021'
            }

            vi.mock('../../../../app/services/return-versions/setup/determine-relevant-licence-version.service.js')
            DetermineRelevantLicenceVersionService.mockResolvedValue(newRelevantLicenceVersion)
          })

          it('returns a result that tells the controller to redirect to the next page in the journey', async () => {
            const result = await SubmitStartDateService(session.id, payload, yarStub)

            expect(result).toEqual({ checkPageVisited: false, journey: 'returns-required' })
          })

          it('does not set the notification message', async () => {
            await SubmitStartDateService(session.id, payload, yarStub)

            expect(yarStub.flash).not.toHaveBeenCalled()
          })

          it('updates the relevant licence version for the session and resets the session', async () => {
            await SubmitStartDateService(session.id, payload, yarStub)

            expect(session.licenceVersion).toEqual({
              copyableReturnVersions: [],
              endDate: new Date('2022-12-31'),
              id: newRelevantLicenceVersion.id,
              startDate: new Date('2020-04-01')
            })

            expect(session.method).toBeUndefined()
            expect(session.checkPageVisited).toBe(false)
            expect(session.requirements).toEqual([{}])
          })
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns the page data for the view', async () => {
        const result = await SubmitStartDateService(session.id, payload, yarStub)

        expect(result).toMatchObject({
          pageTitle: 'Select the start date for the requirements for returns',
          pageTitleCaption: 'Licence 01/ABC',
          startDateDay: null,
          startDateMonth: null,
          startDateYear: null,
          backLink: {
            href: '/system/licences/8b7f78ba-f3ad-4cb6-a058-78abc4d1383d/set-up',
            text: 'Back'
          },
          licenceId: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
          licenceRef: '01/ABC',
          licenceVersionStartDate: '1 January 2023',
          startDateOption: null
        })
      })

      describe('because the user has not selected anything', () => {
        it('includes an error for the radio form element', async () => {
          const result = await SubmitStartDateService(session.id, payload, yarStub)

          expect(result.error).toEqual({
            errorList: [
              {
                href: '#startDateOptions',
                text: 'Select the start date for the requirements for returns'
              }
            ],
            startDateOptions: { text: 'Select the start date for the requirements for returns' }
          })
        })
      })

      describe('because the user has selected another start date and entered invalid data', () => {
        beforeEach(() => {
          payload = {
            startDateOptions: 'anotherStartDate',
            startDateDay: 'a',
            startDateMonth: 'b',
            startDateYear: 'c'
          }
        })

        it('includes an error for the date input element', async () => {
          const result = await SubmitStartDateService(session.id, payload, yarStub)

          expect(result.error).toEqual({
            errorList: [
              {
                href: '#anotherStartDate',
                text: 'Enter a real start date'
              }
            ],
            anotherStartDate: { text: 'Enter a real start date' }
          })
        })

        it('includes what was submitted', async () => {
          const result = await SubmitStartDateService(session.id, payload, yarStub)

          expect(result.startDateDay).toEqual('a')
          expect(result.startDateMonth).toEqual('b')
          expect(result.startDateYear).toEqual('c')
          expect(result.startDateOption).toEqual('anotherStartDate')
        })
      })
    })
  })
})
