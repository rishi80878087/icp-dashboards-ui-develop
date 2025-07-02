import PropTypes from "prop-types"
import { Tag } from "re-usable-design-components";
import { useIntl } from "react-intl";

function getColor(text) {
  if (text?.toLowerCase() === "high") {
    return "error"
  }

  if (text?.toLowerCase() === "medium") {
    return "warning"
  }

  return "success"
}

export default function VolumeStatusTag({ text }) {
  const intl = useIntl();
  return (
    <Tag
      color={getColor(text)}
    >
      {intl?.formatMessage({ id: text })}
    </Tag>
  )
}
VolumeStatusTag.propTypes = {
  text: PropTypes.any
}
