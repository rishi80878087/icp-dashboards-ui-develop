import { useEffect } from "react";
import {
  Row,
  Col,
  // theme,
} from "re-usable-design-components";
import { useRouter } from "next/router";
import getConfig from "next/config";
import { signIn } from "next-auth/react";
import LoginForm from "./forms/LoginForm";

const { publicRuntimeConfig } = getConfig();
const { KEYCLOAK_ENABLED } = publicRuntimeConfig;

export default function LoginSection() {
  const router = useRouter();

  useEffect(() => {
    if (KEYCLOAK_ENABLED === "true") {
      signIn("keycloak", {
        callbackUrl: `/${
          router.asPath.split("?")[1] ? `?${router.asPath.split("?")[1]}` : ""
        }`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  if (KEYCLOAK_ENABLED === "true") {
    return null;
  }

  return (
    <Row justify="center" backgroundColor="var(--colorBgContainer)" isFullHeight>
      <Col
        flex={"500px"}
        paddingInline="var(--paddingXXXLPx)"
        textAlign="center"
        isFlex
        justifyContent="center"
      >
        <LoginForm /> 
      </Col>
    </Row>
  );
}
