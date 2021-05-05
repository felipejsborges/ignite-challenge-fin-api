import request from 'supertest'
import faker from 'faker'
import { app } from '../app'
import connection from '../database'
import { AuthenticateUserUseCase } from '../modules/users/useCases/authenticateUser/AuthenticateUserUseCase'
import { UsersRepository } from '../modules/users/repositories/UsersRepository'
import { IUsersRepository } from '../modules/users/repositories/IUsersRepository'
import { CreateUserUseCase } from '../modules/users/useCases/createUser/CreateUserUseCase'
import { CreateStatementUseCase } from '../modules/statements/useCases/createStatement/CreateStatementUseCase'
import { StatementsRepository } from '../modules/statements/repositories/StatementsRepository'
import { OperationType } from '../modules/statements/entities/Statement'
import { IStatementsRepository } from '../modules/statements/repositories/IStatementsRepository'
import { StatementsUtil } from './utils/statements.util'
import { GetBalanceUseCase } from '../modules/statements/useCases/getBalance/GetBalanceUseCase'

const ENDPOINT = '/api/v1'

describe('[Statements]', () => {
  let token: string
  let user_id: string
  let target_id: string

  let usersRepository: IUsersRepository
  let statementsRepository: IStatementsRepository
  let statementsUtil: StatementsUtil
  let createUserUseCase: CreateUserUseCase
  let getBalanceUseCase: GetBalanceUseCase
  let createStatementUseCase: CreateStatementUseCase

  beforeAll(async () => {
    await connection.create();
  });

  beforeEach(async () => {
    usersRepository = new UsersRepository()
    statementsRepository = new StatementsRepository()
    statementsUtil = new StatementsUtil(statementsRepository)

    createUserUseCase = new CreateUserUseCase(usersRepository)
    const authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository)
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository, getBalanceUseCase)

    const name = faker.name.findName()
    const email = faker.internet.email()
    const password = faker.internet.password()

    user_id = (await createUserUseCase.execute({
      name,
      email,
      password,
    })).id as string

    target_id = (await createUserUseCase.execute({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    })).id as string

    token = (await authenticateUserUseCase.execute({
      email,
      password,
    })).token
  });

  afterEach(async () => {
    await connection.clear();
  })

  afterAll(async () => {
    await connection.close();
  });

  it('should be able get user balance', async () => {
    const depositAmount = faker.datatype.number({ min: 1, max: 999 })

    await statementsUtil.create({
      user_id,
      amount: depositAmount,
      type: 'deposit' as OperationType,
      target_id: undefined
    })

    await statementsUtil.create({
      user_id,
      amount: faker.datatype.number({ min: 0, max: depositAmount }),
      type: 'withdraw' as OperationType,
      target_id: undefined
    })

    const response = await request(app)
      .get(`${ENDPOINT}/statements/balance`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('statements')
    expect(response.body).toHaveProperty('balance')
  })

  it('should be able deposit', async () => {
    const response = await request(app)
      .post(`${ENDPOINT}/statements/deposit`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: faker.datatype.number(999),
        description: faker.lorem.paragraph()
      })

    expect(response.status).toBe(201)
  })

  it('should be able withdraw', async () => {
    const balance = faker.datatype.number({ min: 1, max: 999 })

    await createStatementUseCase.execute({
      amount: balance,
      type: 'deposit' as OperationType,
      description: faker.lorem.paragraph(),
      user_id
    })

    const response = await request(app)
      .post(`${ENDPOINT}/statements/withdraw`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: faker.datatype.number({ min: 0, max: balance }),
        description: faker.lorem.paragraph()
      })

    expect(response.status).toBe(201)
  })

  it('should be able transfer', async () => {
    const balance = faker.datatype.number({ min: 1, max: 999 })

    await createStatementUseCase.execute({
      amount: balance,
      type: 'deposit' as OperationType,
      description: faker.lorem.paragraph(),
      user_id,
      target_id: undefined
    })

    const response = await request(app)
      .post(`${ENDPOINT}/statements/transfer/${target_id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: faker.datatype.number({ min: 0, max: balance }),
        description: faker.lorem.paragraph()
      })

    expect(response.status).toBe(201)
  })

  it('should be get statement data', async () => {
    const statement_id = (await createStatementUseCase.execute({
      amount: faker.datatype.number({ min: 1, max: 999 }),
      type: 'deposit' as OperationType,
      description: faker.lorem.paragraph(),
      user_id
    })).id

    const response = await request(app)
      .get(`${ENDPOINT}/statements/${statement_id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(response.status).toBe(200)
    expect(response.body.id).toBe(statement_id)
  })
})
