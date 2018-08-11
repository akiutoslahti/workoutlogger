const workout = (sequelize, DataTypes) => {
  const Workout = sequelize.define(
    'workout',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      user_id: {
        type: DataTypes.UUID,
        required: true,
        allowNull: false
      },
      date: {
        type: DataTypes.DATE,
        required: true,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          isDate: true
        }
      }
    },
    {
      paranoid: true,
      underscored: true
    }
  )
  return Workout
}

module.exports = workout
