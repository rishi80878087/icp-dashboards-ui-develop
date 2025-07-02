import PropTypes from "prop-types"
import React, { useMemo, useContext, useEffect, useState } from "react";
import { Row, Col, Scrollbars, theme, Spin } from "re-usable-design-components";
import Header from "@/components/Header";
import { useIntl } from "react-intl";
import StorageService from "@/services/storageService";
import Sidemenu, { getMenuOptions } from "@/components/Sidemenu";
import { useRouter } from "next/router";
import useResponsive from "@/hooks/useResponsive";
import {
  getConfig,
  getEmiratesConfig,
  getNationalitiesConfig,
  getResidencyTypeConfig,
} from "@/services/commonService";
import useAsync from "@/hooks/useAsync";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { ThemeContext } from "@/globalContext/theme/themeProvider";
import { checkAccess, setProjectTitle } from "@/utils/helper";

const { useToken } = theme;

function Main(props) {
  const { children, pageName } = props;
  const intl = useIntl();
  const router = useRouter();
  const themeVariables = useToken();
  const [isLoadingComp, setIsLoadingComp] = useState(true);
  const [store] = useContext(LocaleContext);
  const [themeStore] = useContext(ThemeContext);
  const getResponsive = useResponsive();
  const authorization = StorageService.get("authorization");
  const { status: configStatus, value: configValue } = useAsync({
    asyncFunction: getConfig,
    immediate: true,
  });

  const { status: emiratesConfigStatus, value: emiratesConfigValue } = useAsync(
    { asyncFunction: getEmiratesConfig, immediate: true }
  );

  const { status: residencyTypeStatus, value: residencyTypeValues } = useAsync(
    { asyncFunction: getResidencyTypeConfig, immediate: true }
  );

  const { status: nationalitiesConfigStatus, value: nationalitiesConfigValue } =
    useAsync({ asyncFunction: getNationalitiesConfig, immediate: true });
  
  useEffect(() => {
    setIsLoadingComp(true);
    setTimeout(() => {
      setIsLoadingComp(false)
    }, 100)
  }, [store?.projectTranslation, themeStore?.selectedTheme])

  useEffect(() => {
    const handleRouteChange = (url) => {
      setIsLoadingComp(true);
      setTimeout(() => {
        setIsLoadingComp(false);
      }, 50);
    };

    router.events.on('routeChangeStart', handleRouteChange);

    // Clean up the event listener on unmount
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  useEffect(() => {
    setProjectTitle(intl?.messages, intl?.locale)
  }, [intl])

  const isLoading =
    configStatus === "pending" ||
    configStatus === "idle" ||
    emiratesConfigStatus === "pending" ||
    emiratesConfigStatus === "idle" ||
    nationalitiesConfigStatus === "pending" ||
    nationalitiesConfigStatus === "idle" ||
    residencyTypeStatus === "idle" ||
    residencyTypeStatus === "pending" ||
    isLoadingComp;

  const nationalitiesConfigValueObj = useMemo(() => {
    if (nationalitiesConfigStatus !== "success") {
      return {};
    }

    return ((nationalitiesConfigValue?.data || [])?.reduce((acc, v) => {
      acc[v?.country_alpha3] = v
      return acc;
    }, {}))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nationalitiesConfigStatus]);



  if (configValue && !configValue?.volRange) {
    configValue.volRange = configValue?.volume_range || {
      low: 40,
      medium: 70,
      high: 100,
    };
  }

  if (!authorization?.tokenParsed) {
    return (
      <Row isFullHeight={true}>
        <Col
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin />
        </Col>
      </Row>
    );
  }

  const groups = authorization?.tokenParsed?.groups || [];

  const isAccessible = checkAccess({ groups, pageName });

  if (
    authorization?.tokenParsed &&
    !isAccessible &&
    !router?.pathname?.includes("/access-denied")
  ) {
    const _menuOptions = getMenuOptions(intl, themeVariables, router);
    const menuOptions = _menuOptions?.filter((v) =>
      checkAccess({ groups, pageName: v?.name?.[0] })
    );
    if (menuOptions?.length) {
      menuOptions?.[0]?.onClick();
    } else {
      router.push("/access-denied");
    }
    return null;
  }

  const isAccessDenied = router?.pathname?.includes("/access-denied");

  return (
    <Row style={{ maxWidth: "1920px" }} isFullHeight isFlex>
      <Col isFlex>
        <Row>
          <Col>
            <Header />
          </Col>
        </Row>
        <Row isFlexGrow id="containerScroll">
          <Col isFlex>
            <Row isFlexGrow>
              {!isAccessDenied && (
                <Col
                  style={{
                    width: themeVariables?.token?.sidemenuWidth,
                    maxWidth: themeVariables?.token?.sidemenuWidth,
                    display: getResponsive({
                      mobile: "none",
                      midTablet: "none",
                      tablet: "none",
                      default: "",
                    }),
                  }}
                >
                  <Sidemenu />
                </Col>
              )}

              <Col
                style={{
                  backgroundColor: "var(--colorBgLayout)",
                  width: isAccessDenied
                    ? "100%"
                    : `calc(100% - ${getResponsive({
                      mobile: "0",
                      midTablet: "0",
                      tablet: "0",
                      default: themeVariables?.token?.sidemenuWidth,
                    })}px)`,
                  maxWidth: isAccessDenied
                    ? "100%"
                    : `calc(100% - ${getResponsive({
                      mobile: "0",
                      midTablet: "0",
                      tablet: "0",
                      default: themeVariables?.token?.sidemenuWidth,
                    })}px)`,
                }}
              >
                <Scrollbars id="mainLayoutScroll" autoHide>
                  {isLoading ? (
                    <Row isFullHeight={true}>
                      <Col
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Spin />
                      </Col>
                    </Row>
                  ) : (
                    <Row isFullHeight={true}>
                      <Col
                        style={{
                          padding: getResponsive({
                            default: "var(--paddingLGPx) var(--paddingLGPx) 0 var(--paddingLGPx)",
                            tablet: "var(--paddingLGPx)",
                            midTablet: "var(--paddingPx)",
                          }),
                        }}
                      >
                        {console.log("nationalconfigValuefromlayout ", nationalitiesConfigValueObj)}
                        {React.cloneElement(children, { configValue, residencyTypeValues, emiratesConfigValue, nationalitiesConfigValue: { data: (nationalitiesConfigValue?.data || [])?.sort((a, b) => (a?.country_en || "").localeCompare(b?.country_en)) }, nationalitiesConfigValueObj })}
                      </Col>
                    </Row>
                  )}
                </Scrollbars>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

Main.propTypes = {
  children: PropTypes.any,
  pageName: PropTypes.any
}

export default Main;
