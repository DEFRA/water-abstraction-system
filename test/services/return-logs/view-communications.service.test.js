'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, afterEach, beforeEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateUUID } = require('../../../app/lib/general.lib.js')
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Things we need to stub
const FetchNotificationsService = require('../../../app/services/return-logs/fetch-notifications.service.js')
const FetchReturnLogService = require('../../../app/services/return-logs/fetch-return-log.service.js')

// Thing under test
const ViewCommunicationsService = require('../../../app/services/return-logs/view-communications.service.js')

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

    Sinon.stub(FetchReturnLogService, 'go').returns(returnLog)
    Sinon.stub(FetchNotificationsService, 'go').returns({
      notifications: [],
      totalNumber: 0
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when called', () => {
    it('returns page data for the view', async () => {
      const result = await ViewCommunicationsService.go(returnLog.id, page)

      expect(result).to.equal({
        activeSecondaryNav: 'communications',
        pagination: {
          currentPageNumber: 1,
          numberOfPages: 0,
          showingMessage: 'Showing all 0 communications'
        },
        backLink: {
          href: `/system/licences/${returnLog.licence.id}/returns`,
          text: 'Go back to summary'
        },
        notifications: [],
        pageTitle: 'Communications',
        pageTitleCaption: `Licence ${returnLog.licence.licenceRef}`
      })
    })
  })
})
