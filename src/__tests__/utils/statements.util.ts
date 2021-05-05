import faker from 'faker'
import { OperationType } from '../../modules/statements/entities/Statement'
import { IStatementsRepository } from "../../modules/statements/repositories/IStatementsRepository"
import { ICreateStatementDTO } from '../../modules/statements/useCases/createStatement/ICreateStatementDTO'

export class StatementsUtil {
  private repository: IStatementsRepository

  constructor(statementsRepository: IStatementsRepository) {
    this.repository = statementsRepository
  }

  public async create(payload: Partial<ICreateStatementDTO>) {
    return this.repository.create({
      amount: faker.datatype.number({ min: 0, max: 999 }),
      type: 'transfer' as OperationType,
      description: faker.lorem.sentence(),
      user_id: faker.datatype.uuid(),
      target_id: faker.datatype.uuid(),
      ...payload
    })
  }
}
