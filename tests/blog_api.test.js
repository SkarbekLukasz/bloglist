const { test, after, beforeEach, describe } = require('node:test')
const Blog = require('../models/blog')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const { DB_URL } = require('../utils/config')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const api = supertest(app)

const initialBlogs = [
  {
    'title': 'Blog #1',
    'author': 'Jane Doe',
    'url': 'http://localhost:3003',
    'likes': 100,
    'user': new mongoose.Types.ObjectId('66843b4d2eac2b25963d4846')
  },
  {
    'title': 'Blog #2',
    'author': 'John Doe',
    'url': 'http://localhost:3001',
    'likes': 100,
    'user': new mongoose.Types.ObjectId('66843b4d2eac2b25963d4846')
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
    const user = await User.findOne()
    const token = jwt.sign({ username: user.username, id: user.id }, process.env.SECRET)

    await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
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
    const user = await User.findOne()
    const token = jwt.sign({ username: user.username, id: user.id }, process.env.SECRET)

    await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogToSave)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const contents = response.body.map(r => r.likes)

    assert(contents.includes(0))
  })
  test('Responds with 400 when given invalid request', async () => {
    const blogToSave = {
      author: 'John Caramba',
      url: 'http://localhost:3001/john',
    }
    const user = await User.findOne()
    const token = jwt.sign({ username: user.username, id: user.id }, process.env.SECRET)

    await api.post('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .send(blogToSave)
      .expect(400)
  })
  test('should properly delete blog with given id', async () => {
    const blogs = await api.get('/api/blogs')
    const firstId = blogs.body[0].id
    const user = blogs.body[0].user
    const token = jwt.sign({ username: user.username, id: user.id }, process.env.SECRET)

    await api.delete(`/api/blogs/${firstId}`).set('Authorization', `Bearer ${token}`).expect(204)
    const updatedBlogs = await api.get('/api/blogs')

    assert.strictEqual(updatedBlogs.body.length, 1)
  })
  test('sholud return 400 when given invalid id', async () => {
    const firstId = '123456789'

    await api.delete(`/api/blogs/${firstId}`).expect(400)
  })
  test('should properly update document with given id', async () => {
    const blogs = await api.get('/api/blogs')
    const { id, author, title, url } = blogs.body[0]
    const updateData = { author: author, title: title, url: url, likes: 200 }
    const result = await api.put(`/api/blogs/${id}`).send(updateData).expect(200).expect('Content-Type', /application\/json/)
    assert.strictEqual(result.body.likes, 200)
  })
  test('should return 400 when given invalid id for update', async () => {
    const firstId = '123456789'

    await api.put(`/api/blogs/${firstId}`).expect(400)
  })
  test('should return 401 when token is missing from request', async () => {
    const blogToSave = {
      title: 'Blog poster',
      author: 'John Caramba',
      url: 'http://localhost:3001/john',
      likes: 100
    }

    await api.post('/api/blogs').send(blogToSave).expect(401)
  })
  test('should return 401 when token is invalid', async () => {
    const blog = await Blog.findOne()

    await api.delete(`/api/blogs/${blog.id}`).expect(401)
  })
})

after(async () => {
  await mongoose.connection.close()
})