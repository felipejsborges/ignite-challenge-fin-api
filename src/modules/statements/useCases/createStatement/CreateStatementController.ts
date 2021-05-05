import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { OperationType } from '../../entities/Statement';

import { CreateStatementUseCase } from './CreateStatementUseCase';

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { target_id } = request.params
    const { amount, description } = request.body;

    const [splittedPath] = request.originalUrl.split('/statements/')[1].split('/')
    const type = splittedPath as OperationType;

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id,
      type,
      amount,
      description,
      target_id
    });

    return response.status(201).json(statement);
  }
}
