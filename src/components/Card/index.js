import PropTypes from "prop-types"
import { Card } from "re-usable-design-components"

export default function CardComp({ headerPadding = "var(--paddingPx)", cardBodyPadding = "var(--paddingPx)", ...props }) {
  return (
    <Card
      headerPadding={headerPadding}
      bordered={false}
      cardBodyPadding={cardBodyPadding}
      {...props}
    />)
}

CardComp.propTypes = {
  cardBodyPadding: PropTypes.string,
  headerPadding: PropTypes.string,
  props: PropTypes.object
}
