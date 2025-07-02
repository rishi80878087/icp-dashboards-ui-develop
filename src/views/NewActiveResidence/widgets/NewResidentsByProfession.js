import {
  Row,
  Col,
  Table,
  Text,
  Progress,
  AntIcons,
  Select,
  Tooltip,
  PhosphorIcons,
} from "re-usable-design-components";
import DashboardCard from "@/components/DashboardCard";
import { useIntl } from "react-intl";
import ResidenceProfession from "@/svgr/ResidenceProfession";
import { formatNumber, validateInput, checkRtl } from "@/utils/helper";
import { TableFilterDropdown } from "@/components/TableFilterWidgets";
import { LocaleContext } from "@/globalContext/locale/localeProvider";
import _, { values } from "lodash";
import { useEffect, useState, useContext, useMemo, useRef } from "react";
import useAsync from "@/hooks/useAsync";
import { getResidentsByProfession } from "@/services/activeResidenceService";
import useResponsive from "@/hooks/useResponsive";

const { SearchOutlined } = AntIcons;
const { Info } = PhosphorIcons;
const FormatNumber = (v) => <Text>{`${v}%`}</Text>;

function InputWrap({ onChange, typed, setTyped, filters, searchText, appliedSelectedOptions, setAppliedSelectedOptions, searchOptions, selectedOptions, setSelectedOptions }) {
  const getResponsive = useResponsive();
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false)
  const [localeStore] = useContext(LocaleContext);
  const selectRef = useRef();
  const isRtl = checkRtl(localeStore);
  const [value, setValue] = useState(searchText);
  const [options, setOptions] = useState(searchOptions);
  const {
    execute,
    status,
    value: sponsorValue,
  } = useAsync({ asyncFunction: getResidentsByProfession });

  const fetchResults = (value) => {
    execute({ filters: { ...filters, profession_name: value } });
  };

  useEffect(() => {
    if (!_.isEqual(searchText, value)) {
      setValue(searchText)
    }
  }, [searchText])

  useEffect(() => {
    setOptions(searchOptions)
  }, [searchOptions])

  useEffect(() => {
    if (typed?.trim() && status === "success") {
      setOptions(_.cloneDeep(sponsorValue?.data))
    }
  }, [sponsorValue?.data])


  const debouncedSearch = useMemo(() => _.debounce(fetchResults, 300), []);


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
      return a?.[isRtl ? "profession_ar" : "profession_en"]?.localeCompare(b?.[isRtl ? "profession_ar" : "profession_en"])
    }).map((v) => ({
      value: isRtl ? v?.profession_ar : v?.profession_en,
      label: isRtl ? v?.profession_ar : v?.profession_en,
    }))
  }, [options])
  
  useEffect(() => {
    if (selectRef?.current && isOpen) {
      setTimeout(() => {
        selectRef?.current?.focus();
      }, 0)
    }
  }, [optionValues])

  return (
    <div
      style={{
        position: "relative",
        // top:"200px",
        width: getResponsive({ default: "100%" }),
        // marginTop: "150px"
        // backgroundColor:"red",
        // zIndex: 1000,
      }}
      id="select"
    >
      <Select
      // getPopupContainer={() => document.getElementById('select')}
        virtual={false}
        placeholder={intl?.formatMessage({ id: "Search" })}
        allowClear
        ref={selectRef}
        key={JSON.stringify(optionValues)}
        open={true}
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
                const val = selectedOptions?.find((_v) => _v?.[isRtl ? "profession_ar" : "profession_en"] === v);
                if (val) {
                  return val;
                }
              }
              const val = options?.find((_v) => _v?.[isRtl ? "profession_ar" : "profession_en"] === v);
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
          width: "100%",
          // top:"200px"
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

const NewResidentsByProfession = ({ filters, isRtl }) => {
  const intl = useIntl();
  const getResponsive = useResponsive();

  const [searchText, setSearchText] = useState(undefined);
  const [searchOptions, setSearchOptions] = useState([]);
  const [typed, setTyped] = useState(undefined);
  const [selectedOptions, setSelectedOptions] = useState(undefined);
  const [appliedSelectedOptions, setAppliedSelectedOptions] = useState(undefined);

  useEffect(() => {
    console.log("working");
  }, []);

  const {
    execute: loadMoreResidents,
    status,
    value,
    setState,
  } = useAsync({ asyncFunction: getResidentsByProfession });

  useEffect(() => {
    loadMoreResidents({ filters: { ...filters, profession_name: "" } });
  }, [filters]);

  useEffect(() => {
    setSearchOptions(value?.data);
  }, [value?.data])

  console.log("##resident_by_profession_main_data", value);

  // below we have passed Render Prop chldren in tablefilterdropdown to customize the ui of input search and this ui is passed as function so we can call it from parent dynamically

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
          setAppliedSelectedOptions(selectedOptions);
        }}
        onReset={() => {
          setAppliedSelectedOptions(undefined);
        }}
      >
        {(d) => (
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
              setSearchText(v);
              if (!v) {
                setSelectedOptions(undefined);
              }
            }}
          />
        )}
      </TableFilterDropdown>
    ),
    filterIcon: (
      <SearchOutlined
        style={{
          color: appliedSelectedOptions ? "var(--colorPrimaryBase)" : undefined,
        }}
      />
    ),
  });

  const isLoading = ["idle", "pending"]?.includes(status);

  const data = value?.data || [];
  const isEmpty = !isLoading && !data?.length;

  return (
    <DashboardCard
      title={
        <Row align="middle" gutter={4}>
          <Col flex="none">
            {intl?.formatMessage({ id: "Residents by Sector" })}
          </Col>
          <Col flex="none">
            <Tooltip
              title={intl?.formatMessage({
                id: "active_residence_residency_sector_tooltip",
              })}
            >
              <span>
                <Info
                  style={{ marginBottom: "3px" }}
                  color="var(--colorIcon)"
                  size={14}
                  weight="bold"
                />
              </span>
            </Tooltip>
          </Col>
        </Row>
      }
      icon={<ResidenceProfession size={32} />}
      loading={isLoading}
      isEmpty={isEmpty}
    >
      <Row>
        <Col>
          <Table
            id="residentsProfessionTable"
            key={appliedSelectedOptions}
            columns={[
              {
                title: intl?.formatMessage({ id: "Profession" }),
                width: getResponsive({
                  default: "437px",
                  desktop: "320px",
                  bigTablet: "300px",
                  tablet: "216px",
                  midTablet: "300px",
                  mobile: "168px",
                }),
                render: (v) => {
                  return (
                    <Row align="middle" wrap={false} gutter={8}>
                      <Col flex="none">
                        <Text
                          ellipsis={{
                            tooltip: v?.label,
                          }}
                        >
                          {isRtl ? v?.profession_ar : v?.profession_en}
                        </Text>
                      </Col>
                    </Row>
                  );
                },
                ...getColumnSearchProps(),
              },
              {
                title: intl?.formatMessage({ id: "Number of Residents" }),
                width: "auto",
                render: (v) => {
                  return (
                    <Row
                      align="middle"
                      gutter={getResponsive({
                        default: [24],
                        tablet: [0, 0],
                        midTablet: [24],
                        mobile: [0, 0],
                      })}
                    >
                      <Col
                        flex={getResponsive({
                          default: "0 0 95px",
                          tablet: "0 0 95px",
                          midTablet: "0 0 95px",
                          mobile: "0 0 95px",
                        })}
                      >
                        <Text>{formatNumber(v?.count)}</Text>
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
                  );
                },
              },
            ]}
            scroll={{
              y: getResponsive({
                default: data?.length > 8,
                tablet: data?.length > 5,
                midTablet: data?.length > 8,
                mobile: data?.length > 9,
              })
                ? getResponsive({ default: 370, mobile: 69 * 7 })
                : "auto",
              x: getResponsive({ default: "auto", mobile: 450 }),
            }}
            isTableFullHeight
            borderRadiusOnSides={getResponsive({
              default: data?.length > 7 ? "all" : "top",
              tablet: data?.length > 5 ? "all" : "top",
              midTablet: data?.length > 7 ? "all" : "top",
              mobile: data?.length > 6 ? "all" : "top",
            })}
            pagination={false}
            dataSource={appliedSelectedOptions || data}
          />
        </Col>
      </Row>
    </DashboardCard>
  );
};

export default NewResidentsByProfession;
