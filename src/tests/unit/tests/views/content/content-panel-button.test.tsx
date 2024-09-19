// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { Button } from '@fluentui/react-components';
import { render } from '@testing-library/react';
import * as React from 'react';
import {
    expectMockedComponentPropsToMatchSnapshots,
    getMockComponentClassPropsForCall,
    mockReactComponents,
} from 'tests/unit/mock-helpers/mock-module-helpers';
import { ContentPage } from 'views/content/content-page';
import { ContentPanelButton } from 'views/content/content-panel-button';
import { ContentActionMessageCreator } from '../../../../../common/message-creators/content-action-message-creator';

jest.mock('@fluentui/react-components');
jest.mock('../../../../../common/message-creators/content-action-message-creator');

describe('ContentPanelButton', () => {
    mockReactComponents([Button]);
    const content = {
        for: {
            testing: ContentPage.create(() => 'CONTENT FOR TESTING' as any),
        },
    };
    const contentTitle = 'TITLE FOR TESTING';

    const deps = {
        contentProvider: ContentPage.provider(content),
        contentActionMessageCreator: {} as any as ContentActionMessageCreator,
    };

    it('renders from content', () => {
        const renderResult = render(
            <ContentPanelButton
                deps={deps}
                reference={content.for.testing}
                iconName="info"
                contentTitle={contentTitle}
            >
                TEXT
            </ContentPanelButton>,
        );

        expect(renderResult.asFragment()).toMatchSnapshot();
        expectMockedComponentPropsToMatchSnapshots([Button]);
    });

    it('renders from path', () => {
        const renderResult = render(
            <ContentPanelButton
                deps={deps}
                reference={'for/testing'}
                iconName="iconName"
                contentTitle={contentTitle}
            >
                TEXT
            </ContentPanelButton>,
        );

        expect(renderResult.asFragment()).toMatchSnapshot();
        expectMockedComponentPropsToMatchSnapshots([Button]);
    });

    it('renders without iconName', () => {
        const renderResult = render(
            <ContentPanelButton deps={deps} reference={'for/testing'} contentTitle={contentTitle}>
                TEXT
            </ContentPanelButton>,
        );

        expect(renderResult.asFragment()).toMatchSnapshot();
        expectMockedComponentPropsToMatchSnapshots([Button]);
    });

    it('renders with reference is null', () => {
        const renderResult = render(
            <ContentPanelButton deps={deps} reference={''} contentTitle={contentTitle}>
                TEXT
            </ContentPanelButton>,
        );
        expect(renderResult.asFragment()).toMatchSnapshot();
        expectMockedComponentPropsToMatchSnapshots([Button]);
    });

    it('button onClick', () => {
        const deps: any = {
            contentProvider: ContentPage.provider(content),
            contentActionMessageCreator: {
                openContentPanel: jest.fn(),
            },
        };
        render(
            <ContentPanelButton deps={deps} reference={'for/testing'} contentTitle={contentTitle}>
                TEXT
            </ContentPanelButton>,
        );

        getMockComponentClassPropsForCall(Button).onClick();
        expect(deps.contentActionMessageCreator.openContentPanel).toHaveBeenCalled();
    });
});
