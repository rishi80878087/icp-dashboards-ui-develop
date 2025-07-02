import PropTypes from "prop-types"
import { useContext, useEffect, useMemo } from "react";
import _ from "lodash";
import { theme, Row, Col, Tooltip, PhosphorIcons } from "re-usable-design-components";
import useResponsive from "@/hooks/useResponsive";
import { useIntl } from "react-intl";
import ResidensByEmirates from "@/components/ResidentsByEmirates";
import EmirateMap from "@/svgr/EmirateMap";
import { getEmiratesResidents } from "@/services/activeGeneralService";
import useAsync from "@/hooks/useAsync";
import { getEmirateData, checkRtl } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";

const { useToken } = theme;

const { Info } = PhosphorIcons;

const getFormattedData = (data = [], emirateMap = []) => {
  const resObj = {};
  Object.keys(emirateMap)?.forEach((key) => {
    resObj[key] = data?.find(
      (item) => item?.emirate_code == emirateMap[key]?.emirate_code
    )?.total_residents;
  });
  return resObj;
};

function ResidensByEmiratesWrapper({ filter, emiratesConfigValue = [] }) {
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const getResponsive = useResponsive();
  const themeVariables = useToken();
  const isRtl = checkRtl(localeStore);

  const {
    execute: invokeGetEmiratesResidents,
    status: emiratesResidentsStatus,
    value: emiratesResidentsValue,
  } = useAsync({ asyncFunction: getEmiratesResidents });

  useEffect(() => {
    const _filter = _.cloneDeep(filter);
    delete _filter?.emirate;
    invokeGetEmiratesResidents({
      filter: _filter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invokeGetEmiratesResidents, filter?.nationality_code, filter?.age_range, filter?.gender ]);

  const emirateMap = useMemo(() => {
    if (emiratesResidentsStatus !== "success") {
      return {}
    }
    return getEmirateData(themeVariables, emiratesConfigValue, isRtl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emiratesResidentsStatus, emiratesConfigValue])

  const isLoading =
    emiratesResidentsStatus === "idle" || emiratesResidentsStatus === "pending" || !Object?.keys(emirateMap)?.length;;

  const data = useMemo(() => {
    if (emiratesResidentsStatus !== "success") {
      return []
    }

    return getFormattedData(emiratesResidentsValue?.data || [], emirateMap);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emiratesResidentsValue?.data])

  return (
    <ResidensByEmirates
      filter={filter}
      data={data}
      title={(
        <Row align="middle" gutter={4}>
          <Col flex="none">
            {intl.formatMessage({ id: "Population By Emirates" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({ id: "UAE_Population_By_Emirates_Tooltip" })}
            >
              <span>
                <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
              </span>
            </Tooltip>
          </Col>
        </Row>
      )}
      icon={<EmirateMap />}
      loading={isLoading}
      emiratesConfigValue={emiratesConfigValue}
      cardBodyHeight={getResponsive({
        default: "366px",
        mobile: "529px",
        midTablet: "348px",
        tablet: "348px",
        bigTablet: "348px",
        desktop: "348px",
      })}
      bodyWrapStyle={{
        height: "100%",
      }}
      style={{
        height: "100%",
      }}
    />
  );
}

ResidensByEmiratesWrapper.propTypes = {
  emiratesConfigValue: PropTypes.array,
  filter: PropTypes.any
}

export default ResidensByEmiratesWrapper;
