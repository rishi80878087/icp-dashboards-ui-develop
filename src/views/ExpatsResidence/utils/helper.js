import { PhosphorIcons } from "re-usable-design-components";

const { GenderMale, GenderFemale, GenderIntersex } = PhosphorIcons;

export const getGenderOptions = (intl, themeVariables, hideIcon = false) => {
  return [
    {
      label: <span style={{ minWidth: "97px" }}>{intl?.formatMessage({ id: "All Gender" })}</span>,
      value: "all",
      icon: hideIcon ? null : <GenderIntersex size={themeVariables?.token?.iconSizeXSM} weight="bold" />,
      apiKey: 'All'
    },
    {
      label: intl?.formatMessage({ id: "Male" }),
      value: "male",
      icon: hideIcon ? null : <GenderMale size={themeVariables?.token?.iconSizeXSM} weight="bold" />,
      apiKey: 'Male',
    },
    {
      label: intl?.formatMessage({ id: "Female" }),
      value: "female",
      icon: hideIcon ? null : <GenderFemale size={themeVariables?.token?.iconSizeXSM} weight="bold" />,
      apiKey: 'Female',
    },
  ];
};
