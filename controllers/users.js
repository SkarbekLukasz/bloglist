const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

userRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body
  if(!password || password.length <3) {
    response.status(400).json({ error: 'Invalid user password' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

userRouter.get('/', async (request, response) => {
  const result = await User.find({}).populate('blogs', { title: 1, author: 1, id: 1, url: 1 })

  response.json(result)
})

module.exports = userRouter