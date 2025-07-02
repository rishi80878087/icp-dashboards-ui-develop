import { tokens } from "./utility/tokens/antToken";

const { light } = tokens;
import { getColors } from './colors';
const { colors = {}, seed = {}, map = {}, alias = {}, components: AntComponents = {} } = light || {};

const fontFamilies = {
  english: "sf-pro-text",
  arabic: "Noto Kufi Arabic Variable"
};

const newColors = getColors({ colors });

const seedTokens = {
  ...colors,
  ...newColors,
  ...seed,
  fontFamily: fontFamilies.english,
};

const mapTokens = {
  lineHeight: 1.5714285714285714,
  lineHeightLG: 1.5,
  lineHeightSM: 1.6666666666666667,
  lineHeightXL: 1.4,
  ...map,
};

const aliasTokens = {
  ...alias,
  boxShadow: "0px 4px 50px 0px #00000017",

  // layout
  paddingPx: `${alias.padding}px`,
  paddingMDPx: `${alias.paddingMD}px`,
  paddingSMPx: `${alias.paddingSM}px`,
  paddingXSPx: `${alias.paddingXS}px`,
  paddingXXSPx: `${alias.paddingXXS}px`,
  paddingLGPx: `${alias.paddingLG}px`,
  paddingXLPx: `${alias.paddingXL}px`,
  paddingXXLPx: `${alias.paddingXXL}px`,

  marginPx: `${alias.margin}px`,
  marginMDPx: `${alias.marginMD}px`,
  marginSMPx: `${alias.marginSM}px`,
  marginXSPx: `${alias.marginXS}px`,
  marginXXSPx: `${alias.marginXXS}px`,
  marginLGPx: `${alias.marginLG}px`,
  marginXLPx: `${alias.marginXL}px`,
  marginXXLPx: `${alias.marginXXL}px`,

  // border radius
  borderRadiusPx: `${seed.borderRadius}px`,
  borderRadiusSMPx: `${map.borderRadiusSM}px`,
  borderRadiusLGPx: `${map.borderRadiusLG}px`,
  
  //control height
  "controlHeightLGPx": '40px',

  // card
  cardBodyMinHeight: '200px',
  cardBodyMinHeightLG: '370px',
  cardBodyMinHeightMD: '270px',

  // dropdown
  dropdownMaxHeight: '250px',
  
  // icons
  iconSizeXXXLG: 56,
  iconSizeXXXLGPx: '56px',
  iconSizeXXLG: 48,
  iconSizeXXLGPx: '48px',
  iconSizeXLG: 40,
  iconSizeXLGPx: '40px',
  iconSizeXXMD: 32,
  iconSizeXXMDpx: '32px',
  iconSize: 24,
  iconSizePx: '24px',
  iconSizeMD: 20,
  iconSizeMDPx: '20px',
  iconSizeXMD: 22,
  iconSizeXMDPx: '22px',
  iconSizeSM: 18,
  iconSizeSMPx: '18px',
  iconSizeXSM: 16,
  iconSizeXSMPx: '16px',
  iconSizeXXSM: 14,
  iconSizeXXSMPx: '14px',
  iconSizeXXXSM: 12,
  iconSizeXXXSMPx: '12px',
  
  // fontSize
  fontSizePx: `${seed.fontSize}px`,
  
  // line height
  lineHeight: 1.57142857143,

  //control height
  controlHeightXXLPx: `${map.controlHeightXXL}px`,

  // button width
  buttonWidth: '200px',

  //popover confirm
  popoverConfirmWidth: '224px',
  
  // select
  selectContainerWidth: '463px',
  
  // screensizes
  mobile:576,
  mobilePx:'576px',
  midTablet:768,
  midTabletPx:'768px',
  tablet:1024,
  tabletPx:'1024px',
  bigTablet: 1366,
  bigTabletPx: '1366px',
  smallDesktop: 1440,
  smallDesktopPx: '1440px',
  midDesktop: 1680,
  midDesktopPx: '1680px',
  largeDesktop: 1920,
  largeDesktopPx: '1920px',

  // table
  tableMaxHeight: 300,
  tableMaxHeightPx: '300px',
  tableExpandableTableColumnWidth: '32px',
  tableHeaderIconHeight: '20px',

  // form item
  formItemWidth: 393,
  formItemWidthPx: '393px',

  //menu item
  componentNavigatorMenuItemHeight: '48px',

  //Select box tag
  selectBoxTagMargin: '2px',

  componentsDropdownTextWidth: 90,
  componentsDropdownTextWidthSM: 50,

  // empty state icon colors
  emptyStateFillPrimaryColor: map?.colorFillSecondary,
  emptyStateFillSecondaryColor: map?.colorFillTertiary,
  emptyStateStrokeColor: map?.colorBorder,

  headerHeight: 64,
  sidemenuWidth: 100
};

const components = {
  ...AntComponents,
  // Table: {
  //   ...AntComponents?.Table,
  //   colorBorderSecondary: AntComponents?.Table?.colorSplit,
  // },
  // Collapse: {
  //   ...AntComponents?.Collapse,
  //   borderRadiusLG: 0,
  // },
}

export default {
  colors,
  seedTokens,
  mapTokens,
  aliasTokens,
  components,
};
