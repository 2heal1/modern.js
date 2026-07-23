import { createSyncHook } from '@modern-js/plugin';
import { registerPlugin } from '../../src/core/plugin';

describe('global runtime plugins', () => {
  afterEach(() => {
    delete window.__MODERN_RUNTIME_PLUGINS__;
  });

  test('registers the injected plugin before runtime lifecycle hooks run', async () => {
    const calls: string[] = [];
    const globalRuntimePlugin = {
      name: 'global-runtime-plugin',
      setup(api: Record<string, (callback: (...args: any[]) => any) => void>) {
        calls.push('setup');
        api.onBeforeRender(() => {
          calls.push('onBeforeRender');
        });
        api.wrapRoot((App: unknown) => {
          calls.push('wrapRoot');
          return App;
        });
        api.onHydration(() => {
          calls.push('onHydration');
        });
        api.onRouterCreated(() => {
          calls.push('onRouterCreated');
        });
        api.onRouterStateChange(() => {
          calls.push('onRouterStateChange');
        });
        api.onRouteLoader(() => {
          calls.push('onRouteLoader');
        });
        api.onRouteComponent(() => {
          calls.push('onRouteComponent');
        });
      },
    };

    window.__MODERN_RUNTIME_PLUGINS__ = globalRuntimePlugin as any;

    const { hooks } = registerPlugin([
      {
        name: '@modern-js/runtime-plugin-router-hooks',
        registryHooks: {
          onRouterCreated: createSyncHook(),
          onRouterStateChange: createSyncHook(),
          onRouteLoader: createSyncHook(),
          onRouteComponent: createSyncHook(),
        },
      },
    ]);

    expect(calls).toEqual(['setup']);

    await hooks.onBeforeRender.call({} as any);
    hooks.wrapRoot.call(() => null);
    hooks.onHydration.call({} as any);
    hooks.onRouterCreated.call({} as any);
    hooks.onRouterStateChange.call({} as any);
    hooks.onRouteLoader.call({} as any);
    hooks.onRouteComponent.call({} as any);

    expect(calls).toEqual([
      'setup',
      'onBeforeRender',
      'wrapRoot',
      'onHydration',
      'onRouterCreated',
      'onRouterStateChange',
      'onRouteLoader',
      'onRouteComponent',
    ]);
  });
});
