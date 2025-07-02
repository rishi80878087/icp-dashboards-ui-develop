import PropTypes from "prop-types"
import {
  Row,
  Col,
  PhosphorIcons,
} from "re-usable-design-components";
import { useIntl } from "react-intl";
import Tabs from "@/components/Tabs"
import Risks from "./Risks";
import Violations from "./Violations";
import useResponsive from "@/hooks/useResponsive";
import { useRouter } from "next/router";
import ViolatorsDashboardSvg from "@/svgr/ViolatorsDashboard";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { useState, useContext } from "react";
import { checkRtl } from "@/utils/helper";

const { Warning } = PhosphorIcons;


function BorderMovementsWrap({ emiratesConfigValue, nationalitiesConfigValue, nationalitiesConfigValueObj }) {
  const intl = useIntl()
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(router?.query?.type || "violations");
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);

  const getResponsive = useResponsive();
  
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
              pathname: '/violators-dashboard',
              query: {
                type: v
              }
            })
          }}
          items={[
            {
              key: "violations",
              label: (
                <Row gutter={12} wrap={false}>
                  <Col flex="none">
                    <ViolatorsDashboardSvg size={16} />
                  </Col>
                  <Col flex="none">
                    {intl.formatMessage({ id: "Violations" })}
                  </Col>
                </Row>
              )
            },
            {
              key: "risks",
              label: (
                <Row gutter={12} wrap={false}>
                  <Col flex="none">
                    <Warning size={16} />
                  </Col>
                  <Col flex="none">
                    {intl.formatMessage({ id: "Risks" })}
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
          selectedTab == "violations"
            ? (
              <Violations
                nationalitiesConfigValue={nationalitiesConfigValue}
                nationalitiesConfigValueObj={nationalitiesConfigValueObj}
                emiratesConfigValue={emiratesConfigValue}
              />
            )
            : (
              <Risks 
                nationalitiesConfigValue={nationalitiesConfigValue}
                nationalitiesConfigValueObj={nationalitiesConfigValueObj}
                emiratesConfigValue={emiratesConfigValue}
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