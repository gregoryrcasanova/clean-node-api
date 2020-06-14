const { MissingParamError } = require('../../utils/errors')
const MongoHelper = require('../helpers/mongo-helper')

module.exports = class UpdateAccessTokenRepository {
  constructor (userModel) {
    this.userModel = userModel
  }

  async update (userId, accessToken) {
    if (!userId) {
      throw new MissingParamError('userId')
    }
    if (!accessToken) {
      throw new MissingParamError('accessToken')
    }
    const db = await MongoHelper.getDb()
    await db.collection('users').updateOne({
      _id: userId
    }, {
      $set: {
        accessToken
      }
    })
  }
}
