const request = require('supertest')
const app = require('../src/app')

test('Signup a new user', async() => {
    await request(app).post('/users').send({
        name: 'Omry',
        email: 'omryh@gmail.com',
        password: '123!123'
    }).expect(201)
})