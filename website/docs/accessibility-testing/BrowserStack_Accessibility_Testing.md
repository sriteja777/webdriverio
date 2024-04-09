---
id: browserstack-accessibility-testing
title: BrowserStack Accessibility Testing
---

You can easily integrate accessibility tests in your WebdriverIO test suites using [BrowserStack's Automated tests](https://www.browserstack.com/docs/accessibility/automated-tests?utm_source=webdriverio&utm_medium=partnered&utm_campaign=documentation). 

## Advantages of Automated tests in BrowserStack Accessibility Testing

1. **Easy onboarding using an SDK**
You can quickly integrate the BrowserStack SDK into your test suite with a few config changes.

2. **Automatic DOM change monitoring**
When a user interacts with a page, there are typically DOM changes as a consequence of their actions. Automated tests automatically detect these DOM changes and re-run static analysis on the parts of the page that have changed, without the need for user intervention.

3. **Automatic de-duplication**
If the scanner detects multiple instances of an issue within a web page, it will automatically de-duplicate these issues based on a unique issue signature and then provide a consolidated list of unique issues.

4. **Component tagging and grouping**
Issues within common components are grouped together for easy prioritization.

5. **Accessibility-focused assertions**
The SDK provides access to a summary of accessibility issues and the individual issues within every test case. This can be used to add custom assertions within your test case for your preferred level of accessibility testing.

6. **Enhanced monitoring & debugging**
The dashboard contains historical trends of builds in terms of issue severity and test case status. Additionally, every build report contains a breakdown of issue by test case, so you can exactly trace back to when an issue occurred within your test suite.

## Get Started with BrowserStack Accessibility Testing

Follow [these steps](https://www.browserstack.com/docs/accessibility/automated-tests/get-started/webdriverio?utm_source=webdriverio&utm_medium=partnered&utm_campaign=documentation) to integrate your WebdriverIO test suites with BrowserStack's Accessibility Testing.
