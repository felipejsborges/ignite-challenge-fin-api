import { inject, injectable } from "tsyringe";

import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetBalanceError } from "./GetBalanceError";

interface IRequest {
  user_id: string;
}

interface IResponse {
  statements: Statement[];
  balance: number;
}

@injectable()
export class GetBalanceUseCase {
  constructor(
    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,

    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  async execute({ user_id }: IRequest): Promise<IResponse> {
    const user = await this.usersRepository.findById(user_id);

    if(!user) {
      throw new GetBalanceError();
    }

    const statements = await this.statementsRepository.findStatementsByUserId(user_id);

    const balance = statements.reduce((acc, operation) => {
      if (operation.type === 'transfer') {
        if (operation.target_id === user_id) {
          return acc + operation.amount;
        } else {
          return acc - operation.amount;
        }
      }
      else if (operation.type === 'deposit') {
        return acc + operation.amount;
      } else { // operation.type === 'withdraw'
        return acc - operation.amount;
      }
    }, 0)

    return {
      balance,
      statements
    };
  }
}
