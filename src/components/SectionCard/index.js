import PropTypes from "prop-types"
import { Row, Col, Text } from 're-usable-design-components';
import Card from '@/components/Card';
import useResponsive from '@/hooks/useResponsive';

function SectionCard({ title, subtitle, action, content, loading, ...rest }) {
  const getResponsive = useResponsive();

  return (
    <Card
      headerPadding={getResponsive({ default: "var(--paddingPx)", tablet: "var(--paddingPx) var(--paddingSMPx)" })}
      loading={loading}
      cardBodyPadding={getResponsive({ default: "var(--paddingPx)", tablet: "var(--paddingPx) var(--paddingSMPx)" })}
      cardBodyMinHeight="250px"
      title={
        <Row gutter={[0, getResponsive({ midTablet: 12, mobile: 4, default: 12 })]} align="middle" justify="space-between">
          <Col
            {
              ...!getResponsive({ default: false, midTablet: true }) && {
                flex: "1 1 0%"
              }
            }
            {
              ...getResponsive({ default: false, midTablet: true }) && {
                span: 24,
              }
            }
          >
            <Row>
              <Col>
                <Text strong>{title}</Text>
              </Col>
              <Col>
                <Text
                  color="var(--colorTextDescription)"
                >
                  {subtitle}
                </Text>
              </Col>
            </Row>
          </Col>
          <Col
            flex={getResponsive({ default: "none", midTablet: "auto" })}
            {
              ...getResponsive({ default: false, midTablet: true }) && {
                span: 24
              }
            }
          >
            {action}
          </Col>
        </Row>
      }
      {...rest}
    >
      <Row isFullHeight>
        <Col>
          {content}
        </Col>
      </Row>
    </Card>
  )
}

SectionCard.propTypes = {
  action: PropTypes.any,
  content: PropTypes.any,
  loading: PropTypes.any,
  subtitle: PropTypes.any,
  title: PropTypes.any
}

export default SectionCard;
