// Test framework dependencies

// Test helpers
import SessionModelStub from '../../../../support/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../../app/dal/fetch-session.dal.js'
import * as GenerateFromAbstractionDataService from '../../../../../app/services/return-versions/setup/method/generate-from-abstraction-data.service.js'

// Thing under test
import SubmitMethodService from '../../../../../app/services/return-versions/setup/method/submit-method.service.js'

describe('Return Versions - Setup - Submit Method service', () => {
  let payload
  let session
  let sessionData

  beforeEach(() => {
    sessionData = {
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
        startDate: '2022-04-01T00:00:00.000Z',
        waterUndertaker: false
      },
      multipleUpload: false,
      journey: 'returns-required',
      requirements: [{}],
      startDateOptions: 'licenceStartDate',
      returnVersionStartDate: '2023-01-01T00:00:00.000Z',
      licenceVersion: {
        id: '8b7f78ba-f3ad-4cb6-a058-78abc4d1383d',
        endDate: null,
        startDate: '2022-04-01T00:00:00.000Z',
        copyableReturnVersions: [
          {
            id: '60b5d10d-1372-4fb2-b222-bfac81da69ab',
            startDate: '2023-01-01T00:00:00.000Z',
            reason: null,
            modLogs: []
          }
        ]
      },
      reason: 'major-change'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with a valid payload', () => {
      beforeEach(() => {
        payload = {
          method: 'useAbstractionData'
        }

        vi.spyOn(GenerateFromAbstractionDataService, 'default').mockResolvedValue(_generatedReturnRequirements())
      })

      it('saves the submitted value', async () => {
        await SubmitMethodService(session.id, payload)

        expect(session.method).toEqual('useAbstractionData')
        expect(session.$update.called).toBe(true)
      })

      describe('and the user has selected to use abstraction data', () => {
        it('returns the route to the check page', async () => {
          const result = await SubmitMethodService(session.id, payload)

          expect(result.redirect).toEqual('check')
        })

        it('updates the updates the requirements in the session', async () => {
          await SubmitMethodService(session.id, payload)

          expect(session.requirements).toEqual(_generatedReturnRequirements())
          expect(session.$update.called).toBe(true)
        })
      })

      describe('and the user has selected to copy an existing requirement', () => {
        beforeEach(() => {
          payload = {
            method: 'useExistingRequirements'
          }
        })

        it('returns the route for the select an existing requirement page', async () => {
          const result = await SubmitMethodService(session.id, payload)

          expect(result.redirect).toEqual('existing')
        })
      })

      describe('and the user has selected to setup the requirement manually', () => {
        beforeEach(() => {
          payload = {
            method: 'setUpManually'
          }
        })

        it('returns the route for the select purpose page', async () => {
          const result = await SubmitMethodService(session.id, payload)

          expect(result.redirect).toEqual('purpose/0')
        })
      })
    })

    describe('with an invalid payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('returns page data for the view', async () => {
        const result = await SubmitMethodService(session.id, payload)

        expect(result).toMatchObject({
          pageTitle: 'How do you want to set up the requirements for returns?',
          pageTitleCaption: 'Licence 01/ABC',
          backLink: {
            href: `/system/return-versions/setup/${session.id}/reason`,
            text: 'Back'
          },
          displayCopyExisting: true,
          licenceRef: '01/ABC',
          method: null
        })
      })

      describe('because the user has not submitted anything', () => {
        it('includes an error for the input element', async () => {
          const result = await SubmitMethodService(session.id, payload)

          expect(result.error).toEqual({
            errorList: [
              {
                href: '#method',
                text: 'Select how you want to set up the requirements for returns'
              }
            ],
            method: { text: 'Select how you want to set up the requirements for returns' }
          })
        })
      })
    })
  })
})

function _generatedReturnRequirements() {
  return [
    {
      points: ['12345'],
      purposes: ['cea0e449-48de-4ff9-8dd7-c2f6d74ab1ea'],
      returnsCycle: 'summer',
      siteDescription: 'BOREHOLE IN FIELD',
      abstractionPeriod: {
        abstractionPeriodEndDay: '31',
        abstractionPeriodEndMonth: '12',
        abstractionPeriodStartDay: '1',
        abstractionPeriodStartMonth: '4'
      },
      frequencyReported: 'month',
      frequencyCollected: 'week',
      agreementsExceptions: ['none']
    }
  ]
}
