import 'reflect-metadata';
import faker from 'faker'
import { User } from '../../../users/entities/User';
import { OperationType } from '../../entities/Statement';
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { CreateStatementError } from './CreateStatementError';

describe('[Statement]Create', () => {
  let usersRepository: InMemoryUsersRepository
  let statementsRepository: InMemoryStatementsRepository
  let createStatementUseCase: CreateStatementUseCase

  let user_id: string
  let amount: number
  let description: string
  let type: OperationType

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    statementsRepository = new InMemoryStatementsRepository()
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository)

    const user = await usersRepository.create({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    })

    user_id = user.id as string
    amount = faker.datatype.number({ min: 1 })
    description = faker.lorem.sentence()
    type = faker.random.arrayElement(['withdraw', 'deposit']) as OperationType
  })

  it('should not be able to create a statement to a not found user', async () => {
    await expect(createStatementUseCase.execute({
      user_id: faker.datatype.uuid(),
      amount,
      description,
      type
    })).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  })

  it('should be able to create a deposit statement', async () => {
    type = 'deposit' as OperationType

    const depositStatement = await createStatementUseCase.execute({
      user_id,
      amount,
      description,
      type
    })

    expect(depositStatement).toHaveProperty('id')
    expect(depositStatement.user_id).toBe(user_id)
    expect(depositStatement.amount).toBe(amount)
    expect(depositStatement.description).toBe(description)
    expect(depositStatement.type).toBe('deposit')
  })

  it('should be able to create a withdraw statement', async () => {
    // mocking getUserBalance function to ensure user balance is bigger than statement amount
    const mockedGetUserBalance = jest.spyOn(statementsRepository, 'getUserBalance')

    const userBalance = amount + faker.datatype.number()

    const mockedResult = Promise.resolve({ balance: userBalance })

    mockedGetUserBalance.mockImplementationOnce(
      () => mockedResult
    )

    // creating withdraw statement
    type = 'withdraw' as OperationType

    const withdrawStatement = await createStatementUseCase.execute({
      user_id,
      amount,
      description,
      type
    })

    expect(mockedGetUserBalance).toBeCalledTimes(1)
    expect(mockedGetUserBalance).toHaveReturnedWith(mockedResult)
    expect(withdrawStatement).toHaveProperty('id')
    expect(withdrawStatement.user_id).toBe(user_id)
    expect(withdrawStatement.amount).toBe(amount)
    expect(withdrawStatement.description).toBe(description)
    expect(withdrawStatement.type).toBe('withdraw')
  })

  it('should not be able to create a withdraw statement with amount lower than balance', async () => {
    // mocking getUserBalance function to ensure user balance is bigger than statement amount
    const mockedGetUserBalance = jest.spyOn(statementsRepository, 'getUserBalance')

    const userBalance = faker.datatype.number({ min: 0, max: amount - 1 })

    const mockedResult = Promise.resolve({ balance: userBalance })

    mockedGetUserBalance.mockImplementationOnce(
      () => mockedResult
    )

    // creating withdraw statement
    const type = 'withdraw' as OperationType

    await expect(createStatementUseCase.execute({
      user_id,
      amount,
      description,
      type
    })).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})
