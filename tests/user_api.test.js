const {beforeEach, after, describe, test} = require('node:test')
const User = require('../models/user')
const app = require('../app')
const supertest = require('supertest')
const {DB_URL} = require('../utils/config')
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
})

after(async () => {
    await mongoose.connection.close()
})