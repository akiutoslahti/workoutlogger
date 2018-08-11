const user = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      name: {
        type: DataTypes.STRING,
        required: true
      },
      role: {
        type: DataTypes.ENUM,
        values: ['user', 'admin', 'disabled']
      },
      username: {
        type: DataTypes.STRING,
        required: true
      },
      passwordHash: {
        type: DataTypes.STRING,
        required: true
      }
    },
    {
      paranoid: true,
      underscored: true
    }
  )
  return User
}

module.exports = user
