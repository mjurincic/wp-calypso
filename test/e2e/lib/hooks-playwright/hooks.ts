/* eslint-disable mocha/no-top-level-hooks */

/**
 * External dependencies
 */
import config from 'config';
import { BrowserManager, MediaHelper } from '@automattic/calypso-e2e';

/**
 * Hook to launch a Browser and obtain the BrowserContext.
 *
 * @returns {void} No return value.
 */
before( 'Launch browser instance', async function () {
	this.browserContext = await BrowserManager.newBrowserContext();
} );

/**
 * Hook to capture screenshot of the failing page.
 *
 * @returns {Promise<Buffer>} Buffer containing captured screenshot.
 */
afterEach( 'Capture screenshot', async function () {
	// If no test has been run, don't bother.
	if ( ! this.currentTest ) {
		return;
	}

	// If option is set to never save screenshots, then don't bother.
	const doNotSaveScreenshot = config.get( 'neverSaveScreenshots' );
	if ( doNotSaveScreenshot ) {
		return;
	}

	// If test passes and option to save all screenshot is not set,
	// don't bother.
	const saveAllScreenshot = config.get( 'saveAllScreenshots' );
	if ( this.currentTest.state === 'passed' && ! saveAllScreenshot ) {
		return;
	}

	// If we are here, screenshot needs to be captured.
	// Build the necessary components of the filename then call the
	// built-in screenshot utility to save the file.
	const state = this.currentTest.state.toUpperCase();
	const shortTestFileName = this.currentTest.title.replace( /[^a-z0-9]/gi, '-' ).toLowerCase();
	const screenSize = BrowserManager.getTargetScreenSize().toUpperCase();
	const locale = BrowserManager.getTargetLocale().toUpperCase();
	const date = MediaHelper.getDateString();
	const fileName = `${ state }-${ locale }-${ screenSize }-${ shortTestFileName }-${ date }`;
	const screenshotDir = MediaHelper.getScreenshotDir();
	const screenshotPath = `${ screenshotDir }/${ fileName }.png`;

	// Page represents the target page to be captured.
	// Reference to Page object is set during beforeEach hook in the describe block
	// in the currentTest's context.
	return await this.currentTest.page.screenshot( { path: screenshotPath } );
} );

/**
 * Hook to terminate a Browser instance.
 *
 * @returns {Promise<void>} Void promise.
 */
after( 'Close browser', function () {
	return BrowserManager.browser.close();
} );
