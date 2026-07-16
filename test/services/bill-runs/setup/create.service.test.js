// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import SessionModelStub from '../../../support/stubs/session.stub.js'
import { engineTriggers } from '../../../../app/lib/static-lookups.lib.js'

// Things we need to stub
import * as LegacyCreateBillRunRequest from '../../../../app/requests/legacy/create-bill-run.request.js'
import * as StartBillRunProcessService from '../../../../app/services/bill-runs/start-bill-run-process.service.js'

// Thing under test
import CreateService from '../../../../app/services/bill-runs/setup/create.service.js'

describe('Bill Runs - Setup - Create service', () => {
  const regionId = '292fe1c3-c9d4-47dd-a01b-0ac916497af5'
  const user = { username: 'carol.shaw@atari.com' }

  let blockingResults
  let legacyCreateBillRunRequestStub
  let session
  let sessionData
  beforeEach(() => {
    legacyCreateBillRunRequestStub = vi.spyOn(LegacyCreateBillRunRequest, 'send').mockImplementation(() => {})
    vi.spyOn(StartBillRunProcessService, 'default').mockResolvedValue()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when the "blockingResults" determines both bill runs should be triggered', () => {
    beforeEach(() => {
      sessionData = { region: regionId, type: 'supplementary' }

      session = SessionModelStub(sessionData)

      blockingResults = { matches: [], toFinancialYearEnding: 2025, trigger: engineTriggers.both }
    })

    it('triggers both bill run engines', async () => {
      await CreateService(session, blockingResults, user)

      expect(StartBillRunProcessService.default).toHaveBeenCalledWith(
        regionId,
        'supplementary',
        'carol.shaw@atari.com',
        2025
      )
      expect(legacyCreateBillRunRequestStub).toHaveBeenCalledWith('supplementary', regionId, 2025, user, false)
    })
  })

  describe('when the "blockingResults" determines only the "current" bill run should be triggered', () => {
    beforeEach(() => {
      sessionData = { region: regionId, type: 'annual' }

      session = SessionModelStub(sessionData)

      blockingResults = { matches: [], toFinancialYearEnding: 2025, trigger: engineTriggers.current }
    })

    it('triggers only the "current" bill run engine', async () => {
      await CreateService(session, blockingResults, user)

      expect(StartBillRunProcessService.default).toHaveBeenCalledWith(regionId, 'annual', 'carol.shaw@atari.com', 2025)
      expect(legacyCreateBillRunRequestStub).not.toHaveBeenCalled()
    })
  })

  describe('when the "blockingResults" determines only the "old" bill run should be triggered', () => {
    beforeEach(() => {
      sessionData = { region: regionId, type: 'two_part_tariff', season: 'summer' }

      session = SessionModelStub(sessionData)

      blockingResults = { matches: [], toFinancialYearEnding: 2022, trigger: engineTriggers.old }
    })

    it('triggers only the "old" bill run engine', async () => {
      await CreateService(session, blockingResults, user)

      expect(StartBillRunProcessService.default).not.toHaveBeenCalled()
      expect(legacyCreateBillRunRequestStub).toHaveBeenCalledWith('two_part_tariff', regionId, 2022, user, true)
    })
  })
})
