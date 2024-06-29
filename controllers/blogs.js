const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  let blog = new Blog(request.body)
  const result = await blog.save()
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