import { spawn } from 'node:child_process'
import path from 'node:path'
import BrowserStackConfig from './config.js'
import { saveFunnelData } from './instrumentation/funnelInstrumentation.js'
import { fileURLToPath } from 'node:url'
import { TESTOPS_JWT_ENV } from './constants.js'
import { BStackLogger } from './bstackLogger.js'
import fs from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export function setupExitHandlers() {
    process.on('exit', (code) => {
        BStackLogger.debug('Exit hook called')
        const args = shouldCallCleanup(BrowserStackConfig.getInstance())
        if (Array.isArray(args) && args.length) {
            BStackLogger.debug('Spawning cleanup with args ' + args.toString())
            const childProcess = spawn('node', [`${path.join(__dirname, 'cleanup.js')}`, ...args], { detached: true, stdio: 'inherit', env: { ...process.env } })
            childProcess.unref()
            process.exit(code)
        }
    })
}

export function shouldCallCleanup(config: BrowserStackConfig): string[] {
    const args: string[] = []
    if (!!process.env[TESTOPS_JWT_ENV] && !config.testObservability.buildStopped) {
        args.push('--observability')
    }

    if (config.userName && config.accessKey && !config.funnelDataSent) {
        const savedFilePath = saveFunnelData('SDKTestSuccessful', config)
        args.push('--funnelData', savedFilePath)
    }

    if (config.userName && config.accessKey && !config.logsSent) {
        args.push('--logs')
    }

    if (args.length !== 0) {
        const filePath = path.join(BStackLogger.logFolderPath, 'cleanupConfig.json')
        fs.writeFileSync(filePath, JSON.stringify(config.toJSON()))

        args.push('--config', )
    }

    return args
}
