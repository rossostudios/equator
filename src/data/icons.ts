/**
 * Icon paths vendored from @hugeicons/core-free-icons v4.3.4 (MIT).
 *
 * The package's barrel index imports six files with the wrong letter case, for
 * example Grid2x2CheckIcon.js when the real file is Grid2X2CheckIcon.js. macOS
 * hides that because its filesystem is case-insensitive, but Linux build
 * machines do not, so importing the barrel fails there outright. We only use
 * the icons below, so they live here instead: deterministic across platforms,
 * and twelve thousand fewer modules for the bundler to walk.
 *
 * Regenerate with: node mockups/vendor_icons.mjs
 */
export type IconData = readonly (readonly [string, Record<string, string | number>])[];

export const ArrowLeft02Icon: IconData = [["path",{"d":"M5.5 12.002H19","stroke":"currentColor","strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":"1.5","key":"0"}],["path",{"d":"M10.9999 18.002C10.9999 18.002 4.99998 13.583 4.99997 12.0019C4.99996 10.4208 11 6.00195 11 6.00195","stroke":"currentColor","strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":"1.5","key":"1"}]];
export const ArrowRight02Icon: IconData = [["path",{"d":"M18.5 12L4.99997 12","stroke":"currentColor","strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":"1.5","key":"0"}],["path",{"d":"M13 18C13 18 19 13.5811 19 12C19 10.4188 13 6 13 6","stroke":"currentColor","strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":"1.5","key":"1"}]];
export const ArrowUpRight01Icon: IconData = [["path",{"d":"M9 6.65032C9 6.65032 15.9383 6.10759 16.9154 7.08463C17.8924 8.06167 17.3496 15 17.3496 15M16.5 7.5L6.5 17.5","stroke":"currentColor","strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":"1.5","key":"0"}]];
export const Cancel01Icon: IconData = [["path",{"d":"M18 6L6.00081 17.9992M17.9992 18L6 6.00085","stroke":"currentColor","strokeLinecap":"round","strokeLinejoin":"round","strokeWidth":"1.5","key":"0"}]];
export const PlayIcon: IconData = [["path",{"d":"M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z","stroke":"currentColor","strokeLinejoin":"round","strokeWidth":"1.5","key":"0"}]];
