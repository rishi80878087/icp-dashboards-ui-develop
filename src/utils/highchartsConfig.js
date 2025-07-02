export const legendsConfig = {
  floating: false,
  verticalAlign: 'bottom',
  margin: 0,
  paddingBottom: 0,
  symbolHeight: 8,  // Customize the height of the legend symbol
  symbolWidth: 8,   // Customize the width of the legend symbol
  symbolPadding: 8,
  y: 16,
  itemStyle: {
    fontFamily: "var(--fontFamily)",
    color: 'var(--colorText)', // Set the text color (red in this case)
    fontSize: '12px',  // Set the font size
    lineHeight: '18px',
    pointerEvents: 'none' // Disable interaction with legend items
  }
}

export const axisLabelStyle = {
  style: {
    fontFamily: "var(--fontFamily)",
  }
}

export const tooltipConfig = {
  useHTML: true, // Enable HTML in tooltip
  shadow: false,
  borderRadius: 6, // Add border radius here
  backgroundColor: "var(--tooltipBg)", // Change this to your desired background color
  zIndex: 9999,
  style: {
    fontSize: "12px",
    lineHeight: "20px",
    color: "var(--colorTextLightSolid)", // Optional: Change the text color
  },
}

export const plotOptionsConfig = {
  series: {
    borderColor: 'var(--colorBorder)',
    states: {
      hover: {
        halo: null,
      }
    },
  }
}