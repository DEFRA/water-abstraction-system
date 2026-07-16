// Test framework
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Test helpers
import { generateLicenceRef } from '../../support/generators.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Things we need to stub
import * as FetchNotificationsDal from '../../../app/dal/return-logs/fetch-notifications.dal.js'
import * as FetchReturnLogService from '../../../app/services/return-logs/fetch-return-log.service.js'

// Thing under test
import ViewCommunicationsService from '../../../app/services/return-logs/view-communications.service.js'

describe('Return Logs - View Communications Service', () => {
  const page = '1'

  let returnLog

  beforeEach(async () => {
    returnLog = {
      id: generateUUID(),
      licence: {
        id: generateUUID(),
        licenceRef: generateLicenceRef()
      }
    }

    vi.spyOn(FetchReturnLogService, 'default').mockReturnValue(returnLog)
    vi.spyOn(FetchNotificationsDal, 'default').mockReturnValue({
      notifications: [],
      totalNumber: 0
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCommunicationsService(returnLog.id, page)

      expect(result).toEqual({
        activeSecondaryNav: 'communications',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 0,
          showingMessage: 'Showing all 0 communications'
        },
        backLink: {
          href: `/system/licences/${returnLog.licence.id}/returns`,
          text: 'Go back to returns'
        },
        notifications: [],
        pageTitle: 'Communications',
        pageTitleCaption: `Licence ${returnLog.licence.licenceRef}`
      })
    })
  })
})
