'use strict'

// Test framework dependencies
const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const Sinon = require('sinon')

const { describe, it, beforeEach, afterEach } = (exports.lab = Lab.script())
const { expect } = Code

// Test helpers
const { generateLicenceRef } = require('../../support/helpers/licence.helper.js')

// Things we need to stub
const DetermineLicenceHasReturnVersionsService = require('../../../app/services/licences/determine-licence-has-return-versions.service.js')
const FetchReturnsService = require('../../../app/services/licences/fetch-returns.service.js')
const FetchLicenceService = require('../../../app/services/licences/fetch-licence.service.js')

// Thing under test
const ViewReturnsService = require('../../../app/services/licences/view-returns.service.js')

describe('Licences - View Returns service', () => {
  const page = 1

  let auth
  let licence

  beforeEach(async () => {
    auth = {
      isValid: true,
      credentials: {
        user: { id: 123 },
        roles: [
          {
            role: 'returns'
          }
        ],
        groups: [],
        scope: ['returns'],
        permissions: { abstractionReform: false, billRuns: true, manage: true }
      }
    }

    licence = {
      licenceRef: generateLicenceRef()
    }

    Sinon.stub(DetermineLicenceHasReturnVersionsService, 'go').returns(true)

    Sinon.stub(FetchLicenceService, 'go').resolves(licence)

    Sinon.stub(FetchReturnsService, 'go').resolves({
      pagination: { total: 1 },
      returns: _returnLogs()
    })
  })

  afterEach(() => {
    Sinon.restore()
  })

  describe('when a return', () => {
    describe('and it has no optional fields', () => {
      it('will return all the mandatory data and default values for use in the licence returns page', async () => {
        const result = await ViewReturnsService.go(licence.id, auth, page)

        expect(result).to.equal({
          activeNavBar: 'search',
          activeSecondaryNav: 'returns',
          backLink: {
            text: 'Go back to search',
            href: '/'
          },
          noReturnsMessage: null,
          pageTitle: 'Returns',
          pageTitleCaption: `Licence ${licence.licenceRef}`,
          pagination: { numberOfPages: 1, showingMessage: 'Showing all 1 returns' },
          returns: [
            {
              dates: '2 January 2020 to 1 February 2020',
              description: 'empty description',
              dueDate: '28 November 2020',
              link: '/system/return-logs/c4458436-4766-4271-b978-6af7a0e4fd95',
              purpose: ['Spray Irrigation - Direct (SPRAY IRRIGATION)'],
              reference: '10046821',
              status: 'complete'
            }
          ],
          roles: ['returns']
        })
      })
    })
  })
})

function _returnLogs() {
  const returnLog = {
    id: 'v1:1:01/123:10046821:2020-01-02:2020-02-01',
    dueDate: new Date('2020-11-28'),
    status: 'completed',
    startDate: new Date('2020/01/02'),
    endDate: new Date('2020/02/01'),
    metadata: {
      purposes: [
        {
          alias: 'SPRAY IRRIGATION',
          primary: {
            code: 'A',
            description: 'Agriculture'
          },
          tertiary: {
            code: '400',
            description: 'Spray Irrigation - Direct'
          },
          secondary: {
            code: 'AGR',
            description: 'General Agriculture'
          }
        }
      ],
      description: 'empty description'
    },
    returnId: 'c4458436-4766-4271-b978-6af7a0e4fd95',
    returnReference: '10046821'
  }

  return [returnLog]
}
