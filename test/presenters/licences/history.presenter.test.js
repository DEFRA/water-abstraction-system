// Test framework
import { beforeEach, describe, expect, it } from 'vitest'

// Test helpers
import GenerateHelper from '../../support/helpers/generate.helper.js'
import LicenceVersionModel from '../../../app/models/licence-version.model.js'
import { generateUUID } from '../../../app/lib/general.lib.js'

// Thing under test
import HistoryPresenter from '../../../app/presenters/licences/history.presenter.js'

describe('Licences - History presenter', () => {
  let licence
  let licenceHistory

  beforeEach(() => {
    licence = {
      id: generateUUID(),
      licenceRef: GenerateHelper.generateLicenceRef()
    }

    licenceHistory = [
      LicenceVersionModel.fromJson({
        endDate: new Date('2022-06-05'),
        id: generateUUID(),
        modLogs: [{ id: generateUUID(), reasonDescription: 'Licence Holder Name/Address Change' }],
        startDate: new Date('2022-04-01'),
        administrative: null
      })
    ]
  })

  describe('when provided with populated licence history', () => {
    it('correctly presents the data', () => {
      const result = HistoryPresenter(licenceHistory, licence)

      expect(result).toEqual({
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
            reason: 'Licence Holder Name/Address Change',
            startDate: '1 April 2022'
          }
        ],
        pageTitle: 'History',
        pageTitleCaption: `Licence ${licence.licenceRef}`
      })
    })
  })
})
