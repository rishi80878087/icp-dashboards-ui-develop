import PropTypes from "prop-types"
import { useContext, useEffect, useMemo } from "react";
import _ from "lodash";
import { theme, Row, Col, Tooltip, PhosphorIcons } from "re-usable-design-components";
import { useIntl } from "react-intl";
import ResidensByEmirates from "./ResidentsByEmirate";
import EmirateMap from "@/svgr/EmirateMap";
import { getEmiratesStatistics } from "@/services/activeResidenceService";
import useAsync from "@/hooks/useAsync";
import { getEmirateData, checkRtl } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";

const { Info } = PhosphorIcons;
const { useToken } = theme;

const getFormattedData = (data = [], emirateMap = []) => {
  const resObj = {};
  (Object.keys(emirateMap))?.forEach((key) => {
    resObj[key] = data?.find(item => item?.code == emirateMap[key]?.emirate_code)?.total;
  });
  return resObj;
};

function ResidensByEmiratesWrapper({ filters, emiratesConfigValue = [] }) {
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const themeVariables = useToken();
  const isRtl = checkRtl(localeStore);

  const {
    execute: invokeGetEmiratesResidents,
    status: emiratesResidentsStatus,
    value: emiratesResidentsValue,
  } = useAsync({ asyncFunction: getEmiratesStatistics });

  useEffect(() => {
    const _filters = _.cloneDeep(filters);
    delete _filters?.emirate_code;
    invokeGetEmiratesResidents({
      filters: { ..._filters },
    });
  }, [filters]);

  const emirateMap = useMemo(() => {
    if (emiratesResidentsStatus !== "success") {
      return {}
    }
    return getEmirateData(themeVariables, emiratesConfigValue, isRtl);
  }, [emiratesConfigValue, emiratesResidentsStatus])
  
  const isLoading =
    emiratesResidentsStatus === "idle" || emiratesResidentsStatus === "pending" || !Object?.keys(emirateMap)?.length;

  const data = useMemo(() => {
    if (emiratesResidentsStatus !== "success") {
      return []
    }

    return getFormattedData(emiratesResidentsValue?.data || [], emirateMap);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emiratesResidentsValue?.data, emirateMap])
  
  const totalValue = emiratesResidentsValue?.data?.find((v) => v?.code == 0)?.total

  return (
    <ResidensByEmirates
      filter={filters}
      data={data}
      totalValue={totalValue}
      title={
        <Row align="middle" gutter={4}>
          <Col flex="none">
            {intl?.formatMessage({ id: "Residents By Emirate" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({ id: "active_residence_residency_emirate_tooltip" })}
            >
              <span>
                <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
              </span>
            </Tooltip>
          </Col>
        </Row>
      }
      icon={<EmirateMap />}
      loading={isLoading}
      emiratesConfigValue={emiratesConfigValue}
    />
  );
}

ResidensByEmiratesWrapper.propTypes = {
  emiratesConfigValue: PropTypes.array,
  filters: PropTypes.any,
}

export default ResidensByEmiratesWrapper;
