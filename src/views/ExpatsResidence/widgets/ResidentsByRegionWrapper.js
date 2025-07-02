import PropTypes from "prop-types"
import { useContext, useEffect, useState, useMemo, memo } from "react";
import _ from "lodash";
import { useIntl } from "react-intl";
import useAsync from "@/hooks/useAsync";
import { continentKeyLabelMapping, checkRtl, resolveTernary } from "@/utils/helper";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import ResidentsByRegion from "@/components/ResidentsByRegion";
import { getNationalityByGender } from "@/services/expatsResidenceService";
import useWorldGeoJSON from "@/hooks/useWorldGeoJson";


const getFormattedData = (
  showBy,
  isRtl = false,
  nationalitiesConfigValueObj = [],
  _data = [],
  geoJsonObj = {},
) => {
  const data = _.cloneDeep(_data);
  const continentKey = continentKeyLabelMapping[showBy];
  const finalData = [];
  const res = {};
  
  data?.forEach((item) => {
    const _countryGeoObj = geoJsonObj[item?.["country_alpha3"]]
    if (!_countryGeoObj && showBy === "all") {
      const _countryLabelObj = nationalitiesConfigValueObj[item?.country_alpha3];
      finalData.push({
        "iso-a3": item?.country_alpha3,
        "iso-a2": undefined,
        label: isRtl
          ? _countryLabelObj?.country_ar || item?.country_alpha3
          : _countryLabelObj?.country_en || item?.country_alpha3,
        value: item?.total_residents || 0,
      });
    } else if (continentKey === "all" || _countryGeoObj?.properties?.continent === continentKey) {
      const _countryLabelObj = nationalitiesConfigValueObj[item?.country_alpha3];

      if (_countryGeoObj) {
        finalData.push({
          "iso-a3": _countryGeoObj?.properties?.["iso-a3"],
          "iso-a2": _countryGeoObj?.properties?.["iso-a2"],
          label: isRtl
            ? _countryLabelObj?.country_ar
            : _countryLabelObj?.country_en,
          value: item?.total_residents || 0,
        });
      }
    }

    const v = geoJsonObj[item?.country_alpha3]
    const continent = v?.properties?.continent || "others"

   
    const sumValue = resolveTernary(
      _.isNumber(res[continent]),
      res[continent],
      0
    )

    const countryValue = resolveTernary(
      _.isNumber(item?.total_residents),
      item?.total_residents,
      0
    )

    res[continent] = sumValue + countryValue;
  });

  let _sumOfAll = 0

  Object.values(res).forEach(item => {
    _sumOfAll += item || 0
  })

  return ({
    data: finalData,
    totalData: { ...res, All: _sumOfAll }
  })
};


function ResidentsByRegionWrapper({
  filter: _filter,
  icon,
  title,
  nationalitiesConfigValueObj,
  setIsActiveResidenceLoading,
}) {
  const { geoJsonObj } = useWorldGeoJSON();
  const [filter, setFilter] = useState(_filter)
  const intl = useIntl();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);

  const [showBy, setShowBy] = useState("all");
  
  useEffect(() => {
    setFilter(_filter)
  }, [_filter])

  useEffect(() => {
    if (showBy !== "all") {
      setShowBy("all")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const {
    execute: invokeGetNationalityRegionAndCountry,
    status: nationalityRegionAndCountryStatus,
    value: nationalityRegionAndCountryValue,
  } = useAsync({ asyncFunction: getNationalityByGender });

  useEffect(() => {
    const nationalityParam = !filter?.nationality?.country_alpha3
      ? ""
      : `&nationality_code=${filter?.nationality?.country_alpha3}`;
    const emirateParam = !filter?.emirate?.emirate_code
      ? ""
      : `&emirate_code=${filter?.emirate?.emirate_code}`;
    const _params = `gender=${filter?.gender?.apiKey}${emirateParam}${nationalityParam}`;

    invokeGetNationalityRegionAndCountry({
      params: _params,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter?.gender,
    filter?.emirate,
    filter?.nationality,
  ]);


  const isLoading =
    nationalityRegionAndCountryStatus === "idle" ||
    nationalityRegionAndCountryStatus === "pending";
  
  useEffect(() => {
    if (!isLoading) {
      setIsActiveResidenceLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])
  
  const { data, totalData } = useMemo(() => {
    if (nationalityRegionAndCountryStatus !== "success" || !Object?.keys(geoJsonObj)?.length) {
      return {}
    }
    return getFormattedData(
      showBy,
      isRtl,
      nationalitiesConfigValueObj,
      nationalityRegionAndCountryValue?.data || [],
      geoJsonObj || [],
    );  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nationalityRegionAndCountryValue?.data, geoJsonObj, showBy])

  return (
    <ResidentsByRegion
      icon={icon}
      geoJsonObj={geoJsonObj}
      title={title}
      showBy={showBy}
      mapTooltipTitle={intl?.formatMessage({ id: "Total Expats" })}
      setShowBy={setShowBy}
      isLoading={isLoading}
      data={data}
      totalMapping={totalData}
    />
  );
}

ResidentsByRegionWrapper.propTypes = {
  filter: PropTypes.any,
  icon: PropTypes.any,
  nationalitiesConfigValueObj: PropTypes.any,
  title: PropTypes.any
}

export default memo(ResidentsByRegionWrapper, (prev, next) => {
  return _.isEqual(prev, next)
})