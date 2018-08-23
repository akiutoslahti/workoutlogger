const validator = require('validator')

const baseUrl = '/api/workouts'

const formatWorkout = (workout) => {
  const formattedWorkout = workout.toJSON()
  delete formattedWorkout.created_at
  delete formattedWorkout.updated_at
  return formattedWorkout
}

const workoutsRouter = (app, db) => {
  app.get(baseUrl, async (request, response) => {
    try {
      const { token } = request
      if (!token || token.role !== 'admin') {
        return response.status(401).json({
          error: `GET ${baseUrl} failed because of insufficient priviledges`
        })
      }

      const allWorkouts = await db.workouts.findAll()
      const formattedWorkouts = allWorkouts.map((workout) =>
        formatWorkout(workout)
      )
      return response.status(200).json(formattedWorkouts)
    } catch (error) {
      return response
        .status(500)
        .json({ error: `GET ${baseUrl} failed because of error` })
    }
  })

  app.get(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
      const { token } = request
      if (!token) {
        return response.status(401).json({
          error: `GET ${baseUrl} failed because of insufficient priviledges`
        })
      }

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

      if (!(workoutById.user_id === token.id || token.role === 'admin')) {
        return response.status(401).json({
          error: `GET ${baseUrl}/${id} failed because of insufficient priviledges`
        })
      }

      return response.status(200).json(formatWorkout(workoutById))
    } catch (error) {
      return response
        .status(500)
        .json({ error: `GET ${baseUrl}/${id} failed because of error` })
    }
  })

  app.post(baseUrl, async (request, response) => {
    try {
      const { token } = request
      if (!token) {
        return response.status(401).json({
          error: `POST ${baseUrl} failed because of insufficient priviledges`
        })
      }

      const { user_id, date } = request.body
      if (!user_id || !validator.isUUID(user_id, 4)) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because user id is missing or invalid`
        })
      }

      const userById = db.users.find({ where: { id: user_id } })
      if (!userById) {
        return response.status(400).json({
          error: `POST ${baseUrl} failed because user does not exist`
        })
      }

      if (!(user_id === token.id || token.role === 'admin')) {
        return response.status(401).json({
          error: `POST ${baseUrl} failed because of insufficient priviledges`
        })
      }

      const newWorkout = {
        user_id,
        date: !date ? Date.now() : date
      }

      const createdWorkout = await db.workouts.create(newWorkout)
      return response.status(201).json(formatWorkout(createdWorkout))
    } catch (error) {
      console.log(error)
      return response
        .status(500)
        .json({ error: `POST ${baseUrl} failed because of error` })
    }
  })

  app.delete(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
      const { token } = request
      if (!token) {
        return response.status(401).json({
          error: `DELETE ${baseUrl}/${id} failed because of insufficient priviledges`
        })
      }

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

      if (!(workoutById.user_id === token.id || token.role === 'admin')) {
        return response.status(401).json({
          error: `DELETE ${baseUrl}/${id} failed because of insufficient priviledges`
        })
      }

      await db.workouts.destroy({ where: { id } })
      return response.status(204).send()
    } catch (error) {
      return response
        .status(500)
        .json({ error: `DELETE ${baseUrl}/${id} failed because of error` })
    }
  })

  app.patch(`${baseUrl}/:id`, async (request, response) => {
    const { id } = request.params
    try {
      const { token } = request
      if (!token) {
        return response.status(401).json({
          error: `DELETE ${baseUrl}/${id} failed because of insufficient priviledges`
        })
      }

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

      if (!(workoutById.user_id === token.id || token.role === 'admin')) {
        return response.status(401).json({
          error: `DELETE ${baseUrl}/${id} failed because of insufficient priviledges`
        })
      }

      const { updates } = request.body
      if (!updates) {
        return response.status(400).json({
          error: `PATCH ${baseUrl}/${id} failed because no updates were provided in request`
        })
      }

      if (updates.user_id || updates.id) {
        return response.status(400).json({
          error: `DELETE ${baseUrl}/${id} failed because only date can be patched`
        })
      }

      const updatedWorkout = await workoutById.updateAttributes(updates)
      return response.status(200).json(formatWorkout(updatedWorkout))
    } catch (error) {
      return response
        .status(500)
        .json({ error: `PATCH ${baseUrl}/${id} failed because of error` })
    }
  })
}

module.exports = workoutsRouter
