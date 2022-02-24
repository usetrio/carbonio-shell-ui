/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { useEffect, useState, FC } from 'react';
import { Location } from 'history';
import { Prompt, useHistory } from 'react-router-dom';
import { Modal } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

export const RouteLeavingGuard: FC<{ title: string; when?: boolean }> = ({
	children,
	title,
	when
}) => {
	const history = useHistory();
	const [modalVisible, setModalVisible] = useState(false);
	const [lastLocation, setLastLocation] = useState<Location | null>(null);
	const [confirmedNavigation, setConfirmedNavigation] = useState(false);
	const [t] = useTranslation();
	const closeModal = (): void => {
		setModalVisible(false);
	};
	const handleBlockedNavigation = (nextLocation: Location): boolean => {
		if (!confirmedNavigation) {
			setModalVisible(true);
			setLastLocation(nextLocation);
			return false;
		}
		return true;
	};
	const handleConfirmNavigationClick = (): void => {
		setModalVisible(false);
		setConfirmedNavigation(true);
	};
	useEffect(() => {
		if (confirmedNavigation && lastLocation) {
			// Navigate to the previous blocked location with your navigate function
			history.push(lastLocation.pathname);
		}
	}, [confirmedNavigation, history, lastLocation]);
	return (
		<>
			<Prompt when={when} message={handleBlockedNavigation} />
			{/* Your own alert/dialog/modal component */}
			<Modal
				open={modalVisible}
				onClose={closeModal}
				onConfirm={handleConfirmNavigationClick}
				title={title}
				dismissLabel={t('label.cancel', 'Cancel')}
				confirmLabel={t('settings.button.confirm', 'Confirm')}
			>
				{children}
			</Modal>
		</>
	);
};
export default RouteLeavingGuard;
