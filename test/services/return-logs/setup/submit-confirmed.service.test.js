// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import LicenceHelper from '../../../support/helpers/licence.helper.js'
import ReturnLogHelper from '../../../support/helpers/return-log.helper.js'

// Things we need to stub
import * as ProcessBillingFlagService from '../../../../app/services/licences/supplementary/process-billing-flag.service.js'

// Thing under test
import SubmitConfirmedService from '../../../../app/services/return-logs/setup/submit-confirmed.service.js'

describe('Return Logs Setup - Submit Confirmed service', () => {
  let licence
  let returnLog
  beforeEach(async () => {
    licence = await LicenceHelper.add()

    returnLog = await ReturnLogHelper.add({ licenceRef: licence.licenceRef })

    vi.spyOn(ProcessBillingFlagService, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a user submits the confirmed return to be marked for supplementary billing', () => {
    it('returns the licenceId for the redirect', async () => {
      const result = await SubmitConfirmedService(returnLog.id)

      expect(result).toEqual(licence.id)
    })

    it('sends the return to be processed by the "processBillingFlagsService"', async () => {
      await SubmitConfirmedService(returnLog.id)

      expect(ProcessBillingFlagService.default).toHaveBeenCalled()
    })
  })
})
