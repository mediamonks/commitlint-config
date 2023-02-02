import isIgnoredModule from '@commitlint/is-ignored';

// this module has weird exports base don where it runs (node vs jest)
// this will make sure the proper export is used, and TS understands it correctly
export const isIgnored: typeof isIgnoredModule.default =
  typeof isIgnoredModule === 'function' ? isIgnoredModule : isIgnoredModule.default;
