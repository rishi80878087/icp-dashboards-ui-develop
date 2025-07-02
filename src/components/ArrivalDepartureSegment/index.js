import PropTypes from "prop-types"
import { PhosphorIcons, Text, Row, Col } from "re-usable-design-components";
import Segmented from "../Segmented";
import useResponsive from "@/hooks/useResponsive";
import { useIntl } from "react-intl";

const { Suitcase, AirplaneLanding, AirplaneTakeoff } = PhosphorIcons;

function ArrivalDepartureSegment({ value, setValue, ...rest }) {
  const intl = useIntl()
  const getResponsive = useResponsive();
  return (
    <Segmented
      size="default"
      isSelectedBold
      style={{
        minWidth: getResponsive({ default: "auto", mobile: "auto" })
      }}
      onChange={(v) => {
        setValue(v);
      }}
      className={getResponsive({ default: "", mobile: "arrivalDepartureSegment" })}
      value={value}
      options={[
        {
          label: (
            <Row style={{ width: "fit-content", margin: "auto" }} align="middle" gutter={4}>
              <Col style={{ display: "flex" }} flex="none">
                <Suitcase weight="bold" size={16} />
              </Col>
              <Col flex="none">
                <Text
                  {...(value === "ALL") && ({
                    strong: true
                  })}
                >
                  {getResponsive({ default: intl?.formatMessage({ id: "All Passengers" }), midTablet: intl?.formatMessage({ id: "All" }) }) }
                </Text>
              </Col>
            </Row>
          ),
          // label: <Text>{getResponsive({ default: intl?.formatMessage({ id: "All Passengers" }), midTablet: intl?.formatMessage({ id: "All" }) }) }</Text>,
          value: "ALL",
          // icon: <Suitcase size={16} />
        },
        {
          // label: <Text>{intl?.formatMessage({ id: "Arrival" })}</Text>,
          label: (
            <Row style={{ width: "fit-content", margin: "auto" }} align="middle" gutter={4}>
              <Col style={{ display: "flex" }} flex="none">
                <AirplaneLanding weight="bold" size={16} />
              </Col>
              <Col flex="none">
                <Text
                  {...(value === "incoming") && ({
                    strong: true
                  })}
                >
                  {intl?.formatMessage({ id: "Arrival" })}
                </Text>
              </Col>
            </Row>
          ),
          value: "incoming",
          // icon: <AirplaneLanding size={16} />
        },
        {
          label: (
            <Row style={{ width: "fit-content", margin: "auto" }} align="middle" gutter={4}>
              <Col style={{ display: "flex" }} flex="none">
                <AirplaneTakeoff weight="bold" size={16} />
              </Col>
              <Col flex="none">
                <Text
                  {...(value === "outgoing") && ({
                    strong: true
                  })}
                >
                  {intl?.formatMessage({ id: "Departure" })}
                </Text>
              </Col>
            </Row>
          ),
          value: "outgoing",
          // icon: <AirplaneTakeoff size={16} />
        }
      ]}
      {...rest}
    />
  )
}

ArrivalDepartureSegment.propTypes = {
  setValue: PropTypes.func,
  value: PropTypes.string
}

export default ArrivalDepartureSegment;