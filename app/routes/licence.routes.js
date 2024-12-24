'use strict'

const LicencesController = require('../controllers/licences.controller.js')

const routes = [
  {
    method: 'GET',
    path: '/licences/{id}/bills',
    options: {
      handler: LicencesController.viewBills,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/communications',
    handler: LicencesController.viewCommunications
  },
  {
    method: 'GET',
    path: '/licences/{id}/conditions',
    options: {
      handler: LicencesController.viewLicenceAbstractionConditions
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/licence-contact',
    handler: LicencesController.viewLicenceContactDetails
  },
  {
    method: 'GET',
    path: '/licences/{id}/contact-details',
    handler: LicencesController.viewLicenceContacts
  },
  {
    method: 'GET',
    path: '/licences/{id}/history',
    options: {
      handler: LicencesController.viewHistory,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/points',
    options: {
      handler: LicencesController.viewLicencePoints
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/purposes',
    options: {
      handler: LicencesController.viewLicencePurposes
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/set-up',
    options: {
      handler: LicencesController.viewSetUp,
      auth: {
        access: {
          scope: ['view_charge_versions']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/summary',
    handler: LicencesController.viewSummary
  },
  {
    method: 'GET',
    path: '/licences/{id}/returns',
    handler: LicencesController.viewReturns
  },
  {
    method: 'GET',
    path: '/licences/{id}/no-returns-required',
    options: {
      handler: LicencesController.noReturnsRequired,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/returns-required',
    options: {
      handler: LicencesController.returnsRequired,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/licences/supplementary',
    options: {
      handler: LicencesController.supplementary,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/mark-for-supplementary-billing',
    options: {
      handler: LicencesController.markForSupplementaryBilling,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'POST',
    path: '/licences/{id}/mark-for-supplementary-billing',
    options: {
      handler: LicencesController.submitMarkForSupplementaryBilling,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/marked-for-supplementary-billing',
    options: {
      handler: LicencesController.markedForSupplementaryBilling,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

module.exports = routes
