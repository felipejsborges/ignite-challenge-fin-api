import 'reflect-metadata';
import faker from 'faker'
import { CreateUserUseCase } from "../createUser/CreateUserUseCase"
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase"
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { IncorrectEmailOrPasswordError } from './IncorrectEmailOrPasswordError';
import { User } from '../../entities/User';

describe('[User]Authenticate', () => {
  let usersRepository: InMemoryUsersRepository
  let createUserUseCase: CreateUserUseCase
  let authenticateUserUseCase: AuthenticateUserUseCase

  let name: string
  let email: string
  let password: string

  let user: User

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    createUserUseCase = new CreateUserUseCase(usersRepository)
    authenticateUserUseCase = new AuthenticateUserUseCase(usersRepository)

    name = faker.name.findName()
    email = faker.internet.email()
    password = faker.internet.password()

    user = await createUserUseCase.execute({
      name,
      email,
      password
    })
  })

  it('should be able to authenticate user', async () => {
    const sessionInfo = await authenticateUserUseCase.execute({
      email,
      password
    })

    expect(sessionInfo).toHaveProperty('token')
    expect(sessionInfo.user.id).toBe(user.id)
    expect(sessionInfo.user.name).toBe(user.name)
    expect(sessionInfo.user.email).toBe(user.email)
  })

  it('should not be able to authenticate user with inexistent e-mail', async () => {
    await expect(authenticateUserUseCase.execute({
      email: faker.internet.email(),
      password
    })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })

  it('should not be able to authenticate user with incorrect password', async () => {
    await expect(authenticateUserUseCase.execute({
      email,
      password: faker.internet.password()
    })).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError)
  })
})
