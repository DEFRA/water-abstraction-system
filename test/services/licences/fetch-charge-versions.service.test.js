// Test helpers
import ChangeReasonHelper from '../../support/helpers/change-reason.helper.js'
import ChargeVersionHelper from '../../support/helpers/charge-version.helper.js'
import ChargeVersionModel from '../../../app/models/charge-version.model.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Thing under test
import FetchChargeVersionsService from '../../../app/services/licences/fetch-charge-versions.service.js'

describe('Licences - Fetch Charge Versions service', () => {
  const licenceId = generateUUID()

  let changeReason
  let chargeVersion
  let currentChargeVersionWithEndDateId
  let currentChargeVersionWithoutEndDateId
  let supersededChargeVersionWithEndDateId
  let supersededChargeVersionWithoutEndDateId

  afterEach(async () => {
    await chargeVersion.$query().delete()
    await ChargeVersionModel.query()
      .delete()
      .whereIn('id', [
        currentChargeVersionWithEndDateId,
        currentChargeVersionWithoutEndDateId,
        supersededChargeVersionWithEndDateId,
        supersededChargeVersionWithoutEndDateId
      ])
  })

  describe('when the licence has charge versions data', () => {
    beforeEach(async () => {
      changeReason = ChangeReasonHelper.select()

      // Create multiple charge versions to ensure we get them in the right order
      chargeVersion = await ChargeVersionHelper.add({
        changeReasonId: changeReason.id,
        endDate: new Date('2030-03-31'),
        licenceId,
        scheme: 'alcs',
        startDate: new Date('2018-04-01'),
        status: 'superseded',
        versionNumber: 1
      })

      supersededChargeVersionWithEndDateId = chargeVersion.id

      chargeVersion = await ChargeVersionHelper.add({
        changeReasonId: changeReason.id,
        endDate: null,
        licenceId,
        scheme: 'alcs',
        startDate: new Date('2021-04-01'),
        status: 'superseded',
        versionNumber: 3
      })

      supersededChargeVersionWithoutEndDateId = chargeVersion.id

      chargeVersion = await ChargeVersionHelper.add({
        changeReasonId: changeReason.id,
        endDate: null,
        licenceId,
        scheme: 'alcs',
        startDate: new Date('2021-04-01'),
        versionNumber: 4
      })

      currentChargeVersionWithoutEndDateId = chargeVersion.id

      chargeVersion = await ChargeVersionHelper.add({
        changeReasonId: changeReason.id,
        endDate: new Date('2021-03-31'),
        licenceId,
        scheme: 'alcs',
        startDate: new Date('2018-04-01'),
        versionNumber: 2
      })

      currentChargeVersionWithEndDateId = chargeVersion.id
    })

    it('returns the matching charge versions data', async () => {
      const result = await FetchChargeVersionsService(licenceId)

      expect(result).toEqual([
        {
          changeReason: {
            description: changeReason.description
          },
          endDate: null,
          id: currentChargeVersionWithoutEndDateId,
          licenceId,
          startDate: new Date('2021-04-01'),
          status: 'current'
        },
        {
          changeReason: {
            description: changeReason.description
          },
          endDate: null,
          id: supersededChargeVersionWithoutEndDateId,
          licenceId,
          startDate: new Date('2021-04-01'),
          status: 'superseded'
        },
        {
          changeReason: {
            description: changeReason.description
          },
          endDate: new Date('2021-03-31'),
          id: currentChargeVersionWithEndDateId,
          licenceId,
          startDate: new Date('2018-04-01'),
          status: 'current'
        },
        {
          changeReason: {
            description: changeReason.description
          },
          endDate: new Date('2030-03-31'),
          id: supersededChargeVersionWithEndDateId,
          licenceId,
          startDate: new Date('2018-04-01'),
          status: 'superseded'
        }
      ])
    })
  })
})
