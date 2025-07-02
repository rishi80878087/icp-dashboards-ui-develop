import { Select, AntIcons } from "re-usable-design-components";
import useResponsive from "@/hooks/useResponsive";
import { useState, useContext, useEffect } from "react";
import { useIntl } from "react-intl";
import PropTypes from "prop-types";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { checkRtl, validateInput } from "@/utils/helper";


const { SearchOutlined } = AntIcons;

function InputWrap({
  data,
  onChange,
  searchText,
  arKey = "nationalityAr",
  enKey = "nationalityEn"
}) {
  const getResponsive = useResponsive();
  const intl = useIntl();
  const [value, setValue] = useState(searchText);
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);

  useEffect(() => {
    if (!_.isEqual(searchText, value)) {
      setValue(searchText)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText])

  return (
    <div
      style={{
        position: "relative",
        width: getResponsive({ default: "100%" })
      }}
    >
      <Select
        placeholder={intl?.formatMessage({ id: "Search" })}
        allowClear
        mode={"multiple"}
        options={_.cloneDeep(data)?.sort((a, b) => {
          return a?.[isRtl ? arKey : enKey]?.localeCompare(b?.[isRtl ? arKey : enKey])
        }).map((v) => ({
          value: isRtl ? v?.[arKey] : v?.[enKey],
          label: isRtl ? v?.[arKey] : v?.[enKey],
        }))}
        value={value}
        suffixIcon={<SearchOutlined />}
        onChange={(e) => {
          if (!e || !e?.length) {
            setValue(undefined);
            setTimeout(() => {
              onChange(undefined);
            }, 400)
          } else if (validateInput(e)) {
            setValue(e)
            setTimeout(() => {
              onChange(e)
            }, 400)
          }
        }}
        style={{
          width: "100%"
        }}
        block
        onClear={() => {
          setValue(undefined)
          onChange(undefined)
        }}
        size="default"
        maxTagCount={4}
        showSearch
        filterOption={(input, option) => {
          return option?.label?.toLowerCase()?.includes(input?.toLowerCase());
        }}
      />
    </div>
  )
}

InputWrap.propTypes = {
  data: PropTypes.any,
  onChange: PropTypes.any,
  searchText: PropTypes?.any,
  arKey: PropTypes.any,
  enKey: PropTypes?.any
}

export default InputWrap;

