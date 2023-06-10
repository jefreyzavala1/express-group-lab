const request = require('supertest')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')
const app = require('../app')
const server = app.listen(8080, () => console.log('Lets get ready to test'))
const User = require('../models/user')
let mongoServer

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
    await mongoose.connection.close() // programmatic ctrl+c
    mongoServer.stop() // getting rid of our MongoDB instance itself
    server.close()
})

// afterAll((done) => done())

describe('Test the users endpoints', () => {
    test('It should create a new user', async () => {
        const response = await request(app)
            .post('/users')
            .send({ name: 'John Doe', email: 'john.doe@example.com', password: 'password123' })

        expect(response.statusCode).toBe(200)
        expect(response.body.user.name).toEqual('John Doe')
        expect(response.body.user.email).toEqual('john.doe@example.com')
        expect(response.body).toHaveProperty('token')
    })
    test('Should return an array of users', async () => {
        const users = [
          { name: 'John Doe', email: 'johndoe@example.com' },
          { name: 'Jane Smith', email: 'janesmith@example.com' },
        ];
    
        // Mocking the User.find() method to return the predefined users array
        User.find = jest.fn().mockResolvedValue(users);
    
        // Sending a GET request to the /users endpoint
        const response = await request(app).get('/users');
    
        // Asserting the response
        expect(response.status).toBe(200);
        expect(response.body).toEqual(users);
      });
    test('It should allow a user to login', async () => {
        const user = new User({ name: 'Hailey', email: 'hailey@flex.com', password: 'password' })
        await user.save()
        const response = await request(app)
            .post('/users/login')
            .send({ email: user.email, password: 'password' })

        expect(response.body.user.email).toEqual(user.email)
        expect(response.statusCode).toBe(200)
        expect(response.body.user.name).toEqual(user.name)
        expect(response.body).toHaveProperty('token')
    })
    test('It should update a user', async () => {
        const user = new User({ name: 'John Doe', email: 'john.doe@example.com', password: 'password123' })
        await user.save()
        const token = await user.generateAuthToken()

        const response = await request(app)
            .put(`/users/${user._id}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Jane Doe', email: 'jane.doe@example.com' })

        expect(response.statusCode).toBe(200)
        expect(response.body.name).toEqual('Jane Doe')
        expect(response.body.email).toEqual('jane.doe@example.com')
    })
    test('It should delete a user', async () => {
        const user = new User({ name: 'John Doe', email: 'john.doe@example.com', password: 'password123' })
        await user.save()
        const token = await user.generateAuthToken()

        const response = await request(app)
            .delete(`/users/${user._id}`)
            .set('Authorization', `Bearer ${token}`)

        expect(response.statusCode).toBe(204)
        
    })
    test('It should log out a user', async () => {
        const user = new User({ name: 'Casper the Ghost', email: 'casper@gmail.com', password: 'pizza' });
         await user.save();
         const token = await user.generateAuthToken()
        const logoutResponse = await request(app)
        .post('/users/logout')
        .set('Authorization', `Bearer ${token}`);
        expect(logoutResponse.statusCode).toBe(200);
        expect(logoutResponse.body.message).toEqual('User successfully logged out!');
    })
})