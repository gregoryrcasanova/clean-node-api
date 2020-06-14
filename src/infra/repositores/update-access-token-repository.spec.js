const MongoHelper = require('../helpers/mongo-helper')
const { MissingParamError } = require('../../utils/errors')
const UpdateAccessTokenRepository = require('./update-access-token-repository')

const makeSut = (db) => {
  return new UpdateAccessTokenRepository()
}

describe('UpdateAccessToken Repository', () => {
  let db, fakeUserId

  beforeAll(async () => {
    await MongoHelper.connect(process.env.MONGO_URL)
    db = await MongoHelper.getDb()
  })

  beforeEach(async () => {
    const userModel = db.collection('users')
    await userModel.deleteMany()
    const fakeUser = await userModel.insertOne({
      email: 'valid_email@mail.com',
      name: 'any_name',
      age: 50,
      state: 'any_state',
      password: 'hashed_password'
    })
    fakeUserId = fakeUser.ops[0]._id
  })

  afterAll(async () => {
    await MongoHelper.disconnect()
  })

  test('should update the user with the given accessToken', async () => {
    const sut = makeSut()

    await sut.update(fakeUserId, 'valid_token')
    const updatedFakeUser = await db.collection('users')
      .findOne({ _id: fakeUserId })
    expect(updatedFakeUser.accessToken).toBe('valid_token')
  })

  test('should throw if no params are provided', async () => {
    const sut = makeSut(db)

    expect(sut.update()).rejects.toThrow(new MissingParamError('userId'))
    expect(sut.update(fakeUserId)).rejects.toThrow(
      new MissingParamError('accessToken'))
  })
})
