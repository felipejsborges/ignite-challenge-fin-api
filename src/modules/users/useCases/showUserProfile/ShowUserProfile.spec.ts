import faker from 'faker'
import { User } from '../../entities/User'
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository'
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase'
import { ShowUserProfileError } from './ShowUserProfileError'

describe('[User]Show Profile', () => {
  let usersRepository: InMemoryUsersRepository
  let showUserProfileUseCase: ShowUserProfileUseCase

  let name: string
  let email: string
  let password: string

  let user: User

  beforeEach(async () => {
    usersRepository = new InMemoryUsersRepository()
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepository)

    name = faker.name.findName()
    email = faker.internet.email()
    password = faker.internet.password()

    user = await usersRepository.create({
      name,
      email,
      password
    })
  })

  it('should be able to show user profile', async () => {
    const userProfile = await showUserProfileUseCase.execute(user.id as string)

    expect(userProfile.id).toBe(user.id)
    expect(userProfile.name).toBe(user.name)
    expect(userProfile.email).toBe(user.email)
    expect(userProfile.statement).toBe(user.statement)
  })

  it('should not be able to show profile of an inexistent user', async () => {
    const nonExistentId = faker.datatype.uuid()

    await expect(
      showUserProfileUseCase.execute(nonExistentId)
    ).rejects.toBeInstanceOf(ShowUserProfileError)
  })
})
