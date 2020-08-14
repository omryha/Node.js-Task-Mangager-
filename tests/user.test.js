const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const userOneId = new mongoose.Types.ObjectId()

const userOne = {
    _id: userOneId,
    name: 'Edi Vedder',
    email: 'edvi@pearljam.com',
    password: '123!123',
    tokens: [{
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}
beforeEach(async() => {
    await User.deleteMany()
    await new User(userOne).save()
})

test('Should signup a new user', async() => {
    const response = await request(app).post('/users').send({
        name: 'Omry Hazut',
        email: 'omryh@gmail.com',
        password: '123!123'
    }).expect(201)

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Omry Hazut',
            email: 'omryh@gmail.com'
        },
        token: user.tokens[0].token
    })
    expect(user.password).not.toBe('123!123')
})

test('Should login existing user', async() => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)
})

test('Should not login nonexisting user', async() => {
    await request(app).post('/users/login').send({
        email: 'badcredentials@gmail.com',
        password: '123!@#123'
    }).expect(400)
})

test('Should get profile for user', async() => {
    await request(app).get('/users/me').set('Authorization', `Bearer ${userOne.tokens[0].token}`).send().expect(200)
})

test('Should delete account for user', async() => {
    await request(app).delete('/users/me').set('Authorization', `Bearer ${userOne.tokens[0].token}`).send().expect(200)
})

test('Should not delete account for unauthenicated user', async() => {
    await request(app).delete('/users/me').send().expect(401)
})