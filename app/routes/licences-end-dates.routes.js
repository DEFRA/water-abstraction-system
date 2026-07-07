import LicencesEndDatesController from '../controllers/licences-end-dates.controller.js'

const routes = [
  {
    method: 'POST',
    path: '/licences/end-dates/check',
    options: {
      handler: LicencesEndDatesController.check,
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
    method: 'POST',
    path: '/licences/end-dates/process',
    options: {
      handler: LicencesEndDatesController.process,
      app: {
        plainOutput: true
      },
      auth: false,
      plugins: {
        crumb: false
      }
    }
  }
]

export default routes
