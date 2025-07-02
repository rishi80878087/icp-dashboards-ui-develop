import PropTypes from "prop-types"
import dynamic from "next/dynamic";
import { theme } from "re-usable-design-components";
import { useIntl } from "react-intl";
import { formatNumber } from "@/utils/helper";
import { tooltipConfig } from "@/utils/highchartsConfig";

const { useToken } = theme;

const DynamicMap = dynamic(
  () => import("@/components/Map"),
  { ssr: false }
);


function getTooltip (intl, mapTooltipTitle) {
  return function tooltip() {
    return `
      <div style="font-family: var(--fontFamily);">
          ${this?.point?.options?.label || this?.point?.options?.properties?.name}
      </div>
      <div>
        <span>${mapTooltipTitle || intl?.formatMessage({ id: "Total" })}:</span>
        <span style="font-weight: 600;">${[undefined, null]?.includes(this?.point?.options?.value) ? '-': formatNumber(this?.point?.options?.value)}</span>
      </div>
      `;
  }
}

function MapWrap({ values, mapTooltipTitle, isRtl, _getTooltip, onChartLoad = () => { } }) {
  const intl = useIntl();
  const themeVariables = useToken();
  const mapStyle = {
    allAreas: true,
    showInLegend: false,
    borderColor: themeVariables?.token?.Map?.Border, // Or use 'none'
    borderWidth: 1,
    states: {
      hover: {
        enabled: true // Disable hover state
      }
    }
  }
  
  return (
    <DynamicMap
      chart={{
        margin: [0, 0, 30, 0],
        style: {
          direction: 'rtl'
        },
        events: {
          load: async function () {
            const chart = this;
            if (chart) {
              onChartLoad(chart)
            }
          }
        }
      }}
      values={[ { ...mapStyle } , ...values]}
      mapNavigation={{
        enabled: true,
        buttonOptions: {
          align: 'left',
          verticalAlign: 'bottom',
          theme: {
            r: 6, // change border radius here
          },
          style: {
            // Customize styles if needed
            backgroundColor: 'var(--colorBgContainer)',
            borderColor: 'var(--colorBorder)',
            borderRadius: '5px', // Add border radius here
            padding: '5px', // Optional: Adjust padding for better appearance
            fontSize: '12px' // Optional: Adjust font size
          }
        }
      }}
      tooltip={{
        formatter: _getTooltip ? _getTooltip(intl, isRtl) : getTooltip(intl, mapTooltipTitle),
        ...tooltipConfig,
      }}
    />
  )
}

MapWrap.propTypes = {
  mapTooltipTitle: PropTypes.any,
  onChartLoad: PropTypes.func,
  values: PropTypes.any,
  isRtl: PropTypes.any,
  _getTooltip: PropTypes.any
}

export default MapWrap;