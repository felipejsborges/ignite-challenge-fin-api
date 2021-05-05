import faker from 'faker'
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { GetBalanceUseCase } from "./GetBalanceUseCase"
import { GetBalanceError } from './GetBalanceError'
import { OperationType } from '../../entities/Statement'
import { StatementsUtil } from '../../../../__tests__/utils/statements.util'

describe('[Statement]GetBalance', () => {
  let statementsRepository: InMemoryStatementsRepository
  let usersRepository: InMemoryUsersRepository
  let getBalanceUseCase: GetBalanceUseCase
  let statementsUtil: StatementsUtil

  beforeEach(async () => {
    statementsRepository = new InMemoryStatementsRepository()
    usersRepository = new InMemoryUsersRepository()
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository)
    statementsUtil = new StatementsUtil(statementsRepository)
  })

  it('should be able to get user balance', async () => {
    const user_id = (await usersRepository.create({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    })).id as string

    const target_id = (await usersRepository.create({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    })).id

    const depositAmount = faker.datatype.number({ min: 2, max: 999 })

    await statementsUtil.create({
      amount: depositAmount,
      type: 'deposit' as OperationType,
      user_id,
      target_id: undefined
    })

    const sentTransferAmount = faker.datatype.number({ min: 1, max: depositAmount })

    await statementsUtil.create({
      amount: sentTransferAmount,
      type: 'transfer' as OperationType,
      user_id,
      target_id
    })

    const receivedTransferAmount = faker.datatype.number({ min: 0, max: sentTransferAmount })

    await statementsUtil.create({
      amount: receivedTransferAmount,
      type: 'transfer' as OperationType,
      user_id: target_id,
      target_id: user_id
    })

    const userBalance = await getBalanceUseCase.execute({ user_id })

    expect(userBalance.balance).toBe(depositAmount - sentTransferAmount + receivedTransferAmount)
    expect(userBalance.statements).toHaveLength(3)
  })

  it('should not be able to get balance of a non existent user', async () => {
    await expect(getBalanceUseCase.execute({
      user_id: faker.datatype.uuid()
    })).rejects.toBeInstanceOf(GetBalanceError)
  })
})
