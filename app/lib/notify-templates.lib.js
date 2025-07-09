'use strict'

const notifyTemplates = {
  standard: {
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
    }
  },
  // Todo: add tests
  adHoc: {
    invitations: {
      primaryUserEmail: '7bb89469-1dbc-458a-9526-fad8ab71285f',
      returnsAgentEmail: 'cbc4efe2-f3b5-4642-8f6d-3532df73ee94',
      licenceHolderLetter: '4b47cf1c-043c-4a0c-8659-5be06cb2b860',
      returnsToLetter: '73b4c395-4423-4976-8ab4-c82e2cb6beee'
    }
  },
  alerts: {
    email: {
      reduce: 'd94bf110-b173-4f77-8e9a-cf7b4f95dc00',
      reduceOrStop: '4ebf29e1-f819-4d88-b7e4-ee47df302b9a',
      reduceOrStopWarning: 'bf32327a-f170-4854-8abb-3068aee9cdec',
      reduceWarning: '6ec7265d-8ebb-4217-a62b-9bf0216f8c9f',
      resume: '5eae5e5b-4f9a-4e2e-8d1e-c8d083533fbf',
      stop: 'd7468ba1-ac65-42c4-9785-8998f9c34e01',
      stopWarning: 'a51ace39-3224-4c18-bbb8-c803a6da9a21'
    },
    letter: {
      reduce: 'fafe7d77-7710-46c8-b870-3b5c1e3816d2',
      reduceOrStop: '2d81eaa7-0c34-463b-8ac2-5ff37d5bd800',
      reduceOrStopWarning: '8c77274f-6a61-46a5-82d8-66863320d608',
      reduceWarning: '27499bbd-e854-4f13-884e-30e0894526b6',
      resume: 'ba6b11ad-41fc-4054-87eb-7e9a168ceec2',
      stop: 'c2635893-0dd7-4fff-a152-774707e2175e',
      stopWarning: '7ab10c86-2c23-4376-8c72-9419e7f982bb'
    }
  }
}

module.exports = {
  notifyTemplates
}
