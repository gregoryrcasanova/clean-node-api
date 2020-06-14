const MongoHelper = require('../helpers/mongo-helper')
const LoadUserByEmailRepository = require('./load-user-by-email-repository')
const { MissingParamError } = require('../../utils/errors')

const makeSut = (db) => {
  const userModel = db.collection('users')
  const sut = new LoadUserByEmailRepository(userModel)

  return {
    userModel, sut
  }
}

describe('LoadUserByEmail Repository', () => {
  let db

  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
    db = await MongoHelper.getDb()
  })

  beforeEach(async () => {
    await db.collection('users').deleteMany()
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  test('should return null if no user is found', async () => {
    const { sut } = makeSut(db)
    const user = await sut.load('invalid_email@mail.com')
    expect(user).toBeNull()
  })

  test('should return an user if user is found', async () => {
    const { sut, userModel } = makeSut(db)
    const fakeUser = await userModel.insertOne({
      email: 'valid_email@mail.com',
      name: 'any_name',
      age: 50,
      state: 'any_state',
      password: 'hashed_password'
    })
    const user = await sut.load('valid_email@mail.com')
    expect(user).toEqual({
      _id: fakeUser.ops[0]._id,
      password: fakeUser.ops[0].password
    })
  })

  test('should throw if no userModel is provided', () => {
    const sut = new LoadUserByEmailRepository()
    const promise = sut.load('any_@mail.com')
    expect(promise).rejects.toThrow()
  })

  test('should throw if no email is provided', () => {
    const { sut } = makeSut(db)
    const promise = sut.load()
    expect(promise).rejects.toThrow(new MissingParamError('email'))
  })
})
