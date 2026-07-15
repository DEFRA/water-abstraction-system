// Things we need to stub
import LicenceSupplementaryYearModel from '../../../app/models/licence-supplementary-year.model.js'

// Thing under test
import UnassignBillRunToLicencesService from '../../../app/services/bill-runs/unassign-bill-run-to-licences.service.js'

describe('Bill Runs - Unassign Bill Run To Licences service', () => {
  const billRunId = '091c3d3f-0328-4b10-b1a1-3eccf55416a0'

  let licenceSupplementaryYearPatch
  let licenceSupplementaryYearWhere

  beforeEach(() => {
    licenceSupplementaryYearPatch = vi.fn().mockReturnThis()
    licenceSupplementaryYearWhere = vi.fn()

    vi.spyOn(LicenceSupplementaryYearModel, 'query').mockReturnValue({
      patch: licenceSupplementaryYearPatch,
      where: licenceSupplementaryYearWhere
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('updates the matching "LicenceSupplementaryYear" records with a null bill run ID', async () => {
      await UnassignBillRunToLicencesService(billRunId)

      const patchArgs = licenceSupplementaryYearPatch.mock.calls[0][0]

      expect(patchArgs.billRunId).toBeNull()

      const whereArgs = licenceSupplementaryYearWhere.mock.calls[0]

      expect(whereArgs).toEqual(['billRunId', '091c3d3f-0328-4b10-b1a1-3eccf55416a0'])
    })
  })
})
