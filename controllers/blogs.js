const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', { username: 1, name: 1, id: 1 })
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const { author, url, title } = request.body
  const decodedToken = jwt.verify(request.body.token, process.env.SECRET)
  if(!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)
  let blog = new Blog({
    author: author,
    url: url,
    title: title,
    user: user.id
  })
  const result = await blog.save()
  user.blogs = user.blogs.concat(result._id)
  await user.save()
  response.status(201).json(result)
})

blogsRouter.delete('/:id', async (request, response) => {
  const id = request.params.id
  const result = await Blog.findByIdAndDelete(id)
  response.status(204).send(result)
})

blogsRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const body = request.body
  if(!body.likes) {
    response.status(400).send({ error: 'Missing content' })
  }
  const blogToUpdate = body
  const result = await Blog.findByIdAndUpdate(id, blogToUpdate, { new: true })
  response.status(200).send(result)
})

module.exports = blogsRouter