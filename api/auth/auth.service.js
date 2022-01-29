const bcrypt = require('bcrypt')
const userService = require('../user/user.service')
const logger = require('../../services/logger.service')
const { OAuth2Client } = require('google-auth-library')

async function login(username, password) {
    logger.debug(`auth.service - login with username: ${username}`)

    const user = await userService.getByUsername(username)
    if (!user) return Promise.reject('Invalid username or password')
    console.log(user)
    // TODO: un-comment for real login
    const match = await bcrypt.compare(password, user.password)
    if (!match) return Promise.reject('Invalid username or password')

    delete user.password
    user._id = user._id.toString()
    return user
}


async function googleLogin (tokenId) {
    const googleUser = new OAuth2Client(tokenId)
    async function verify() {
        const ticket = await googleUser.verifyIdToken({
            idToken: tokenId,
            audience: '1075713010675-m4s5vqqfj2kdl5t43hpfcao569uq0c4o.apps.googleusercontent.com'
        })
        const payload = ticket.getPayload()
        const userFullname = payload['name']
        const userUsername = payload['email']
        const userPassword = payload['given_name']
        const userVerified = { fullname: userFullname, username: userUsername, password: `${userPassword}123`, imgUrl: '', mentions: [] }
        return userVerified
    }
    const userVerified = await verify().catch(console.error)
    let user = await userService.getByUsername(userVerified.username)
    if (!user) user = await userService.add(userVerified)
    delete user.password
    user._id = user._id.toString()
    return user

}
    

async function signup(username, password, fullname) {
    const saltRounds = 10

    logger.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)
    if (!username || !password || !fullname) return Promise.reject('fullname, username and password are required!')

    const userExist = await userService.getByUsername(username)
    if (userExist) return Promise.reject('Username already taken')

    const hash = await bcrypt.hash(password, saltRounds)
    return userService.add({ username, password: hash, fullname })
}

module.exports = {
    signup,
    login,
    googleLogin
}