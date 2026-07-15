// Test helpers
import { generateUUID } from '../../../../app/lib/general.lib.js'
import LicenceSupplementaryYearHelper from '../../../support/helpers/licence-supplementary-year.helper.js'
import LicenceSupplementaryYearModel from '../../../../app/models/licence-supplementary-year.model.js'

// Thing under test
import CreateLicenceSupplementaryYearService from '../../../../app/services/licences/supplementary/create-licence-supplementary-year.service.js'

describe('Create Licence Supplementary Years Service', () => {
  let licenceId
  let twoPartTariff
  let financialYearEnds

  describe('when provided a licenceId, years and twoPartTariff data', () => {
    beforeEach(async () => {
      licenceId = generateUUID()
      twoPartTariff = true
      financialYearEnds = [2023]
    })

    describe('that does not already exist', () => {
      it('persists the data', async () => {
        await CreateLicenceSupplementaryYearService(licenceId, financialYearEnds, twoPartTariff)

        const result = await _fetchLicenceSupplementaryYears(licenceId)

        expect(result).toHaveLength(1)
        expect(result[0]).toMatchObject({
          licenceId,
          billRunId: null,
          financialYearEnd: financialYearEnds[0],
          twoPartTariff
        })
      })
    })

    describe('that already exist', () => {
      beforeEach(async () => {
        await LicenceSupplementaryYearHelper.add({ licenceId, financialYearEnd: 2023, twoPartTariff: true })
      })

      describe('without the billRunId', () => {
        it('does not persist the data', async () => {
          await CreateLicenceSupplementaryYearService(licenceId, financialYearEnds, twoPartTariff)

          const result = await _fetchLicenceSupplementaryYears(licenceId)

          expect(result).toHaveLength(1)
          expect(result[0].licenceId).toEqual(licenceId)
        })
      })

      describe('with the billRunId', () => {
        let billRunId

        beforeEach(async () => {
          billRunId = generateUUID()

          await LicenceSupplementaryYearModel.query()
            .update({ billRunId })
            .where('licenceId', licenceId)
            .orderBy('billRunId')
        })

        it('persist the data', async () => {
          await CreateLicenceSupplementaryYearService(licenceId, financialYearEnds, twoPartTariff)

          const result = await _fetchLicenceSupplementaryYears(licenceId)

          expect(result).toHaveLength(2)
          expect(result[0].billRunId).toEqual(billRunId)
          expect(result[1].billRunId).toEqual(null)
        })
      })
    })
  })
})

function _fetchLicenceSupplementaryYears(licenceId) {
  return LicenceSupplementaryYearModel.query()
    .select(['id', 'licenceId', 'billRunId', 'financialYearEnd', 'twoPartTariff'])
    .where('licenceId', licenceId)
}
