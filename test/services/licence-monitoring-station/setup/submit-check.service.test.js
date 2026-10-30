// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from 'water-abstraction-engine/test/stubs/session.stub.js'
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'
import { generateLicenceRef, generateUserId, generateUUID } from 'water-abstraction-engine/test/generators.js'

// Things we need to stub
import * as DeleteSessionDal from 'water-abstraction-engine/dal/delete-session.dal.js'
import * as FetchSessionDal from 'water-abstraction-engine/dal/fetch-session.dal.js'
import * as CreateTagDal from '../../../../src/dal/licence-monitoring-station/setup/create-tag.dal.js'

// Thing under test
import SubmitCheckService from '../../../../src/services/licence-monitoring-station/setup/submit-check.service.js'

describe('Licence Monitoring Station - Setup - Submit Check service', () => {
  let createTagDalStub
  let deleteSessionDalStub
  let session
  let sessionData
  let userId
  let yarStub

  beforeEach(() => {
    sessionData = {
      abstractionPeriodEndDay: 31,
      abstractionPeriodEndMonth: 12,
      abstractionPeriodStartDay: 1,
      abstractionPeriodStartMonth: 1,
      checkPageVisited: true,
      conditionDisplayText: 'CONDITION_DISPLAY_TEXT',
      conditionId: 'no_condition',
      label: 'LABEL',
      licenceId: generateUUID(),
      licenceRef: generateLicenceRef(),
      monitoringStationId: generateUUID(),
      reduceAtThreshold: null,
      stopOrReduce: 'stop',
      threshold: 100,
      unit: 'Ml/d'
    }

    session = SessionModelStub(sessionData)

    userId = generateUserId()

    createTagDalStub = vi.spyOn(CreateTagDal, 'default').mockResolvedValue()
    deleteSessionDalStub = vi.spyOn(DeleteSessionDal, 'default').mockResolvedValue()
    vi.spyOn(FetchSessionDal, 'default').mockResolvedValue(session)

    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('calls the "CreateTagDal" to create the monitoring station tag', async () => {
      await SubmitCheckService(session.id, userId, yarStub)

      expect(createTagDalStub).toHaveBeenCalledExactlyOnceWith(session, userId)
    })

    it('deletes the session', async () => {
      await SubmitCheckService(session.id, userId, yarStub)

      expect(deleteSessionDalStub).toHaveBeenCalledExactlyOnceWith(session.id)
    })

    it('sets the notification message title to "Success" and the text to "Tag for licence ... added"', async () => {
      await SubmitCheckService(session.id, userId, yarStub)

      const [flashType, notification] = yarStub.flash.mock.calls[0]

      expect(flashType).toEqual('notification')
      expect(notification).toEqual({
        text: `Tag for licence ${session.licenceRef} added`,
        titleText: 'Success'
      })
    })

    it('returns the monitoring station ID to continue the journey', async () => {
      const result = await SubmitCheckService(session.id, userId, yarStub)

      expect(result).toEqual(session.monitoringStationId)
    })
  })
})
