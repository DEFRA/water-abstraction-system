'use strict'

const notifyTemplates = {
  returns: {
    invitations: {
      primaryUserEmail: '2fa7fc83-4df1-4f52-bccf-ff0faeb12b6f',
      returnsAgentEmail: '41c45bd4-8225-4d7e-a175-b48b613b5510',
      licenceHolderLetter: '4fe80aed-c5dd-44c3-9044-d0289d635019',
      returnsToLetter: '0e535549-99a2-44a9-84a7-589b12d00879'
    },
    reminders: {
      primaryUserEmail: 'f1144bc7-8bdc-4e82-87cb-1a6c69445836',
      returnsAgentEmail: '038e1807-d1b5-4f09-a5a6-d7eee9030a7a',
      licenceHolderLetter: 'c01c808b-094b-4a3a-ab9f-a6e86bad36ba',
      returnsToLetter: 'e9f132c7-a550-4e18-a5c1-78375f07aa2d'
    },
    // ad-hoc uses the same templates as reminders
    'ad-hoc': {
      primaryUserEmail: 'f1144bc7-8bdc-4e82-87cb-1a6c69445836',
      returnsAgentEmail: '038e1807-d1b5-4f09-a5a6-d7eee9030a7a',
      licenceHolderLetter: 'c01c808b-094b-4a3a-ab9f-a6e86bad36ba',
      returnsToLetter: 'e9f132c7-a550-4e18-a5c1-78375f07aa2d'
    }
  }
}

module.exports = {
  notifyTemplates
}
