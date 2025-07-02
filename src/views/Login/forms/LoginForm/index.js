import { useState, useCallback, useEffect } from "react";
import moment from "moment";
import {
  Row,
  Col,
  Space,
  Title,
  Input,
  InputPassword,
  Button,
  Text,
  AntIcons,
  theme
} from "re-usable-design-components";
import { useIntl } from "react-intl";
import { useRouter } from "next/router";
import useAsync from "@/hooks/useAsync";
import Logo from "@/components/Logo";
import { signInApi } from "@/services/authService";
import StorageService from "../../../../services/storageService";
import jwt from 'jwt-decode';
import Link from "next/link";

const { UserOutlined } = AntIcons;
const { useToken } = theme;

function LoginForm() {
  const intl = useIntl();
  const themeVariables = useToken();
  const {
    execute: executeSignIn,
    status,
    value,
    // error,
  } = useAsync({ asyncFunction: signInApi });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();
  const [state, setState] = useState({
    userId: "",
    password: "",
    grantType: "password",
  });
  const [formMeta, setFormMeta] = useState({ isFormDirty: false });
  const [errors, setErrors] = useState({});
  const { margin } = themeVariables.token;
  useEffect(() => {
    if (value?.data) {
      const minutes = value?.data?.expires_in;
      StorageService.set('authorization', {
        ...value?.data,
        session_expires: moment().add(minutes, "minutes"),
      });
      if (value?.data?.access_token) {
        const details = jwt(value?.data?.access_token)
        StorageService.set('user_details', details);
      }
      router.push('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleValidate = useCallback((values = {}) => {
    const errors = {};
    if (!values?.userId?.trim()) {
      errors.userId = "Required";
    }
    if (!values?.password?.trim()) {
      errors.password = "Required";
    }
    return errors;
  }, []);

  const handleChange = useCallback(
    (e) => {
      setState((v) => {
        const newValues = {
          ...v,
          [e?.target?.name]: e?.target?.value,
        };

        if (formMeta?.isFormDirty) {
          const errors = handleValidate(newValues);
          setErrors(errors);
        }
        return newValues;
      });
    },
    [formMeta, handleValidate]
  );

  const handleSubmit = useCallback(() => {
    const errors = handleValidate(state);
    if (!formMeta?.isFormDirty) {
      setFormMeta({ isFormDirty: true });
    }
    if (Object.keys(errors)?.length) {
      setErrors(errors);
    } else {
      // invoke login api
      executeSignIn(state);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMeta, handleValidate, state]);

  function handleKeyUp(event) {
    if (event.keyCode === 13) {
      handleSubmit(event);
    }
  }

  useEffect(() => {
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keyup", handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <Space direction="vertical" size={margin}>
      
      <Logo />

      <Space direction="vertical" size={margin}>
        <Title level={5}>
          {intl.formatMessage({ id: "Login_into_your_account" })}
        </Title>

        <Space direction="vertical">
          <Row>
            <Col style={{ position: "relative" }}>
              <Space direction="vertical" size={0}>
                <Input
                  prefix={
                    <UserOutlined style={{ color: "var(--colorIcon)" }} />
                  }
                  value={state?.userId}
                  size="large"
                  name="userId"
                  placeholder={intl.formatMessage({ id: "Email" })}
                  onChange={handleChange}
                  {...(errors?.userId && {
                    status: "error",
                  })}
                />
                {errors?.userId && (
                  <Text
                    size="sm"
                    type="danger"
                    style={{ position: "absolute", left: 0 }}
                  >
                    {errors?.userId}
                  </Text>
                )}
              </Space>
            </Col>
          </Row>

          <Row>
            <Col>
              <Space direction="vertical" size={0}>
                <InputPassword
                  value={state?.password}
                  name="password"
                  size="large"
                  placeholder={intl.formatMessage({ id: "Password" })}
                  visibilityToggle={{
                    visible: passwordVisible,
                    onVisibleChange: setPasswordVisible,
                  }}
                  {...(errors?.password && {
                    status: "error",
                  })}
                  onChange={handleChange}
                />
                {errors?.password && (
                  <Text
                    size="sm"
                    type="danger"
                    style={{ position: "absolute", left: 0 }}
                  >
                    {errors?.password}
                  </Text>
                )}
              </Space>
            </Col>
          </Row>

          {/* <Space align="center">
            <Button
              type="link"
              onClick={toggleForm}
            >
              {intl.formatMessage({ id: "Forgot_password" })}
            </Button>
          </Space> */}
          <Button
            block
            disabled={status === "pending"}
            onClick={handleSubmit}
            size="large"
          >
            {intl.formatMessage({ id: "Login" })}
          </Button>
        </Space>
      </Space>
      
      <Row>
        <Col
          paddingBlock="var(--paddingLGPx) 0"
        >
          <Space direction="vertical" size={0}>
            <Space size={0}>
              <Text size="sm" color={"var(--colorTextDisabled)"}>
                {intl.formatMessage({ id: "Powered_by" })}
              </Text>
              &nbsp;
              <Link
                href={"https://saal.ai/"}
                target="_blank"
                style={{
                  textDecoration: 'none'
                }}
              >
                <Text underline size="sm" color={"var(--colorTextDisabled)"}>
                  Saal.ai
                </Text>
              </Link>
            </Space>
          </Space>
        </Col>
      </Row>
    </Space>
  );
}

export default LoginForm;
