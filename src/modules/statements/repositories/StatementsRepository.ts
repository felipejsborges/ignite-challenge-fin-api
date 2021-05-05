import { getRepository, Repository } from "typeorm";
import { Statement } from "../entities/Statement";
import { ICreateStatementDTO } from "../useCases/createStatement/ICreateStatementDTO";
import { IGetStatementOperationDTO } from "../useCases/getStatementOperation/IGetStatementOperationDTO";
import { IStatementsRepository } from "./IStatementsRepository";

export class StatementsRepository implements IStatementsRepository {
  private repository: Repository<Statement>;

  constructor() {
    this.repository = getRepository(Statement);
  }

  async create(data: ICreateStatementDTO): Promise<Statement> {
    const statement = this.repository.create(data);

    return this.repository.save(statement);
  }

  async findStatementOperation({ statement_id, user_id }: IGetStatementOperationDTO): Promise<Statement | undefined> {
    let statement = await this.repository.findOne(statement_id, {
      where: { user_id }
    });

    if (statement) statement = { ...statement, amount: Number(statement.amount) }

    return statement
  }

  async findStatementsByUserId(user_id: string): Promise<Statement[]> {
    let statements = await this.repository.find({
      where: [{ user_id }, { target_id: user_id }]
    });

    statements = statements.map(statement => ({ ...statement, amount: Number(statement.amount) }))

    return statements
  }
}
