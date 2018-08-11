const validator = require('validator')

const baseUrl = '/api/workouts'

const workoutsRouter = (app, db) => {
  app.get(baseUrl, async (request, response) => {
    try {
      const allWorkouts = await db.workouts.findAll()
      return response.status(200).json(allWorkouts)
    } catch (error) {
      return response
        .status(500)
        .json({ error: `GET ${baseUrl} failed due error` })
    }
  })

  app.get(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
      if (!validator.isUUID(id, 4)) {
        return response.status(400).json({
          error: `GET ${baseUrl}/${id} failed because id is not valid`
        })
      }

      const workoutById = await db.workouts.find({ where: { id } })
      if (!workoutById) {
        return response.status(404).json({
          error: `GET ${baseUrl}/${id} failed because workout does not exist`
        })
      }

      return response.status(200).json(workoutById)
    } catch (error) {
      return response
        .status(500)
        .json({ error: `GET ${baseUrl}/${id} failed due error` })
    }
  })

  app.post(baseUrl, async (request, response) => {
    try {
      const { user_id, date } = request.body // eslint-disable-line camelcase
      if (!validator.isUUID(user_id, 4)) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because user id is invalid`
        })
      }

      const userById = db.users.find({ where: { id: user_id } })
      if (!userById) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because user does not exist`
        })
      }
      const newWorkout = {
        user_id,
        date: !date ? Date.now() : date
      }

      const createdWorkout = await db.workouts.create(newWorkout)
      return response.status(201).json(createdWorkout)
    } catch (error) {
      console.log(error)
      return response
        .status(500)
        .json({ error: `POST ${baseUrl} failed due error` })
    }
  })

  app.delete(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
      if (!validator.isUUID(id, 4)) {
        return response.status(400).json({
          error: `DELETE ${baseUrl}/${id} failed because id is not valid`
        })
      }

      const workoutById = await db.workouts.find({ where: { id } })
      if (!workoutById) {
        return response.status(404).json({
          error: `DELETE ${baseUrl}/${id} failed because workout does not exist`
        })
      }

      await db.workouts.destroy({ where: { id } })
      return response.status(200).send()
    } catch (error) {
      return response
        .status(500)
        .json({ error: `DELETE ${baseUrl}/${id} failed due error` })
    }
  })

  app.patch(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
      if (!validator.isUUID(id, 4)) {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because id is not valid`
        })
      }

      const workoutById = await db.workouts.find({ where: { id } })
      if (!workoutById) {
        return response.status(404).json({
          error: `PATCH ${baseUrl}/${id} failed because workout does not exist`
        })
      }

      const { updates } = request.body

      const updatedWorkout = await workoutById.updateAttributes(updates)
      return response.status(200).json(updatedWorkout)
    } catch (error) {
      return response
        .status(500)
        .json({ error: `PATCH ${baseUrl}/${id} failed due error` })
    }
  })
}

module.exports = workoutsRouter
