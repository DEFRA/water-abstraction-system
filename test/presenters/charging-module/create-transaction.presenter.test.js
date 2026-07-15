// Test helpers
import LicenceHelper from '../../support/helpers/licence.helper.js'
import LicenceModel from '../../../app/models/licence.model.js'
import { ref } from 'objection'
import RegionHelper from '../../support/helpers/region.helper.js'
import TransactionHelper from '../../support/helpers/transaction.helper.js'

// Thing under test
import CreateTransactionPresenter from '../../../app/presenters/charging-module/create-transaction.presenter.js'

describe('Charging Module Create Transaction presenter', () => {
  const accountNumber = 'A51542397A'

  let transaction
  let licence
  let region

  describe('when provided with a Transaction and Licence instance', () => {
    beforeEach(async () => {
      region = RegionHelper.select()

      // NOTE: In the context the presenter is used it is from a Licence instance returned by
      // FetchChargeVersionsService. We recreate how that instance is formed here, including extracting some of the
      // values as distinct properties from the licence's `regions` JSONb field.
      const tempLicence = await LicenceHelper.add({
        regionId: region.id,
        regions: { historicalAreaCode: 'SAAR', regionalChargeArea: 'Southern' }
      })

      licence = await LicenceModel.query()
        .findById(tempLicence.id)
        .select([
          'id',
          'licenceRef',
          ref('licences.regions:historicalAreaCode').castText().as('historicalAreaCode'),
          ref('licences.regions:regionalChargeArea').castText().as('regionalChargeArea')
        ])
        .withGraphFetched('region')
        .modifyGraph('licence.region', (builder) => {
          builder.select(['id', 'chargeRegionId'])
        })

      // NOTE: The transaction object the presenter expects is what `FormatSrocTransactionLineService` returns rather
      // than a simple instance of `TransactionModel`. But to test the presenter, we just need to _represent_ what the
      // service returns whilst avoiding over complicating our tests with the additional setup it needs. So, we create a
      // standard transaction instance and amend some of the properties to match what FormatSrocTransactionLineService
      // does.
      transaction = await TransactionHelper.add()
      transaction.section127Agreement = false
      transaction.section130Agreement = false
      transaction.startDate = new Date('2022-04-01')
      transaction.endDate = new Date('2023-03-31')
    })

    it('correctly presents the data', () => {
      const result = CreateTransactionPresenter(transaction, accountNumber, licence)

      expect(result.clientId).toEqual(transaction.id)
      expect(result.ruleset).toEqual('sroc')
      expect(result.periodStart).toEqual('01-APR-2022')
      expect(result.periodEnd).toEqual('31-MAR-2023')
      expect(result.credit).toEqual(false)
      expect(result.abatementFactor).toEqual(1)
      expect(result.adjustmentFactor).toEqual(1)
      expect(result.actualVolume).toEqual(11)
      expect(result.aggregateProportion).toEqual(1)
      expect(result.areaCode).toEqual('SAAR')
      expect(result.authorisedDays).toEqual(365)
      expect(result.authorisedVolume).toEqual(11)
      expect(result.billableDays).toEqual(365)
      expect(result.chargeCategoryCode).toEqual(transaction.chargeCategoryCode)
      expect(result.chargeCategoryDescription).toEqual(transaction.chargeCategoryDescription)
      expect(result.chargePeriod).toEqual('01-APR-2022 - 31-MAR-2023')
      expect(result.compensationCharge).toEqual(false)
      expect(result.customerReference).toEqual(accountNumber)
      expect(result.licenceNumber).toEqual(licence.licenceRef)
      expect(result.lineDescription).toEqual(
        'Water abstraction charge: Agriculture other than spray irrigation at East Rudham'
      )
      expect(result.loss).toEqual('medium')
      expect(result.region).toEqual(region.chargeRegionId)
      expect(result.regionalChargingArea).toEqual('Southern')
      expect(result.section127Agreement).toEqual(false)
      expect(result.section130Agreement).toEqual(false)
      expect(result.supportedSource).toEqual(false)
      expect(result.supportedSourceName).toEqual(null)
      expect(result.twoPartTariff).toEqual(false)
      expect(result.waterCompanyCharge).toEqual(false)
      expect(result.waterUndertaker).toEqual(false)
      expect(result.winterOnly).toEqual(false)
    })
  })
})
