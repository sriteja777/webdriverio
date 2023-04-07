import type { SuiteStats, TestStats, RunnerStats, HookStats } from '@wdio/reporter'
import WDIOReporter, {Test} from '@wdio/reporter'
import type { Capabilities, Options } from '@wdio/types'

import { v4 as uuidv4 } from 'uuid'

import type { BrowserstackConfig, TestData } from './types.js'
import { getCloudProvider, uploadEventData, getHierarchy } from './util.js'
import RequestQueueHandler from './request-handler.js'

export default class TestReporter extends WDIOReporter {
    private _capabilities: Capabilities.Capabilities = {}
    private _config?: BrowserstackConfig & Options.Testrunner
    private _observability = true
    private _sessionId?: string
    private _suiteName?: string
    private _requestQueueHandler = RequestQueueHandler.getInstance()

    // @ts-ignore
    constructor(...args) {
        // @ts-ignore
        super(...args);
        this.on('test:end',  /* istanbul ignore next */(test: Test) => {
            console.log("came test end from hook  ", test)
            // const testStat = this.tests[test.uid]
            // this.retries = 0
            // this.onTestEnd(testStat)
        })
        this.on('test:fail',  /* istanbul ignore next */(test: Test) => {
            console.log("came test fail from hook", test )

            // const testStat = this.tests[test.uid]
            // this.retries = 0
            // this.onTestEnd(testStat)
        })

        this.on('test:pending', (test: Test) => {
            console.log("came test pending from hook", test)
        })

        this.on('test:start', /* istanbul ignore next */ (test: Test) => {
            console.log("came test start from hook", test)
        })

        }
    onRunnerStart (runnerStats: RunnerStats) {
        this._capabilities = runnerStats.capabilities as Capabilities.Capabilities
        this._config = runnerStats.config as BrowserstackConfig & Options.Testrunner
        this._sessionId = runnerStats.sessionId
        if (typeof this._config.testObservability !== 'undefined') {
            this._observability = this._config.testObservability
        }
    }

    onSuiteStart (suiteStats: SuiteStats) {
        console.log('came on suite start, suite stats are', suiteStats)
        this._suiteName = suiteStats.file
    }

    onSuiteEnd(suiteStats: SuiteStats) {
        // super.onSuiteEnd(suiteStats);
        console.log('came on suite end, suite stats are', suiteStats)

    }

    onRunnerEnd(runnerStats: RunnerStats) {
        console.log('came on runner end, runner stats are', runnerStats)

        // super.onRunnerEnd(runnerStats);
    }

    async sendTestData(testStats: TestStats) {
        console.log('came on sendTestData ')
        const framework = this._config?.framework

        const testData: TestData = {
            uuid: uuidv4(),
            type: testStats.type,
            name: testStats.title,
            body: {
                lang: 'webdriverio',
                code: null
            },
            scope: testStats.fullTitle,
            scopes: getHierarchy(testStats.fullTitle),
            identifier: testStats.fullTitle,
            file_name: this._suiteName,
            location: this._suiteName,
            started_at: (new Date()).toISOString(),
            framework: framework,
            finished_at: (new Date()).toISOString(),
            duration_in_ms: testStats._duration,
            retries: { limit:0, attempts: 0 },
            result: testStats.state,
        }

        const cloudProvider = getCloudProvider({ options: { hostname: this._config?.hostname } } as WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser)
        testData.integrations = {}

        testData.integrations[cloudProvider] = {
            capabilities: this._capabilities,
            session_id: this._sessionId,
            browser: this._capabilities?.browserName,
            browser_version: this._capabilities?.browserVersion,
            platform: this._capabilities?.platformName,
        }

        const uploadData = {
            event_type: 'TestRunFinished',
            test_run: testData
        }

        const req = this._requestQueueHandler.add(uploadData)
        if (req.proceed && req.data) {
            await uploadEventData(req.data, req.url)
        }

    }



    async onTestSkip(testStats: TestStats) {
        console.log('came on test skip, test stats are', testStats)
        // cucumber steps call this method. We don't want step skipped state so skip for cucumber
        const framework = this._config?.framework

        if (this._observability && framework !== 'cucumber') {
            const testData: TestData = {
                uuid: uuidv4(),
                type: testStats.type,
                name: testStats.title,
                body: {
                    lang: 'webdriverio',
                    code: null
                },
                scope: testStats.fullTitle,
                scopes: getHierarchy(testStats.fullTitle),
                identifier: testStats.fullTitle,
                file_name: this._suiteName,
                location: this._suiteName,
                started_at: (new Date()).toISOString(),
                framework: framework,
                finished_at: (new Date()).toISOString(),
                duration_in_ms: testStats._duration,
                retries: { limit:0, attempts: 0 },
                result: testStats.state,
            }

            const cloudProvider = getCloudProvider({ options: { hostname: this._config?.hostname } } as WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser)
            testData.integrations = {}

            testData.integrations[cloudProvider] = {
                capabilities: this._capabilities,
                session_id: this._sessionId,
                browser: this._capabilities?.browserName,
                browser_version: this._capabilities?.browserVersion,
                platform: this._capabilities?.platformName,
            }

            const uploadData = {
                event_type: 'TestRunFinished',
                test_run: testData
            }

            const req = this._requestQueueHandler.add(uploadData)
            if (req.proceed && req.data) {
                await uploadEventData(req.data, req.url)
            }
        }
    }

    onTestFail(testStats: TestStats) {
        // super.onTestFail(testStats);
        console.log('came test fail, test stats are', testStats, 'json is ', JSON.stringify(testStats))
    }

    onTestEnd(testStats: TestStats) {
        console.log('came test end, test stats are', testStats, ' json is ', JSON.stringify(testStats))
    }



    onHookEnd(hookStats: HookStats) {
        console.log('came hook end, hook stats are', hookStats, ' json is ', JSON.stringify(hookStats))
    }

    onHookStart(hookStats: HookStats) {
        // super.onHookStart(hookStat);
        console.log('came hook start, hook stats are', hookStats, ' json is ', JSON.stringify(hookStats))
    }

    onTestPass(testStats: TestStats) {
        console.log('came test pass, test stats are', testStats, ' json is ', JSON.stringify(testStats))

        // super.onTestPass(testStats);
    }

    onTestRetry(testStats: TestStats) {
        console.log('came test retry, test stats are', testStats, ' json is ', JSON.stringify(testStats))

        // super.onTestRetry(testStats);
    }

    async onTestStart(testStats: TestStats) {
        console.log("came test start, test stats are", testStats, " json is ", JSON.stringify(testStats))
        const framework = this._config?.framework
        //
        if (this._observability && framework !== 'cucumber') {
            const testData: TestData = {
                uuid: uuidv4(),
                type: testStats.type,
                name: testStats.title,
                body: {
                    lang: 'webdriverio',
                    code: null
                },
                scope: testStats.fullTitle,
                scopes: getHierarchy(testStats.fullTitle),
                identifier: testStats.fullTitle,
                file_name: this._suiteName,
                location: this._suiteName,
                //vc_filepath: (this._gitConfigPath && test.file) ? path.relative(this._gitConfigPath, test.file) : undefined, // Missing
                started_at: testStats.start && testStats.start.toISOString(),
                finished_at: testStats.end && testStats.end.toISOString(),
                result: testStats.state,
                framework: framework,

                //         finished_at: (new Date()).toISOString(),
        //         duration_in_ms: testStats._duration,
        //         retries: { limit:0, attempts: 0 },
        //         result: testStats.state,
            }

            // if (testStats.start) testData["started_at"] = testStats.start.toISOString()
            // if (testStats.emd) testData["started_at"] = testStats.start.toISOString()

            //
            const cloudProvider = getCloudProvider({ options: { hostname: this._config?.hostname } } as WebdriverIO.Browser | WebdriverIO.MultiRemoteBrowser)
            testData.integrations = {}
        //
            testData.integrations[cloudProvider] = {
                capabilities: this._capabilities,
                session_id: this._sessionId,
                browser: this._capabilities?.browserName,
                browser_version: this._capabilities?.browserVersion,
                platform: this._capabilities?.platformName,
            }
        //
            const uploadData = {
                event_type: 'TestRunStarted',
                test_run: testData
            }
        //
            const req = this._requestQueueHandler.add(uploadData)
            if (req.proceed && req.data) {
                await uploadEventData(req.data, req.url)
            }
        }
    }
}
