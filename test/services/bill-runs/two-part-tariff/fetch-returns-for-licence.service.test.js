'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')

const { describe, it, beforeEach } = exports.lab = Lab.script()
const { expect } = Code

// Test helpers
const DatabaseHelper = require('../../../support/helpers/database.helper.js')
const LineHelper = require('../../../support/helpers/returns/line.helper.js')
const ReturnHelper = require('../../../support/helpers/returns/return.helper.js')
const VersionHelper = require('../../../support/helpers/returns/version.helper.js')

// Thing under test
const FetchReturnsForLicenceService = require('../../../../app/services/bill-runs/two-part-tariff/fetch-returns-for-licence.service.js')

describe('Fetch Returns for Licence service', () => {
  const billingPeriod = { startDate: new Date('2022-04-01'), endDate: new Date('2023-03-31') }
  let returnRecord

  beforeEach(async () => {
    await DatabaseHelper.clean()
  })

  describe('when there are valid Returns that should be considered', () => {
    beforeEach(async () => {
      const metadata = {
        nald: {
          periodEndDay: '31',
          periodEndMonth: '3',
          periodStartDay: '1',
          periodStartMonth: '4'
        },
        purposes: [
          {
            tertiary: {
              code: '400',
              description: 'Spray Irrigation - Direct'
            }
          }
        ],
        description: 'The Description',
        isTwoPartTariff: true
      }

      returnRecord = await ReturnHelper.add({ metadata })
    })

    describe('which have return lines within the billing period', () => {
      beforeEach(async () => {
        const { returnId } = returnRecord
        const { versionId } = await VersionHelper.add({ returnId })

        await LineHelper.add({ versionId, startDate: new Date('2022-05-01'), endDate: new Date('2022-05-07'), quantity: 1234 })
        await LineHelper.add({ versionId, startDate: new Date('2022-05-08'), endDate: new Date('2022-05-14'), quantity: 5678 })
      })

      it('returns the Return and Lines that are applicable', async () => {
        const { licenceRef } = returnRecord
        const result = await FetchReturnsForLicenceService.go(licenceRef, billingPeriod)

        expect(result).to.have.length(1)
        expect(result[0].returnId).to.equal(returnRecord.returnId)
        expect(result[0].description).to.equal('The Description')
        expect(result[0].startDate).to.equal(new Date('2022-04-01'))
        expect(result[0].endDate).to.equal(new Date('2023-03-31'))
        expect(result[0].periodStartDay).to.equal(1)
        expect(result[0].periodStartMonth).to.equal(4)
        expect(result[0].periodEndDay).to.equal(31)
        expect(result[0].periodEndMonth).to.equal(3)

        expect(result[0].purposes).to.have.length(1)
        expect(result[0].purposes[0].tertiary.code).to.equal('400')
        expect(result[0].purposes[0].tertiary.description).to.equal('Spray Irrigation - Direct')

        expect(result[0].versions).to.have.length(1)
        expect(result[0].versions[0].nilReturn).to.equal(false)

        expect(result[0].versions[0].lines).to.have.length(2)
        expect(result[0].versions[0].lines[0].startDate).to.equal(new Date('2022-05-01'))
        expect(result[0].versions[0].lines[0].endDate).to.equal(new Date('2022-05-07'))
        expect(result[0].versions[0].lines[0].quantity).to.equal(1234)
        expect(result[0].versions[0].lines[1].startDate).to.equal(new Date('2022-05-08'))
        expect(result[0].versions[0].lines[1].endDate).to.equal(new Date('2022-05-14'))
        expect(result[0].versions[0].lines[1].quantity).to.equal(5678)
      })
    })

    describe('which have NO return lines within the billing period', () => {
      beforeEach(async () => {
        const { returnId } = returnRecord
        const { versionId } = await VersionHelper.add({ returnId })

        await LineHelper.add({ versionId, startDate: new Date('2023-05-01'), endDate: new Date('2023-05-07'), quantity: 1234 })
        await LineHelper.add({ versionId, startDate: new Date('2023-05-08'), endDate: new Date('2023-05-14'), quantity: 5678 })
      })

      it('returns the Return with no lines', async () => {
        const { licenceRef } = returnRecord
        const result = await FetchReturnsForLicenceService.go(licenceRef, billingPeriod)

        expect(result).to.have.length(1)

        expect(result[0].versions[0].lines).to.have.length(0)
      })
    })

    describe('which is a nil return', () => {
      beforeEach(async () => {
        const { returnId } = returnRecord

        await VersionHelper.add({ returnId, nilReturn: true })
      })

      it('returns the Return with `nilreturn` set to `true` and no lines', async () => {
        const { licenceRef } = returnRecord
        const result = await FetchReturnsForLicenceService.go(licenceRef, billingPeriod)

        expect(result).to.have.length(1)

        expect(result[0].versions).to.have.length(1)
        expect(result[0].versions[0].nilReturn).to.equal(true)

        expect(result[0].versions[0].lines).to.have.length(0)
      })
    })
  })

  describe('when there are NO valid Returns that should be considered', () => {
    describe('because the return is outside the billing period', () => {
      beforeEach(async () => {
        returnRecord = await ReturnHelper.add({ startDate: new Date('2023-04-01'), endDate: new Date('2024-03-31') })
        const { returnId } = returnRecord

        await VersionHelper.add({ returnId })
      })

      it('returns no records', async () => {
        const { licenceRef } = returnRecord
        const result = await FetchReturnsForLicenceService.go(licenceRef, billingPeriod)

        expect(result).to.have.length(0)
      })
    })

    describe('because the return is not two-part-tariff', () => {
      beforeEach(async () => {
        const metadata = {
          nald: {
            periodEndDay: '31',
            periodEndMonth: '3',
            periodStartDay: '1',
            periodStartMonth: '4'
          },
          purposes: [
            {
              tertiary: {
                code: '400',
                description: 'Spray Irrigation - Direct'
              }
            }
          ],
          description: 'The Description',
          isTwoPartTariff: false
        }

        returnRecord = await ReturnHelper.add({ metadata })
        const { returnId } = returnRecord

        await VersionHelper.add({ returnId })
      })

      it('returns no records', async () => {
        const { licenceRef } = returnRecord
        const result = await FetchReturnsForLicenceService.go(licenceRef, billingPeriod)

        expect(result).to.have.length(0)
      })
    })
  })
})
