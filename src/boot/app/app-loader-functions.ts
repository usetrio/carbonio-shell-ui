/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
// The 'useXXX' functions actually return hooks
/* eslint-disable react-hooks/rules-of-hooks */

import { reduce } from 'lodash';

import { CarbonioModule } from '../../../types';
import {
	usePushHistoryCallback,
	useGoBackHistoryCallback,
	useReplaceHistoryCallback,
	getCurrentRoute,
	useCurrentRoute,
	replaceHistory,
	goBackHistory,
	pushHistory
} from '../../history/hooks';
import { getSoapFetch, getXmlSoapFetch } from '../../network/fetch';
import { changeTagColor, createTag, deleteTag, renameTag } from '../../network/tags';
import { getNotificationManager } from '../../notification/NotificationManager';
import { runSearch } from '../../search/run-search';
import { useIsMobile } from '../../shell/hooks/useIsMobile';
import { useLocalStorage } from '../../shell/hooks/useLocalStorage';
import {
	getUserAccount,
	getUserAccounts,
	getUserSetting,
	getUserSettings,
	useUserAccount,
	useUserAccounts,
	useUserSetting,
	useUserSettings,
	useUserRight,
	useUserRights,
	getUserRight,
	getUserRights
} from '../../store/account';
import { getApp, getAppContext, useApp, useAppContext, useAppStore } from '../../store/app';
import {
	addBoard,
	closeBoard,
	updateBoard,
	updateBoardContext,
	getBoardById,
	getBoardContextById,
	useBoardContextById,
	useBoardById,
	useBoard,
	minimizeBoards,
	reopenBoards,
	setCurrentBoard,
	useBoardHooks
} from '../../store/boards';
import { useContextBridge } from '../../store/context-bridge';
import {
	getFolder,
	getFolders,
	useFolder,
	useFolders,
	useRoot,
	getRoot,
	useRoots,
	getRoots,
	useSearchFolder,
	useSearchFolders,
	getSearchFolder,
	getSearchFolders,
	useFoldersByView,
	useFoldersAccordionByView,
	useRootByUser,
	getRootByUser
} from '../../store/folder';
import { getI18n, getTFunction } from '../../store/i18n';
import {
	getAction,
	getActions,
	getActionsFactory,
	getActionFactory,
	getIntegratedComponent,
	getIntegratedFunction
} from '../../store/integrations/getters';
import {
	useAction,
	useActions,
	useActionsFactory,
	useActionFactory,
	useIntegratedComponent,
	useIntegratedFunction
} from '../../store/integrations/hooks';
import { useNotify, useRefresh } from '../../store/network';
import { getTags, useTags } from '../../store/tags';

// eslint-disable-next-line @typescript-eslint/ban-types
export const getAppFunctions = (pkg: CarbonioModule): Record<string, Function> => ({
	// I18N
	getI18n: getI18n(pkg.name),
	t: getTFunction(pkg.name),
	// FETCH
	soapFetch: getSoapFetch(pkg.name),
	xmlSoapFetch: getXmlSoapFetch(pkg.name),

	// APP STORE FUNCTIONS
	useAppContext: useAppContext(pkg.name),
	getAppContext: getAppContext(pkg.name),
	useApp: useApp(pkg.name),
	getApp: getApp(pkg.name),
	getComponent: useAppStore((s) => s.views.appView),

	// INTEGRATIONS
	useIntegratedFunction,
	getIntegratedFunction,
	useIntegratedComponent,
	getIntegratedComponent,
	useAction,
	getAction,
	useActions,
	getActions,
	useActionsFactory,
	getActionsFactory,
	useActionFactory,
	getActionFactory,
	// ACCOUNTS
	useUserAccount,
	getUserAccount,
	useUserAccounts,
	getUserAccounts,
	useUserSettings,
	getUserSettings,
	getUserSetting,
	useUserSetting,
	useUserRight,
	useUserRights,
	getUserRight,
	getUserRights,
	useTags,
	getTags,
	useNotify,
	useRefresh,
	// FOLDERS
	useFoldersByView,
	useFoldersAccordionByView,
	useFolder,
	getFolder,
	useFolders,
	getFolders,
	useRoot,
	getRoot,
	useRoots,
	getRoots,
	useSearchFolder,
	useSearchFolders,
	getSearchFolder,
	getSearchFolders,
	useRootByUser,
	getRootByUser,
	// BOARDS
	addBoard: addBoard(pkg.name),
	closeBoard,
	updateBoard,
	updateBoardContext,
	getBoardById,
	getBoardContextById,
	useBoard,
	useBoardById,
	useBoardContextById,
	minimizeBoards,
	reopenBoards,
	setCurrentBoard,
	useBoardHooks,
	// HISTORY
	usePushHistoryCallback,
	useGoBackHistoryCallback,
	useReplaceHistoryCallback,
	useCurrentRoute,
	getCurrentRoute,
	pushHistory,
	goBackHistory,
	replaceHistory,
	// TAGS
	createTag,
	renameTag,
	changeTagColor,
	deleteTag,
	// NOTIFICATION
	getNotificationManager,

	// STUFF
	runSearch,
	useIsMobile,
	useLocalStorage,
	getBridgedFunctions: (): unknown => {
		const { packageDependentFunctions, functions } = useContextBridge.getState();
		return {
			...functions,
			...reduce(packageDependentFunctions, (acc, f, name) => ({ ...acc, [name]: f(pkg.name) }), {})
		};
	}
});
