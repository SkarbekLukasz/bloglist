const { test, after, beforeEach } = require('node:test')
const Blog = require('../models/blog')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const {DB_URL} = require('../utils/config')

const api = supertest(app)

const initialBlogs = [
    {
      "title": "Blog #1",
      "author": "Jane Doe",
      "url": "http://localhost:3003",
      "likes": 100,
    },
    {
      "title": "Blog #2",
      "author": "John Doe",
      "url": "http://localhost:3001",
      "likes": 100,
    }
  ]

mongoose.connect(DB_URL)

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogToSave = new Blog(initialBlogs[0])
    await blogToSave.save()
    blogToSave = new Blog(initialBlogs[1])
    await blogToSave.save()
})

test('returns JSON in response', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

test('returns 2 blogs in response', async () => {
  const response = await api.get('/api/blogs')

  assert(response.body.length, 2)
})

after(async () => {
    await mongoose.connection.close()
  })