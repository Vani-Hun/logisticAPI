'use strict'

import mongoose from "mongoose"
import os from "os"
import process from "process"
const _SECONDS = 30000

// check over load
export const checkOverload = () => {
    setInterval(() => {
        const numConnection = mongoose.connections.length
        const numCores = os.cpus().length
        const memoryUsage = process.memoryUsage().rss
        const maxConnection = numCores * 5
        console.log(`Active connection: ${numConnection}`)
        console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`)
        if (numConnection + 2 > maxConnection) {
            console.log("Connection overload detected")
        }
    }, _SECONDS)//Monitor every 30 seconds
}

