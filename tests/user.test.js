const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/user');
const { userOneId, userOne, setupDatabase } = require('./fixtures/db');

beforeEach(setupDatabase);

test('Signup user', async () => {
    const response = await request(app).post('/users').send({
        name: 'Andrew',
        email: 'zohr@energyrepair.am',
        password: 'musadcnnias'
    }).expect(201);

    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    expect(response.body).toMatchObject({
        user: {
            name: 'Andrew',
            email: 'zohr@energyrepair.am',
        },
        token: user.tokens[0].token
    });

    expect(user.password).not.toBe('musadcnnias');
});

test('Log in existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    const user = await User.findById(userOneId);
    expect(response.body.token).toBe(user.tokens[1].token)
});

test('Log in failure', async () => {
    await request(app).post('/users/login').send({
        email: userOne.email,
        password: 'someshittassword'
    }).expect(404);
});

test('Get profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
});

test('Get profile failure', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
});

test('Delete account', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .send()
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user).toBeNull()
});

test('Fail to delete account', async () => {
    await request(app).delete('/users/me')
        .send()
        .expect(401);
});

test('Upload avatar', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${ userOne.tokens[0].token }`)
        .attach('pic', 'tests/fixtures/profile-pic.jpg')
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer))
});

test('Update user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'DavitZohrabyan'
        }).expect(200);

    const user = await User.findById(userOneId);
    expect(user.name).toBe('DavitZohrabyan');
});

test('Update user failure', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            location: 'Yerevan'
        }).expect(400);
});


