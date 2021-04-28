import request from 'supertest'
import faker from 'faker'
import { app } from '../app'
import connection from '../database'
import { UsersRepository } from '../modules/users/repositories/UsersRepository'
import { CreateUserUseCase } from '../modules/users/useCases/createUser/CreateUserUseCase'

const ENDPOINT = '/api/v1/sessions'

describe('[Sessions]', () => {
  beforeAll(async () => {
    await connection.create();
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    await connection.clear();
  });

  it('should be able to login', async () => {
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

    const response = await request(app)
      .post(ENDPOINT)
      .send({
        email,
        password,
      })

    expect(response.status).toBe(200)
    expect(response.body.token).toBeTruthy()
  })
})
