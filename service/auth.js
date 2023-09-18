import KeyToken from "../model/KeyToken.js"

export const createKeyToken = async (userId, deviceInfo, refreshToken, privateKey, publicKey) => {

    try {
        await KeyToken.findOneAndUpdate({ user: userId },
            { $pull: { refreshTokenUsed: { deviceInfo: deviceInfo.ip } } },
            { upsert: true, new: true })

        const tokens = await KeyToken.findOneAndUpdate({ user: userId },
            { publicKey: publicKey, privateKey: privateKey, $push: { refreshTokenUsed: { deviceInfo: deviceInfo.ip, refreshToken: refreshToken } }, refreshToken: refreshToken },
            { upsert: true, new: true })
        return tokens ? tokens.publicKey : null
    } catch (error) {
        console.log(error)

    }
}
