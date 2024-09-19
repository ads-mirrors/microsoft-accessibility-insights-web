// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { TextField } from '@fluentui/react';
import { Link, Button } from '@fluentui/react-components';
import { act, fireEvent, render } from '@testing-library/react';
import { Assessments } from 'assessments/assessments';
import { FlaggedComponent } from 'common/components/flagged-component';
import { FluentUIV9Icon } from 'common/icons/fluentui-v9-icons';
import { CapturedInstanceActionType } from 'common/types/captured-instance-action-type';
import { FeatureFlagStoreData } from 'common/types/store-data/feature-flag-store-data';
import { VisualizationType } from 'common/types/visualization-type';
import { ActionAndCancelButtonsComponent } from 'DetailsView/components/action-and-cancel-buttons-component';
import {
    FailureInstancePanelControl,
    FailureInstancePanelControlProps,
} from 'DetailsView/components/failure-instance-panel-control';
import { FailureInstancePanelDetails } from 'DetailsView/components/failure-instance-panel-details';
import { GenericPanel } from 'DetailsView/components/generic-panel';
import * as React from 'react';
import {
    expectMockedComponentPropsToMatchSnapshots,
    getMockComponentClassPropsForCall,
    mockReactComponents,
    useOriginalReactElements,
} from 'tests/unit/mock-helpers/mock-module-helpers';
import { IMock, Mock, Times } from 'typemoq';
jest.mock('@fluentui/react');
jest.mock('@fluentui/react-components');
jest.mock('common/components/flagged-component');
jest.mock('DetailsView/components/generic-panel');
jest.mock('DetailsView/components/action-and-cancel-buttons-component');
jest.mock('DetailsView/components/failure-instance-panel-details');
jest.mock('common/icons/fluentui-v9-icons');

describe('FailureInstancePanelControlTest', () => {
    mockReactComponents([
        Button,
        Link,
        GenericPanel,
        FlaggedComponent,
        TextField,
        ActionAndCancelButtonsComponent,
        FailureInstancePanelDetails,
        FluentUIV9Icon,
    ]);
    let addPathForValidationMock: IMock<(path) => void>;
    let addInstanceMock: IMock<(instanceData, test, step) => void>;
    let editInstanceMock: IMock<(instanceData, test, step, id) => void>;
    let clearPathSnippetDataMock: IMock<() => void>;

    beforeEach(() => {
        addInstanceMock = Mock.ofInstance(() => {});
        editInstanceMock = Mock.ofInstance(() => {});
        addPathForValidationMock = Mock.ofInstance(() => {});
        clearPathSnippetDataMock = Mock.ofInstance(() => {});
    });

    test('render FailureInstancePanelControl: create without instance', () => {
        const props = createPropsWithType(CapturedInstanceActionType.CREATE);
        const renderResult = render(<FailureInstancePanelControl {...props} />);
        expectMockedComponentPropsToMatchSnapshots([Button, FlaggedComponent]);
        expect(renderResult.asFragment()).toMatchSnapshot();
    });

    test('render FailureInstancePanelControl: partial original instance', () => {
        const props = {
            step: 'missingHeadings',
            test: VisualizationType.HeadingsAssessment,
            addFailureInstance: addInstanceMock.object,
            addPathForValidation: addPathForValidationMock.object,
            clearPathSnippetData: clearPathSnippetDataMock.object,
            actionType: CapturedInstanceActionType.CREATE,
            assessmentsProvider: Assessments,
            featureFlagStoreData: null,
            failureInstance: { failureDescription: 'original text' },
        };
        const renderResult = render(<FailureInstancePanelControl {...props} />);
        expectMockedComponentPropsToMatchSnapshots([Button, FlaggedComponent]);
        expect(renderResult.asFragment()).toMatchSnapshot();
        const flaggedProps = getMockComponentClassPropsForCall(FlaggedComponent);
        expect(flaggedProps.enableJSXElement.props.path).toBeUndefined();
    });

    test('render FailureInstancePanelControl: edit without instance', () => {
        const props = createPropsWithType(CapturedInstanceActionType.EDIT);
        const renderResult = render(<FailureInstancePanelControl {...props} />);
        expectMockedComponentPropsToMatchSnapshots([Button, FlaggedComponent]);
        expect(renderResult.asFragment()).toMatchSnapshot();
    });

    test('closeFailureInstancePanel', () => {
        useOriginalReactElements('@fluentui/react', ['TextField']);
        const description = 'description';
        const props = createPropsWithType(CapturedInstanceActionType.CREATE);
        const renderResult = render(<FailureInstancePanelControl {...props} />);
        expectMockedComponentPropsToMatchSnapshots([Button, FlaggedComponent]);
        const genericPanelProp = getMockComponentClassPropsForCall(GenericPanel);
        const textField = renderResult.getByRole('textbox') as HTMLInputElement;
        fireEvent.change(textField, { target: { value: description } });
        act(() => {
            genericPanelProp.onDismiss();
        });

        expect(genericPanelProp.isOpen).toBe(false);
        // This shouldn't be cleared because it stays briefly visible as the panel close animation happens
        expect(textField.value).toBe(description);

        clearPathSnippetDataMock.verify(handler => handler(), Times.exactly(2));
    });

    test('onFailureDescriptionChange', () => {
        useOriginalReactElements('@fluentui/react', [
            'TextField',
            'Panel',
            'ActionButton',
            'DefaultButton',
        ]);

        useOriginalReactElements('@fluentui/react-components', ['Link', 'Button']);
        useOriginalReactElements('DetailsView/components/generic-panel', ['GenericPanel']);
        useOriginalReactElements('common/components/flagged-component', ['FlaggedComponent']);
        useOriginalReactElements('DetailsView/components/action-and-cancel-buttons-component', [
            'ActionAndCancelButtonsComponent',
        ]);
        useOriginalReactElements('DetailsView/components/failure-instance-panel-details', [
            'FailureInstancePanelDetails',
        ]);
        const description = 'abc';
        const props = createPropsWithType(CapturedInstanceActionType.CREATE);

        const renderResult = render(<FailureInstancePanelControl {...props} />);
        expectMockedComponentPropsToMatchSnapshots([Button, FlaggedComponent]);

        fireEvent.click(renderResult.getByText('Add a failure instance'));
        const textField = renderResult.getByRole('textbox') as HTMLInputElement;
        fireEvent.change(textField, { target: { value: description } });

        expect(textField.value).toBe(description);
    });

    test('onSelectorChange ', () => {
        const selector = 'some selector';
        const props = createPropsWithType(CapturedInstanceActionType.CREATE);
        props.featureFlagStoreData = { manualInstanceDetails: true };
        props.failureInstance.path = '';
        const renderResult = render(<FailureInstancePanelControl {...props} />);
        expectMockedComponentPropsToMatchSnapshots([Button, FlaggedComponent]);
        fireEvent.click(renderResult.getByText('Add a failure instance'));
        const cssSelector = renderResult.getByLabelText('CSS Selector') as HTMLInputElement;
        fireEvent.change(cssSelector, { target: { value: selector } });
        expect(cssSelector.value).toBe(selector);
    });

    test('onValidateSelector ', () => {
        const props = createPropsWithType(CapturedInstanceActionType.CREATE);

        const failureInstance = {
            failureDescription: 'new text',
            path: 'some selector',
            snippet: null,
        };

        props.failureInstance = failureInstance;
        props.featureFlagStoreData = { manualInstanceDetails: true };
        addPathForValidationMock
            .setup(handler => handler(failureInstance.path))
            .verifiable(Times.once());

        const renderResult = render(<FailureInstancePanelControl {...props} />);
        expectMockedComponentPropsToMatchSnapshots([Button, FlaggedComponent]);
        fireEvent.click(renderResult.getByText('Add a failure instance'));
        fireEvent.click(renderResult.getByText('Validate CSS selector'));

        addPathForValidationMock.verifyAll();
    });

    test('openFailureInstancePanel', () => {
        const props = createPropsWithType(CapturedInstanceActionType.CREATE);
        const failureInstance = {
            failureDescription: 'new text',
            path: 'new path',
            snippet: 'new snippet',
        };
        props.failureInstance = failureInstance;
        props.featureFlagStoreData = { manualInstanceDetails: true };
        const renderResult = render(<FailureInstancePanelControl {...props} />);
        expectMockedComponentPropsToMatchSnapshots([Button, FlaggedComponent]);
        fireEvent.click(renderResult.getByText('Add a failure instance'));

        expect(renderResult.container.querySelector('.failureInstancePanel')).not.toBeNull;
        const failureDescription = renderResult.getByLabelText('Comment') as HTMLInputElement;
        expect(failureDescription.value).toEqual(props.failureInstance.failureDescription);
        const pathField = renderResult.getByLabelText('CSS Selector') as HTMLInputElement;
        expect(pathField.value).toEqual(props.failureInstance.path);
        const snippetText = renderResult.getByText(props.failureInstance.snippet);
        expect(snippetText).not.toBeNull();
    });

    test('onSaveEditedFailureInstance', () => {
        const description = 'text';
        const props = createPropsWithType(CapturedInstanceActionType.EDIT);
        props.instanceId = '1';
        props.editFailureInstance = editInstanceMock.object;

        const instanceData = {
            failureDescription: description,
            path: null,
            snippet: null,
        };

        editInstanceMock
            .setup(handler => handler(instanceData, props.test, props.step, props.instanceId))
            .verifiable(Times.once());

        const renderResult = render(<FailureInstancePanelControl {...props} />);
        expectMockedComponentPropsToMatchSnapshots([Button, FlaggedComponent]);
        fireEvent.click(renderResult.getByRole('button'));
        const textField = renderResult.getByRole('textbox') as HTMLInputElement;
        fireEvent.change(textField, { target: { value: description } });
        fireEvent.click(renderResult.getByText('Save'));
        expect(renderResult.container.querySelector('.failureInstancePanel')).not.toBeNull;
        editInstanceMock.verifyAll();
        clearPathSnippetDataMock.verify(handler => handler(), Times.exactly(2));
    });

    test('onAddFailureInstance', () => {
        const description = 'text';
        const props = createPropsWithType(CapturedInstanceActionType.CREATE);

        const instanceData = {
            failureDescription: description,
            path: null,
            snippet: null,
        };

        addInstanceMock
            .setup(handler => handler(instanceData, props.test, props.step))
            .verifiable(Times.once());

        const renderResult = render(<FailureInstancePanelControl {...props} />);
        expectMockedComponentPropsToMatchSnapshots([Button, FlaggedComponent]);
        fireEvent.click(renderResult.getByText('Add a failure instance'));
        const textField = renderResult.getByRole('textbox') as HTMLInputElement;
        fireEvent.change(textField, { target: { value: description } });
        fireEvent.click(renderResult.getByText('Add failed instance'));
        expect(renderResult.container.querySelector('.failureInstancePanel')).not.toBeNull;
        addInstanceMock.verifyAll();
        clearPathSnippetDataMock.verify(handler => handler(), Times.exactly(2));
    });

    test('componentDidMount clears store', () => {
        const props = createPropsWithType(CapturedInstanceActionType.CREATE);
        const failureInstance = {
            failureDescription: null,
            path: 'inputed path',
            snippet: 'snippet for path',
        };
        props.failureInstance = failureInstance;

        const component = new FailureInstancePanelControl(props);
        component.componentDidMount();

        clearPathSnippetDataMock.verify(handler => handler(), Times.exactly(1));
    });

    test('componentDidUpdate reassigns state', () => {
        const prevProps = createPropsWithType(CapturedInstanceActionType.CREATE);
        const newProps = createPropsWithType(CapturedInstanceActionType.CREATE);
        const newFailureInstance = {
            failureDescription: null,
            path: 'inputed path',
            snippet: 'snippet for path',
        };
        prevProps.failureInstance.path = '';
        newProps.failureInstance = newFailureInstance;
        newProps.featureFlagStoreData = { manualInstanceDetails: true };
        prevProps.featureFlagStoreData = { manualInstanceDetails: true };
        const renderResult = render(<FailureInstancePanelControl {...prevProps} />);
        expectMockedComponentPropsToMatchSnapshots([Button, FlaggedComponent]);
        fireEvent.click(renderResult.getByText('Add a failure instance'));
        const pathField = renderResult.getByLabelText('CSS Selector') as HTMLInputElement;
        expect(pathField.value).toEqual(prevProps.failureInstance.path);
        const emptySnippetText = renderResult.getByText(
            'Code snippet will auto-populate based on the CSS selector input.',
        );
        expect(emptySnippetText).not.toBeNull();
        renderResult.rerender(<FailureInstancePanelControl {...newProps} />);
        expect(pathField.value).toEqual(newProps.failureInstance.path);
        const filledSnippetText = renderResult.getByText(newProps.failureInstance.snippet);
        expect(filledSnippetText).not.toBeNull();
    });

    function createPropsWithType(
        actionType: CapturedInstanceActionType,
    ): FailureInstancePanelControlProps {
        const featureData = {} as FeatureFlagStoreData;
        const emptyFailureInstance = {
            failureDescription: null,
            path: null,
            snippet: null,
        };

        return {
            step: 'missingHeadings',
            test: VisualizationType.HeadingsAssessment,
            addFailureInstance: addInstanceMock.object,
            addPathForValidation: addPathForValidationMock.object,
            clearPathSnippetData: clearPathSnippetDataMock.object,
            actionType: actionType,
            assessmentsProvider: Assessments,
            featureFlagStoreData: featureData,
            failureInstance: emptyFailureInstance,
        };
    }
});
