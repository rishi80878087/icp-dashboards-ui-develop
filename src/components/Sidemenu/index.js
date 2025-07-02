import PropTypes from "prop-types"
import React, { useState, useContext, useEffect } from "react";
import {
  Row,
  Col,
  theme,
  Menu,
  PhosphorIcons,
  Segmented,
  ConfigProvider,
  Tooltip,
  Scrollbars
} from "re-usable-design-components";
import { useIntl } from "react-intl";
import { useRouter } from "next/router";
import { setTheme } from "@/globalContext/theme/themeActions";
import { ThemeContext } from "@/globalContext/theme/themeProvider";
import StorageService from "@/services/storageService";
import { checkAccess } from "@/utils/helper";
import ActiveResidence from "@/svgr/ActiveResidence";
import ActiveGeneral from "@/svgr/ActiveGeneral";
import BorderMovements from "@/svgr/BorderMovements";
import ViolatorsDashboard from "@/svgr/ViolatorsDashboard";


const { Sun, MoonStars } = PhosphorIcons;

export const getMenuOptions = (intl, themeVariables, router) => {
  return [
    {
      label: (
        <span
          style={{
            width: "100%",
            display: "flex",
            whiteSpace: "initial",
            textAlign: "inherit",
          }}
        >
          {intl.formatMessage({ id: "Passenger Forecasting" })}
        </span>
      ),
      key: "passengerForecasting",
      onClick: () => {
        setTimeout(() => {
          router.push("/")
        }, 100)
      },
      path: "/",
      name: ["Passenger_Forecasting"],
      icon: <SuitcaseRolling size={30} />,
      getIcon: (iconProps) => {
        return (
          <SuitcaseRolling
            size={30}
            {...iconProps}
          />
        );
      },
    },
    {
      label: (
        <span
          style={{
            width: "100%",
            display: "flex",
            whiteSpace: "initial",
            textAlign: "inherit",
          }}
        >
          {intl.formatMessage({ id: "Name Origin Explorer" })}
        </span>
      ),
      key: "uc2",
      path: "/origins-explorer",
      name: ["Name_Prediction"],
      onClick: () => {
        setTimeout(() => {
          router.push("/origins-explorer")
        }, 100)
      },
      icon: <AirplaneInFlight size={30} />,
      getIcon: (iconProps) => {
        return (
          <AirplaneInFlight
            size={30}
            {...iconProps}
          />
        );
      },
      disabled: false,
    },
     {
      label: (
        <span
          style={{
            width: "100%",
            display: "flex",
            whiteSpace: "initial",
            textAlign: "inherit",
          }}
        >
          {intl.formatMessage({ id: "New Active Residence & Expats" })}
        </span>
      ),
      key: "new_active_residence",
      path: "/new-active-residence",
      name: ["New_Active_Residence"],
      onClick: () => {
        setTimeout(() => {
          router.push("/new-active-residence")
        }, 100)
      },
      icon: <ActiveResidence />,
      getIcon: (iconProps) => {
        return (
          <ActiveResidence
            {...iconProps}
          />
        );
      },
      disabled: false,
    },
    {
      label: (
        <span
          style={{
            width: "100%",
            display: "flex",
            whiteSpace: "initial",
            textAlign: "inherit",
          }}
        >
          {intl.formatMessage({ id: "Active Residence & Expats" })}
        </span>
      ),
      key: "active_residence",
      path: "/active-residence",
      name: ["Active_Residence"],
      onClick: () => {
        setTimeout(() => {
          router.push("/active-residence")
        }, 100)
      },
      icon: <ActiveResidence />,
      getIcon: (iconProps) => {
        return (
          <ActiveResidence
            {...iconProps}
          />
        );
      },
      disabled: false,
    },
    {
      label: (
        <span
          style={{
            width: "100%",
            display: "flex",
            whiteSpace: "initial",
            textAlign: "inherit",
          }}
        >
          {intl.formatMessage({ id: "UAE Population" })}
        </span>
      ),
      key: "active_general",
      path: "/uae-population",
      name: ["Active_General"],
      onClick: () => {
        setTimeout(() => {
          router.push("/uae-population")
        }, 100)
      },
      icon: <ActiveGeneral />,
      getIcon: (iconProps) => {
        return (
          <ActiveGeneral
            {...iconProps}
          />
        );
      },
      disabled: false,
    },
    {
      label: (
        <span
          style={{
            width: "100%",
            display: "flex",
            whiteSpace: "initial",
            textAlign: "inherit",
          }}
        >
          {intl.formatMessage({ id: "Border Movements" })}
        </span>
      ),
      key: "border-movements",
      path: "/border-movements",
      name: ["Border_Movements"],
      onClick: () => {
        setTimeout(() => {
          router.push("/border-movements")
        }, 100)
      },
      icon: <BorderMovements />,
      getIcon: (iconProps) => {
        return (
          <BorderMovements
            {...iconProps}
          />
        );
      },
      disabled: false,
    },
    {
      label: (
        <span
          style={{
            width: "100%",
            display: "flex",
            whiteSpace: "initial",
            textAlign: "inherit",
          }}
        >
          {intl.formatMessage({ id: "Violators Dashboard" })}
        </span>
      ),
      key: "violators-dashboard",
      path: "/violators-dashboard",
      name: ["Border_Violations"],
      onClick: () => {
        router.push("/violators-dashboard")
      },
      icon: <ViolatorsDashboard />,
      getIcon: (iconProps) => {
        return (
          <ViolatorsDashboard
            {...iconProps}
          />
        );
      },
      disabled: false,
    }
    // {
    //   label: (
    //     <span
    //       style={{
    //         width: "100%",
    //         display: "flex",
    //         whiteSpace: "initial",
    //         textAlign: "inherit",
    //       }}
    //     >
    //       {intl.formatMessage({ id: "uc3" })}
    //     </span>
    //   ),
    //   key: "uc3",
    //   icon: <AirplaneInFlight size={30} />,
    //   getIcon: (iconProps) => {
    //     return (
    //       <AirplaneInFlight
    //         size={30}
    //         {...iconProps}
    //       />
    //     );
    //   },
    //   disabled: true,
    // },
  ];
};

const { useToken } = theme;
const { SuitcaseRolling, AirplaneInFlight } = PhosphorIcons;

function SegmentedWrap () {
  const [store, dispatch] = useContext(ThemeContext);
  const [selectedTheme, setSelectedTheme] = useState(store?.selectedTheme)
  const themeVariables = useToken();

  useEffect(() => {
    if (store?.selectedTheme !== selectedTheme) {
      setSelectedTheme(store?.selectedTheme)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store?.selectedTheme])

  return (
    <Segmented
      isSelectedBold
      size="large"
      value={selectedTheme}
      onChange={(e) => {
        setSelectedTheme(e);
        setTimeout(() => {
          dispatch(setTheme(e))
        }, 100)
      }}
      style={{
        backgroundColor: themeVariables?.token?.["Segmented-custom"]?.colorBgLayout,
        border: `1px solid ${themeVariables?.token?.["Segmented-custom"]?.colorBorder}`
      }}
      options={[
        {
          label: <Row align="middle" gutter={4}><Col flex="none"><Sun weight="bold" size={16} /></Col></Row>,
          value: "base"
        },
        {
          label: <Row align="middle" gutter={4}><Col flex="none"><MoonStars weight="bold" size={16} /></Col></Row>,
          value: "dark"
        }
      ]}
    />
  )
}

const MemoisedSegmentedWrap = React.memo(SegmentedWrap);


function Sidemenu({ style = {} }) {
  const intl = useIntl();
  const themeVariables = useToken();
  const authorization = StorageService.get('authorization');
  const router = useRouter();

  const groups = authorization?.tokenParsed?.groups;

  const isSettings = router?.pathname?.includes("/setting")
  const _menuOptions = getMenuOptions(intl, themeVariables, router);
  const menuOptions = _menuOptions?.filter((v) => checkAccess({ groups, pageName: v?.name?.[0] }))
  let selectedMenu = "passengerForecasting"
  menuOptions?.forEach((option) => {
    option.label = <span style={{ textAlign: "center" }}>{option?.label}</span>
    if (router?.pathname?.includes(option?.path)) {
      selectedMenu = option?.key
    }
  });

  return (
    <>
      <Scrollbars>
        <Row
          style={{
            ...style,
          }}
          isFullHeight
        >

          <Col isFlex>
            <Menu
              style={{
                height: "100%",
                padding: `${themeVariables?.token?.paddingLG}px 0`,
                paddingBottom: "95px"
              }}
              itemMode="vertical"
              items={menuOptions}
              selectedKeys={isSettings ? [] : [selectedMenu]}
            />
          </Col>
        </Row>
      </Scrollbars>
      <Col
        isFlex
        alignItems="center"
        justifyContent="center"
        paddingBlock={themeVariables?.token?.paddingSM}
        style={{
          position: "absolute",
          bottom: themeVariables?.token?.paddingLG,
          width: "100%",
        }}
      >
        <ConfigProvider
          theme={{
            token: {
              segmentedBgColorSelected: themeVariables?.token?.colorPrimaryHover
            },
            components: {
              Segmented: {
                itemColor: themeVariables?.token?.["Segmented-custom"]?.colorText,
                itemHoverColor: themeVariables?.token?.["Segmented-custom"]?.colorText,
                // itemSelectedBg: themeVariables?.token?.segmentedBgColorSelected,
                // ...selectedColor && ({
                //   colorText: selectedColor
                // })
              },
            },
          }}
        >
          <Tooltip
            title={intl?.formatMessage({ id: "Theme" })}
          >
            <MemoisedSegmentedWrap
            />
          </Tooltip>
        </ConfigProvider>
      </Col>
    </>
  );
}

Sidemenu.propTypes = {
  style: PropTypes.object
}

export default Sidemenu;
