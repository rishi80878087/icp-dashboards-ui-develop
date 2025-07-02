import PropTypes from "prop-types"
import {
  Row, Col, theme, Divider, RadioGroup,
  Select, Drawer, Menu, PhosphorIcons,
  Text, Button, Input, Table, message,
  TimePicker, Breadcrumb, AntIcons, Title, Space,
  Tooltip, ModalMethod
} from 're-usable-design-components';
import { useIntl } from 'react-intl';
import useResponsive from '@/hooks/useResponsive';
import _ from "lodash";
import { useEffect, useState, useContext } from 'react';
import useAsync from '@/hooks/useAsync';
import dayjs from 'dayjs';
import { useRouter } from "next/router";
import {
  createOfficerEfficiency, getOfficerEfficiencies, deleteOfficerEfficiency, updateOfficerEfficiency,
  createAirportConfiguration, updateAirportConfiguration, getAirportConfigurations, deleteAirportConfiguration
} from "@/services/settingServices";
import { LocaleContext } from '@/globalContext/locale/localeProvider';
import { formatNumber } from '@/utils/helper';


const { GearFine, Clock, Plus, FloppyDisk, Trash, PencilSimpleLine } = PhosphorIcons;
const customParseFormat = require("dayjs/plugin/customParseFormat");
const { useToken } = theme;

const { HomeOutlined, QuestionCircleOutlined } = AntIcons;

dayjs.extend(customParseFormat);

const _initialFieldsEfficiency = {
  fields: {
    airport_code: undefined,
    passengers_per_officer: undefined,
    traffic_direction: undefined
  }
}

function EfficiencyForm({ records, open, airports, messageApi, onClose }) {
  const themeVariables = useToken();
  const { token } = themeVariables;
  const [state, setState] = useState(_.cloneDeep(_initialFieldsEfficiency))
  const intl = useIntl();

  const { fields } = state;
  const { airport_code, passengers_per_officer, traffic_direction } = fields;

  const findedAirports = records?.find((record) => record?.airport_code === airport_code)

  useEffect(() => {
    if (findedAirports?.airport_code && !open?.id) {
      if (findedAirports?.traffic_direction === "outgoing") {
        setState((s) => ({
          ...s,
          fields: {
            ...s?.fields,
            traffic_direction: "incoming"
          }
        }))
      } else {
        setState((s) => ({
          ...s,
          fields: {
            ...s?.fields,
            traffic_direction: "outgoing"
          }
        }))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [findedAirports?.airport_code]);

  const {
    execute: executeCreateOfficerEfficiency,
    // value: createOfficerEfficiencyValue,
    status: createOfficerEfficiencyStatus,
  } = useAsync({
    asyncFunction: createOfficerEfficiency,
  });

  const {
    execute: executeUpdateOfficerEfficiency,
    // value: updateOfficerEfficiencyValue,
    status: updateOfficerEfficiencyStatus,
  } = useAsync({
    asyncFunction: updateOfficerEfficiency,
  });

  useEffect(() => {
    if (open?.id) {
      setState({
        fields: {
          ...open
        }
      })
    }
  }, [open])

  const isFormEmpty = airport_code === undefined || passengers_per_officer === undefined || traffic_direction === undefined;
  let isFormDisabled = false

  if (open?.id !== undefined) {
    if (
      (open?.airport_code === fields?.airport_code)
      && (open?.passengers_per_officer === fields?.passengers_per_officer)
      && (open?.traffic_direction === fields?.traffic_direction)
    ) {
      isFormDisabled = true
    }
  }

  const _radioOptions = [
    {
      value: 'incoming',
      label: intl?.formatMessage({ id: 'Arrival' }),
    },
    {
      value: 'outgoing',
      label: intl?.formatMessage({ id: 'Departure' }),
    },
  ]

  const radioOptions = _radioOptions
  // ?.filter((v) => {
  //   if (open?.id) {
  //     return true
  //   }
  //   return findedAirports?.traffic_direction !== v?.value
  // });
  return (
    <Row gutter={[0, token?.margin]}>
      <Col>
        <Row gutter={[0, token?.marginXS]}>
          <Col>
            <Text><Text color="var(--colorError)">*</Text> {intl?.formatMessage({ id: "Airport" })}</Text>
          </Col>
          <Col>
            <Select
              disabled={open?.id !== undefined}
              placeholder={intl?.formatMessage({ id: "Select" })}
              value={fields?.airport_code}
              onChange={(v) => {
                const _airport = airports?.find((airport) => airport?.airport_code === v)
                setState((val) => ({
                  ...val,
                  fields: {
                    ...val?.fields,
                    airport_code: _airport?.airport_code
                  }
                }))
              }}
              options={airports?.map((v) => ({ value: v?.airport_code, label: v?.airport_code }))}
            />
          </Col>
        </Row>
      </Col>

      <Col>
        <Row gutter={[0, token?.marginXS]}>
          <Col>
            <Text><Text color="var(--colorError)">*</Text> <Text>{intl?.formatMessage({ id: "Travel Type" })}</Text></Text>
          </Col>
          <Col>
            <RadioGroup
              disabled={open?.id || findedAirports}
              value={fields.traffic_direction}
              onChange={(e) => {
                setState((s) => {
                  return ({
                    ...s,
                    fields: {
                      ...s?.fields,
                      traffic_direction: e?.target?.value
                    }
                  })
                })
              }}
              options={radioOptions}
            />
          </Col>
        </Row>
      </Col>

      <Col>
        <Row gutter={[0, token?.marginXS]}>
          <Col>
            <Text><Text color="var(--colorError)">*</Text> <Text>{intl?.formatMessage({ id: "Number of passengers can process per officer" })}</Text>&nbsp;<Tooltip title={intl?.formatMessage({ id: "Number of passengers can process per officer tooltip" })}><QuestionCircleOutlined style={{ fontSize: "14px", color: "var(--colorIcon)" }} /></Tooltip></Text>
          </Col>
          <Col>
            <Input
              placeholder={intl?.formatMessage({ id: "Number of passengers" })}
              value={fields?.passengers_per_officer === undefined ? '' : fields?.passengers_per_officer}
              status={state?.error ? "error" : undefined}
              maxLength={8}
              onChange={(event) => {
                const inputValue = event.target.value;

                if (event?.target?.value === "") {
                  setState((f) => {
                    return ({
                      ...f,
                      fields: {
                        ...f?.fields,
                        passengers_per_officer: undefined
                      },
                      error: true
                    })
                  });
                } else if (/^\d*$/.test(inputValue)) {
                  setState((f) => {
                    return ({
                      ...f,
                      fields: {
                        ...f?.fields,
                        passengers_per_officer: Number(inputValue)
                      },
                      error: false
                    })
                  });
                }
              }}
            />
          </Col>
        </Row>
      </Col>

      <Col>
        <Row gutter={[token?.marginSM]}>
          <Col flex="none">
            <Button
              disabled={isFormEmpty || isFormDisabled || (createOfficerEfficiencyStatus === "pending") || (updateOfficerEfficiencyStatus === "pending")}
              icon={<FloppyDisk />}
              type={"primary"}
              onClick={async () => {
                let res = ''
                if (open?.id === undefined) {
                  res = await executeCreateOfficerEfficiency({ data: fields })
                } else {
                  res = await executeUpdateOfficerEfficiency({ data: fields })
                }
                if (res) {
                  messageApi.open({
                    type: 'success',
                    content: intl?.formatMessage({ id: 'Configuration saved successfully' }),
                  })
                  onClose(res);
                }
              }}
            >
              {intl?.formatMessage({ id: "Save" })}
            </Button>
          </Col>

          <Col flex="none">
            <Button
              onClick={() => {
                onClose()
              }}
              type="default"
            >
              {intl?.formatMessage({ id: "Cancel" })}
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

EfficiencyForm.propTypes = {
  airports: PropTypes.any,
  messageApi: PropTypes.any,
  onClose: PropTypes.func,
  open: PropTypes.any,
  records: PropTypes.any
}

const _initialFieldsAirportConf = {
  fields: {
    airport_code: undefined,
    shift_starting_time: "00:00:00",
    number_of_shifts: 3,
    airport_max_capacity: null,
    daily_staffed_gate_passenger_capacity: null
  }
}

function ShiftForm({ open, airports, messageApi, onClose }) {
  const themeVariables = useToken();
  const { token } = themeVariables;
  const [state, setState] = useState(_.cloneDeep(_initialFieldsAirportConf))
  const intl = useIntl();

  const { fields } = state;
  const { airport_code, shift_starting_time, number_of_shifts, airport_max_capacity, daily_staffed_gate_passenger_capacity } = fields;

  const {
    execute: executeCreateAirportConfiguration,
    // value: createAirportConfigurationValue,
    status: createAirportConfigurationStatus,
  } = useAsync({
    asyncFunction: createAirportConfiguration,
  });

  const {
    execute: executeUpdateAirportConfiguration,
    // value: updateAirportConfigurationValue,
    status: updateAirportConfigurationStatus,
  } = useAsync({
    asyncFunction: updateAirportConfiguration,
  });

  useEffect(() => {
    if (open?.id) {
      setState({
        fields: {
          ...open
        }
      })
    }
  }, [open])

  const isFormEmpty = airport_code === undefined || shift_starting_time === undefined || number_of_shifts === undefined || airport_max_capacity === undefined || daily_staffed_gate_passenger_capacity === undefined;
  let isFormDisabled = false

  if (open?.id !== undefined) {
    if (
      (open?.airport_code === fields?.airport_code)
      && (open?.shift_starting_time === fields?.shift_starting_time)
      && (open?.number_of_shifts === fields?.number_of_shifts)
      && (open?.airport_max_capacity === fields?.airport_max_capacity)
      && (open?.daily_staffed_gate_passenger_capacity === fields?.daily_staffed_gate_passenger_capacity)
    ) {
      isFormDisabled = true
    }
  }

  return (
    <Row gutter={[0, token?.margin]}>
      <Col>
        <Row gutter={[0, token?.marginXS]}>
          <Col>
            <Text><Text color="var(--colorError)">*</Text> {intl?.formatMessage({ id: "Airport Selection" })}</Text>&nbsp;<Tooltip title={intl?.formatMessage({ id: "Airport_Selection_tooltip_Shift_Configuration" })}><QuestionCircleOutlined style={{ fontSize: "14px", color: "var(--colorIcon)" }} /></Tooltip>
          </Col>
          <Col>
            <Select
              disabled={open?.id !== undefined}
              placeholder={intl?.formatMessage({ id: "Select" })}
              value={fields?.airport_code}
              onChange={(v) => {
                const _airport = airports?.find((airport) => airport?.airport_code === v)
                setState((val) => ({
                  ...val,
                  fields: {
                    ...val?.fields,
                    airport_code: _airport?.airport_code
                  }
                }))
              }}
              options={airports?.map((v) => ({ value: v?.airport_code, label: v?.airport_code }))}
            />
          </Col>
        </Row>
      </Col>

      <Col>
        <Row gutter={[0, token?.marginXS]}>
          <Col>
            <Text><Text color="var(--colorError)">*</Text> <Text>{intl?.formatMessage({ id: "Shift Starting Time" })}</Text></Text> &nbsp;<Tooltip title={intl?.formatMessage({ id: "Shift_Starting_Time_tooltip_Shift_Configuration" })}><QuestionCircleOutlined style={{ fontSize: "14px", color: "var(--colorIcon)" }} /></Tooltip>
          </Col>
          <Col>
            <TimePicker
              inputReadOnly
              size="large"
              allowClear={false}
              value={dayjs(shift_starting_time, "HH:mm:ss")}
              format='HH:mm:ss'
              onChange={(val, valString) => {
                setState((val) => ({
                  ...val,
                  fields: {
                    ...val?.fields,
                    shift_starting_time: valString
                  }
                }))
              }}
              style={{ width: "100%" }}
            />
          </Col>
        </Row>
      </Col>

      <Col>
        <Row gutter={[0, token?.marginXS]}>
          <Col>
            <Text><Text color="var(--colorError)">*</Text> <Text>{intl?.formatMessage({ id: "Number of Shifts" })}</Text></Text> &nbsp;
            {/* <Tooltip title={intl?.formatMessage({ id: "Shift_Count_tooltip_Shift_Configuration" })}><QuestionCircleOutlined style={{ fontSize: "14px", color: "var(--colorIcon)" }} /></Tooltip> */}
          </Col>
          <Col>
            <Select
              style={{ width: "100%" }}
              disabled
              value={number_of_shifts}
              onChange={(v) => {
                setState((f) => {
                  return ({
                    ...f,
                    fields: {
                      ...f?.fields,
                      number_of_shifts: v
                    }
                  })
                });
              }}
              options={[1, 2, 3]?.map((v) => ({ value: v, label: v }))}
            />
          </Col>
        </Row>
      </Col>

      <Col>
        <Row gutter={[0, token?.marginXS]}>
          <Col>
            <Text><Text color="var(--colorError)">*</Text> <Text>{intl?.formatMessage({ id: "Passengers Capacity" })}</Text></Text> &nbsp;<Tooltip title={intl?.formatMessage({ id: "Passenger_Capacity_tooltip_Shift_Configuration" })}><QuestionCircleOutlined style={{ fontSize: "14px", color: "var(--colorIcon)" }} /></Tooltip>
          </Col>
          <Col>
            <Input
              maxLength={8}
              placeholder={intl?.formatMessage({ id: "Number of passengers" })}
              value={airport_max_capacity === undefined ? '' : airport_max_capacity}
              status={state?.error ? "error" : undefined}
              onChange={(event) => {
                const inputValue = event.target.value;

                if (event?.target?.value === "") {
                  setState((f) => {
                    return ({
                      ...f,
                      fields: {
                        ...f?.fields,
                        airport_max_capacity: undefined
                      },
                      error: true,
                    })
                  });
                } else if (/^\d*$/.test(inputValue)) {
                  setState((f) => {
                    return ({
                      ...f,
                      fields: {
                        ...f?.fields,
                        airport_max_capacity: Number(inputValue)
                      },
                      error: false,
                    })
                  });
                }
              }}
            />
          </Col>
        </Row>
      </Col>

      <Col>
        <Row gutter={[0, token?.marginXS]}>
          <Col>
            <Text><Text color="var(--colorError)">*</Text> <Text>{intl?.formatMessage({ id: "Daily Staffed Gate Passengers Capacity" })}</Text></Text> &nbsp;<Tooltip title={intl?.formatMessage({ id: "Daily_Staffed_Gate_Passengers_Capacity_tooltip_Shift_Configuration" })}><QuestionCircleOutlined style={{ fontSize: "14px", color: "var(--colorIcon)" }} /></Tooltip>
          </Col>
          <Col>
            <Input
              maxLength={8}
              placeholder={intl?.formatMessage({ id: "Number of passengers" })}
              value={daily_staffed_gate_passenger_capacity === undefined ? '' : daily_staffed_gate_passenger_capacity}
              status={state?.error ? "error" : undefined}
              onChange={(event) => {
                const inputValue = event.target.value;

                if (event?.target?.value === "") {
                  setState((f) => {
                    return ({
                      ...f,
                      fields: {
                        ...f?.fields,
                        daily_staffed_gate_passenger_capacity: undefined
                      },
                      error: true,
                    })
                  });
                } else if (/^\d*$/.test(inputValue)) {
                  setState((f) => {
                    return ({
                      ...f,
                      fields: {
                        ...f?.fields,
                        daily_staffed_gate_passenger_capacity: Number(inputValue)
                      },
                      error: false,
                    })
                  });
                }
              }}
            />
          </Col>
        </Row>
      </Col>

      <Col>
        <Row gutter={[token?.marginSM]}>
          <Col flex="none">
            <Button
              disabled={isFormEmpty || isFormDisabled || (createAirportConfigurationStatus === "pending") || (updateAirportConfigurationStatus === "pending")}
              icon={<FloppyDisk />}
              type={"primary"}
              onClick={async () => {
                let res = ''
                if (open?.id === undefined) {
                  res = await executeCreateAirportConfiguration({ data: fields })
                } else {
                  res = await executeUpdateAirportConfiguration({ data: fields, airport_code: open?.airport_code })
                }
                if (res) {
                  messageApi.open({
                    type: 'success',
                    content: intl?.formatMessage({ id: 'Configuration saved successfully' }),
                  })
                  onClose(res);
                }
              }}
            >
              {intl?.formatMessage({ id: "Save" })}
            </Button>
          </Col>

          <Col flex="none">
            <Button onClick={() => { onClose() }} type="default">{intl?.formatMessage({ id: "Cancel" })}</Button>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

ShiftForm.propTypes = {
  airports: PropTypes.shape({
    find: PropTypes.func,
    map: PropTypes.func
  }),
  messageApi: PropTypes.shape({
    open: PropTypes.func
  }),
  onClose: PropTypes.func,
  open: PropTypes.shape({
    airport_code: PropTypes.any,
    airport_max_capacity: PropTypes.any,
    daily_staffed_gate_passenger_capacity: PropTypes.any,
    id: PropTypes.any,
    number_of_shifts: PropTypes.any,
    shift_starting_time: PropTypes.any
  })
}

function OfficerEfficiency({ configValue, modal }) {
  const themeVariables = useToken();
  const [store] = useContext(LocaleContext);
  const { token } = themeVariables;
  const [messageApi, contextHolder] = message.useMessage();
  const intl = useIntl();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const getResponsive = useResponsive();

  const isRtl = store?.projectTranslation === "ar";
  const {
    execute: executeGetOfficerEfficiencies,
    value: getOfficerEfficienciesValue,
    status: getOfficerEfficienciesStatus,
    setState: setConfigs
  } = useAsync({
    asyncFunction: getOfficerEfficiencies,
    immediate: true
  });

  const {
    execute: executeDeleteOfficerEfficiencies,
    // value: deleteOfficerEfficienciesValue,
    status: deleteOfficerEfficienciesStatus,
  } = useAsync({
    asyncFunction: deleteOfficerEfficiency,
  });

  const { airports } = configValue;
  function handleSetConfig(val) {
    setConfigs((v) => {
      return ({
        ...v,
        value: v?.value?.filter((_v) => _v?.id !== val?.id)
      })
    })
  }

  const handleModalConfirm = async (val) => {
    modal?.confirm({
      title: intl?.formatMessage({ id: "Are you sure want to Delete?" }),
      onOk: async () => {
        const res = await executeDeleteOfficerEfficiencies({ id: val?.id })
        if (res) {
          handleSetConfig(val)
          messageApi.open({
            type: 'success',
            content: intl?.formatMessage({ id: 'Configuration deleted successfully' }),
          })
        }
      }
    })
  }
  
  const columns = [
    {
      title: intl?.formatMessage({ id: "Configuration Name" }),
      dataIndex: "config_name",
      width: "280px",
      render: (timeString) => timeString || "-",
      sorter: (a, b) => {
        return a?.config_name?.localeCompare(b?.config_name);
      },
    },
    // {
    //   title: intl?.formatMessage({ id: "Description" }),
    //   dataIndex: "description",
    //   width: "230px",
    //   width: getResponsive({ default: "245px", mobile: "151px" }),
    //   render: (val) => val || "-"
    // },
    {
      title: intl?.formatMessage({ id: "Airport Name" }),
      dataIndex: "airport_code",
      render: (text) => text,
      sorter: (a, b) => {
        return a?.airport_code?.localeCompare(b?.airport_code);
      },
    },
    {
      title: intl?.formatMessage({ id: "Value" }),
      dataIndex: "passengers_per_officer",
      render: (text) => `1:${text}`
    },
    {
      title: intl?.formatMessage({ id: "Travel Type" }),
      dataIndex: "traffic_direction",
      render: (text) => text === "outgoing" ? intl?.formatMessage({ id: "Departure" }) : intl?.formatMessage({ id: "Arrival" })
    },
    {
      title: intl?.formatMessage({ id: "Action" }),
      width: "95px",
      fixed: 'right',
      render: (val) => (
        <Row align="middle">
          <Col
            style={{ cursor: "pointer" }}
            flex="none"
            onClick={() => {
              setIsDrawerOpen(val);
            }}
          >
            <Button
              ghost
              type="text"
              disabled={deleteOfficerEfficienciesStatus === "pending"}
              icon={<PencilSimpleLine />}
            />
          </Col>
          <Col
            style={{ cursor: "pointer" }}
            flex="none"
            onClick={async () => {
              await handleModalConfirm(val)
            }}
          >
            <Button
              ghost
              icon={<Trash />}
              type="text"
              disabled={deleteOfficerEfficienciesStatus === "pending"}
            />
          </Col>
        </Row>
      )
    },
  ]

  const isLoading = getOfficerEfficienciesStatus === "pending" || getOfficerEfficienciesStatus === "idle";

  const _airports = airports?.filter((v) => {
    const val = getOfficerEfficienciesValue?.filter((_v) => _v?.airport_code === v?.airport_code);
    return val?.length < 2
  })

  return (
    <Row isFullHeight>
      <Col isFlex>
        {contextHolder}
        <Drawer
          destroyOnClose
          width={getResponsive({ default: 400, mobile: "100%" })}
          placement={isRtl ? "left" : "right"}
          open={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false)
          }}
          title={intl?.formatMessage({ id: "Officers Efficiency" })}
        >
          <EfficiencyForm
            messageApi={messageApi}
            airports={_airports}
            records={getOfficerEfficienciesValue}
            open={isDrawerOpen}
            onClose={(val) => {
              setIsDrawerOpen(false)
              if (val) {
                executeGetOfficerEfficiencies()
              }
            }}
          />
        </Drawer>

        <Row
          backgroundColor="var(--colorBgContainer)"
          isFlexGrow
        >
          <Col
            isFlex
          >
            <Row
              gutter={token?.marginSM}
              wrap={false}
              isFullHeight
            >
              <Col isFlex flex={"auto"}>
                <Row align="start" justify="space-between">
                  <Col flex="none">
                    <Space
                      direction="vertical"
                      size={token?.marginXXS}
                    >
                      <Text strong>
                        {intl?.formatMessage({ id: "Officers Efficiency Configuration" })}
                      </Text>

                      <Text color="var(--colorTextDescription)">
                        {intl?.formatMessage({ id: "Configuring for peak performance" })}
                      </Text>
                    </Space>
                  </Col>
                  {
                    !!_airports?.length &&
                    <Col flex="none">
                      <Button
                        icon={<Plus />}
                        onClick={() => {
                          setIsDrawerOpen(true)
                        }}
                      >
                        {
                          getResponsive({ default: "true", mobile: "false" }) === "true" &&
                          intl?.formatMessage({ id: "Configuration" })
                        }
                      </Button>
                    </Col>
                  }
                </Row>

                <Row
                  style={{ marginTop: "var(--paddingSMPx)" }}
                  isFlexGrow
                >
                  <Col>
                    <Table
                      showSorterTooltip={false}
                      loading={isLoading}
                      style={{
                        width: "100%"
                      }}
                      scroll={{
                        x: getResponsive({ default: 960, midTablet: 960 })
                      }}
                      tableRowHoverBg="colorBgContainer"
                      columns={columns}
                      pagination={false}
                      dataSource={getOfficerEfficienciesValue}
                      borderRadiusOnSides="bottom"
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

OfficerEfficiency.propTypes = {
  configValue: PropTypes.any,
  modal: PropTypes.any
}

function ShiftConfiguration({ configValue, modal }) {
  const themeVariables = useToken();
  const { token } = themeVariables;
  const [messageApi, contextHolder] = message.useMessage();
  const intl = useIntl();
  const [store] = useContext(LocaleContext);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const getResponsive = useResponsive();

  const isRtl = store?.projectTranslation === "ar";

  const {
    execute: executeGetAirportConfigurations,
    value: getAirportConfigurationsValue,
    status: getAirportConfigurationsStatus,
    setState: setConfigs
  } = useAsync({
    asyncFunction: getAirportConfigurations,
    immediate: true
  });

  const {
    execute: executeDeleteAirportConfiguration,
    // value: deleteAirportConfigurationValue,
    status: deleteAirportConfigurationStatus,
  } = useAsync({
    asyncFunction: deleteAirportConfiguration,
  });

  const { airports } = configValue;

  const handleDelete = async (val) => {
    const res = await executeDeleteAirportConfiguration({ id: val?.airport_code })
    if (res) {
      setConfigs((v) => {
        return ({
          ...v,
          value: v?.value?.filter((_v) => _v?.id !== val?.id)
        })
      })
      messageApi.open({
        type: 'success',
        content: intl?.formatMessage({ id: `Configuration deleted successfully` }),
      })
    }
  }
  const columns = [
    {
      title: intl?.formatMessage({ id: "Airport Name" }),
      dataIndex: "airport_code",
      width: "150px",
      render: (text) => text,
      sorter: (a, b) => {
        return a?.airport_code?.localeCompare(b?.airport_code);
      },
    },
    {
      title: intl?.formatMessage({ id: "Shift Starting Time" }),
      dataIndex: "shift_starting_time",
      width: getResponsive({ default: "245px", mobile: "151px" })
    },
    {
      title: intl?.formatMessage({ id: "Number of Shifts" }),
      dataIndex: "number_of_shifts",
      width: getResponsive({ default: "245px", mobile: "151px" })
    },
    {
      title: intl?.formatMessage({ id: "Passenger Capacity" }),
      width: getResponsive({ default: "245px", mobile: "151px" }),
      render: (v) => (v?.airport_max_capacity !== undefined && v?.airport_max_capacity !== null) ? formatNumber(v?.airport_max_capacity) : "-"
    },
    {
      title: intl?.formatMessage({ id: "Daily Staffed Gate Passengers Capacity" }),
      width: getResponsive({ default: "300px", mobile: "auto" }),
      render: (v) => (v?.daily_staffed_gate_passenger_capacity !== undefined && v?.daily_staffed_gate_passenger_capacity !== null) ? formatNumber(v?.daily_staffed_gate_passenger_capacity) : "-"
    },
    {
      title: intl?.formatMessage({ id: "Action" }),
      width: "95px",
      fixed: "right",
      render: (val) => (
        <Row align="middle">
          <Col
            style={{ cursor: "pointer" }}
            flex="none"
            onClick={() => {
              setIsDrawerOpen(val);
            }}
          >
            <Button
              ghost
              type="text"
              disabled={getAirportConfigurationsStatus === "pending"}
              icon={<PencilSimpleLine />}
            />
          </Col>
          <Col
            style={{ cursor: "pointer" }}
            flex="none"
            onClick={async () => {
              modal?.confirm({
                title: intl?.formatMessage({ id: "Are you sure want to Delete?" }),
                onOk: async () => {
                  await handleDelete(val)
                }
              })
            }}
          >
            <Button
              ghost
              icon={<Trash />}
              type="text"
              disabled={deleteAirportConfigurationStatus === "pending"}
            />
          </Col>
        </Row>
      )
    },
  ]

  const isLoading = getAirportConfigurationsStatus === "pending" || getAirportConfigurationsStatus === "idle";

  const _airports = airports?.filter((v) => {
    return !getAirportConfigurationsValue?.find((_v) => v?.airport_code === _v?.airport_code)
  })

  return (
    <Row isFullHeight>
      <Col isFlex>
        {contextHolder}
        <Drawer
          placement={isRtl ? "left" : "right"}
          destroyOnClose
          width={getResponsive({ default: 400, mobile: "100%" })}
          open={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false)
          }}
          title={intl?.formatMessage({ id: "Airport Configuration" })}
        >
          <ShiftForm
            messageApi={messageApi}
            airports={_airports}
            open={isDrawerOpen}
            onClose={(val) => {
              setIsDrawerOpen(false)
              if (val) {
                executeGetAirportConfigurations()
              }
            }}
          />
        </Drawer>

        <Row
          backgroundColor="var(--colorBgContainer)"
          isFlexGrow
        >
          <Col
            isFlex
          >
            <Row
              gutter={token?.marginSM}
              wrap={false}
              isFullHeight
            >
              <Col isFlex flex={"auto"}>
                <Row align="start" justify="space-between">
                  <Col flex="none">
                    <Space
                      direction="vertical"
                      size={token?.marginXXS}
                    >
                      <Text strong>
                        {intl?.formatMessage({ id: "Airport Configuration" })}
                      </Text>
                    </Space>
                  </Col>
                  {
                    !!_airports?.length &&
                    <Col flex="none">
                      <Button
                        icon={<Plus />}
                        onClick={() => {
                          setIsDrawerOpen(true)
                        }}
                      >
                        {
                          getResponsive({ default: "true", mobile: "false" }) === "true" &&
                          intl?.formatMessage({ id: "Configuration" })
                        }
                      </Button>
                    </Col>
                  }
                </Row>

                <Row style={{ marginTop: "var(--paddingSMPx)" }} isFlexGrow>
                  <Col>
                    <Table
                      showSorterTooltip={false}
                      loading={isLoading}
                      scroll={{
                        x: getResponsive({ default: 960, midTablet: 960, mobile: 750 })
                      }}
                      tableRowHoverBg="colorBgContainer"
                      columns={columns}
                      pagination={false}
                      dataSource={getAirportConfigurationsValue}
                      borderRadiusOnSides="bottom"
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

ShiftConfiguration.propTypes = {
  configValue: PropTypes.any,
  modal: PropTypes.any
}

function Settings({ configValue }) {
  const themeVariables = useToken();
  const { token } = themeVariables;
  const intl = useIntl();
  const getResponsive = useResponsive();
  const [selectedMenu, setSelectedMenu] = useState("efficiency_configuration")
  const router = useRouter();

  return (
    <Row isFullHeight>
      <Col isFlex>
        <Row
          gutter={[0, token?.margin]}
        >
          <Col>
            <Breadcrumb
              items={[
                {
                  key: "home",
                  path: "/",
                  onClick: (e) => {
                    e?.preventDefault();
                    router.push("/");
                  },
                  title: (
                    <HomeOutlined />
                  ),
                },
                {
                  title: intl?.formatMessage({ id: "Settings" }),
                }
              ]}
            />
          </Col>

          <Col>
            <Row gutter={[0, 12]} align="middle" justify="space-between">
              <Col flex={getResponsive({ default: "none", mobile: "auto" })}>
                <Title level={5}>
                  {intl?.formatMessage({ id: "Basic Configuration" })}
                </Title>
              </Col>

              {
                getResponsive({ default: "false", midTablet: "true" }) === "true" && (
                  <Col
                    flex={getResponsive({ default: "none", mobile: "0 0 100%" })}
                  >
                    <Select
                      value={selectedMenu}
                      size="middle"
                      onChange={(e) => {
                        setSelectedMenu(e)
                      }}
                      style={{
                        width: getResponsive({ default: "360px", mobile: "100%" })
                      }}
                      options={[
                        {
                          value: "efficiency_configuration",
                          label: intl?.formatMessage({ id: "Efficiency Configuration" })
                        },
                        {
                          value: "shift_configuration",
                          label: intl?.formatMessage({ id: "Airport Configuration" })
                        }
                      ]}
                    />
                  </Col>
                )
              }
            </Row>
          </Col>
        </Row>


        <Row
          backgroundColor="var(--colorBgContainer)"
          isFlexGrow
          style={{
            marginTop: "var(--paddingPx)",
            borderRadius: "8px"
          }}
        >
          <Col
            paddingInline="var(--paddingPx)"
            paddingBlock="var(--paddingPx)"
            isFlex
          >
            <Row
              gutter={token?.marginSM}
              wrap={false}
              isFullHeight
            >
              {
                getResponsive({ default: "true", midTablet: "false" }) === "true" && (
                  <Col
                    flex="0 0 238px"
                  >
                    <Menu
                      mode="inline"
                      isBorderNone
                      itemMode="vertical"
                      className="settingsMenu"
                      backgroundColor="var(--colorBgContainer)"
                      isMenuTitleMarginNone={true}
                      theme="light"
                      selectedKeys={[selectedMenu]}
                      onSelect={(v) => {
                        setSelectedMenu(v?.key)
                      }}
                      items={[
                        {
                          label: <Text color="currentColor">{intl?.formatMessage({ id: "Efficiency Configuration" })}</Text>,
                          key: "efficiency_configuration",
                          style: {
                            color: "var(--colorText)",
                            display: "flex",
                            flexDirection: "row",
                            columnGap: "8px",
                            minHeight: "40px",
                            borderRadius: "8px",
                            ...selectedMenu === "efficiency_configuration" && ({
                              backgroundColor: token?.["Menu-custom"]?.controlItemBgActive,
                              color: token?.["Menu-custom"]?.colorPrimary,
                            }),
                          },
                          icon: <GearFine weight="bold" size={16} />
                        },
                        {
                          label: <Text color={"currentColor"}>{intl?.formatMessage({ id: "Airport Configuration" })}</Text>,
                          key: "shift_configuration",
                          icon: <Clock weight="bold" size={16} />,
                          style: {
                            color: "var(--colorText)",
                            display: "flex",
                            flexDirection: "row",
                            columnGap: "8px",
                            minHeight: "40px",
                            borderRadius: "8px",
                            ...selectedMenu === "shift_configuration" && ({
                              backgroundColor: token?.["Menu-custom"]?.controlItemBgActive,
                              color: token?.["Menu-custom"]?.colorPrimary,
                            }),
                          },
                        }
                      ]}
                    />
                  </Col>
                )
              }

              {
                getResponsive({ default: "true", midTablet: "false" }) === "true" && (
                  <Col flex="none">
                    <Divider style={{ height: "100%", marginInline: "var(--paddingXSPx)" }} type="vertical" />
                  </Col>
                )
              }

              <Col isFlex flex={"auto"}>
                <ModalMethod>
                  {
                    (modal) => (
                      <>
                        {
                          selectedMenu === "efficiency_configuration"
                            ? (
                              <OfficerEfficiency modal={modal} configValue={configValue} />
                            )
                            : (
                              <ShiftConfiguration modal={modal} configValue={configValue} />
                            )
                        }
                      </>
                    )
                  }
                </ModalMethod>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

Settings.propTypes = {
  configValue: PropTypes.any
}

export default Settings;