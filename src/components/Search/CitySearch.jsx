import React from "react";
import Select from "react-select";

const CitySearch = ({ cities, selectedCityId, setSelectedCityId }) => {
  const options = cities.map((city) => ({
    value: city.id.toString(),
    label: city.name,
  }));

  const selected = options.find((opt) => opt.value === selectedCityId);

  return (
    <Select
      options={options}
      value={selected}
      onChange={(opt) => setSelectedCityId(opt.value)}
      placeholder="Search and select a city..."
      className="w-[30vw]"
    />
  );
};

export default CitySearch;
