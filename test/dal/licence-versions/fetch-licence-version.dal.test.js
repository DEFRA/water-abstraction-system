// Test helpers
import CRMContactsSeeder from '../../support/seeders/crm-contacts.seeder.js'
import * as LicenceHelper from '../../support/helpers/licence.helper.js'
import * as LicenceVersionHelper from '../../support/helpers/licence-version.helper.js'
import * as LicenceVersionPurposeHelper from '../../support/helpers/licence-version-purpose.helper.js'
import * as LicenceVersionPurposePointHelper from '../../support/helpers/licence-version-purpose-point.helper.js'
import * as PointHelper from '../../support/helpers/point.helper.js'
import * as PurposeHelper from '../../support/helpers/purpose.helper.js'
import * as SourceHelper from '../../support/helpers/source.helper.js'

// Thing under test
import FetchLicenceVersionDal from '../../../app/dal/licence-versions/fetch-licence-version.dal.js'

describe('Licence Versions - Fetch licence version dal', () => {
  let additionalLicenceVersionOne
  let additionalLicenceVersionTwo
  let licence
  let licenceHolder
  let licenceVersion
  let licenceVersionPurpose
  let licenceVersionPurposePoint
  let point
  let purpose
  let source

  describe('when there is licence version', () => {
    beforeAll(async () => {
      licence = await LicenceHelper.add()

      licenceHolder = await CRMContactsSeeder.licenceHolder({ licence }, 'Example Trading Ltd')

      licenceVersion = licenceHolder.licenceVersion

      // Add additional licence for the pagination array
      additionalLicenceVersionOne = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2021-01-01'),
        endDate: new Date('2021-12-31')
      })

      additionalLicenceVersionTwo = await LicenceVersionHelper.add({
        licenceId: licence.id,
        startDate: new Date('2019-01-01'),
        endDate: new Date('2021-12-31')
      })

      purpose = PurposeHelper.select()

      licenceVersionPurpose = await LicenceVersionPurposeHelper.add({
        licenceVersionId: licenceVersion.id,
        purposeId: purpose.id
      })

      source = SourceHelper.select()
      point = await PointHelper.add({ sourceId: source.id })

      licenceVersionPurposePoint = await LicenceVersionPurposePointHelper.add({
        licenceVersionPurposeId: licenceVersionPurpose.id,
        pointId: point.id
      })
    })

    afterEach(async () => {
      await licenceHolder.clean()

      await licence.$query().delete()
      await additionalLicenceVersionOne.$query().delete()
      await additionalLicenceVersionTwo.$query().delete()
      await licenceVersionPurpose.$query().delete()
      await licenceVersionPurposePoint.$query().delete()
      await point.$query().delete()
    })

    it('returns the matching licence version and the pagination array (in order)', async () => {
      const result = await FetchLicenceVersionDal(licenceVersion.id)

      expect(result).toEqual({
        licenceVersion: {
          address: {
            address1: '4',
            address2: 'Privet Drive',
            address3: 'Little Whinging',
            address4: 'Surrey',
            address5: null,
            address6: null,
            country: null,
            id: licenceHolder.address.id,
            postcode: 'WD25 7LR'
          },
          administrative: null,
          applicationNumber: null,
          company: {
            id: licenceHolder.company.id,
            name: 'Example Trading Ltd'
          },
          createdAt: licenceVersion.createdAt,
          endDate: null,
          id: licenceVersion.id,
          issueDate: null,
          licence: {
            id: licence.id,
            licenceRef: licence.licenceRef
          },
          licenceVersionPurposes: [
            {
              abstractionPeriodEndDay: 31,
              abstractionPeriodEndMonth: 3,
              abstractionPeriodStartDay: 1,
              abstractionPeriodStartMonth: 1,
              annualQuantity: null,
              dailyQuantity: null,
              hourlyQuantity: null,
              instantQuantity: null,
              licenceVersionPurposePoints: [
                {
                  abstractionMethod: null
                }
              ],
              points: [
                {
                  bgsReference: null,
                  category: null,
                  depth: null,
                  description: 'WELL AT WELLINGTON',
                  hydroInterceptDistance: null,
                  hydroOffsetDistance: null,
                  hydroReference: null,
                  id: point.id,
                  locationNote: null,
                  ngr1: point.ngr1,
                  ngr2: null,
                  ngr3: null,
                  ngr4: null,
                  note: null,
                  primaryType: null,
                  secondaryType: null,
                  source: {
                    description: source.description,
                    id: source.id,
                    sourceType: source.sourceType
                  },
                  wellReference: null
                }
              ],
              purpose: {
                description: purpose.description,
                id: purpose.id
              }
            }
          ],
          modLogs: [],
          startDate: licenceVersion.startDate
        },
        licenceVersionsForPagination: [
          {
            id: additionalLicenceVersionTwo.id,
            startDate: new Date('2019-01-01')
          },
          {
            id: additionalLicenceVersionOne.id,
            startDate: new Date('2021-01-01')
          },
          {
            id: licenceVersion.id,
            startDate: new Date('2022-01-01')
          }
        ]
      })
    })
  })
})
