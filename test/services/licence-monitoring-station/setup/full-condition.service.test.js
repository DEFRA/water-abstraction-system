// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'

// Things to stub
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import * as FetchFullConditionDal from '../../../../src/dal/licence-monitoring-station/setup/fetch-full-condition.dal.js'

// Thing under test
import FullConditionService from '../../../../src/services/licence-monitoring-station/setup/full-condition.service.js'

describe('Licence Monitoring Station Setup - Full Condition Service', () => {
  let condition
  let session
  let sessionData

  beforeEach(() => {
    condition = {
      createdAt: Date.now(),
      displayTitle: 'DISPLAY_TITLE',
      id: 'd5d05f06-b380-4f74-a479-9cbdb81bc279',
      notes: 'NOTES',
      param1: 'PARAM_1',
      param2: 'PARAM_2'
    }

    vi.spyOn(FetchFullConditionDal, 'default').mockResolvedValue([condition])

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
            checked: false,
            hint: {
              text: 'NOTES (Additional information 1: PARAM_1) (Additional information 2: PARAM_2)'
            },
            text: 'DISPLAY_TITLE 1',
            value: condition.id
          },
          { divider: 'or' },
          {
            checked: false,
            text: 'The condition is not listed for this licence',
            value: 'no_condition'
          }
        ]
      })
    })
  })
})
