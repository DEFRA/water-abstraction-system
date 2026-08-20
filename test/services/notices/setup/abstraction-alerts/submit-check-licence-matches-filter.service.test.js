// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import YarStub from 'water-abstraction-engine/test/stubs/yar.stub.js'

// Thing under test
import SubmitCheckLicenceMatchesFilterService from '../../../../../src/services/notices/setup/abstraction-alerts/submit-check-licence-matches-filter.service.js'

describe('Notices - Setup - Abstraction Alerts - Submit Check Licence Matches Filter service', () => {
  const sessionId = 'e4d4d5e6-0d4c-4d55-bd23-5b3ecd9b0f1a'

  let payload
  let yarStub

  beforeEach(() => {
    yarStub = YarStub()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    describe('with an empty payload', () => {
      beforeEach(() => {
        payload = {}
      })

      it('saves a default "checkLicenceMatchesFilter" object in the session', async () => {
        await SubmitCheckLicenceMatchesFilterService(sessionId, payload, yarStub)

        const setArgs = yarStub.set.mock.calls[0]

        expect(setArgs[0]).toEqual(`checkLicenceMatchesFilter-${sessionId}`)
        expect(setArgs[1]).toEqual({ periods: [] })
      })
    })

    describe('with the instruction to clear filters', () => {
      beforeEach(() => {
        payload = {
          clearFilters: 'reset'
        }
      })

      it('clears the "checkLicenceMatchesFilter" object from the session', async () => {
        await SubmitCheckLicenceMatchesFilterService(sessionId, payload, yarStub)

        expect(yarStub.clear).toHaveBeenCalledWith(`checkLicenceMatchesFilter-${sessionId}`)
      })

      it('does not save anything to the session', async () => {
        await SubmitCheckLicenceMatchesFilterService(sessionId, payload, yarStub)

        expect(yarStub.set).not.toHaveBeenCalled()
      })
    })

    describe('with a single abstraction period selected', () => {
      beforeEach(() => {
        payload = { periods: '1-1-31-3' }
      })

      it('saves the selected period as an array in the "checkLicenceMatchesFilter" object', async () => {
        await SubmitCheckLicenceMatchesFilterService(sessionId, payload, yarStub)

        const setArgs = yarStub.set.mock.calls[0]

        expect(setArgs[0]).toEqual(`checkLicenceMatchesFilter-${sessionId}`)
        expect(setArgs[1]).toEqual({ periods: ['1-1-31-3'] })
      })
    })

    describe('with multiple abstraction periods selected', () => {
      beforeEach(() => {
        payload = { periods: ['1-1-31-3', '1-2-1-1'] }
      })

      it('saves the selected periods in the "checkLicenceMatchesFilter" object', async () => {
        await SubmitCheckLicenceMatchesFilterService(sessionId, payload, yarStub)

        const setArgs = yarStub.set.mock.calls[0]

        expect(setArgs[0]).toEqual(`checkLicenceMatchesFilter-${sessionId}`)
        expect(setArgs[1]).toEqual({ periods: ['1-1-31-3', '1-2-1-1'] })
      })
    })
  })
})
