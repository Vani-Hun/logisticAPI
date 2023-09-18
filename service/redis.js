import client from "../helper/connectRedis";

var redis = module.exports = {
    setPromise: async ({ key, value }) => {
        try {
            return new Promise((isOk, isError) => {
                client.set(key, value, (err, rs) => {
                    return !err ? isOk(rs) : isError(err)
                })
            })
        } catch (error) {

        }
    },

    getPromise: async (key) => {
        try {
            return new Promise((isOk, isError) => {
                client.get(key, (err, rs) => {
                    return !err ? isOk(rs) : isError(err)
                })
            })
        } catch (error) {

        }
    }

}