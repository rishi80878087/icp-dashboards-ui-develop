import PropTypes from "prop-types"
import { useContext, useEffect, useMemo } from "react";
import { theme } from "re-usable-design-components";
import useResponsive from "@/hooks/useResponsive";
import { useIntl } from "react-intl";
import ResidensByEmirates from "@/components/ResidentsByEmirates";
import EmirateMap from "@/svgr/EmirateMap";
import { getEmiratesResidents } from "@/services/expatsResidenceService";
import useAsync from "@/hooks/useAsync";
import { getEmirateData, checkRtl } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";

const { useToken } = theme;

const getFormattedData = (data = [], emirateMap = []) => {
  const resObj = {};
  (Object.keys(emirateMap))?.forEach((key) => {
    resObj[key] = data?.find(item => item?.emirate_code == emirateMap[key]?.emirate_code)?.total_residents;
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
    const nationalityParam = !filter?.nationality?.country_alpha3
      ? ""
      : `&nationality_code=${filter?.nationality?.country_alpha3}`;
    const _params = `gender=${filter?.gender?.apiKey}${nationalityParam}`;
    invokeGetEmiratesResidents({
      params: _params,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter?.gender, filter?.nationality]);

  const emirateMap = useMemo(() => {
    if (emiratesResidentsStatus !== "success") {
      return {}
    }
    return getEmirateData(themeVariables, emiratesConfigValue, isRtl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emiratesConfigValue, emiratesResidentsStatus])

  const isLoading =
    emiratesResidentsStatus === "idle" || emiratesResidentsStatus === "pending" || !Object?.keys(emirateMap)?.length;;

  const data = useMemo(() => {
    if (emiratesResidentsStatus !== "success") {
      return []
    }
    
    return getFormattedData(emiratesResidentsValue?.data || [], emirateMap);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emiratesResidentsValue?.data, emirateMap])

  return (
    <ResidensByEmirates
      filter={filter}
      data={data}
      title={intl?.formatMessage({ id: "Total Expat Residents By Emirates" })}
      subtitle={intl?.formatMessage({
        id: "Distribution of expatriates across all Emirates.",
      })}
      icon={<EmirateMap />}
      loading={isLoading}
      actionProps={{
        flex: getResponsive({ default: "none", tablet: "0 0 100%", midTablet: "none", mobile: "0 0 100%" })
      }}
      titleProps={{
        wrap: getResponsive({ default: "false", tablet: "true", midTablet: "false", mobile: "true" }) === "true",
        gutter: getResponsive({ default: [8], midTablet: [8], mobile: [0, 8], tablet: [0, 8] })
      }}          
      emiratesConfigValue={emiratesConfigValue}
      segmentProps={{
        block: getResponsive({
          default: "false",
          midTablet: "false",
          mobile: "true",
          tablet: "true"
        }) === "true"
      }}
    />
  );
}

ResidensByEmiratesWrapper.propTypes = {
  emiratesConfigValue: PropTypes.any,
  filter: PropTypes.any
}

export default ResidensByEmiratesWrapper;
