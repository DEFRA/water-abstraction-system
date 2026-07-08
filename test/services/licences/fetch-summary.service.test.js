// Test helpers
import * as CompanyHelper from '../../support/helpers/company.helper.js'
import * as LicenceDocumentHeaderHelper from '../../support/helpers/licence-document-header.helper.js'
import * as LicenceEntityHelper from '../../support/helpers/licence-entity.helper.js'
import * as LicenceEntityRoleHelper from '../../support/helpers/licence-entity-role.helper.js'
import * as LicenceHelper from '../../support/helpers/licence.helper.js'
import * as LicenceMonitoringStationHelper from '../../support/helpers/licence-monitoring-station.helper.js'
import * as LicenceVersionHelper from '../../support/helpers/licence-version.helper.js'
import * as LicenceVersionPurposeConditionHelper from '../../support/helpers/licence-version-purpose-condition.helper.js'
import * as LicenceVersionPurposeConditionTypeHelper from '../../support/helpers/licence-version-purpose-condition-type.helper.js'
import * as LicenceVersionPurposeHelper from '../../support/helpers/licence-version-purpose.helper.js'
import * as LicenceVersionPurposePointHelper from '../../support/helpers/licence-version-purpose-point.helper.js'
import * as MonitoringStationHelper from '../../support/helpers/monitoring-station.helper.js'
import * as PointHelper from '../../support/helpers/point.helper.js'
import * as PurposeHelper from '../../support/helpers/purpose.helper.js'
import * as RegionHelper from '../../support/helpers/region.helper.js'
import * as SourceHelper from '../../support/helpers/source.helper.js'
import * as UserHelper from '../../support/helpers/user.helper.js'
import * as WorkflowHelper from '../../support/helpers/workflow.helper.js'

// Thing under test
import FetchSummaryService from '../../../app/services/licences/fetch-summary.service.js'

const REGION_SOUTHERN_INDEX = 5

describe('Licences - Fetch Summary service', () => {
  let company
  let companyEntity
  let licence
  let licenceDocumentHeader
  let licenceEntityRole
  let licenceMonitoringStation
  let licenceVersion
  let licenceVersionPurpose
  let licenceVersionPurposeCondition
  let licenceVersionPurposeConditionType
  let licenceVersionPurposePoint
  let monitoringStation
  let oldLicenceVersion
  let point
  let purpose
  let region
  let source
  let user
  let userEntity
  let workflow

  beforeAll(async () => {
    region = RegionHelper.select(REGION_SOUTHERN_INDEX)

    licence = await LicenceHelper.add({
      expiredDate: null,
      lapsedDate: null,
      regionId: region.id
    })

    company = await CompanyHelper.add()

    // Create 2 licence versions so we can test the service only gets the 'current' version
    oldLicenceVersion = await LicenceVersionHelper.add({
      companyId: company.id,
      endDate: new Date('2022-04-30'),
      increment: 0,
      issue: 100,
      licenceId: licence.id,
      startDate: new Date('2021-10-11'),
      status: 'superseded'
    })

    licenceVersion = await LicenceVersionHelper.add({
      companyId: company.id,
      increment: 0,
      issue: 101,
      licenceId: licence.id,
      startDate: new Date('2022-05-01')
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

    licenceVersionPurposeConditionType = LicenceVersionPurposeConditionTypeHelper.data.find((conditionType) => {
      return conditionType.displayTitle === 'Aggregate condition link between licences'
    })

    licenceVersionPurposeCondition = await LicenceVersionPurposeConditionHelper.add({
      licenceVersionPurposeId: licenceVersionPurpose.id,
      licenceVersionPurposeConditionTypeId: licenceVersionPurposeConditionType.id
    })

    companyEntity = await LicenceEntityHelper.add({ name: company.name, type: 'company' })

    licenceDocumentHeader = await LicenceDocumentHeaderHelper.add({
      companyEntityId: companyEntity.id,
      licenceName: 'Licency McLicenceFace',
      licenceRef: licence.licenceRef
    })

    userEntity = await LicenceEntityHelper.add({ name: licence.licenceRef, type: 'individual' })
    user = await UserHelper.add({ application: 'water_vml', licenceEntityId: userEntity.id, username: userEntity.name })

    licenceEntityRole = await LicenceEntityRoleHelper.add({
      companyEntityId: companyEntity.id,
      licenceEntityId: userEntity.id,
      role: 'primary_user'
    })

    monitoringStation = await MonitoringStationHelper.add()

    licenceMonitoringStation = await LicenceMonitoringStationHelper.add({
      monitoringStationId: monitoringStation.id,
      licenceId: licence.id
    })

    // We add two workflow records: one reflects that the licence is in workflow, so of that it previously was but
    // has been dealt with. We want to ensure these soft-deleted records are ignored so licences are not flagged
    // as changed incorrectly
    workflow = await WorkflowHelper.add({ licenceId: licence.id })
    await WorkflowHelper.add({ deletedAt: new Date('2023-06-01'), licenceId: licence.id })
  })

  afterAll(async () => {
    // await licenceEntity.$query().delete()
    // await licenceEntityRole.$query().delete()
    await workflow.$query().delete()

    await licenceMonitoringStation.$query().delete()
    await monitoringStation.$query().delete()

    await user.$query().delete()
    await userEntity.$query().delete()
    await licenceDocumentHeader.$query().delete()
    await companyEntity.$query().delete()

    await licenceVersionPurposeCondition.$query().delete()
    await licenceVersionPurposePoint.$query().delete()
    await point.$query().delete()
    await licenceVersionPurpose.$query().delete()

    await licenceVersion.$query().delete()
    await oldLicenceVersion.$query().delete()

    await company.$query().delete()
    await licence.$query().delete()
  })

  describe('when called', () => {
    it('returns results', async () => {
      const result = await FetchSummaryService(licence.id)

      expect(result).toEqual({
        id: licence.id,
        expiredDate: null,
        issueDate: null,
        startDate: new Date('2022-01-01'),
        licenceDocumentHeader: {
          id: licenceDocumentHeader.id,
          licenceName: licenceDocumentHeader.licenceName,
          licenceEntityRoles: [
            {
              id: licenceEntityRole.id,
              licenceEntity: {
                id: userEntity.id,
                user: {
                  id: user.id,
                  userId: user.userId,
                  username: user.username
                }
              }
            }
          ]
        },
        region: {
          id: region.id,
          displayName: region.displayName
        },
        licenceVersions: [
          {
            id: licenceVersion.id,
            issueDate: null,
            licenceId: licence.id,
            startDate: new Date('2022-05-01'),
            status: 'current',
            company: {
              id: company.id,
              name: 'Example Trading Ltd',
              type: 'organisation'
            },
            licenceVersionPurposes: [
              {
                id: licenceVersionPurpose.id,
                abstractionPeriodStartDay: 1,
                abstractionPeriodStartMonth: 1,
                abstractionPeriodEndDay: 31,
                abstractionPeriodEndMonth: 3,
                annualQuantity: null,
                dailyQuantity: null,
                hourlyQuantity: null,
                instantQuantity: null,
                purpose: {
                  id: purpose.id,
                  description: purpose.description
                },
                points: [
                  {
                    description: point.description,
                    id: point.id,
                    ngr1: point.ngr1,
                    ngr2: point.ngr2,
                    ngr3: point.ngr3,
                    ngr4: point.ngr4,
                    source: { description: source.description, id: source.id }
                  }
                ],
                licenceVersionPurposeConditions: [
                  {
                    id: licenceVersionPurposeCondition.id,
                    licenceVersionPurposeConditionType: {
                      id: licenceVersionPurposeConditionType.id,
                      displayTitle: 'Aggregate condition link between licences'
                    }
                  }
                ]
              }
            ]
          }
        ],
        licenceMonitoringStations: [
          {
            id: licenceMonitoringStation.id,
            monitoringStation: {
              id: monitoringStation.id,
              label: 'MONITOR PLACE'
            }
          }
        ],
        workflows: [
          {
            id: workflow.id,
            status: workflow.status
          }
        ]
      })
    })
  })
})
