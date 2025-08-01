import type { Schema } from '@modern-js/codesmith-formily';
import { i18n, localeKeys } from '../../locale';
import {
  ActionElement,
  ActionElementText,
  ActionFunction,
  ActionFunctionText,
  type ActionRefactor,
  ActionRefactorText,
  ActionType,
  ActionTypeQuestionText,
  ActionTypeText,
} from '../common';

export const MWAActionTypes = [
  ActionType.Element,
  ActionType.Function,
  ActionType.Refactor,
];

export const MWAActionFunctions = [
  ActionFunction.TailwindCSS,
  ActionFunction.BFF,
  ActionFunction.SSG,
  ActionFunction.MicroFrontend,
  ActionFunction.Polyfill,
];

export const MWAActionElements = [ActionElement.Entry, ActionElement.Server];
export const MWAActionReactors = [];

export const MWAActionTypesMap: Record<ActionType, string[]> = {
  [ActionType.Element]: MWAActionElements,
  [ActionType.Function]: MWAActionFunctions,
  [ActionType.Refactor]: MWAActionReactors,
};

export const getMWANewActionSchema = (): Schema => {
  return {
    type: 'object',
    properties: {
      actionType: {
        type: 'string',
        title: i18n.t(localeKeys.action.self),
        enum: MWAActionTypes.map(type => ({
          value: type,
          label: ActionTypeText[type](),
          type: ['string'],
        })),
      },
      [ActionType.Element]: {
        type: 'string',
        title: ActionTypeQuestionText[ActionType.Element](),
        enum: MWAActionElements.map(element => ({
          value: element,
          label: ActionElementText[element](),
        })),
        'x-reactions': [
          {
            dependencies: ['actionType'],
            fulfill: {
              state: {
                visible: '{{$deps[0] === "element"}}',
              },
            },
          },
        ],
      },
      [ActionType.Function]: {
        type: 'string',
        title: ActionTypeQuestionText[ActionType.Function](),
        enum: MWAActionFunctions.map(func => ({
          value: func,
          label: ActionFunctionText[func](),
        })),
        'x-reactions': [
          {
            dependencies: ['actionType'],
            fulfill: {
              state: {
                visible: '{{$deps[0] === "function"}}',
              },
            },
          },
        ],
      },
      [ActionType.Refactor]: {
        type: 'string',
        title: ActionTypeQuestionText[ActionType.Refactor](),
        enum: MWAActionReactors.map(refactor => ({
          value: refactor,
          label: ActionRefactorText[refactor](),
        })),
        'x-reactions': [
          {
            dependencies: ['actionType'],
            fulfill: {
              state: {
                visible: '{{$deps[0] === "refactor"}}',
              },
            },
          },
        ],
      },
    },
  };
};

export const MWAActionFunctionsDevDependencies: Partial<
  Record<ActionFunction, string>
> = {
  [ActionFunction.SSG]: '@modern-js/plugin-ssg',
  [ActionFunction.TailwindCSS]: 'tailwindcss',
};

export const MWAActionFunctionsDependencies: Partial<
  Record<ActionFunction, string>
> = {
  [ActionFunction.BFF]: '@modern-js/plugin-bff',
  [ActionFunction.TailwindCSS]: '@modern-js/plugin-tailwindcss',
  [ActionFunction.Polyfill]: '@modern-js/plugin-polyfill',
};

export const MWAActionFunctionsAppendTypeContent: Partial<
  Record<ActionFunction, string>
> = {};

export const MWAActionRefactorDependencies: Partial<
  Record<ActionRefactor, string>
> = {};

export const MWAActionReactorAppendTypeContent: Partial<
  Record<ActionRefactor, string>
> = {};

export const MWANewActionGenerators: Record<
  ActionType,
  Record<string, string>
> = {
  [ActionType.Element]: {
    [ActionElement.Entry]: '@modern-js/entry-generator',
    [ActionElement.Server]: '@modern-js/server-generator',
  },
  [ActionType.Function]: {
    [ActionFunction.TailwindCSS]: '@modern-js/tailwindcss-generator',
    [ActionFunction.BFF]: '@modern-js/bff-generator',
    [ActionFunction.MicroFrontend]: '@modern-js/dependence-generator',
    [ActionFunction.SSG]: '@modern-js/ssg-generator',
    [ActionFunction.Polyfill]: '@modern-js/dependence-generator',
  },
  [ActionType.Refactor]: {},
};

export const MWANewActionPluginName: Record<
  ActionType,
  Record<string, string>
> = {
  [ActionType.Element]: {
    [ActionElement.Server]: '',
  },
  [ActionType.Function]: {
    [ActionFunction.TailwindCSS]: 'tailwindcssPlugin',
    [ActionFunction.BFF]: 'bffPlugin',
    [ActionFunction.SSG]: 'ssgPlugin',
    [ActionFunction.Polyfill]: 'polyfillPlugin',
  },
  [ActionType.Refactor]: {},
};

export const MWANewActionPluginDependence: Record<
  ActionType,
  Record<string, string>
> = {
  [ActionType.Element]: {
    [ActionElement.Server]: '',
  },
  [ActionType.Function]: {
    [ActionFunction.TailwindCSS]: '@modern-js/plugin-tailwindcss',
    [ActionFunction.BFF]: '@modern-js/plugin-bff',
    [ActionFunction.SSG]: '@modern-js/plugin-ssg',
    [ActionFunction.Polyfill]: '@modern-js/plugin-polyfill',
  },
  [ActionType.Refactor]: {},
};
