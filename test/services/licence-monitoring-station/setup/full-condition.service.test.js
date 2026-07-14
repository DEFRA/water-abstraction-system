// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'

// Things to stub
import * as FetchFullConditionService from '../../../../app/services/licence-monitoring-station/setup/fetch-full-condition.service.js'
import * as FetchSessionDal from '../../../../app/dal/fetch-session.dal.js'

// Thing under test
import FullConditionService from '../../../../app/services/licence-monitoring-station/setup/full-condition.service.js'

describe('Licence Monitoring Station Setup - Full Condition Service', () => {
  let condition
  let session
  let sessionData

  beforeEach(() => {
    condition = {
      id: 'd5d05f06-b380-4f74-a479-9cbdb81bc279',
      notes: 'NOTES',
      param1: 'PARAM_1',
      param2: 'PARAM_2',
      createdAt: Date.now(),
      displayTitle: 'DISPLAY_TITLE'
    }

    vi.spyOn(FetchFullConditionService, 'default').mockResolvedValue([condition])

    sessionData = {
      label: 'Monitoring Station',
      licenceId: 'LICENCE_ID',
      licenceRef: 'LICENCE_REF'
    }

    session = SessionModelStub(sessionData)

    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns the expected output', async () => {
      const result = await FullConditionService(session.id)

      expect(result).toEqual({
        backLink: `/system/licence-monitoring-station/setup/${session.id}/licence-number`,
        monitoringStationLabel: 'Monitoring Station',
        pageTitle: `Select the full condition for licence LICENCE_REF`,
        radioButtons: [
          {
            value: condition.id,
            text: 'DISPLAY_TITLE 1',
            hint: {
              text: 'NOTES (Additional information 1: PARAM_1) (Additional information 2: PARAM_2)'
            },
            checked: false
          },
          { divider: 'or' },
          {
            value: 'no_condition',
            text: 'The condition is not listed for this licence',
            checked: false
          }
        ]
      })
    })
  })
})
