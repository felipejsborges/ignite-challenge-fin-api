import 'reflect-metadata';
import faker from 'faker'
import { CreateUserUseCase } from "./CreateUserUseCase"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserError } from './CreateUserError';
import { User } from '../../entities/User';

describe('[User]Create', () => {
  let usersRepository: InMemoryUsersRepository
  let createUserUseCase: CreateUserUseCase

  let name: string
  let email: string
  let password: string

  let user: User

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)

    name = faker.name.findName()
    email = faker.internet.email()
    password = faker.internet.password()

    user = await createUserUseCase.execute({
      name,
      email,
      password
    })
  })

  it('should be able to create a user', async () => {
    expect(user).toHaveProperty('id')
    expect(user.name).toBe(name)
    expect(user.email).toBe(email)
  })

  it('should not be able to create an existent user', async () => {
    await expect(createUserUseCase.execute({
      name: faker.name.findName(),
      email,
      password: faker.internet.password()
    })).rejects.toBeInstanceOf(CreateUserError)
  })
})
