// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import YarStub from '../../../support/stubs/yar.stub.js'

// Things we need to stub
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import CheckService from '../../../../app/services/return-logs/setup/check.service.js'

describe('Return Logs Setup - Check service', () => {
  let session
  let sessionData
  let yarStub

  beforeEach(() => {
    yarStub = YarStub()
    yarStub.flash.mockReturnValue([])

    sessionData = _sessionData()

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called for the first time', () => {
    it('returns page data for the view', async () => {
      const result = await CheckService(session.id, yarStub)

      expect(result).toEqual({
        abstractionPeriod: '1 January to 31 December',
        displayReadings: true,
        displayUnits: true,
        enterMultipleLinkText: 'Enter multiple monthly readings',
        links: {
          cancel: `/system/return-logs/setup/${session.id}/cancel`,
          meterDetails: `/system/return-logs/setup/${session.id}/meter-provided`,
          multipleEntries: `/system/return-logs/setup/${session.id}/multiple-entries`,
          nilReturn: `/system/return-logs/setup/${session.id}/submission`,
          received: `/system/return-logs/setup/${session.id}/received`,
          reported: `/system/return-logs/setup/${session.id}/reported`,
          startReading: `/system/return-logs/setup/${session.id}/start-reading`,
          units: `/system/return-logs/setup/${session.id}/units`
        },
        meter10TimesDisplay: undefined,
        meterMake: undefined,
        meterProvided: 'no',
        meterSerialNumber: undefined,
        nilReturn: 'No',
        note: {
          actions: [
            {
              href: 'note',
              text: 'Add a note'
            }
          ],
          text: 'No notes added'
        },
        notification: undefined,
        pageTitle: 'Check details and enter new volumes or readings',
        pageTitleCaption: 'Return reference 1234',
        purposes: 'Evaporative Cooling',
        returnReceivedDate: '31 January 2025',
        reportingFigures: 'Meter readings',
        returnPeriod: '1 April 2004 to 31 March 2005',
        siteDescription: 'POINT A, TEST SITE DESCRIPTION',
        startReading: 0,
        summaryTableData: {
          headers: [
            {
              text: 'Month'
            },
            {
              format: 'numeric',
              text: 'Reading'
            },
            {
              format: 'numeric',
              text: 'Megalitres'
            },
            {
              format: 'numeric',
              text: 'Cubic metres'
            },
            {
              format: 'numeric',
              text: 'Details'
            }
          ],
          rows: []
        },
        tableTitle: 'Summary of monthly readings',
        tariff: 'Standard',
        totalCubicMetres: '0',
        totalQuantity: '0',
        units: 'Megalitres'
      })
    })

    it('updates the session record to indicate user has visited the "check" page', async () => {
      await CheckService(session.id, yarStub)

      expect(session.checkPageVisited).toBe(true)
      expect(session.$update).toHaveBeenCalled()
    })
  })
})

function _sessionData() {
  return {
    endDate: '2005-03-31T00:00:00.000Z',
    lines: [],
    meterProvided: 'no',
    periodEndDay: 31,
    periodEndMonth: 12,
    periodStartDay: 1,
    periodStartMonth: 1,
    purposes: ['Evaporative Cooling'],
    receivedDate: '2025-01-31T00:00:00.000Z',
    reported: 'meterReadings',
    returnReference: '1234',
    returnsFrequency: 'month',
    siteDescription: 'POINT A, TEST SITE DESCRIPTION',
    startDate: '2004-04-01T00:00:00.000Z',
    startReading: 0,
    twoPartTariff: false,
    units: 'megalitres',
    unitSymbol: 'Ml'
  }
}
