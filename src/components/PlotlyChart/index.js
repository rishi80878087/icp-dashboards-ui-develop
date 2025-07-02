import PropTypes from "prop-types"
import { useContext, useRef } from "react";
import { theme } from "re-usable-design-components";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, resolveTernary } from "@/utils/helper";
const { useToken } = theme;
import dynamic from "next/dynamic";
import { renderTooltipTemplate } from "./renderTemplate";

const DynamicPlotChart = dynamic(
  () => import("react-plotly.js"),
  { ssr: false }
);


function getTheme(yAxisTitle, token, rest, isRtl) {
  const plotlyTheme = {
    font: {
      family: token?.fontFamily,
      size: 14,
      color: token?.colorText,
    },
    hoverlabel: {
      borderRadius: 6, // Add border radius here
      bgcolor: token.tooltipBg, // Change this to your desired background color
      align: 'left',              // Left-align text inside tooltip
      font: {
        family: "sf-pro-text",  // Font type
        size: 12,         // Font size
        color: token.colorTextLightSolid,   // Text color
        nameLength: 0
      },
    },
    bargroupgap: 0.20,
    dragmode: false, // Disables pan/zoom
    xaxis: {
      ...isRtl ? {
        autorange: 'reversed'
      }
        : {},
      showline: true,
      fixedrange: true, // Disables zoom on x-axis
      automargin: true, // Automatically adjust left margin for y-axis labels
      zeroline: false,
      ticklen: 0, //
      linewidth: 1,
      linecolor: token?.colorBorderSecondary,
      mirror: false,
      tickfont: { size: 12, color: token?.colorText }, // Axis tick labels
      // title: { text: "X-Axis Label", font: { size: 16, color: "#000" } },
      gridcolor: token?.colorBorderSecondary, // Light Gray Gridlines
    },
    barcornerradius: 4,
    hoverinfo: 'skip',
    yaxis: {
      showline: true,
      zeroline: false,
      side: isRtl ? 'right': 'left', // Move y-axis to right side
      automargin: true,
      fixedrange: true, // Disables zoom on y-axis
      // showticklabels: false,
      ticklen: 0,
      tickwidth: 0,   
      linecolor: token?.colorBorderSecondary,
      linewidth: 1,
      mirror: false,
      tickfont: { size: 12, color: token?.colorText },
      title: { text: yAxisTitle, standoff: !yAxisTitle ? resolveTernary(isRtl, 32, 0) : resolveTernary(isRtl, 76, 24), font: { size: 14, color: token?.colorText } },
      gridcolor: token?.colorBorderSecondary,
      showgrid: !!rest?.showYAxisGridlines,
    },
    autosize: true,
    bargap: 0.4,
    legend: {
      itemclick: false,    // Disables single click
      itemdoubleclick: false, // Disables double click
      orientation: 'h', // Horizontal orientation
      // y: -0.3, // Position the legend below the chart
      x: 0.5, // Center the legend horizontally
      xanchor: 'center', // Anchor the legend at its center
    },
    showlegend: true, // Hides the legend
    paper_bgcolor: 'rgba(0,0,0,0)', // Transparent background
    plot_bgcolor: 'rgba(0,0,0,0)', // Transparent plot area
    margin: { l: 0, r: 0, t: 0, b: 0 }, // Adjusted margins
  };
  return plotlyTheme;
}

const PlotlyChart = ({
  data,
  layout = {},
  config = {},
  yAxisTitle = "",
  customLegend = false,
  ...rest
}) => {
  const themeVariables = useToken();
  const tooltipRef = useRef();
  const token = themeVariables?.token;
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore)
  const _layout = getTheme(yAxisTitle, token, rest, isRtl)

  const handleHover = (event) => {
    const point = event.points[0];
    const tooltip = tooltipRef.current;
    if (!tooltip) return;
    tooltip.innerHTML = renderTooltipTemplate(point);
    const bbox = point.bbox;

    let posX = (bbox.x0 + bbox.x1) / 2 + 8; // Center X + 8px arrow
    let posY = (bbox.y0 + bbox.y1) / 2; // Center Y
    tooltip.style.display = 'block';

    const tooltipWidth = tooltip.offsetWidth;
    // Check if tooltip would overflow on the right
    if ((posX + tooltipWidth) > tooltip.parentElement.offsetWidth) {
      posX -= tooltipWidth;
    }

    tooltip.style.left = `${posX}px`;
    tooltip.style.top = `${posY}px`;
    tooltip.style.visibility = 'visible';

  };

  const handleUnhover = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  };
  return (
    <>
      <DynamicPlotChart
        data={data}
        useResizeHandler={true} // Enable resizing
        style={{ width: '100%', height: '100%' }} // Set width and height to 100%
        layout={{
          ..._layout,
          ...layout,
          yaxis: {
            ..._layout?.yaxis,
            ...(layout?.yaxis || {})
          },
        }}
        config={{
          displayModeBar: false, // This removes the entire toolbar
          scrollZoom: false,
          ...config
        }}
        onHover={handleHover}
        onUnhover={handleUnhover}
      />
      {customLegend && data &&
        <div style={{ position: 'absolute', bottom: '10px', left: '0', width: '100%'}}>
          <div style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: '18px'}}>
            {data?.[0]?.labels?.map((label, index) => {
              const color = data[0].marker?.colors?.[index];
              return <div key={label + index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: color || '#000',
                  }}
                ></div>
                <span style={{ fontSize: '14px'}}>{label}</span>
              </div>
            })}
          </div>
        </div>}
      <div
        ref={tooltipRef}
        className="plotly-custom-tooltip"
        style={{
          display: 'block',
          visibility: 'hidden',
          position: 'absolute',
          background: '#1f2937',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          pointerEvents: 'none',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          zIndex: 10,
          transform: 'translateY(-50%)',
        }}
      />
    </>
  );
};

PlotlyChart.propTypes = {
  data: PropTypes.any,
  layout: PropTypes.any,
  config: PropTypes.any,
  yAxisTitle: PropTypes.any,
  customLegend: PropTypes.bool,
}

export default PlotlyChart;
