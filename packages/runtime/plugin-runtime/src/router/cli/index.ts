import {
  getEntryOptions,
  createRuntimeExportsUtils,
  PLUGIN_SCHEMAS,
} from '@modern-js/utils';
import { ServerRoute } from '@modern-js/types';
import type { CliPlugin } from '@modern-js/core';

const PLUGIN_IDENTIFIER = 'router';

const ROUTES_IDENTIFIER = 'routes';

export default (): CliPlugin => ({
  name: '@modern-js/plugin-router',
  required: ['@modern-js/runtime'],
  setup: api => {
    const runtimeConfigMap = new Map<string, any>();

    let pluginsExportsUtils: any;
    let routerExportsUtils: any;

    return {
      config() {
        const appContext = api.useAppContext();

        pluginsExportsUtils = createRuntimeExportsUtils(
          appContext.internalDirectory,
          'plugins',
        );

        routerExportsUtils = createRuntimeExportsUtils(
          appContext.internalDirectory,
          'router',
        );

        return {
          source: {
            alias: {
              '@modern-js/runtime/plugins': pluginsExportsUtils.getPath(),
              '@modern-js/runtime/router': routerExportsUtils.getPath(),
            },
          },
        };
      },
      validateSchema() {
        return PLUGIN_SCHEMAS['@modern-js/plugin-router'];
      },
      modifyEntryImports({ entrypoint, imports }: any) {
        const { entryName, fileSystemRoutes } = entrypoint;
        const userConfig = api.useResolvedConfigContext();
        const isLegacy = Boolean(userConfig?.runtime?.router?.legacy);
        const { packageName } = api.useAppContext();

        const runtimeConfig = getEntryOptions(
          entryName,
          userConfig.runtime,
          userConfig.runtimeByEntries,
          packageName,
        );

        runtimeConfigMap.set(entryName, runtimeConfig);

        if (runtimeConfig?.router) {
          if (!isLegacy) {
            imports.push({
              value: '@modern-js/runtime/plugins',
              specifiers: [{ imported: PLUGIN_IDENTIFIER }],
            });
          }
        } else if (fileSystemRoutes) {
          throw new Error(
            `should enable runtime.router for entry ${entryName}`,
          );
        }

        return {
          entrypoint,
          imports,
        };
      },
      modifyEntryRuntimePlugins({ entrypoint, plugins }: any) {
        const { entryName, fileSystemRoutes } = entrypoint;
        const { serverRoutes } = api.useAppContext();
        const userConfig = api.useResolvedConfigContext();
        const isLegacy = Boolean(userConfig?.runtime?.router?.legacy);
        const runtimeConfig = runtimeConfigMap.get(entryName);
        if (runtimeConfig.router && !isLegacy) {
          // Todo: plugin-router best to only handle manage client route.
          // here support base server route usage, part for compatibility
          const serverBase = serverRoutes
            .filter((route: ServerRoute) => route.entryName === entryName)
            .map(route => route.urlPath)
            .sort((a, b) => (a.length - b.length > 0 ? -1 : 1));

          plugins.push({
            name: PLUGIN_IDENTIFIER,
            options: JSON.stringify({
              serverBase,
              ...runtimeConfig.router,
              routesConfig: fileSystemRoutes
                ? `{ ${ROUTES_IDENTIFIER}, globalApp: App }`
                : undefined,
            }).replace(
              /"routesConfig"\s*:\s*"((\S|\s)+)"/g,
              '"routesConfig": $1,',
            ),
          });
        }
        return {
          entrypoint,
          plugins,
        };
      },
      addRuntimeExports() {
        const userConfig = api.useResolvedConfigContext();
        const isLegacy = Boolean(userConfig?.runtime?.router?.legacy);
        pluginsExportsUtils.addExport(
          `export { default as router } from '@modern-js/runtime/router'`,
        );
        if (!isLegacy) {
          routerExportsUtils.addExport(
            `export * from '@modern-js/runtime/runtime-router'`,
          );
        }
      },
    };
  },
});
