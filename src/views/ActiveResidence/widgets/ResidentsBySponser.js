import PropTypes from "prop-types"
import { Row, Col, Table, Text, Progress, AntIcons, Select, Tooltip, PhosphorIcons } from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import ResidenceSponsers from "@/svgr/ResidenceSponsers"
import { formatNumber, validateInput, checkRtl } from "@/utils/helper";
import { TableFilterDropdown  } from "@/components/TableFilterWidgets";
import useAsync from "@/hooks/useAsync";
import _ from "lodash";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import { useEffect, useState, useContext, useMemo, useRef } from "react";
import { getResidentsBySponser } from "@/services/activeResidenceService";
import useResponsive from "@/hooks/useResponsive";

const { SearchOutlined } = AntIcons;
const { Info } = PhosphorIcons;
const FormatNumber = (v) => <Text>{`${v}%`}</Text>


function InputWrap({ onChange, typed, setTyped, filters, searchText, appliedSelectedOptions, setAppliedSelectedOptions, searchOptions, selectedOptions, setSelectedOptions }) {
  const getResponsive = useResponsive();
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false)
  const [localeStore] = useContext(LocaleContext);
  const isRtl = checkRtl(localeStore);
  const selectRef = useRef();
  const [value, setValue] = useState(searchText);
  const [options, setOptions] = useState(searchOptions);

  const {
    execute,
    status,
    value: sponsorValue,
  } = useAsync({ asyncFunction: getResidentsBySponser });

  const fetchResults = (value) => {
    execute({ filters: { ...filters, sponsor_name: value } });
  };

  useEffect(() => {
    if (!_.isEqual(searchText, value)) {
      setValue(searchText)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText])

  useEffect(() => {
    if (typed?.trim() && status === "success") {
      setOptions(_.cloneDeep(sponsorValue?.data))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sponsorValue?.data])


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useMemo(() => _.debounce(fetchResults, 300), []);

  // Call debounced function when input changes
  const handleChange = (e) => {
    if (!e) {
      setOptions(searchOptions)
    } else if (validateInput(e)) {
      debouncedSearch(e);
    }
    setTyped(e)
  };

  const optionValues = useMemo(() => {
    return options?.sort((a, b) => {
      return a?.[isRtl ? "sponsor_ar" : "sponsor_en"]?.localeCompare(b?.[isRtl ? "sponsor_ar" : "sponsor_en"])
    }).map((v) => ({
      value: isRtl ? v?.sponsor_ar : v?.sponsor_en,
      label: isRtl ? v?.sponsor_ar : v?.sponsor_en,
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options])
  
  useEffect(() => {
    if (selectRef?.current && isOpen) {
      setTimeout(() => {
        selectRef?.current?.focus();
      }, 0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionValues])

  return (
    <div
      style={{
        position: "relative",
        width: getResponsive({ default: "100%" })
      }}
    >
      <Select
        virtual={false}
        placeholder={intl?.formatMessage({ id: "Search" })}
        allowClear
        ref={selectRef}
        key={JSON.stringify(optionValues)}
        open={isOpen}
        onFocus={() => {
          setIsOpen(true)
        }}
        onBlur={() => {
          setIsOpen(false)
        }}
        searchValue={typed}
        mode={"multiple"}
        loading={status === "pending"}
        options={optionValues}
        value={value}
        suffixIcon={<SearchOutlined />}
        onChange={(e) => {
          if (!e || !e?.length) {
            setValue(undefined);
            setSelectedOptions(undefined)
            setTimeout(() => {
              onChange(undefined);
            }, 400)
          } else if (validateInput(e)) {
            const _selectedOptions = e?.map((v) => {
              if (selectedOptions) {
                const val = selectedOptions?.find((_v) => _v?.[isRtl ? "sponsor_ar" : "sponsor_en"] === v);
                if (val) {
                  return val;
                }
              }
              const val = options?.find((_v) => _v?.[isRtl ? "sponsor_ar" : "sponsor_en"] === v);
              if (val) {
                return val;
              }
            })
            setSelectedOptions(_selectedOptions);
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
          setTyped(undefined)
          setSelectedOptions(undefined)
          if (appliedSelectedOptions) {
            setAppliedSelectedOptions(undefined)
          }
        }}
        filterOption={true}
        maxTagCount={4}
        showSearch
        onSearch={handleChange}
      />
    </div>
  )
}

InputWrap.propTypes = {
  onChange: PropTypes.any,
  searchText: PropTypes.string,
  searchOptions: PropTypes.array,
  filters: PropTypes.any,
  typed: PropTypes.any,
  setTyped: PropTypes.any,
  selectedOptions: PropTypes.any,
  setAppliedSelectedOptions: PropTypes.any,
  setSelectedOptions: PropTypes.any,
  appliedSelectedOptions: PropTypes?.any
}

function ResidentsBySponser({ filters, isRtl }) {
  const intl = useIntl();
  const getResponsive = useResponsive();
  const [searchText, setSearchText] = useState(undefined)
  const [searchOptions, setSearchOptions] = useState([]);
  const [typed, setTyped] = useState(undefined);
  const [selectedOptions, setSelectedOptions] = useState(undefined);
  const [appliedSelectedOptions, setAppliedSelectedOptions] = useState(undefined);

  const {
    execute,
    status,
    value,
  } = useAsync({ asyncFunction: getResidentsBySponser });

  const {
    execute: loadMoreResidents,
  } = useAsync({ asyncFunction: getResidentsBySponser });

  const data = value?.data || []

  useEffect(() => {
    setSearchOptions(value?.data);
  }, [value?.data])

  useEffect(() => {
    if (searchText) {
      setSearchText(undefined);
    }
    if (selectedOptions) {
      setSelectedOptions(undefined)
    }
    if (typed) {
      setTyped(undefined)
    }
  }, [filters])


  const getColumnSearchProps = () => ({
    filterDropdown: (
      <TableFilterDropdown
        setAppliedSearchText={() => {}}
        appliedSearchText={""}
        setSearchText={setSearchText}
        isSearchDisabled={_.isEqual(selectedOptions, appliedSelectedOptions)}
        searchText={searchText}
        data={searchOptions}
        onSearch={() => {
          setAppliedSelectedOptions(selectedOptions)
        }}
        onReset={() => {
          setAppliedSelectedOptions(undefined)
        }}
      >
        {
          (d) => (
            <InputWrap
              searchOptions={d}
              searchText={searchText}
              key={appliedSelectedOptions}
              size="default"
              filters={filters}
              selectedOptions={selectedOptions}
              typed={typed}
              setTyped={setTyped}
              setSelectedOptions={setSelectedOptions}
              setAppliedSelectedOptions={setAppliedSelectedOptions}
              appliedSelectedOptions={appliedSelectedOptions}
              onChange={(v) => {
                setSearchText(v)
                if (!v) {
                  setSelectedOptions(undefined)
                }
              }}
            />
          )
        }
      </TableFilterDropdown>
    ),
    filterIcon: <SearchOutlined style={{ color: appliedSelectedOptions ? 'var(--colorPrimaryBase)' : undefined }} />,
  });

  async function loadMoreValues() {
    if (value?.data?.length < value?.total) {
      const res = await loadMoreResidents({ filters: { ...filters }, skip: value?.data?.length });
      if (res?.data?.length) {
        setState((v) => ({
          ...v,
          value: {
            ...v?.value,
            data: [...(v?.value?.data || []), ...(res?.data || [])]
          }
        }))
      }
    }
  }

  function handleScroll(e) {
    const ele = document.querySelector("#residentsBySponser .ant-table-body");
    const { scrollTop, clientHeight, scrollHeight } = ele;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    // Example action based on distance from the bottom
    if (distanceFromBottom < 30) {
      loadMoreValues()
    }
  }
  const debouncedScrollHandler = _.debounce(handleScroll, 400);

  useEffect(() => {
    execute({ filters: { ...filters, sponsor_name: "" } })
  }, [filters]);

  useEffect(() => {
    if (data?.length) {
      const ele = document.querySelector("#residentsBySponser .ant-table-body");
      if (ele) {
        ele.addEventListener('scroll', debouncedScrollHandler);
      }

      // Cleanup on component unmount
      return () => {
        if (ele) {
          ele.removeEventListener('scroll', debouncedScrollHandler);
        }
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, appliedSelectedOptions])

  const isLoading = ["idle", "pending"]?.includes(status);
  const isEmpty = !isLoading && !data?.length;


  return (
    <DashboardCard
      title={
        <Row align="middle" gutter={4}>
          <Col flex="none">
            {intl?.formatMessage({ id: "Residents By Sponsor" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({ id: "active_residence_residency_sponsor_tooltip" })}
            >
              <span>
                <Info style={{ marginBottom: "3px" }} color="var(--colorIcon)" size={14} weight="bold" />
              </span>
            </Tooltip>
          </Col>
        </Row>
      }
      icon={<ResidenceSponsers />}
      cardBodyHeight={getResponsive({ default: "423px", mobile: "530px" })}
      cardBodyPadding={isLoading ? "16px" : "0px"}
      bodyWrapStyle={{
        padding: "0px"
      }}
      titleProps={{
        wrap: getResponsive({ default: "false", tablet: "true", midTablet: "false", mobile: "true" }) === "true",
        gutter: getResponsive({ default: [8], tablet: [0, 8], midTablet: [8], mobile: [0, 8] })
      }}
      actionProps={{
        flex: getResponsive({ default: "none", tablet: "0 0 100%", midTablet: "none", mobile: "0 0 100%" })
      }}
      bodyBackgroundColor="transparent"
      loading={isLoading}
      isEmpty={isEmpty}
    >
      <Row>
        <Col>
          <Table
            scroll={{
              y: getResponsive({ default: data?.length > 8, tablet: data?.length > 5, midTablet: data?.length > 8, mobile: data?.length > 9 }) ? getResponsive({ default: 370, mobile: 69 * 7 }) : "auto",
              x: getResponsive({ default: "auto", mobile: 450 }),
            }}
            key={appliedSelectedOptions}
            id="residentsBySponser"
            borderRadiusOnSides={getResponsive({ default: data?.length > 7 ? "all" : "top", tablet: data?.length > 5 ? "all" : "top", midTablet: data?.length > 7 ? "all": "top", mobile: data?.length > 6 ? "all": "top" })}
            loading={false}
            dataSource={appliedSelectedOptions || data}
            columns={[
              {
                title: intl?.formatMessage({ id: "Sponsors" }),
                width: getResponsive({ default: "437px", desktop: "320px", bigTablet: "300px", tablet: "216px", midTablet: "300px", mobile: "168px" }),
                render: (v) => {
                  return (
                    <Row align="middle" wrap={false} gutter={8}>
                      <Col flex="none">
                        <Text
                          ellipsis={{
                            tooltip: v?.label
                          }}
                        >
                          {isRtl ? v?.sponsor_ar : v?.sponsor_en}
                        </Text>
                      </Col>
                    </Row>
                  )
                },
                ...getColumnSearchProps()
              },
              {
                title: intl?.formatMessage({ id: "Number of Residents" }),
                render: (v) => {
                  return (
                    <Row align="middle" gutter={getResponsive({ default: [24], tablet: [0, 0], midTablet: [24], mobile: [0, 0] })}>
                      <Col flex={getResponsive({ default: "0 0 95px", tablet: "0 0 95px", midTablet: "0 0 95px", mobile: "0 0 95px" })}>
                        <Text>
                          {formatNumber(v?.count)}
                        </Text>
                      </Col>

                      <Col flex="auto">
                        <Progress
                          strokeColor={"var(--colorPrimaryBase)"}
                          percent={Number(v?.percentage)}
                          showInfo={true}
                          format={FormatNumber}
                        />
                      </Col>
                    </Row>
                  )
                }
              }
            ]}
            isTableFullHeight
            // isSplitHidden
            pagination={false} // Set pagination based on the number of items
          />
        </Col>
      </Row>
    </DashboardCard>
  )
}

ResidentsBySponser.propTypes = {
  filters: PropTypes.any,
  isRtl: PropTypes.any,
}

export default ResidentsBySponser;