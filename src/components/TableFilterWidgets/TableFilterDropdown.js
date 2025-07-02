import { Row, Col, Button, AntIcons } from "re-usable-design-components";
import _ from "lodash";
import { useContext } from "react";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import useResponsive from "@/hooks/useResponsive";
import { useIntl } from "react-intl";
import PropTypes from "prop-types";
import { checkRtl } from "@/utils/helper";

const { SearchOutlined } = AntIcons;

function TableFilterDropdown({
  children,
  setAppliedSearchText,
  appliedSearchText,
  setSearchText,
  searchText,
  onSearch = () => {},
  onReset = () => {},
  data,
  isSearchDisabled = false,
}) {
  const intl = useIntl();
  const getResponsive = useResponsive();
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  console.log("dataa ", data);
  return (
    <div
      style={{
        padding: 8,
        width: getResponsive({ default: "290px", mobile: "220px" }),
        rowGap: "8px",
      }}
    >
      {children(data)}
      <Row justify="end" style={{ marginTop: "8px" }} gutter={8}>
        <Col flex="none">
          <Button
            onClick={() => {
              setAppliedSearchText(undefined);
              setSearchText(undefined);
              onReset();
            }}
            type="default"
            {...(!isRtl && {
              style: { width: 70 },
            })}
          >
            {intl?.formatMessage({ id: "Reset" })}
          </Button>
        </Col>
        <Col flex="none">
          <Button
            type="primary"
            disabled={
              !searchText?.length ||
              _.isEqual(searchText, appliedSearchText) ||
              isSearchDisabled
            }
            onClick={() => {
              setAppliedSearchText(searchText);
              onSearch();
            }}
            icon={<SearchOutlined />}
            style={{ width: 102 }}
          >
            {intl?.formatMessage({ id: "Search" })}
          </Button>
        </Col>
      </Row>
    </div>
  );
}

export default TableFilterDropdown;

TableFilterDropdown.propTypes = {
  children: PropTypes.any,
  setAppliedSearchText: PropTypes.any,
  appliedSearchText: PropTypes.any,
  setSearchText: PropTypes.any,
  searchText: PropTypes.any,
  data: PropTypes.any,
  onSearch: PropTypes.any,
  onReset: PropTypes.any,
  isSearchDisabled: PropTypes.any,
};
