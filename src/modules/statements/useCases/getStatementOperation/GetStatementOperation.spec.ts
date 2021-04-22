import faker from 'faker'
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository"
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase"
import { GetStatementOperationError } from './GetStatementOperationError'
import { OperationType } from '../../entities/Statement'

describe('[Statement]GetStatementOperation', () => {
  let usersRepository: InMemoryUsersRepository
  let statementsRepository: InMemoryStatementsRepository
  let getStatementOperationUseCase: GetStatementOperationUseCase

  let user_id: string
  let statement_id: string

  beforeEach(async () => {
    statementsRepository = new InMemoryStatementsRepository()
    usersRepository = new InMemoryUsersRepository()
    getStatementOperationUseCase = new GetStatementOperationUseCase(usersRepository, statementsRepository)

    const user = await usersRepository.create({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    })

    user_id = user.id as string

    const statement = await statementsRepository.create({
      user_id: user.id as string,
      amount: faker.datatype.number({ min: 1 }),
      description: faker.lorem.sentence(),
      type: faker.random.arrayElement(['withdraw', 'deposit']) as OperationType,
    })

    statement_id = statement.id as string
  })

  it('should be able to get a statement operation', async () => {
    const statementOperation = await getStatementOperationUseCase.execute({
      user_id,
      statement_id
    })

    expect(statementOperation).toBeTruthy()
    expect(statementOperation).toHaveProperty('id')
  })

  it('should not be able to get statement operation of a non existent user', async () => {
    await expect(getStatementOperationUseCase.execute({
      user_id: faker.datatype.uuid(),
      statement_id
    })).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound)
  })

  it('should not be able to get a non existent statement operation', async () => {
    await expect(getStatementOperationUseCase.execute({
      user_id,
      statement_id: faker.datatype.uuid()
    })).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound)
  })
})
