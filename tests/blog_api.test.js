const { test, after, beforeEach, describe } = require('node:test')
const Blog = require('../models/blog')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const { DB_URL } = require('../utils/config')

const api = supertest(app)

const initialBlogs = [
  {
    'title': 'Blog #1',
    'author': 'Jane Doe',
    'url': 'http://localhost:3003',
    'likes': 100,
  },
  {
    'title': 'Blog #2',
    'author': 'John Doe',
    'url': 'http://localhost:3001',
    'likes': 100,
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

describe('API integration tests', () => {
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

  test('return proper id property within DB ojects', async () => {
    const response = await api.get('/api/blogs')

    const firstBlog = response.body[0]
    const isID = Object.keys(firstBlog).some(key => key ==='id')

    assert(isID, true)
  })

  test('successfully save new blog to database', async () => {
    const blogToSave = {
      title: 'Blog poster',
      author: 'John Caramba',
      url: 'http://localhost:3001/john',
      likes: 100
    }

    await api.post('/api/blogs')
      .send(blogToSave)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const contents = response.body.map(r => r.author)

    assert.strictEqual(response.body.length, initialBlogs.length + 1)
    assert(contents.includes('John Caramba'))
  })

  test('missing likes property is set to 0 in DB', async () => {
    const blogToSave = {
      title: 'Blog tester',
      author: 'John Caramba',
      url: 'http://localhost:3001/john',
    }

    await api.post('/api/blogs')
      .send(blogToSave)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const contents = response.body.map(r => r.likes)

    assert(contents.includes(0))
  })
})

after(async () => {
  await mongoose.connection.close()
})