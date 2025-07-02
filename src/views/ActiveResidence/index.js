import PropTypes from "prop-types"
import {
  Row,
  Col,
  PhosphorIcons,
} from "re-usable-design-components";
import { useIntl } from "react-intl";
import Tabs from "@/components/Tabs"
import useAsync from "@/hooks/useAsync";
import useResponsive from "@/hooks/useResponsive";
import { useRouter } from "next/router";
import { getBorderTypeConfig } from "@/services/commonService";
import ActiveResidence from "./ActiveResidence";
import VisaHolders from "./VisaHolders";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { useState, useContext } from "react";
import { checkRtl } from "@/utils/helper";

const { UsersFour, IdentificationCard } = PhosphorIcons;


function ActiveResidenceWrap({ emiratesConfigValue, nationalitiesConfigValue, nationalitiesConfigValueObj, residencyTypeValues }) {
  const intl = useIntl()
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState(router?.query?.type || "residence");
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
              pathname: '/active-residence',
              query: {
                type: v
              }
            })
          }}
          items={[
            {
              key: "residence",
              label: (
                <Row gutter={12} wrap={false}>
                  <Col flex="none">
                    <UsersFour size={16} />
                  </Col>
                  <Col flex="none">
                    {intl.formatMessage({ id: "Residents" })}
                  </Col>
                </Row>
              )
            },
            {
              key: "visa-holders",
              label: (
                <Row gutter={12} wrap={false}>
                  <Col flex="none">
                    <IdentificationCard size={16} />
                  </Col>
                  <Col flex="none">
                    {intl.formatMessage({ id: "Visa Holders" })}
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
          selectedTab == "residence"
            ? (
              <ActiveResidence
                nationalitiesConfigValue={nationalitiesConfigValue}
                nationalitiesConfigValueObj={nationalitiesConfigValueObj}
                borderTypeConfigValue={borderTypeConfigValue}
                emiratesConfigValue={emiratesConfigValue}
                residencyTypeValues={residencyTypeValues}
              />
            )
            :  (
              <VisaHolders
                nationalitiesConfigValue={nationalitiesConfigValue}
                nationalitiesConfigValueObj={nationalitiesConfigValueObj}
                borderTypeConfigValue={borderTypeConfigValue}
                emiratesConfigValue={emiratesConfigValue}
                residencyTypeValues={residencyTypeValues}
              />
            )
        }
      </Col>
    </Row>
  );
}
export default ActiveResidenceWrap;

ActiveResidenceWrap.propTypes = {
  nationalitiesConfigValue: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.any,
  emiratesConfigValue: PropTypes.any,
  residencyTypeValues: PropTypes.any
}