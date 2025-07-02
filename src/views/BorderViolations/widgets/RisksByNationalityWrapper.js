import PropTypes from "prop-types"
import { useContext, useEffect, useState, useMemo } from "react";
import { useIntl } from "react-intl";
import useAsync from "@/hooks/useAsync";
import { checkRtl } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import useWorldGeoJSON from "@/hooks/useWorldGeoJson";
import RisksByNationality from "@/components/RisksByNationality";
import useResponsive from "@/hooks/useResponsive";
import { getAllEmirates, getRiskByNationality } from "@/services/riskDashboardService";
import getCountryISO2 from 'country-iso-3-to-2';


function RisksByNationalityWrapper({
  filters,
  icon,
  title,
  dateRange,
  isPreview,
  space,
  isPrint,
  rows,
  offset,
  callback,
  isTableHidden,
  isMapHidden
}) {
  const { geoJsonObj } = useWorldGeoJSON();
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const [showBy, setShowBy] = useState(0);
  const getResponsive = useResponsive();

  const {
    execute: invokeGetAllEmirates,
    status: getAllEmiratesStatus,
    value: emiratesList,
  } = useAsync({ asyncFunction: getAllEmirates});

  const {
    execute: invokeGetRiskByNationality,
    status: getRiskByNationalityStatus,
    value: riskByNationality,
  } = useAsync({ asyncFunction: getRiskByNationality });

  useEffect(() => {
    if (showBy !== 0) {
      setShowBy(0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    invokeGetAllEmirates({
      filter: {
        ...filters,
        ...dateRange
      },
    });
  }, [filters, invokeGetAllEmirates, dateRange]);

  useEffect(() => {
    invokeGetRiskByNationality({
      filter: {
        emirate: showBy,
        nationality: filters.nationality,
        risks: filters.risks,
        ...dateRange,
      },
    });
  }, [showBy, filters, invokeGetRiskByNationality, dateRange]);

  const isLoadingTabs = getAllEmiratesStatus === "pending" || getAllEmiratesStatus === "idle";
  const isLoading =
    getRiskByNationalityStatus === "idle" ||
    getRiskByNationalityStatus === "pending" ||
    isLoadingTabs;

  const { data, totalData } = useMemo(() => {
    if (getRiskByNationalityStatus !== "success") {
      return {}
    }
    return {
      data: riskByNationality?.data?.nationalities?.map((item) => ({
        "iso-a2": getCountryISO2(item?.code),
        "iso-a3": item?.code,
        label: isRtl
          ? item?.name_ar
          : item?.name_en,
        value: item?.total || 0,
      })),
      totalData: emiratesList?.data?.emirates?.[showBy]?.total || 0,
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riskByNationality?.data?.nationalities, showBy, emiratesList?.data?.emirates])

  return (
    <RisksByNationality
      icon={icon}
      geoJsonObj={geoJsonObj}
      title={title}
      showBy={showBy}
      mapTooltipTitle={intl?.formatMessage({ id: "Total Violations" })}
      setShowBy={setShowBy}
      isLoading={isLoading}
      scrollY={getResponsive({ default: 455, tablet: 345 })}
      isLoadingTabs={isLoadingTabs}
      data={data}
      emiratesList={emiratesList?.data?.emirates || []}
      totalCount={totalData}
      isPreview={isPreview}
      space={space}
      isPrint={isPrint}
      rows={rows}
      offset={offset}
      callback={callback}
      isTableHidden={isTableHidden}
      isMapHidden={isMapHidden}
    />
  );
}

RisksByNationalityWrapper.propTypes = {
  filters: PropTypes.any,
  icon: PropTypes.any,
  title: PropTypes.any,
  dateRange: PropTypes.any,
  isPreview: PropTypes.any,
  space: PropTypes.any,
  isPrint: PropTypes.any,
  rows: PropTypes.any,
  offset: PropTypes.any,
  callback: PropTypes.any,
  isTableHidden: PropTypes.any,
  isMapHidden: PropTypes.any
}

export default RisksByNationalityWrapper;
