import PropTypes from "prop-types"
import React from "react";
import {
  Row,
  Col,
  Text,
  theme,
  Button,
  PhosphorIcons,
  Tag,
  Link,
} from "re-usable-design-components";
import useResponsive from "@/hooks/useResponsive";
import { useIntl } from "react-intl";
import Card from "@/components/Card";

const { useToken } = theme;
const { X } = PhosphorIcons;

const ChipsWrapper = ({ children }) => (
  children
);

function AppliedFilters({
  data = [],
  onTagCross = () => {},
  onClear = () => {},
  isPreview,
}) {
  const intl = useIntl();
  const getResponsive = useResponsive();
  const themeVariables = useToken();

  const chipsContent = (
    <Col flex="auto" isFlex justifyContent="center">
      <Row
        gutter={[
          themeVariables?.token?.marginXS,
          themeVariables?.token?.marginXS,
        ]}
        wrap={true}
      >
        {data?.map((filterItem) => (
          <Col key={filterItem?.key} flex="none">
            <Tag
              color={themeVariables?.token?.["brand-gold-1"]}
              borderColor={themeVariables?.token?.Tag.colorBorder}
            >
              <Row
                isFlex
                align="middle"
                gutter={themeVariables?.token?.marginXXS}
              >
                <Col flex="none">
                  <Text size="sm">{filterItem?.label}:</Text>
                </Col>
                <Col flex="none">
                  <Text size="sm" strong>
                    {filterItem?.value}
                  </Text>
                </Col>
                {filterItem?.closable && (
                  <Col
                    flex="none"
                    isFlex
                    onClick={() => onTagCross(filterItem)}
                  >
                    <Link>
                      <Col isFlex>
                        <X
                          size={themeVariables?.token?.iconSizeXXXSM}
                          color={themeVariables?.token?.Typography?.colorText}
                        />
                      </Col>
                    </Link>
                  </Col>
                )}
              </Row>
            </Tag>
          </Col>
        ))}
      </Row>
    </Col>
  )
  
  return (
    <Row>
      <Col>
        <Card
          bodyStyle={{
            padding: `${themeVariables?.token?.paddingSM}px ${themeVariables?.token?.padding}px`,
          }}
        >
          <Row
            gutter={themeVariables?.token?.marginXS}
            wrap={false}
            justify={getResponsive({ default: "", mobile: "space-between" })}
          >
            <Col
              flex="none"
              isFlex={
                getResponsive({ default: "true", mobile: "false" }) === "true"
              }
              alignItems="center"
              justifyContent="center"
            >
              <Text strong>
                {intl?.formatMessage({ id: "Applied Filters" })}:
              </Text>
            </Col>
            {getResponsive({ default: "true", mobile: "false" }) === "true" && <ChipsWrapper>{chipsContent}</ChipsWrapper>}
            {
              !isPreview &&
              <Col flex="none">
                <Button
                  danger
                  ghost
                  onClick={() => onClear()}
                  size="middle"
                  type={getResponsive({ default: "primary", mobile: "text" })}
                >
                  {intl?.formatMessage({ id: "Clear All" })}
                </Button>
              </Col>
            }
          </Row>
          {getResponsive({ default: "false", mobile: "true" }) === "true" && <Row style={{ paddingTop: themeVariables?.token?.paddingXS }}><ChipsWrapper>{chipsContent}</ChipsWrapper></Row>}
        </Card>
      </Col>
    </Row>
  );
}

AppliedFilters.propTypes = {
  data: PropTypes.array,
  onClear: PropTypes.func,
  onTagCross: PropTypes.func
}

export default AppliedFilters;
