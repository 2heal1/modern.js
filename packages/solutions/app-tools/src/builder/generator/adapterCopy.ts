import type { RsbuildPlugin } from '@modern-js/builder';
import type { BuilderOptions } from '../shared';
import { createPublicPattern } from './createCopyPattern';

export const builderPluginAdapterCopy = (
  options: BuilderOptions,
): RsbuildPlugin => ({
  name: 'builder-plugin-adapter-copy',

  setup(api) {
    const { normalizedConfig: modernConfig, appContext } = options;

    api.modifyBundlerChain((chain, { CHAIN_ID }) => {
      // apply copy plugin
      if (chain.plugins.has(CHAIN_ID.PLUGIN.COPY)) {
        const defaultCopyPattern = createPublicPattern(
          appContext,
          modernConfig,
          chain,
        );
        chain.plugin(CHAIN_ID.PLUGIN.COPY).tap(args => [
          {
            patterns: [...(args[0]?.patterns || []), defaultCopyPattern],
          },
        ]);
      }
    });
  },
});
