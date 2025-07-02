import {Row, Col, PhosphorIcons} from "re-usable-design-components";
import Tabs from "@/components/Tabs";
import {useState, useContext, useEffect} from 'react';
import { useRouter } from "next/router";
import NewActiveResidence from "./NewActiveResidence";
import VisaHolders from "./VisaHolders";
import { getBorderTypeConfig } from "@/services/commonService";
import useAsync from "@/hooks/useAsync";

const { UsersFour, IdentificationCard } = PhosphorIcons;

// const {
//     value: borderTypeConfigValue,
//   } = useAsync({ asyncFunction: getBorderTypeConfig, immediate: true });



export default function NewActiveResidenceWrapper({emiratesConfigValue, nationalitiesConfigValue, nationalitiesConfigValueObj, residencyTypeValues}){

    const router= useRouter();

    const [selectedTab, setSelectedTab] = useState(router?.query?.type || "residence");

    useEffect(()=>{
        console.log('emiratesConfigValue from index ', emiratesConfigValue);
    },[emiratesConfigValue, nationalitiesConfigValue, nationalitiesConfigValueObj, residencyTypeValues])

    console.log('selected tab', selectedTab);
    console.log('nationalitiesConfigValue from indexx ', nationalitiesConfigValue);

    return (
        <div>
           <Row>
             <Col>
                 <Tabs
                 activeKey={selectedTab}
                 onChange={(v) => {
                    setSelectedTab(v);
                    router?.replace({
                      pathname: '/new-active-residence',
                      query: {
                        type: v
                      }
                    })
                  }}
                   items={
                    [
                        {
                         key: "residence",
                         label:(
                            <Row gutter={12}>
                                 <Col flex="none">
                                 <UsersFour size={16} />
                                 </Col>
                                 <Col flex="none">
                                   Residents
                                 </Col>
                            </Row>
                         )
                        },
                        {
                         key: "new-visa-holder",
                         label:(
                            <Row gutter={12}>
                                <Col flex="none">
                                <IdentificationCard size = {16} />
                                </Col>
                                <Col flex="none">
                                Visa Holders
                                </Col>
                            </Row>
                         )
                        }
                    ]
                   }
                 />
             </Col>
             <Col>
                  {
                    selectedTab == "residence" ? (
                         <NewActiveResidence
                         nationalitiesConfigValue={nationalitiesConfigValue}
                         nationalitiesConfigValueObj={nationalitiesConfigValueObj}
                        //  borderTypeConfigValue={borderTypeConfigValue}
                         emiratesConfigValue={emiratesConfigValue}
                         residencyTypeValues={residencyTypeValues}                      
                         />
                    )
                    :
                    (
                       <VisaHolders/>
                    )
                  }
             </Col>
           </Row>
        </div>
    )
}