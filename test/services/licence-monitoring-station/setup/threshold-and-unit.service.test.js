// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

// Things we need to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'

// Thing under test
import ThresholdAndUnitService from '../../../../src/services/licence-monitoring-station/setup/threshold-and-unit.service.js'

describe('Licence Monitoring Station Setup - Threshold and Unit service', () => {
  let session
  let sessionData

  beforeEach(() => {
    sessionData = { label: 'Monitoring Station Label', monitoringStationId: 'e1c44f9b-51c2-4aee-a518-5509d6f05869' }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('fetches the current setup session record', async () => {
      const result = await ThresholdAndUnitService(session.id)

      expect(result.sessionId).toEqual(session.id)
    })

    it('returns page data for the view', async () => {
      const result = await ThresholdAndUnitService(session.id)

      expect(result).toMatchObject({
        backLink: '/system/monitoring-stations/e1c44f9b-51c2-4aee-a518-5509d6f05869',
        displayUnits: [
          { checked: false, hint: { text: 'megalitres per day' }, text: 'Ml/d', value: 'Ml/d' },
          { checked: false, hint: { text: 'cubic metres per second' }, text: 'm3/s', value: 'm3/s' },
          { checked: false, hint: { text: 'cubic metres per day' }, text: 'm3/d', value: 'm3/d' },
          { checked: false, hint: { text: 'litres per second' }, text: 'l/s', value: 'l/s' },
          { checked: false, hint: { text: 'metres above ordnance datum' }, text: 'mAOD', value: 'mAOD' },
          { checked: false, hint: { text: 'metres below ordnance datum' }, text: 'mBOD', value: 'mBOD' },
          { checked: false, hint: { text: 'metres above sea datum' }, text: 'mASD', value: 'mASD' },
          { checked: false, hint: { text: 'metres' }, text: 'm', value: 'm' },
          { checked: false, hint: { text: 'south level datum' }, text: 'SLD', value: 'SLD' },
          { checked: false, hint: { text: 'cubic foot per second' }, text: 'ft3/s', value: 'ft3/s' },
          { checked: false, hint: { text: 'gallons per day' }, text: 'gpd', value: 'gpd' },
          { checked: false, hint: { text: 'million gallons per day' }, text: 'Mgpd', value: 'Mgpd' }
        ],
        monitoringStationLabel: 'Monitoring Station Label',
        pageTitle: 'What is the licence hands-off flow or level threshold?',
        threshold: null
      })
    })
  })
})
