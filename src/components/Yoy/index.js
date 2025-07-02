import PropTypes from "prop-types"
import { Tag, Row, Col, Text, PhosphorIcons } from "re-usable-design-components" 
import { useIntl } from "react-intl";

const { ArrowUp, ArrowDown } = PhosphorIcons;

export default function YOy({ value, text: _text = "Yoy" }) {
  const intl = useIntl();
  const text = intl?.formatMessage({ id: _text })
  if (value === null || value === undefined) {
    return null
  }

  return (
    <Row align="middle" gutter={4}>
      <Col flex="none">
        <Tag bordered={false} color={value >= 0 ? "error" : "success"}>
          <Row gutter={4} align="middle">
            <Col flex="none">
              <Text size="sm" color="currentColor">
                {Math.abs(value)}%
              </Text>
            </Col>
            <Col style={{ display: "flex" }} flex="none">
              {
                value < 0
                  ? <ArrowDown size={10} />
                  : <ArrowUp size={10} />
              }
            </Col>
          </Row>
        </Tag>
      </Col>

      <Col flex="none">
        <Text size="sm" color={"var(--colorTextDescription)"}>
          {text}
        </Text>
      </Col>
    </Row>
  )
}
YOy.propTypes = {
  text: PropTypes.string,
  value: PropTypes.number
}
