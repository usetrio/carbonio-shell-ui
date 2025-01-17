/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
	ChipInput,
	ChipInputProps,
	Container,
	IconButton,
	Padding,
	Tooltip
} from '@zextras/carbonio-design-system';
import { filter, find, map, reduce, some } from 'lodash';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { ModuleSelector } from './module-selector';
import { useSearchStore } from './search-store';
import { QueryChip, QueryItem } from '../../types';
import { LOCAL_STORAGE_SEARCH_KEY, SEARCH_APP_ID } from '../constants';
import { useLocalStorage } from '../shell/hooks/useLocalStorage';
import { getT } from '../store/i18n';

const OutlinedIconButton = styled(IconButton)`
	border: 0.0625rem solid
		${({ theme, disabled }): string =>
			disabled ? theme.palette.primary.disabled : theme.palette.primary.regular};
	display: block;
	& svg {
		border: none;
	}
`;

const StyledChipInput = styled(ChipInput)`
	padding: 0 1rem;
	&:hover {
		outline: none;
		background: ${({ theme, disabled }): string =>
			disabled ? 'gray5' : theme.palette.gray5.hover};
	}
`;

const StyledContainer = styled(Container)`
	height: 2.625rem;
	overflow-y: hidden;
	&:first-child {
		transform: translateY(-0.125rem);
	}
`;

type SearchOption = NonNullable<ChipInputProps['options']>[number] & QueryItem;

export const SearchBar = (): JSX.Element => {
	const inputRef = useRef<HTMLInputElement>(null);
	const t = getT();
	const [storedSuggestions, setStoredSuggestions] = useLocalStorage<SearchOption[]>(
		LOCAL_STORAGE_SEARCH_KEY,
		[]
	);
	const [inputTyped, setInputTyped] = useState<string>('');
	const history = useHistory();
	const { updateQuery, module, query, searchDisabled, setSearchDisabled, tooltip } =
		useSearchStore();

	const [isTyping, setIsTyping] = useState(false);

	const [options, setOptions] = useState<SearchOption[]>([]);

	const [inputHasFocus, setInputHasFocus] = useState(false);

	const [searchInputValue, setSearchInputValue] = useState<QueryChip[]>(query);

	const showClear = useMemo(
		() =>
			searchInputValue.length > 0 ||
			(inputRef.current?.value && inputRef.current?.value?.length > 0),
		[searchInputValue.length]
	);
	const clearSearch = useCallback((): void => {
		if (inputRef.current) {
			inputRef.current.value = '';
			inputRef.current?.focus();
		}
		setIsTyping(false);
		setSearchInputValue([]);
		setSearchDisabled(false);
		updateQuery([]);
		setInputTyped('');
	}, [setSearchDisabled, updateQuery]);

	const onSearch = useCallback(() => {
		updateQuery((currentQuery) => {
			const ref = inputRef?.current;
			if (ref) {
				ref.value = '';
			}
			if (inputTyped.length > 0) {
				const newInputValue: typeof searchInputValue = [
					...searchInputValue,
					...map(
						inputTyped.split(' '),
						(label, id): QueryChip => ({
							id: `${id}`,
							label,
							hasAvatar: false
						})
					)
				];
				setSearchInputValue(newInputValue);
				setInputTyped('');
				return reduce(
					newInputValue,
					(acc, newInputChip) => {
						if (
							!some(
								currentQuery,
								(currentQueryChip) => currentQueryChip.label === newInputChip.label
							)
						) {
							acc.push(newInputChip);
						}
						return acc;
					},
					filter(currentQuery, (currentQueryChip) =>
						some(
							searchInputValue,
							(searchInputChip) => searchInputChip.label === currentQueryChip.label
						)
					)
				);
			}

			setInputTyped('');

			return reduce(
				searchInputValue,
				(acc, searchInputChip) => {
					if (
						!some(
							currentQuery,
							(currentQueryChip) => currentQueryChip.label === searchInputChip.label
						)
					) {
						acc.push(searchInputChip);
					}
					return acc;
				},

				filter(currentQuery, (currentQueryChip: QueryChip) =>
					some(
						searchInputValue,
						(searchInputChip) => searchInputChip.label === currentQueryChip.label
					)
				)
			);
		});
		// TODO: perform a navigation only when coming from a different module (not the search one)
		history.push(`/${SEARCH_APP_ID}/${module}`);
	}, [updateQuery, history, module, inputTyped, searchInputValue]);

	const appSuggestions = useMemo<SearchOption[]>(
		() =>
			filter(storedSuggestions, (v) => v.app === module)
				.reverse()
				.map(
					(item): SearchOption => ({
						...item,
						disabled: searchDisabled,
						onClick: (): void => {
							const newInputChip: QueryChip = { ...item, hasAvatar: false, onClick: undefined };
							setSearchInputValue((prevState) => [...prevState, newInputChip]);
						}
					})
				),
		[storedSuggestions, module, searchDisabled]
	);

	const updateOptions = useCallback(
		(textContent: string, queryChips: QueryChip[]): void => {
			if (textContent.length > 0) {
				setOptions(
					appSuggestions
						.filter(
							(suggestion) =>
								textContent &&
								suggestion.label.includes(textContent) &&
								!some(queryChips, (queryChip) => queryChip.value === suggestion.label)
						)
						.slice(0, 5)
				);
			} else {
				setOptions(appSuggestions.slice(0, 5));
			}
		},
		[appSuggestions]
	);

	const onQueryChange = useCallback<NonNullable<ChipInputProps['onChange']>>(
		(newQuery) => {
			// FIXME: move the saving of suggestions after the search occurs.
			// 	The saving logic should not be placed here because the onChange is called even when a chip is removed from the chipInput.
			//  So, at the moment, keywords never searched for are saved too.
			const lastChipLabel = newQuery[newQuery.length - 1]?.label;
			if (
				lastChipLabel &&
				typeof lastChipLabel === 'string' &&
				module &&
				!find(appSuggestions, (suggestion) => suggestion.label === lastChipLabel)
			) {
				setStoredSuggestions((prevState) => {
					const newSuggestion: SearchOption = {
						value: lastChipLabel,
						label: lastChipLabel,
						icon: 'ClockOutline',
						app: module,
						id: lastChipLabel
					};
					return [...prevState, newSuggestion];
				});
			}

			// FIXME: remove the cast (by making ChipItem support generics?)
			setSearchInputValue(newQuery as QueryChip[]);
		},
		[appSuggestions, module, setStoredSuggestions]
	);

	const onInputType = useCallback<NonNullable<ChipInputProps['onInputType']>>(
		(ev) => {
			if (!ev.textContent) {
				setIsTyping(false);
			} else {
				setIsTyping(true);
			}
			setInputTyped(ev.textContent || '');
			updateOptions(ev.textContent || '', query);
		},
		[query, updateOptions]
	);

	useEffect(() => {
		if (module) {
			const suggestions = filter(appSuggestions, (suggestion) => suggestion.app === module).slice(
				0,
				5
			);

			setOptions(suggestions);
		}
	}, [appSuggestions, module]);

	const containerRef = useRef<HTMLDivElement>(null);
	const addFocus = useCallback(() => setInputHasFocus(true), []);
	const removeFocus = useCallback(() => setInputHasFocus(false), []);

	// disabled for now, awaiting refactor of the search bar
	// useEffect(() => {
	// 	const handler = (event: KeyboardEvent): unknown =>
	// 		handleKeyboardShortcuts({
	// 			event,
	// 			inputRef,
	// 			primaryAction,
	// 			secondaryActions,
	// 			currentApp
	// 		});
	// 	document.addEventListener('keydown', handler);
	// 	return (): void => {
	// 		document.removeEventListener('keydown', handler);
	// 	};
	// }, [currentApp, inputRef, primaryAction, secondaryActions]);

	useEffect(() => {
		const ref = inputRef.current;
		const runSearchOnKeyUp = (ev: KeyboardEvent): void => {
			if (ev.key === 'Enter') {
				onSearch();
				removeFocus();
			}
		};
		if (ref) {
			ref.addEventListener('keyup', runSearchOnKeyUp);
		}

		return (): void => {
			if (ref) {
				ref.removeEventListener('keyup', runSearchOnKeyUp);
			}
		};
	}, [onSearch, removeFocus]);

	const disableOptions = useMemo(() => !(options.length > 0) || isTyping, [options, isTyping]);

	const placeholder = useMemo(
		() =>
			inputHasFocus && module
				? t('search.active_input_label', 'Separate your keywords by a comma or pressing TAB')
				: t('search.idle_input_label', 'Search in {{module}}', {
						module
				  }),
		[inputHasFocus, module, t]
	);

	const clearButtonPlaceholder = useMemo(
		() =>
			showClear || isTyping
				? t('search.clear', 'Clear search input')
				: t('search.already_clear', 'Search input is already clear'),
		[showClear, t, isTyping]
	);

	const searchButtonsAreDisabled = useMemo(
		() => (isTyping ? false : !showClear),
		[showClear, isTyping]
	);

	const searchBtnTooltipLabel = useMemo(() => {
		if (!searchButtonsAreDisabled && searchInputValue.length > 0) {
			return t('search.start', 'Start search');
		}
		if (inputHasFocus) {
			return t(
				'search.type_or_choose_suggestion',
				'Type or choose some keywords to start a search'
			);
		}
		if (query.length > 0) {
			return t('label.edit_to_start_search', 'Edit your search to start a new one');
		}
		return t('search.type_to_start_search', 'Type some keywords to start a search');
	}, [searchButtonsAreDisabled, searchInputValue.length, inputHasFocus, query.length, t]);

	const onChipAdd = useCallback<NonNullable<ChipInputProps['onAdd']>>(
		(newChip) => {
			setIsTyping(false);
			setInputTyped('');
			if (module) {
				const suggestions = filter(
					appSuggestions,
					(suggestion) => suggestion?.app === module
				).slice(0, 5);

				setOptions(suggestions);
			}
			return {
				label: typeof newChip === 'string' ? newChip : '',
				value: newChip,
				hasAvatar: false
			};
		},
		[appSuggestions, module]
	);

	useEffect(() => {
		setSearchInputValue(map(query, (queryChip) => ({ ...queryChip, disabled: searchDisabled })));
	}, [searchDisabled, query]);

	return (
		<Container
			minWidth="fit-content"
			width="fit"
			flexGrow="1"
			orientation="horizontal"
			ref={containerRef}
		>
			<Tooltip
				disabled={!searchDisabled}
				maxWidth="100%"
				label={
					tooltip ??
					t('search.unable_to_parse_query', 'Unable to complete the search, clear it and retry')
				}
			>
				<Container orientation="horizontal" width="fill">
					<Container minWidth="32rem" width="fill">
						<Container orientation="horizontal" width="fill">
							<Container width="fit">
								<ModuleSelector />
							</Container>
							<StyledContainer orientation="horizontal">
								<StyledChipInput
									disabled={searchDisabled}
									inputRef={inputRef}
									value={searchInputValue}
									onAdd={onChipAdd}
									options={options}
									placeholder={placeholder}
									confirmChipOnBlur={false}
									separators={['Enter', 'NumpadEnter', 'Comma', 'Space']}
									background={searchDisabled ? 'gray5' : 'gray6'}
									style={{
										cursor: 'pointer',
										overflowX: 'hidden'
									}}
									onChange={onQueryChange}
									onInputType={onInputType}
									onInputTypeDebounce={0}
									onBlur={removeFocus}
									onFocus={addFocus}
									disableOptions={disableOptions}
									requireUniqueChips={false}
								/>
							</StyledContainer>
						</Container>
					</Container>

					{!searchButtonsAreDisabled && (
						<Padding left="small">
							<Tooltip label={clearButtonPlaceholder} placement="bottom">
								<OutlinedIconButton
									size="large"
									customSize={{
										iconSize: 'large',
										paddingSize: 'small'
									}}
									disabled={searchButtonsAreDisabled}
									icon="BackspaceOutline"
									iconColor="primary"
									onClick={clearSearch}
								/>
							</Tooltip>
						</Padding>
					)}

					<Padding left="small">
						<Tooltip
							maxWidth="100%"
							disabled={searchDisabled}
							label={searchBtnTooltipLabel}
							placement="bottom"
						>
							<IconButton
								size="large"
								customSize={{
									iconSize: 'large',
									paddingSize: 'small'
								}}
								icon="Search"
								disabled={searchButtonsAreDisabled}
								backgroundColor="primary"
								iconColor="gray6"
								onClick={onSearch}
							/>
						</Tooltip>
					</Padding>
				</Container>
			</Tooltip>
		</Container>
	);
};
