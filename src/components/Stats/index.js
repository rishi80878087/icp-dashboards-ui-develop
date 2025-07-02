import PropTypes from "prop-types"
import { Row, Col, theme, Text, PhosphorIcons, Tooltip } from "re-usable-design-components";
import Card from "../Card";

const { Info } = PhosphorIcons;


const { useToken } = theme;

function Stats(props) {
  const themeVariables = useToken();
  const { label, labelStyle, labelTextStyle = {}, tooltipPlacement, backgroundColor, icon, iconBackground, value, cardBodyPadding, labelSize, tooltip, overlayInnerStyle } = props;

  return (
    <Card
      cardBodyBackgroundColor={backgroundColor || "var(--colorBgContainer)"}
      cardBodyPadding={cardBodyPadding || "var(--paddingPx)"}
      borderRadius={"var(--borderRadiusPx)"}
    >
      <Row gutter={[themeVariables?.token?.marginXXS, themeVariables?.token?.marginXXS]}>
        <Col>
          <Row align="start" justify="space-between">
            <Col flex="none">
              {
                iconBackground
                  ?
                  <div
                    style={{
                      display: "flex",
                      width: "42px",
                      height: "42px",
                      backgroundColor: iconBackground,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "50%"
                    }}
                  >
                    {icon}
                  </div>
                  : icon
              }
            </Col>

            {
              tooltip && (
                <Tooltip
                  title={tooltip}
                  {...!!overlayInnerStyle && ({
                    overlayInnerStyle
                  })}
                  {
                    ...!!tooltipPlacement && ({
                      placement: tooltipPlacement
                    })
                  }
                >
                  <Col
                    flex="none"
                    paddingInline="var(--paddingXSPx) 0px"
                    style={{
                      maxHeight: "28px"
                    }}
                  >
                    <Info color="var(--colorIcon)" size={14} weight="bold" />
                  </Col>
                </Tooltip>
              )
            }
          </Row>

        </Col>
        <Col
          style={{
            ...labelStyle
          }}
        >
          <Text
            {
              ...!!labelSize && ({
                size: labelSize
              })
            }
            type="secondary"
            {...labelTextStyle}
          >
            {label}
          </Text>
        </Col>
        <Col>
          {value}
        </Col>
      </Row >
    </Card >
  )
}

Stats.propTypes = {
  backgroundColor: PropTypes.string,
  cardBodyPadding: PropTypes.string,
  icon: PropTypes.any,
  iconBackground: PropTypes.any,
  label: PropTypes.any,
  labelSize: PropTypes.any,
  labelStyle: PropTypes.any,
  labelTextStyle: PropTypes.object,
  overlayInnerStyle: PropTypes.any,
  tooltip: PropTypes.any,
  tooltipPlacement: PropTypes.any,
  value: PropTypes.any
}

export default Stats;
