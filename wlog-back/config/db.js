const Sequelize = require('sequelize')
const env = require('./env')
console.log(env)
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
//db.workouts = require('../models/workouts')
//db.exercises = require('../models/exercises')

// Relations
//db.users.hasMany(db.workouts)
//db.workouts.belongsTo(db.users)
//db.workouts.hasMany(db.exercises)
//db.exercises.belongsTo(db.workouts)

module.exports = db
