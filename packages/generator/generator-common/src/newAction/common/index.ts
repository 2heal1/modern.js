import { i18n, localeKeys } from '../../locale';

export enum ActionType {
  Function = 'function',
  Element = 'element',
  Refactor = 'refactor',
}

export enum ActionElement {
  Entry = 'entry',
  Server = 'server',
}

export enum ActionFunction {
  TailwindCSS = 'tailwindcss',
  BFF = 'bff',
  MicroFrontend = 'micro_frontend',
  I18n = 'i18n',
  RuntimeApi = 'runtimeApi',
  SSG = 'ssg',
  Polyfill = 'polyfill',
  ModuleDoc = 'module_doc',
}

export enum ActionRefactor {}

export const ActionTypeText: Record<ActionType, () => string> = {
  [ActionType.Function]: () => i18n.t(localeKeys.action.function.self),
  [ActionType.Element]: () => i18n.t(localeKeys.action.element.self),
  [ActionType.Refactor]: () => i18n.t(localeKeys.action.refactor.self),
};

export const ActionTypeQuestionText: Record<ActionType, () => string> = {
  [ActionType.Function]: () => i18n.t(localeKeys.action.function.question),
  [ActionType.Element]: () => i18n.t(localeKeys.action.element.question),
  [ActionType.Refactor]: () => i18n.t(localeKeys.action.refactor.question),
};

export const ActionElementText: Record<ActionElement, () => string> = {
  [ActionElement.Entry]: () => i18n.t(localeKeys.action.element.entry),
  [ActionElement.Server]: () => i18n.t(localeKeys.action.element.server),
};

export const ActionFunctionText: Record<ActionFunction, () => string> = {
  [ActionFunction.TailwindCSS]: () =>
    i18n.t(localeKeys.action.function.tailwindcss),
  [ActionFunction.BFF]: () => i18n.t(localeKeys.action.function.bff),
  [ActionFunction.MicroFrontend]: () =>
    i18n.t(localeKeys.action.function.micro_frontend),
  [ActionFunction.I18n]: () => i18n.t(localeKeys.action.function.i18n),
  [ActionFunction.RuntimeApi]: () =>
    i18n.t(localeKeys.action.function.runtime_api),
  [ActionFunction.SSG]: () => i18n.t(localeKeys.action.function.ssg),
  [ActionFunction.Polyfill]: () => i18n.t(localeKeys.action.function.polyfill),
  [ActionFunction.ModuleDoc]: () =>
    i18n.t(localeKeys.action.function.module_doc),
};

export const ActionRefactorText: Record<ActionRefactor, () => string> = {};

export const ActionTypeTextMap: Record<
  ActionType,
  Record<string, () => string>
> = {
  [ActionType.Element]: ActionElementText,
  [ActionType.Function]: ActionFunctionText,
  [ActionType.Refactor]: ActionRefactorText,
};
