const exercise = (sequalize, DataTypes) => {
  const Exercise = sequalize.define(
    'exercise',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      name: {
        type: DataTypes.STRING,
        required: true,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      description: {
        type: DataTypes.STRING
      }
    },
    {
      paranoid: true,
      underscored: true
    }
  )
  return Exercise
}

module.exports = exercise
