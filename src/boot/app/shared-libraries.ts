/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from 'react';
import * as ReactDOM from 'react-dom';
import * as Lodash from 'lodash';
import * as ReactRouterDom from 'react-router-dom';
import * as Moment from 'moment';
import * as ReactI18n from 'react-i18next';
import * as ReactRedux from 'react-redux';
import * as ReduxJSToolkit from '@reduxjs/toolkit';
import * as ZappUI from '@zextras/carbonio-design-system';
import * as StyledComponents from 'styled-components';
import * as Preview from '@zextras/carbonio-ui-preview';

export function injectSharedLibraries(): void {
	if (!window.__ZAPP_SHARED_LIBRARIES__) {
		window.__ZAPP_SHARED_LIBRARIES__ = {
			react: React,
			'react-dom': ReactDOM,
			'react-i18next': ReactI18n,
			'react-redux': ReactRedux,
			lodash: Lodash,
			'react-router-dom': ReactRouterDom,
			moment: Moment,
			'styled-components': StyledComponents,
			'@reduxjs/toolkit': ReduxJSToolkit,
			'@zextras/carbonio-shell-ui': {},
			'@zextras/carbonio-design-system': ZappUI,
			'@zextras/carbonio-ui-preview': Preview
		};
		window.__ZAPP_HMR_EXPORT__ = {};
	}
}
