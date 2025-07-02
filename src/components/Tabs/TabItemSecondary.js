import PropTypes from "prop-types"
import { Row, Col, Text } from "re-usable-design-components";


function TabItemSecondary({ totalValue, rawValue, icon, label, value, isResponsive }) {
  if (isResponsive) {
    return (
      <Row gutter={[8, 0]}>
        <Col
          flex="none"
          style={{
            marginBottom: "8px"
          }}
        >
          {icon}
        </Col>

        <Col flex="auto">
          <Row gutter={[0, 4]}>
            <Col
              style={{
                maxHeight: "20px"
              }}
            >
              <Text
                size="sm"
                type="secondary"
              >
                {label}
              </Text>
            </Col>
            <Col>
              <Row gutter={4} align="middle">
                <Col flex="none">
                  <Text
                    strong
                  >
                    {value}
                  </Text>
                </Col>
                {
                  ![undefined, null]?.includes(totalValue) &&
                  <Col flex="none">
                    <Text size="sm" color="var(--colorTextDescription)">
                      {`${((rawValue / totalValue) * 100)?.toFixed(1)}%`}
                    </Text>
                  </Col>
                }
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
  return (
    <Row gutter={[0, 4]}>
      <Col
        style={{
          marginBottom: "8px"
        }}
      >
        {icon}
      </Col>

      <Col
        style={{
          maxHeight: "20px"
        }}
      >
        <Text
          size="sm"
          type="secondary"
        >
          {label}
        </Text>
      </Col>
      <Col>
        <Row gutter={4} align="middle">
          <Col flex="none">
            <Text
              strong
            >
              {value}
            </Text>
          </Col>
          {
            ![undefined, null]?.includes(totalValue) &&
            <Col flex="none">
              <Text size="sm" color="var(--colorTextDescription)">
                {`${((Number(rawValue) / Number(totalValue)) * 100)?.toFixed(1)}%`}
              </Text>
            </Col>
          }
        </Row>
      </Col>
    </Row>
  );
}

TabItemSecondary.propTypes = {
  icon: PropTypes.any,
  label: PropTypes.any,
  value: PropTypes.any,
  isResponsive: PropTypes.any,
  totalValue: PropTypes?.any,
  rawValue: PropTypes?.any
}

export default TabItemSecondary;