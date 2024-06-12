import type { AppConfig, BrowserstackConfig } from './types.js'
import type { Options } from '@wdio/types'
import TestOpsConfig from './testOps/testOpsConfig.js'
import { isUndefined } from './util.js'
import { TESTOPS_BUILD_ID_ENV } from './constants.js'
import { v4 as uuidv4 } from 'uuid'

class BrowserStackConfig {
    static getInstance(options?: BrowserstackConfig & Options.Testrunner, config?: Options.Testrunner): BrowserStackConfig {
        if (!this._instance && options && config) {
            this._instance = new BrowserStackConfig(options, config)
        }
        return this._instance
    }

    public userName?: string
    public accessKey?: string
    public framework?: string
    public buildName?: string
    public buildIdentifier?: string
    public testObservability: TestOpsConfig
    public percy: boolean
    public accessibility: boolean
    public app?: string|AppConfig
    private static _instance: BrowserStackConfig
    public appAutomate: boolean
    public automate: boolean
    public funnelDataSent: boolean = false
    public logsSent: boolean = false
    public logsUUID?: string
    public clientBuildUUID?: string

    private constructor(options: BrowserstackConfig & Options.Testrunner, config: Options.Testrunner) {
        this.framework = config.framework
        this.userName = config.user
        this.accessKey = config.key
        this.testObservability = new TestOpsConfig(options.testObservability !== false, !isUndefined(options.testObservability))
        this.percy = options.percy || false
        this.accessibility = options.accessibility || false
        this.app = options.app
        this.appAutomate = !isUndefined(options.app)
        this.automate = !this.appAutomate
        this.buildIdentifier = options.buildIdentifier
    }

    sentFunnelData() {
        this.funnelDataSent = true
    }

    getConfigForCleanup() {
        return {
            userName: this.userName,
            accessKey: this.accessKey,
            clientBuildUUID: this.userName,
        }
    }

    getClientBuildUUID() {
        if (this.clientBuildUUID) {
            return this.clientBuildUUID
        }
        if (process.env[TESTOPS_BUILD_ID_ENV]) {
            this.clientBuildUUID = process.env[TESTOPS_BUILD_ID_ENV]
        }

        this.clientBuildUUID = uuidv4()
        return this.clientBuildUUID

    }

    // static fromJSON() {
    //     return new BrowserStackConfig()
    // }

}

export default BrowserStackConfig
