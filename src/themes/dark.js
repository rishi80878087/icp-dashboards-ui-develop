import { tokens } from "./utility/tokens/antTokenDark";
import baseThemeTokens from "./base";
import { getColors } from "./colors";
const { dark } = tokens;

const {
  colors = {},
  seed = {},
  map = {},
  alias = {},
  components: AntComponents = {},
} = dark || {};

const newColors = getColors({ colors });

const seedTokens = {
  ...baseThemeTokens?.colors,
  ...colors,
  ...baseThemeTokens?.seedTokens,
  ...newColors,
  ...seed,
};

const mapTokens = {
  ...baseThemeTokens?.mapTokens,
  ...map,
};

const aliasTokens = {
  ...baseThemeTokens?.aliasTokens,
  ...alias,
  // empty state icon colors
  emptyStateFillPrimaryColor: map?.colorFillSecondary,
  emptyStateFillSecondaryColor: map?.colorFillTertiary,
  emptyStateStrokeColor: map?.colorBorder,
};

const components = {
  ...baseThemeTokens?.components,
  ...AntComponents,
  // Table: {
  //   ...AntComponents?.Table,
  //   colorBorderSecondary: AntComponents?.Table?.colorSplit,
  // },
  // Collapse: {
  //   ...AntComponents?.Collapse,
  //   borderRadiusLG: 0,
  // },
};

export default {
  colors,
  seedTokens,
  mapTokens,
  aliasTokens,
  components,
};
