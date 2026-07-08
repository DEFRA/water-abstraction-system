import {
  markForSupplementaryBilling,
  markedForSupplementaryBilling,
  noReturnsRequired,
  returnsRequired,
  submitMarkForSupplementaryBilling,
  supplementary,
  viewBills,
  viewCommunications,
  viewContactDetails,
  viewHistory,
  viewLicenceConditions,
  viewLicencePoints,
  viewLicencePurposes,
  viewReturns,
  viewSetUp,
  viewSummary
} from '../controllers/licences.controller.js'

const routes = [
  {
    method: 'GET',
    path: '/licences/{id}/bills',
    options: {
      handler: viewBills,
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
    handler: viewCommunications
  },
  {
    method: 'GET',
    path: '/licences/{id}/conditions',
    options: {
      handler: viewLicenceConditions
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/contact-details',
    handler: viewContactDetails
  },
  {
    method: 'GET',
    path: '/licences/{id}/history',
    options: {
      handler: viewHistory
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/points',
    options: {
      handler: viewLicencePoints
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/purposes',
    options: {
      handler: viewLicencePurposes
    }
  },
  {
    method: 'GET',
    path: '/licences/{id}/set-up',
    options: {
      handler: viewSetUp,
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
    handler: viewSummary
  },
  {
    method: 'GET',
    path: '/licences/{id}/returns',
    handler: viewReturns
  },
  {
    method: 'GET',
    path: '/licences/{id}/no-returns-required',
    options: {
      handler: noReturnsRequired,
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
      handler: returnsRequired,
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
      handler: supplementary,
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
      handler: markForSupplementaryBilling,
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
      handler: submitMarkForSupplementaryBilling,
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
      handler: markedForSupplementaryBilling,
      auth: {
        access: {
          scope: ['billing']
        }
      }
    }
  }
]

export default routes
