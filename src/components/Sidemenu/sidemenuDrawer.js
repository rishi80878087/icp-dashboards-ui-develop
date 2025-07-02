import PropTypes from "prop-types"
import React, { useContext } from "react";
import {
  Row,
  Col,
  theme,
  Drawer,
  Text,
} from "re-usable-design-components";
import { useIntl } from "react-intl";
import StorageService from "@/services/storageService";
import { useRouter } from "next/router";
import { getMenuOptions } from "@/components/Sidemenu";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkAccess } from "@/utils/helper";
import useResponsive from "@/hooks/useResponsive";

const { useToken } = theme;


function SidemenuDrawer({ style = {}, onClose = () => {} }) {
  const intl = useIntl();
  const router = useRouter();
  const themeVariables = useToken();
  const getResponsive = useResponsive();
  const authorization = StorageService.get('authorization');
  const groups = authorization?.tokenParsed?.groups;
  const [localeStore] = useContext(LocaleContext);
  const isRtl = localeStore?.projectTranslation === "ar"
  const isSettings = router?.pathname?.includes("/setting")

  const _menuOptions = getMenuOptions(intl, themeVariables, router);
  const menuOptions = _menuOptions?.filter((v) => checkAccess({ groups, pageName: v?.name?.[0] }))
  let selectedMenu = "passengerForecasting"
  menuOptions?.forEach((option) => {
    if (router?.pathname?.includes(option?.path)) {
      selectedMenu = option?.key
    }
  })
  
  return (
    <Drawer
      size="medium"
      title={null}
      onClose={() => onClose()}
      open={true}
      footer={null}
      bodyStyle={{
        padding: 0,
        display: "flex",
        flexDirection: "column"
      }}
      contentWrapperStyle={{ boxShadow: 'none' }}
      width="272px"
      getContainer={() => document.getElementById("containerScroll")}
      headerStyle={{
        display: "none"
      }}
      rootStyle={{
        height: getResponsive({ mobile: "calc(100vh - 52px)", tablet: "calc(100vh - 64px)" }),
        top: getResponsive({ mobile:"52px", tablet: "64px" }),
        bottom: 0,
      }}
      placement={isRtl ? "right" : "left"}
    >
      <Row>
        {menuOptions?.map((val) => {
          return (
            <Col
              key={val?.key}
              paddingInline={themeVariables?.token?.padding}
              paddingBlock={themeVariables?.token?.paddingXS}
              style={{
                opacity: val?.disabled && 0.6,
                cursor: val?.disabled ? "not-allowed" : "pointer",
                color:
                  selectedMenu === val?.key &&
                  themeVariables?.token?.Menu?.controlItemBgActive,
              }}
              // onClick={() => {
              //   if (!val?.disabled) {
              //     setSelectedMenu(val?.key);
              //   }
              // }}
            >
              <Row
                isFlex
                align="middle"
                wrap={false}
                gutter={themeVariables?.token?.marginXS}
                onClick={() => {
                  if (val.onClick) {
                    val?.onClick();
                    onClose();
                  }
                }}
              >
                <Col flex="none" isFlex>
                  {val?.getIcon({
                    size: 24,
                    color:
                      // store?.selectedTheme === "dark" &&
                      (!isSettings && selectedMenu === val?.key)
                        ? "var(--colorPrimaryBase)"
                        : "var(--colorText)"
                  })}
                </Col>
                <Col flex="none" isFlex>
                  <Text
                    id="hello"
                    color={
                      (!isSettings && selectedMenu === val?.key) ?
                        "var(--colorPrimaryBase)"
                        : "var(--colorText)"
                    }
                  >
                    {val?.label}
                  </Text>
                </Col>
              </Row>
            </Col>
          );
        })}
      </Row>
    </Drawer>
  );
}

SidemenuDrawer.propTypes = {
  onClose: PropTypes.func,
  style: PropTypes.object
}

export default SidemenuDrawer;
