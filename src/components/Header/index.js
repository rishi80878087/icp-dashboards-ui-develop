import PropTypes from "prop-types"
import React, { useContext, useEffect, useState } from "react";
import {
  Row,
  Col,
  theme,
  PhosphorIcons,
  AntIcons,
  Dropdown,
  Avatar,
  Text,
  Divider,
  Button
} from "re-usable-design-components";
import { useIntl } from "react-intl";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { setLocale as setGlobalLocale } from "@/globalContext/locale/localeActions";
import StorageService from "@/services/storageService";
import getConfig from "next/config";
import { signOut } from "next-auth/react";
import Logo from "@/components/Logo";
import { useMatomo } from "@datapunt/matomo-tracker-react";
import { useRouter } from "next/router";
import { setTheme } from "@/globalContext/theme/themeActions";
import useResponsive from "@/hooks/useResponsive";
import { ThemeContext } from "@/globalContext/theme/themeProvider";
import SidemenuDrawer from "@/components/Sidemenu/sidemenuDrawer";
import Segmented from "@/components/Segmented";


const { useToken } = theme;
const { publicRuntimeConfig } = getConfig();
const { KEYCLOAK_ENABLED } = publicRuntimeConfig;

const { Globe, Gear, List, PaintBrush, Sun, MoonStars, GearSix, CaretDown } = PhosphorIcons;
const { UserOutlined, LogoutOutlined } = AntIcons;


function LanguageSwitch () {
  const [store, dispatch] = useContext(LocaleContext);
  const [projectTranslation, setProjectTranslation] = useState(store?.projectTranslation)
  const intl = useIntl();

  useEffect(() => {
    if (store?.projectTranslation !== projectTranslation) {
      setProjectTranslation(store?.projectTranslation)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.projectTranslation])

  return (
    <Segmented
      size="small"
      value={projectTranslation}
      onChange={(e) => {
        setProjectTranslation(e);
        setTimeout(() => {
          dispatch(setGlobalLocale(e))
        }, 100)
      }}
      options={[
        {
          label: intl?.formatMessage({ id: "EN" }),
          value: "en"
        },
        {
          label: intl?.formatMessage({ id: "AR" }),
          value: "ar"
        }
      ]}
    />
  )
}

const MemoisedLanguageSwitch = React.memo(LanguageSwitch);


function DarkModeSwitch () {
  const [themeStore, dispatchTheme] = useContext(ThemeContext);
  const intl = useIntl();

  return (
    <Segmented
      size="small"
      value={themeStore?.selectedTheme}
      onChange={(e) => {
        dispatchTheme(setTheme(e))
      }}
      options={[
        {
          label: <Row align="middle" gutter={4}><Col flex="none"><Sun weight="bold" size={14} /></Col><Col flex="none"><Text color="currentColor">{intl?.formatMessage({ id: "Light" })}</Text></Col></Row>,
          value: "base"
        },
        {
          label: <Row align="middle" gutter={4}><Col flex="none"><MoonStars weight="bold" size={14} /></Col><Col flex="none"><Text color="currentColor">{intl?.formatMessage({ id: "Dark" })}</Text></Col></Row>,
          value: "dark"
        }
      ]}
    />
  )
}

const MemoisedDarkModeSwitch = React.memo(DarkModeSwitch);

function Header({
  style = {},
  areActionsHidden = false,
  isNavigationDisabled = false
}) {
  const intl = useIntl();
  const router = useRouter();
  const themeVariables = useToken();
  const [store] = useContext(LocaleContext);
  const [projectTranslation, setProjectTranslation] = useState(store?.projectTranslation)
  const { pushInstruction, trackEvent } = useMatomo();
  const getUseResponsive = useResponsive();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const locallyStoredLanguage = StorageService.get("locale") || "en";
  const locallyStoredTheme = StorageService.get("theme") || "base";

  const userObj = StorageService.get("authorization")?.tokenParsed || {};

  useEffect(() => {
    if (store?.projectTranslation !== projectTranslation) {
      setProjectTranslation(store?.projectTranslation)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.projectTranslation])

  const onLogout = async () => {
    StorageService.removeAll();
    StorageService.set("locale", locallyStoredLanguage);
    StorageService.set("theme", locallyStoredTheme);
    trackEvent({
      category: "Application",
      action: "Logout",
    });
    pushInstruction("resetUserId");
    if (KEYCLOAK_ENABLED === "true") {
      await signOut({ redirect: false });
    } else {
      router.push("/login");
    }
  };

  const isMobileOrMidTablet = (getUseResponsive({ default: "false", midTablet: "true", mobile: "true" }) === "true");
  let _options = [
    {
      key: '1',
      style: {
        paddingInline: "var(--paddingXSPx)"
      },
      label: (
        <Row align="middle" gutter={themeVariables?.token?.marginXS}>
          <Col flex="none">
            <Avatar
              size={themeVariables?.token?.iconSize}
              icon={<UserOutlined />}
            />
          </Col>
          <Col flex="none">
            <Text>
              {userObj?.name ||
                userObj?.preferred_username ||
                userObj?.email}
            </Text>
          </Col>
        </Row>
      ),
    },
    {
      type: 'divider',
    },
  ]
  const isTablet = (getUseResponsive({ default: "false", tablet: "true", midTablet: "false", mobile: "false" }) === "true");

  if (isTablet) {
    _options?.push(
      {
        key: "appearance",
        label: (
          <Row wrap={false} align="middle" gutter={themeVariables?.token?.marginXS}>
            <Col flex="none">
              <PaintBrush size={14} />
            </Col>
            <Col flex="none">
              <Text>{intl.formatMessage({ id: "Appearance" })}</Text>
            </Col>
            <Col flex="none">
              <MemoisedDarkModeSwitch
              />
            </Col>
          </Row>
        ),
      },
    )
  } else if (isMobileOrMidTablet) {
    _options = [
      {
        key: "globe",
        label: (
          <Row align="middle" gutter={themeVariables?.token?.marginXS}>
            <Col flex="none">
              <Globe size={14} />
            </Col>
            <Col flex="none">
              <Text>{intl.formatMessage({ id: "Language" })}</Text>
            </Col>
            <Col flex="none">
              <LanguageSwitch
              />
            </Col>
          </Row>
        ),
      },
      {
        key: "appearance",
        label: (
          <Row wrap={false} align="middle" gutter={themeVariables?.token?.marginXS}>
            <Col flex="none">
              <PaintBrush size={14} />
            </Col>
            <Col flex="none">
              <Text>{intl.formatMessage({ id: "Appearance" })}</Text>
            </Col>
            <Col flex="none">
              <MemoisedDarkModeSwitch
              />
            </Col>
          </Row>
        ),
      },
    ]
  }
  const groups = userObj?.groups;

  if (groups?.includes("ADMIN") && getUseResponsive({ default: "false", midTablet: "true" }) === "true") {
    _options?.push({
      key: "settings",
      label: (
        <Row gutter={themeVariables?.token?.marginXS}>
          <Col flex="none">
            <Gear size={themeVariables?.token?.iconSizeXSM} />
          </Col>
          <Col flex="none">
            <Text>{intl.formatMessage({ id: "settings" })}</Text>
          </Col>
        </Row>
      ),
      onClick: (e) => {
        router?.push("/settings")
      },
    })
  }
  const profileOptions = [
    ..._options,
    {
      key: "signOut",
      label: (
        <Row gutter={themeVariables?.token?.marginXS}>
          <Col flex="none">
            <LogoutOutlined style={{ fontSize: "14px" }} />
          </Col>
          <Col flex="none">
            <Text>{intl.formatMessage({ id: "signOut" })}</Text>
          </Col>
        </Row>
      ),
      onClick: (e) => {
        onLogout();
      },
    },
  ];

  return (
    <Row
      backgroundColor={themeVariables?.token?.colorBgContainer}
      style={{
        height: getUseResponsive({ default: themeVariables?.token?.headerHeight, mobile: "52px" }),
        borderBottom: `1px solid ${themeVariables?.token?.colorSplit}`,
        boxShadow: themeVariables?.token?.boxShadow,
        ...style,
      }}
    >
      <Col isFlex paddingInline={themeVariables?.token?.paddingLG}>
        <Row style={{ position: "relative" }} justify="space-between" align="middle" isFullHeight>
          <Col flex="none">
            <Row align="middle" gutter={themeVariables?.token?.marginXS}>
              {
                !areActionsHidden &&
                <Col
                  onClick={() => {
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                  }}
                  flex="none"
                  style={{
                    width: "40px",
                    display: getUseResponsive({
                      mobile: "flex",
                      midTablet: "flex",
                      tablet: "flex",
                      default: "none",
                    }),
                  }}
                >
                  <List
                    style={{ cursor: "pointer" }}
                    size={themeVariables?.token?.iconSizeSM}
                    color={themeVariables?.token?.colorText}
                  />
                </Col>
              }
              <Col
                flex="none"
                // style={
                //   !!(getUseResponsive({ default: "false", mobile: "true" }) === "true") ? {
                //     position: "absolute",
                //     left: 0,
                //     right: 0,
                //     margin: "auto",
                //     width: "fit-content"
                //   }
                //     : {}
                // }
              >
                <Logo isNavigationDisabled={isNavigationDisabled} width="auto" height={getUseResponsive({ default: "44px", mobile: "29px" })} />
              </Col>
            </Row>
          </Col>
          {
            !areActionsHidden &&
            <Col flex="none">
              <Row gutter={themeVariables?.token?.marginLG} align="middle">
                {/* <Col flex="none">
                  <BellSimple
                    size={themeVariables?.token?.iconSizeSM}
                    weight="bold"
                    color={themeVariables?.token?.colorText}
                  />
                </Col> */}
                {
                  getUseResponsive({ default: "true", midTablet: "false", mobile: "false" }) === "true" &&
                  <Col flex="none">
                    <MemoisedLanguageSwitch />
                  </Col>
                }
                {
                  getUseResponsive({ default: "true", midTablet: "false" }) === "true" && (groups?.includes("ADMIN")) && (
                    <Col flex="none">
                      <Button
                        type="text"
                        icon={<GearSix
                          weight="bold"
                          color="var(--colorText)"
                          size={18}
                          style={{
                            cursor: 'pointer'
                          }}
                          onClick={() => {
                            router?.push("/settings")
                          }}
                        />}
                      />
                    </Col>
                  )
                }
                <Col flex="none">
                  <Divider style={{ height: "32px" }} color="var(--colorSplit)" type="vertical" />
                </Col>
                <Col flex="none">
                  <Dropdown
                    menu={{
                      items: profileOptions,
                    }}
                    overlayStyle={{
                      minWidth: getUseResponsive({ default: "165px", tablet: "265px", mobile: "265px" })
                    }}
                  >
                    <Row align="middle" gutter={themeVariables?.token?.marginXS}>
                      <Col flex="none">
                        <Avatar
                          size={themeVariables?.token?.iconSize}
                          icon={<UserOutlined />}
                        />
                      </Col>
                      <Col flex="none">
                        <CaretDown color="var(--colorText)" size={16} />
                      </Col>
                    </Row>
                  </Dropdown>
                </Col>
              </Row>
            </Col>
          }
        </Row>
      </Col>
      {isMobileMenuOpen && (
        <SidemenuDrawer
          onClose={() => {
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </Row>
  );
}

Header.propTypes = {
  style: PropTypes.object,
  areActionsHidden: PropTypes.bool,
  isNavigationDisabled: PropTypes.bool
}

export default Header;
