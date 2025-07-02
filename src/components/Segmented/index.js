import PropTypes from "prop-types"
import { Segmented, theme } from "re-usable-design-components"

const { useToken } = theme;
export default function SegmentedWrap({ style, ...props}) {
  const themeVariables = useToken();
  const selectedColor = themeVariables?.token?.Segmented?.colorText;

  return(
    <Segmented
      isSelectedBold
      selectedColor={selectedColor}
      style={{
        backgroundColor: themeVariables?.token?.["Segmented"]?.colorBgLayout,
        border: `1px solid ${themeVariables?.token?.["Segmented"]?.colorBorder}`,
        maxHeight: "32px",
        ...style
      }}
      {...props}
    />
  )
}

SegmentedWrap.propTypes = {
  style: PropTypes.any
}
