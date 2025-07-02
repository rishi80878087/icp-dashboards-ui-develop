export const getGenderOptions = (intl) => {
  return [
    {
      label: intl?.formatMessage({ id: "Male" }),
      value: "Male",
    },
    {
      label: intl?.formatMessage({ id: "Female" }),
      value: "Female",
    },
    // {
    //   label: intl?.formatMessage({ id: "Others" }),
    //   value: "Others",
    // },
  ];
};

export const getAgeOptions = () => {
  return [
    {
      value: "31-35",
      label: "31-35",
    },
    {
      value: "61-65",
      label: "61-65",
    },
    {
      value: "46-50",
      label: "46-50",
    },
    {
      value: "91+",
      label: "91+",
    },
    {
      value: "71-75",
      label: "71-75",
    },
    {
      value: "86-90",
      label: "86-90",
    },
    {
      value: "56-60",
      label: "56-60",
    },
    {
      value: "16-20",
      label: "16-20",
    },
    {
      value: "36-40",
      label: "36-40",
    },
    {
      value: "41-45",
      label: "41-45",
    },
    {
      value: "26-30",
      label: "26-30",
    },
    {
      value: "81-85",
      label: "81-85",
    },
    {
      value: "6-10",
      label: "6-10",
    },
    {
      value: "66-70",
      label: "66-70",
    },
    {
      value: "0-5",
      label: "0-5",
    },
    {
      value: "51-55",
      label: "51-55",
    },
    {
      value: "76-80",
      label: "76-80",
    },
    {
      value: "11-15",
      label: "11-15",
    },
    {
      value: "21-25",
      label: "21-25",
    },
  ];
};
