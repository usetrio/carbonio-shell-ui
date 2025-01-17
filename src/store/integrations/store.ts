/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ComponentType } from 'react';

import produce from 'immer';
import { forEach, includes, omit } from 'lodash';
import { create } from 'zustand';

import Composer from './composer';
import type { ActionFactory, AnyFunction, IntegrationsState } from '../../../types';
import { SHELL_APP_ID } from '../../constants';

// extra currying as suggested in https://github.com/pmndrs/zustand/blob/main/docs/guides/typescript.md#basic-usage
export const useIntegrationsStore = create<IntegrationsState>()((set) => ({
	actions: {},
	components: {
		composer: {
			item: Composer,
			app: SHELL_APP_ID
		}
	},
	functions: {},
	registerActions: <T>(
		...items: Array<{ id: string; action: ActionFactory<T>; type: string }>
	): void =>
		set(
			produce((state) => {
				forEach(items, ({ id, action, type }) => {
					if (!state.actions[type]) state.actions[type] = {};
					state.actions[type][id] = action;
				});
			})
		),
	registerComponents:
		(app: string) =>
		(...items: Array<{ id: string; component: ComponentType }>): void =>
			set(
				produce((state) => {
					forEach(items, ({ id, component }) => {
						state.components[id] = { app, item: component };
					});
				})
			),
	registerFunctions: (...items: Array<{ id: string; fn: AnyFunction }>): void =>
		set(
			produce((state) => {
				forEach(items, ({ id, fn }) => {
					state.functions[id] = fn;
				});
			})
		),
	removeActions: (...ids: Array<string>): void =>
		set(
			produce((state) => {
				forEach(state.actions, (actionTypeMap, type) => {
					forEach(actionTypeMap, (actionFactory, actionFactoryId) => {
						if (includes(ids, actionFactoryId)) {
							delete state.actions[type][actionFactoryId];
						}
					});
				});
			})
		),
	removeComponents: (...ids: Array<string>): void =>
		set((s) => ({
			...s,
			components: omit(s.components, ids)
		})),
	removeFunctions: (...ids: Array<string>): void =>
		set((s) => ({
			...s,
			functions: omit(s.functions, ids)
		}))
}));
