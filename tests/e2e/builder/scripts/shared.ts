import assert from 'assert';
import { join } from 'path';
import { URL } from 'url';
import type {
  BuilderConfig,
  CreateBuilderOptions as _CreateBuilderOptions,
} from '@modern-js/builder';
import fs from '@modern-js/utils/fs-extra';
import {
  type ConsoleType,
  type RsbuildPlugin,
  logger,
  mergeRsbuildConfig,
} from '@rsbuild/core';

logger.level = 'error';

type CreateBuilderOptions = Omit<
  _CreateBuilderOptions,
  'bundlerType' | 'config'
>;

export const getHrefByEntryName = (entryName: string, port: number) => {
  const baseUrl = new URL(`http://localhost:${port}`);
  const htmlRoot = new URL('html/', baseUrl);
  const homeUrl = new URL(`${entryName}/index.html`, htmlRoot);

  return homeUrl.href;
};

const noop = () => {};

export const createBuilder = async (
  builderOptions: CreateBuilderOptions,
  builderConfig: BuilderConfig = {},
) => {
  const { createBuilder } = await import('@modern-js/builder');

  const builder = await createBuilder({
    ...builderOptions,
    bundlerType: 'rspack',
    config: builderConfig,
  });

  return builder;
};

const portMap = new Map();

// Available port ranges: 1024 ～ 65535
// `10080` is not available in macOS CI, `> 50000` get 'permission denied' in Windows.
// so we use `15000` ~ `45000`.
function getRandomPort(defaultPort = Math.ceil(Math.random() * 30000) + 15000) {
  let port = defaultPort;
  while (true) {
    if (!portMap.get(port)) {
      portMap.set(port, 1);
      return port;
    } else {
      port++;
    }
  }
}

const updateConfigForTest = (
  config: BuilderConfig,
  entry?: Record<string, string>,
) => {
  // make devPort random to avoid port conflict
  config.dev = {
    ...(config.dev || {}),
    port: getRandomPort(config.dev?.port),
  };
  config.source ??= {};

  config.source.entry = entry;

  config.dev!.progressBar = config.dev!.progressBar || false;

  if (!config.performance?.buildCache) {
    config.performance = {
      ...(config.performance || {}),
      buildCache: false,
    };
  }

  config.performance.printFileSize = false;

  // disable ts checker to make the tests faster
  if (config.output?.disableTsChecker !== false) {
    config.output = {
      ...(config.output || {}),
      disableTsChecker: true,
    };
  }

  // disable polyfill to make the tests faster
  if (config.output?.polyfill === undefined) {
    config.output = {
      ...(config.output || {}),
      polyfill: 'off',
    };
  }
};

export async function dev({
  builderConfig = {},
  entry,
  ...options
}: CreateBuilderOptions & {
  entry: Record<string, string>;
  builderConfig?: BuilderConfig;
}) {
  process.env.NODE_ENV = 'development';

  updateConfigForTest(builderConfig, entry);

  const builder = await createBuilder(options, builderConfig);
  builder.addPlugins([
    {
      setup(api) {
        api.modifyRsbuildConfig((config: any) => {
          return mergeRsbuildConfig(config, {
            server: {
              middlewareMode: false,
            },
          });
        });
      },
    } as RsbuildPlugin,
  ]);
  return builder.startDevServer();
}

export async function build({
  plugins,
  runServer = false,
  builderConfig = {},
  entry,
  ...options
}: CreateBuilderOptions & {
  entry?: Record<string, string>;
  plugins?: any[];
  runServer?: boolean;
  builderConfig?: BuilderConfig;
}) {
  process.env.NODE_ENV = 'production';

  updateConfigForTest(builderConfig, entry);

  const builder = await createBuilder(options, builderConfig);

  if (plugins) {
    builder.addPlugins(plugins);
  }

  const [{ runStaticServer, globContentJSON }] = await Promise.all([
    import('@modern-js/e2e'),
    builder.build(),
  ]);

  const { distPath } = builder.context;

  const { port, close } = runServer
    ? await runStaticServer(distPath, {
        port: builderConfig.dev!.port,
      })
    : { port: 0, close: noop };

  const clean = async () => await fs.remove(distPath);

  const unwrapOutputJSON = async (ignoreMap = true, maxSize = 4096) => {
    return globContentJSON(distPath, {
      absolute: true,
      maxSize,
      ignore: ignoreMap ? [join(distPath, '/**/*.map')] : [],
    });
  };

  const getIndexFile = async () => {
    const files = await unwrapOutputJSON();
    const [name, content] =
      Object.entries(files).find(
        ([file]) => file.includes('index') && file.endsWith('.js'),
      ) || [];

    assert(name);

    return {
      content: content!,
      size: content!.length / 1024,
    };
  };

  return {
    distPath,
    port,
    clean,
    close,
    unwrapOutputJSON,
    getIndexFile,
    instance: builder,
  };
}

export const proxyConsole = (
  types: ConsoleType | ConsoleType[] = ['log', 'warn', 'info', 'error'],
  keepAnsi = false,
) => {
  const logs: string[] = [];
  const restores: Array<() => void> = [];

  for (const type of Array.isArray(types) ? types : [types]) {
    const method = console[type];

    restores.push(() => {
      console[type] = method;
    });

    console[type] = log => {
      logs.push(log);
    };
  }

  return {
    logs,
    restore: () => {
      for (const restore of restores) {
        restore();
      }
    },
  };
};
