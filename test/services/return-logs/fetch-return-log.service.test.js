// Test framework
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// Test helpers
import LicenceHelper from '../../support/helpers/licence.helper.js'
import ReturnLogHelper from '../../support/helpers/return-log.helper.js'

// Thing under test
import FetchReturnLogService from '../../../app/services/return-logs/fetch-return-log.service.js'

describe('Return Logs - Fetch Return Log service', () => {
  let licence
  let returnLog

  beforeAll(async () => {
    licence = await LicenceHelper.add()
    returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef })
  })

  afterAll(async () => {
    await returnLog.$query().delete()
    await licence.$query().delete()
  })

  describe('when called', () => {
    it('fetches the matching return log with the linked licence', async () => {
      const result = await FetchReturnLogService(returnLog.id)

      expect(result).toEqual({
        id: returnLog.id,
        licence: {
          id: licence.id,
          licenceRef: licence.licenceRef
        }
      })
    })
  })
})
