import { generateBuilder } from '../generator';
import type { BuilderOptions } from '../shared';

export async function createRspackBuilderForModern(options: BuilderOptions) {
  const builder = await generateBuilder(options, 'rspack');
  return builder;
}
