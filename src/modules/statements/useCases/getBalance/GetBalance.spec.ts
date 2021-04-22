import faker from 'faker'
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { GetBalanceUseCase } from "./GetBalanceUseCase"
import { GetBalanceError } from './GetBalanceError'

describe('[Statement]GetBalance', () => {
  let statementsRepository: InMemoryStatementsRepository
  let usersRepository: InMemoryUsersRepository
  let getBalanceUseCase: GetBalanceUseCase

  let user_id: string

  beforeEach(async () => {
    statementsRepository = new InMemoryStatementsRepository()
    usersRepository = new InMemoryUsersRepository()
    getBalanceUseCase = new GetBalanceUseCase(statementsRepository, usersRepository)

    const user = await usersRepository.create({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    })

    user_id = user.id as string
  })

  it('should be able to get user balance', async () => {
    const userBalance = await getBalanceUseCase.execute({ user_id })

    expect(userBalance).toBeTruthy()
  })

  it('should not be able to get balance of a non existent user', async () => {
    await expect(getBalanceUseCase.execute({
      user_id: faker.datatype.uuid()
    })).rejects.toBeInstanceOf(GetBalanceError)
  })
})
