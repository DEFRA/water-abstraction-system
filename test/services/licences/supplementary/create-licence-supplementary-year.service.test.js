'use strict'

// Test framework dependencies

const Code = require('@hapi/code')

const { describe, it, beforeEach } = require('node:test')
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../../app/lib/general.lib.js')
const LicenceSupplementaryYearHelper = require('../../../support/helpers/licence-supplementary-year.helper.js')
const LicenceSupplementaryYearModel = require('../../../../app/models/licence-supplementary-year.model.js')

// Thing under test
const CreateLicenceSupplementaryYearService = require('../../../../app/services/licences/supplementary/create-licence-supplementary-year.service.js')

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
        await CreateLicenceSupplementaryYearService.go(licenceId, financialYearEnds, twoPartTariff)

        const result = await _fetchLicenceSupplementaryYears(licenceId)

        expect(result).to.have.length(1)
        expect(result[0]).to.equal({
          licenceId,
          billRunId: null,
          financialYearEnd: financialYearEnds[0],
          twoPartTariff
        }, { skip: ['id'] })
      })
    })

    describe('that already exist', () => {
      beforeEach(async () => {
        await LicenceSupplementaryYearHelper.add({ licenceId, financialYearEnd: 2023, twoPartTariff: true })
      })

      describe('without the billRunId', () => {
        it('does not persist the data', async () => {
          await CreateLicenceSupplementaryYearService.go(licenceId, financialYearEnds, twoPartTariff)

          const result = await _fetchLicenceSupplementaryYears(licenceId)

          expect(result).to.have.length(1)
          expect(result[0].licenceId).to.equal(licenceId)
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
          await CreateLicenceSupplementaryYearService.go(licenceId, financialYearEnds, twoPartTariff)

          const result = await _fetchLicenceSupplementaryYears(licenceId)

          expect(result).to.have.length(2)
          expect(result[0].billRunId).to.equal(billRunId)
          expect(result[1].billRunId).to.equal(null)
        })
      })
    })
  })
})

function _fetchLicenceSupplementaryYears (licenceId) {
  return LicenceSupplementaryYearModel.query()
    .select([
      'id',
      'licenceId',
      'billRunId',
      'financialYearEnd',
      'twoPartTariff'
    ])
    .where('licenceId', licenceId)
}
