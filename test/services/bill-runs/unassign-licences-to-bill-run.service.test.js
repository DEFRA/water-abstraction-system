// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Things we need to stub
import LicenceSupplementaryYearModel from '../../../app/models/licence-supplementary-year.model.js'

// Thing under test
import UnassignLicencesToBillRunService from '../../../app/services/bill-runs/unassign-licences-to-bill-run.service.js'

describe('Bill Runs - Unassign Licences To Bill Run service', () => {
  const billRunId = '091c3d3f-0328-4b10-b1a1-3eccf55416a0'
  const licenceIds = ['098e0fff-1c3e-4be3-83b9-8f483ae5b41e', '406b8ba4-63b6-442a-86f3-a144f1f63ca9']

  let licenceSupplementaryYearPatch
  let licenceSupplementaryYearWhereIn
  let licenceSupplementaryYearWhere

  beforeEach(() => {
    licenceSupplementaryYearPatch = vi.fn().mockReturnThis()
    licenceSupplementaryYearWhereIn = vi.fn().mockReturnThis()
    licenceSupplementaryYearWhere = vi.fn()

    vi.spyOn(LicenceSupplementaryYearModel, 'query').mockReturnValue({
      patch: licenceSupplementaryYearPatch,
      whereIn: licenceSupplementaryYearWhereIn,
      where: licenceSupplementaryYearWhere
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('updates the matching "LicenceSupplementaryYear" records with a null bill run ID', async () => {
      await UnassignLicencesToBillRunService(licenceIds, billRunId)

      const patchArgs = licenceSupplementaryYearPatch.mock.calls[0][0]

      expect(patchArgs.billRunId).toBeNull()

      const whereInArgs = licenceSupplementaryYearWhereIn.mock.calls[0]

      expect(whereInArgs).toEqual(['licenceId', licenceIds])

      const whereArgs = licenceSupplementaryYearWhere.mock.calls[0]

      expect(whereArgs).toEqual(['billRunId', '091c3d3f-0328-4b10-b1a1-3eccf55416a0'])
    })
  })
})
