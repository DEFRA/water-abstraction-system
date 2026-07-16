// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import GenerateHelper from '../../support/helpers/generate.helper.js'
import LicenceVersionModel from '../../../app/models/licence-version.model.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchHistoryService from '../../../app/services/licences/fetch-history.service.js'
import * as FetchLicenceService from '../../../app/services/licences/fetch-licence.service.js'

// Thing under test
import ViewHistoryService from '../../../app/services/licences/view-history.service.js'

describe('Licences - View History service', () => {
  let auth
  let licence
  let licenceHistory

  beforeEach(() => {
    auth = {
      credentials: {
        roles: [
          {
            role: 'billing'
          }
        ]
      }
    }

    licence = {
      id: generateUUID(),
      licenceRef: GenerateHelper.generateLicenceRef()
    }

    licenceHistory = [
      LicenceVersionModel.fromJson({
        endDate: new Date('2022-06-05'),
        id: generateUUID(),
        modLogs: [],
        startDate: new Date('2022-04-01')
      })
    ]

    vi.spyOn(FetchLicenceService, 'default').mockReturnValue(licence)
    vi.spyOn(FetchHistoryService, 'default').mockReturnValue(licenceHistory)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when a licence with a matching ID exists', () => {
    it('correctly presents the data', async () => {
      const result = await ViewHistoryService(licence.id, auth)

      expect(result).toEqual({
        activeSecondaryNav: 'history',
        backLink: {
          href: '/',
          text: 'Go back to search'
        },
        licenceVersions: [
          {
            changeType: 'licence issued',
            endDate: '5 June 2022',
            link: {
              hiddenText: 'licence version ending on 5 June 2022',
              href: `/system/licence-versions/${licenceHistory[0].id}`
            },
            reason: null,
            startDate: '1 April 2022'
          }
        ],
        pageTitle: 'History',
        pageTitleCaption: `Licence ${licence.licenceRef}`,
        roles: ['billing']
      })
    })
  })
})
