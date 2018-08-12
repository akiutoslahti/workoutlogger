const workoutExercise = (sequelize, DataTypes) => {
  const WorkoutExercise = sequelize.define(
    'workouts_exercises',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      workout_id: {
        type: DataTypes.UUID,
        required: true,
        allowNull: false,
        validate: {
          isUUID: 4
        }
      },
      exercise_id: {
        type: DataTypes.UUID,
        required: true,
        allowNull: false,
        validate: {
          isUUID: 4
        }
      },
      set_count: {
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false,
        validate: {
          isInt: true,
          min: 1
        }
      },
      repetition_count: {
        type: DataTypes.INTEGER,
        required: true,
        allowNull: false,
        validate: {
          isInt: true,
          min: 1
        }
      }
    },
    {
      paranoid: false,
      underscored: true,
      freezeTableName: true
    }
  )
  return WorkoutExercise
}

module.exports = workoutExercise
