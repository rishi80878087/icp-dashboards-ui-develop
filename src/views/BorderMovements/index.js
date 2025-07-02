import PropTypes from "prop-types"
import {
  Row,
  Col,
  PhosphorIcons,
} from "re-usable-design-components";
import { useIntl } from "react-intl";
import Tabs from "@/components/Tabs"
import BorderMovements from "./BorderMovements";
import useAsync from "@/hooks/useAsync";
import useResponsive from "@/hooks/useResponsive";
import { useRouter } from "next/router";
import BorderMovementsSvg from "@/svgr/BorderMovements";
import { getBorderTypeConfig } from "@/services/commonService";
import VisaResidency from "./VisaResidency";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { useState, useContext } from "react";
import { checkRtl } from "@/utils/helper";

const { IdentificationBadge } = PhosphorIcons;


function BorderMovementsWrap({ emiratesConfigValue, nationalitiesConfigValue, nationalitiesConfigValueObj }) {
  const intl = useIntl()
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(router?.query?.type || "movements");
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);

  const getResponsive = useResponsive();
  
  const {
    value: borderTypeConfigValue,
  } = useAsync({ asyncFunction: getBorderTypeConfig, immediate: true });

  return (
    <Row
      isFullHeight
      style={{
        position: "relative"
      }}
    >
      <Col
        style={{
          position: "absolute",
          left: getResponsive({ default: "-24px", midTablet: "-16px" }),
          right: getResponsive({ default: "-24px", midTablet: "-16px" }),
          top: getResponsive({ default: "-24px", midTablet: "-16px" }),
          paddingInline: "24px",
          backgroundColor: "var(--colorPrimaryBg)",
          minWidth: getResponsive({ default: "calc(100% + 48px)", midTablet: "calc(100% + 32px)" }),
          borderBottom: "1px solid var(--colorPrimaryBase)"
        }}
      >
        <Tabs
          type="line"
          tabBarGutter={isRtl ? 0: 32}
          bodyPaddingTop="none"
          activeKey={selectedTab}
          onChange={(v) => {
            setSelectedTab(v);
            router?.replace({
              pathname: '/border-movements',
              query: {
                type: v
              }
            })
          }}
          items={[
            {
              key: "movements",
              label: (
                <Row gutter={12} wrap={false}>
                  <Col flex="none">
                    <BorderMovementsSvg size={16} />
                  </Col>
                  <Col flex="none">
                    {intl.formatMessage({ id: "Border Movements" })}
                  </Col>
                </Row>
              )
            },
            {
              key: "residency",
              label: (
                <Row gutter={12} wrap={false}>
                  <Col flex="none">
                    <IdentificationBadge size={16} />
                  </Col>
                  <Col flex="none">
                    {intl.formatMessage({ id: "Visa & Residency" })}
                  </Col>
                </Row>
              )
            }
          ]}
        />
      </Col>
      <Col
        style={{
          marginTop: "48px"
        }}
      >
        {
          selectedTab == "movements"
            ? (
              <BorderMovements
                nationalitiesConfigValue={nationalitiesConfigValue}
                nationalitiesConfigValueObj={nationalitiesConfigValueObj}
                borderTypeConfigValue={borderTypeConfigValue}
                emiratesConfigValue={emiratesConfigValue}
              />
            )
            : (
              <VisaResidency
                emiratesConfigValue={emiratesConfigValue}
                nationalitiesConfigValue={nationalitiesConfigValue}
                nationalitiesConfigValueObj={nationalitiesConfigValueObj}
                borderTypeConfigValue={borderTypeConfigValue}
              />
            )
        }
      </Col>
    </Row>
  );
}
export default BorderMovementsWrap;

BorderMovementsWrap.propTypes = {
  nationalitiesConfigValue: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.any,
  emiratesConfigValue: PropTypes.any
}