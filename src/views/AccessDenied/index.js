import React from 'react'
import { Row, Col, PhosphorIcons, Text, theme, Title } from "re-usable-design-components"
import { useIntl } from 'react-intl';

const { Warning } = PhosphorIcons;
const { useToken } = theme;

function AccessDenied() {
  const themeVariables = useToken();
  const intl = useIntl();
  const { token } = themeVariables;
  return (
    <Row
      isFullHeight
      style={{
        backgroundColor: "var(--colorBgContainer)",
        borderRadius: "var(--borderRadiusLGPx)"
      }}
    >
      <Col
        paddingInline="var(--paddingPx)"
        paddingBlock="var(--paddingPx)"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Row
          gutter={[0, token?.marginSM]}
        >
          <Col
            textAlign="center"
          >
            <Warning color="var(--colorTextDescription)" weight="duotone" size="76px" />
          </Col>
          <Col
            textAlign="center"
          >
            <Title level={4} >{intl?.formatMessage({ id: "Access Denied" })}</Title>
          </Col>
          <Col
            textAlign="center"
            style={{
              maxWidth: "470px",
              margin: "auto"
            }}
          >
            <Text
              type="secondary"
            >
              {intl?.formatMessage({ id: "You do not have permission to access the Passenger Forecasting page. Please contact your Head of Department to request access." })}
            </Text>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default AccessDenied;
