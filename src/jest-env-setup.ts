/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import '@testing-library/jest-dom/extend-expect';
import { act, configure } from '@testing-library/react';
import dotenv from 'dotenv';
import failOnConsole from 'jest-fail-on-console';
import { noop } from 'lodash';

import server from './mocks/server';

dotenv.config();

configure({
	asyncUtilTimeout: 2000
});

failOnConsole({
	shouldFailOnWarn: true,
	shouldFailOnError: true,
	silenceMessage: (errorMessage) =>
		// Warning: Failed prop type: Invalid prop `target` of type `Window` supplied to `ForwardRef(SnackbarFn)`, expected instance of `Window`
		// This warning is printed in the console for this render. This happens because window element is a jsdom representation of the window,
		// and it's an object instead of a Window class instance, so the check on the prop type fail for the target prop
		/Invalid prop `\w+`(\sof type `\w+`)? supplied to `(\w+(\(\w+\))?)`/.test(errorMessage) ||
		// errors forced from the tests
		/Controlled error/gi.test(errorMessage)
});

beforeEach(() => {
	Object.defineProperty(window, 'IntersectionObserver', {
		writable: true,
		value: jest.fn(function intersectionObserverMock(
			callback: IntersectionObserverCallback,
			options: IntersectionObserverInit
		) {
			return {
				thresholds: options.threshold,
				root: options.root,
				rootMargin: options.rootMargin,
				observe: noop,
				unobserve: noop,
				disconnect: noop
			};
		})
	});

	// cleanup local storage
	window.localStorage.clear();

	jest.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1024);
	jest.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(768);
});

beforeAll(() => {
	server.listen({ onUnhandledRequest: 'warn' });

	const retryTimes = process.env.JEST_RETRY_TIMES ? parseInt(process.env.JEST_RETRY_TIMES, 10) : 2;
	jest.retryTimes(retryTimes, { logErrorsBeforeRetry: true });
});

afterAll(() => {
	server.close();
});

afterEach(() => {
	act(() => {
		jest.runOnlyPendingTimers();
	});
	server.events.removeAllListeners();
	server.resetHandlers();
	act(() => {
		window.resizeTo(1024, 768);
	});
});

jest.mock<typeof import('./workers')>('./workers');
jest.mock<typeof import('./reporting/functions')>('./reporting/functions');
jest.mock<typeof import('./reporting/store')>('./reporting/store');
