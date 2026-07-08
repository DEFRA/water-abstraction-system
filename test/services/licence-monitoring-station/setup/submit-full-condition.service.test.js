// Test framework dependencies

// Test helpers
import * as LicenceVersionPurposeConditionHelper from '../../../support/helpers/licence-version-purpose-condition.helper.js'
import * as LicenceVersionPurposeHelper from '../../../support/helpers/licence-version-purpose.helper.js'
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things to stub
import FetchFullConditionService from '../../../../app/services/licence-monitoring-station/setup/fetch-full-condition.service.js'
import FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'
import FullConditionService from '../../../../app/services/licence-monitoring-station/setup/full-condition.service.js'

// Thing under test
import SubmitFullConditionService from '../../../../app/services/licence-monitoring-station/setup/submit-full-condition.service.js'

describe('Licence Monitoring Station Setup - Submit Full Condition Service', () => {
  let payload
  let session
  let sessionData

  const pageData = {
    pageData: 'PAGE_DATA'
  }

  beforeEach(async () => {
    sessionData = {}

    session = SessionModelStub(sessionData)

    vi.mock('../../../../app/dal/fetch-session.dal.js')
    FetchSessionDal.mockResolvedValue(session)

    const licenceVersionPurpose = await LicenceVersionPurposeHelper.add()
    const licenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
      licenceVersionPurposeId: licenceVersionPurpose.id,
      param1: 'PARAM_1',
      param2: 'PARAM_2',
      notes: 'NOTES'
    })

    payload = {
      condition: licenceVersionPurposeCondition.id
    }

    vi.mock('../../../../app/services/licence-monitoring-station/setup/fetch-full-condition.service.js')
    FetchFullConditionService.mockResolvedValue([
      {
        ...licenceVersionPurposeCondition,
        abstractionPeriodStartDay: licenceVersionPurpose.abstractionPeriodStartDay,
        abstractionPeriodStartMonth: licenceVersionPurpose.abstractionPeriodStartMonth,
        abstractionPeriodEndDay: licenceVersionPurpose.abstractionPeriodEndDay,
        abstractionPeriodEndMonth: licenceVersionPurpose.abstractionPeriodEndMonth,
        displayTitle: 'LICENCE_VERSION_CONDITION_TYPE_DISPLAY_TITLE'
      }
    ])
    vi.mock('../../../../app/services/licence-monitoring-station/setup/full-condition.service.js')
    FullConditionService.mockResolvedValue(pageData)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('saves the submitted value', async () => {
      await SubmitFullConditionService(session.id, payload)

      expect(session.conditionId).toEqual(payload.condition)
      expect(session.$update.called).toBe(true)
    })

    it('saves the abstraction period', async () => {
      await SubmitFullConditionService(session.id, payload)

      expect(session.abstractionPeriodEndDay).toEqual(31)
      expect(session.abstractionPeriodEndMonth).toEqual(3)
      expect(session.abstractionPeriodStartDay).toEqual(1)
      expect(session.abstractionPeriodStartMonth).toEqual(1)
    })

    it('saves the condition display text', async () => {
      await SubmitFullConditionService(session.id, payload)

      expect(session.conditionDisplayText).toEqual(
        'LICENCE_VERSION_CONDITION_TYPE_DISPLAY_TITLE 1: NOTES (Additional information 1: PARAM_1) (Additional information 2: PARAM_2)'
      )
    })

    describe('and no_condition was passed in the payload', () => {
      beforeEach(() => {
        payload = { condition: 'no_condition' }
      })

      it('returns true for abstractionPeriod', async () => {
        const result = await SubmitFullConditionService(session.id, payload)

        expect(result).toEqual({ abstractionPeriod: true })
      })
    })

    describe('and a UUID was passed in the payload', () => {
      it('returns false for abstractionPeriod', async () => {
        const result = await SubmitFullConditionService(session.id, payload)

        expect(result).toEqual({ abstractionPeriod: false })
      })
    })
  })

  describe('when validation fails', () => {
    beforeEach(() => {
      payload = {}
    })

    it('returns page data for the view, with errors', async () => {
      const result = await SubmitFullConditionService(session.id, payload)

      expect(result).toEqual({
        error: { text: 'Select a condition' },
        ...pageData
      })
    })
  })
})
