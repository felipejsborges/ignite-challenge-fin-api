import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

@injectable()
export class CreateStatementUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,

    @inject('GetBalanceUseCase')
    private getBalanceUseCase: GetBalanceUseCase
  ) { }

  async execute({ user_id, type, amount, description, target_id }: ICreateStatementDTO) {
    const user = await this.usersRepository.findById(user_id);

    if (!user) {
      throw new CreateStatementError.UserNotFound();
    }

    if (['withdraw', 'transfer'].includes(type)) {
      const { balance } = await this.getBalanceUseCase.execute({ user_id });

      if (balance < amount) {
        throw new CreateStatementError.InsufficientFunds()
      }
    }

    let statementOperation: Statement

    if (type === 'transfer') {
      // create for sender
      statementOperation = await this.statementsRepository.create({
        user_id,
        type,
        amount,
        description,
        target_id
      });

      // create for target
      await this.statementsRepository.create({
        type,
        amount,
        description,
        user_id: target_id as string,
        target_id
      });
    } else {
      statementOperation = await this.statementsRepository.create({
        user_id,
        type,
        amount,
        description
      });
    }

    return statementOperation;
  }
}
