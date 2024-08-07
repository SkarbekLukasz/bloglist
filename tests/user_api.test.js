const { beforeEach, after, describe, test } = require('node:test')
const User = require('../models/user')
const app = require('../app')
const supertest = require('supertest')
const { DB_URL } = require('../utils/config')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const assert = require('node:assert')

const api = supertest(app)
mongoose.connect(DB_URL)

beforeEach(async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({
    username: 'Pabloo',
    name: 'Paweł Jaszczak',
    passwordHash: passwordHash
  })

  await user.save()
})

describe('user api tests', () => {
  test('properly saves another user to DB', async () => {
    const result = await User.find({})

    assert.strictEqual(result.length, 1)
  })
  test('saves new user to DB through API', async () => {
    const newUserData = {
      username: 'fbl',
      name: 'Faloo Baloo',
      password: 'sekret2'
    }
    const result = await api.post('/api/users').send(newUserData).expect(201).expect('Content-Type', /application\/json/)
    assert(!result.body.password)
  })
  test('properly returns list of all users through API', async () => {
    const result = await api.get('/api/users').expect(200).expect('Content-Type', /application\/json/)

    assert.strictEqual(result.body.length, 1)
  })
  test('returns 400 when password field is missing from request', async () => {
    const payload = {
      username: 'fbl',
      name: 'Faloo Baloo',
    }
    await api.post('/api/users').send(payload).expect(400).expect('Content-Type', /application\/json/)
  })
  test('returns 400 when password length is less than 3 chars', async () => {
    const payload = {
      username: 'fbl',
      name: 'Faloo Baloo',
      password: '12'
    }
    await api.post('/api/users').send(payload).expect(400).expect('Content-Type', /application\/json/)
  })
  test('returns validation error when username is not unique', async () => {
    const payload = {
      username: 'Pabloo',
      name: 'Faloo Baloo',
      password: '123'
    }
    await api.post('/api/users').send(payload).expect(400).expect('Content-Type', /application\/json/)
  })
  test('returns validation error when username is not included in request', async () => {
    const payload = {
      name: 'Faloo Baloo',
      password: '123'
    }
    await api.post('/api/users').send(payload).expect(400).expect('Content-Type', /application\/json/)
  })
  test('should return 200 and create new token for valid credentials', async () => {
    const payload = {
      username: 'Pabloo',
      password: 'sekret'
    }
    const { body } = await api.post('/api/login').send(payload).expect(200).expect('Content-Type', /application\/json/)

    assert(body.token)
  })
  test('should return 400 when given invalid credentials for login', async () => {
    const payload = {
      username: 'Pabloo',
      password: 'sekret2'
    }

    await api.post('/api/login').send(payload).expect(401).expect('Content-Type', /application\/json/)
  })
})

after(async () => {
  await mongoose.connection.close()
})