import PropTypes from "prop-types"
import { Empty, Text } from "re-usable-design-components";
import { useContext } from "react";
import EmptyIcon from "@/svgr/Empty"
import EmptyDark from "@/svgr/EmptyDark"
import { ThemeContext } from "@/globalContext/theme/themeProvider";


export default function EmptyWrap({ type, description, imageStyle, ...rest }) {
  const [themeStore] = useContext(ThemeContext);
  const isDark = themeStore?.selectedTheme === "dark"
  if (type === "primary") {
    return (
      <Empty
        imageStyle={{
          height: "auto",
          ...imageStyle
        }}
        image={isDark ? <EmptyDark /> : <EmptyIcon />}
        {...rest}
        description={<Text color="var(--colorTextDescription)">{description}</Text>}
      />
    )
  }
  return (
    <Empty
      imageStyle={{
        height: "51px",
        ...imageStyle
      }}
      {...rest}
      description={<Text color="var(--colorTextDescription)">{description}</Text>}
    />
  )
}
EmptyWrap.propTypes = {
  description: PropTypes.any,
  imageStyle: PropTypes.any,
  type: PropTypes.string,
  rest: PropTypes.object
}
