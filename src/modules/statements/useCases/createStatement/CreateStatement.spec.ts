import 'reflect-metadata';
import faker from 'faker'
import { OperationType } from '../../entities/Statement';
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { CreateStatementUseCase } from "./CreateStatementUseCase"
import { CreateStatementError } from './CreateStatementError';
import { GetBalanceUseCase } from '../getBalance/GetBalanceUseCase';

describe('[Statement]Create', () => {
  let usersRepository: InMemoryUsersRepository
  let statementsRepository: InMemoryStatementsRepository
  let getBalanceUseCase: GetBalanceUseCase
  let createStatementUseCase: CreateStatementUseCase

  let user_id: string
  let amount: number
  let description: string
  let type: OperationType

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    statementsRepository = new InMemoryStatementsRepository()
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository)
    createStatementUseCase = new CreateStatementUseCase(usersRepository, statementsRepository, getBalanceUseCase)

    const user = await usersRepository.create({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    })

    user_id = user.id as string
    amount = faker.datatype.number({ min: 1 })
    description = faker.lorem.sentence()
    type = faker.random.arrayElement(['withdraw', 'deposit', 'transfer']) as OperationType
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

  describe('Create withdraw and transfer statements with enough balance', () => {
    let mockedGetUserBalance: jest.SpyInstance
    let userBalance: number
    let mockedResult: Promise<{ balance: number }>

    beforeEach(() => {
      mockedGetUserBalance = jest.spyOn(getBalanceUseCase, 'execute')

      userBalance = amount + faker.datatype.number()

      mockedResult = Promise.resolve({ balance: userBalance })

      mockedGetUserBalance.mockImplementationOnce(
        () => mockedResult
      )
    })

    it('should be able to create a withdraw statement', async () => {
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

    it('should be able to create a transfer statement', async () => {
      type = 'transfer' as OperationType

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
      expect(withdrawStatement.type).toBe('transfer')
    })
  })

  describe('Don\'t create withdraw and transfer statements without enough balance', () => {
    let mockedGetUserBalance: jest.SpyInstance
    let userBalance: number
    let mockedResult: Promise<{ balance: number }>

    beforeEach(() => {
      mockedGetUserBalance = jest.spyOn(getBalanceUseCase, 'execute')

      userBalance = faker.datatype.number({ min: 0, max: amount - 1 })

      mockedResult = Promise.resolve({ balance: userBalance })

      mockedGetUserBalance.mockImplementationOnce(
        () => mockedResult
      )
    })
  })

  it('should not be able to create a withdraw statement with amount lower than balance', async () => {
    const type = 'withdraw' as OperationType

    await expect(createStatementUseCase.execute({
      user_id,
      amount,
      description,
      type
    })).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })

  it('should not be able to create a transfer statement with amount lower than balance', async () => {
    const type = 'transfer' as OperationType

    await expect(createStatementUseCase.execute({
      user_id,
      amount,
      description,
      type
    })).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  })
})
