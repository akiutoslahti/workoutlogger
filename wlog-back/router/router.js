/* eslint-disable global-require */
const routes = [
  require('./routes/users'),
  require('./routes/login'),
  require('./routes/exercises'),
  require('./routes/workouts')
]
/* eslint-enable global-require */

// Add access to the app and db objects to each route
const router = function router(app, db) {
  return routes.forEach((route) => {
    route(app, db)
  })
}

module.exports = router
