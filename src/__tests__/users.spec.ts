import request from 'supertest'
import faker from 'faker'
import { app } from '../app'
import connection from '../database'
import { AuthenticateUserUseCase } from '../modules/users/useCases/authenticateUser/AuthenticateUserUseCase'
import { UsersRepository } from '../modules/users/repositories/UsersRepository'
import { CreateUserUseCase } from '../modules/users/useCases/createUser/CreateUserUseCase'

const ENDPOINT = '/api/v1'

describe('[Users]', () => {
  beforeAll(async () => {
    await connection.create();
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    await connection.clear();
  });

  it('should be able to create a user', async () => {
    const response = await request(app)
      .post(`${ENDPOINT}/users`)
      .send({
        name: faker.name.findName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      })

    expect(response.status).toBe(201)
  })

  it('should be able to get user profile', async () => {
    const name = faker.name.findName()
    const email = faker.internet.email()
    const password = faker.internet.password()

    const usersRepository = new UsersRepository()
    const createUserUseCase = new CreateUserUseCase(usersRepository)

    await createUserUseCase.execute({
      name,
      email,
      password,
    })

    const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)

    const { token } = await authenticateUserUseCase.execute({
      email,
      password,
    })

    const response = await request(app)
      .get(`${ENDPOINT}/profile`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.name).toBe(name)
    expect(response.body.email).toBe(email)
  })
})
