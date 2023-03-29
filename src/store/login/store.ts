/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import create from 'zustand';
import { LoginConfigStore } from '../../../types/loginConfig';

export const useLoginConfigStore = create<LoginConfigStore>(() => ({
	loaded: false,
	// setup defaults for fields which does not depend on dark mode
	carbonioWebUiTitle: 'Carbonio Client',
	// default to png because this icon is used also in notification, and svg are not supported there
	carbonioWebUiFavicon: `${BASE_PATH}favicon.png`
}));
