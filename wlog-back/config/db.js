const Sequelize = require('sequelize')
const env = require('./env')

const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PW, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: env.DB_DIALECT,
  define: {
    underscored: true
  }
})

const db = {}

db.Sequelize = Sequelize
db.sequelize = sequelize

// Models / Tables
db.users = require('../models/users')(sequelize, Sequelize)
db.workouts = require('../models/workouts')(sequelize, Sequelize)
db.workoutsExercises = require('../models/workouts_exercises')(
  sequelize,
  Sequelize
)
db.exercises = require('../models/exercises')(sequelize, Sequelize)

// Relations
db.users.hasMany(db.workouts)
db.workouts.belongsTo(db.users)

db.workouts.hasMany(db.workoutsExercises)
db.workoutsExercises.belongsTo(db.workouts)

db.exercises.hasMany(db.workoutsExercises)
db.workoutsExercises.belongsTo(db.exercises)

module.exports = db
