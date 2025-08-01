import {
  fs,
  CONFIG_FILE_EXTENSIONS,
  chalk,
  getCommand,
  getNodeEnv,
  isDevCommand,
  logger,
} from '@modern-js/utils';
import type { LoadedConfig } from '../types';
import { mergeConfig } from '../utils/mergeConfig';
import { getConfigFilePath, loadConfig } from './loadConfig';

/**
 * A modern config can export a function or an object
 * If it's a function, it will be called and return a config object
 */
async function getConfigObject<T>(config?: T) {
  if (typeof config === 'function') {
    return (await config({ env: getNodeEnv(), command: getCommand() })) || {};
  }
  return config || {};
}

async function loadLocalConfig<T>(
  appDirectory: string,
  configFile: string | false,
) {
  let localConfigFile: string | false = false;

  if (typeof configFile === 'string') {
    for (const ext of CONFIG_FILE_EXTENSIONS) {
      if (configFile.endsWith(ext)) {
        const replacedPath = configFile.replace(ext, `.local${ext}`);
        if (fs.existsSync(replacedPath)) {
          localConfigFile = replacedPath;
        }
      }
    }
  }

  if (localConfigFile) {
    const loaded = await loadConfig<T>(appDirectory, localConfigFile);
    return getConfigObject(loaded.config);
  }

  return null;
}

export async function createLoadedConfig<T>(
  appDirectory: string,
  configFilePath: string,
  otherConfig?: T,
): Promise<LoadedConfig<T>> {
  const configFile = getConfigFilePath(appDirectory, configFilePath);

  const loaded = await loadConfig<T>(appDirectory, configFile);

  if (!loaded.config && !loaded.pkgConfig) {
    logger.warn(
      `Can not find any config file in the current project, please check if you have a correct config file.`,
    );
    logger.warn(`Current project path: ${chalk.yellow(appDirectory)}`);
  }

  const config = await getConfigObject(loaded.config);
  let mergedConfig = config;

  // Only load local config when running dev command
  if (isDevCommand()) {
    const localConfig = await loadLocalConfig(appDirectory, configFile);

    // The priority of local config is higher than the user config and pkg config
    if (localConfig) {
      mergedConfig = mergeConfig([mergedConfig, localConfig]);
    }
  }

  if (otherConfig) {
    mergedConfig = mergeConfig([mergedConfig, otherConfig]);
  }

  return {
    packageName: loaded.packageName,
    config: mergedConfig,
    configFile: loaded.configFile,
    pkgConfig: loaded.pkgConfig,
    jsConfig: loaded.config,
  };
}
