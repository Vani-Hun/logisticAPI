import dotenv from "dotenv"
dotenv.config()

import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL
})

await client.connect()


client.on("connect", () => {
    console.log('Redis connected')
})
client.on("error", (error) => {
    console.error(error)
})

export default client
