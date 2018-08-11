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
        required: true,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      role: {
        type: DataTypes.ENUM,
        values: ['user', 'admin', 'disabled'],
        required: true,
        allowNull: false
      },
      username: {
        type: DataTypes.STRING,
        required: true,
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      passwordHash: {
        type: DataTypes.STRING,
        required: true,
        allowNull: false,
        validate: {
          notEmpty: true
        }
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
