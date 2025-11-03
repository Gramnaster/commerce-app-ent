import { usePhilippineAddress } from '../utils';

interface PhilippineAddressFieldsProps {
  initialRegion?: string;
  initialProvince?: string;
  initialCity?: string;
  initialBarangay?: string;
  onAddressChange: (field: string, value: string) => void;
  errors?: {
    region?: string;
    city?: string;
    barangay?: string;
  };
  inputClassName?: string;
}

const PhilippineAddressFields = ({
  initialRegion = '',
  initialProvince = '',
  initialCity = '',
  initialBarangay = '',
  onAddressChange,
  errors = {},
  inputClassName = '',
}: PhilippineAddressFieldsProps) => {
  const {
    regions,
    filteredProvinces,
    filteredCities,
    filteredBarangays,
    selectedRegion,
    selectedProvince,
    selectedCity,
    selectedBarangay,
    handleRegionChange,
    handleProvinceChange,
    handleCityChange,
    handleBarangayChange,
    loading,
  } = usePhilippineAddress({
    initialRegion,
    initialProvince,
    initialCity,
    initialBarangay,
    onAddressChange,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span className="loading loading-spinner loading-md"></span>
        <span className="ml-2 text-white">Loading address data...</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Region */}
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Region <span className="text-red-500">*</span>
        </label>
        <select
          name="region"
          value={selectedRegion}
          onChange={(e) => handleRegionChange(e.target.value)}
          className={`w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent ${inputClassName} ${
            errors.region ? 'border-red-500' : ''
          }`}
          required
        >
          <option value="">Choose Region</option>
          {regions.map((region) => (
            <option key={region.region_code} value={region.region_code}>
              {region.region_name}
            </option>
          ))}
        </select>
        {errors.region && (
          <p className="mt-1 text-sm text-red-500">{errors.region}</p>
        )}
      </div>

      {/* Province */}
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Province <span className="text-red-500">*</span>
        </label>
        <select
          name="province"
          value={selectedProvince}
          onChange={(e) => handleProvinceChange(e.target.value)}
          className={`w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent ${inputClassName}`}
          disabled={!selectedRegion || filteredProvinces.length === 0}
          required
        >
          <option value="">
            {!selectedRegion
              ? 'Select a region first'
              : filteredProvinces.length === 0
              ? 'No provinces available'
              : 'Choose Province'}
          </option>
          {filteredProvinces.map((province) => (
            <option key={province.province_code} value={province.province_code}>
              {province.province_name}
            </option>
          ))}
        </select>
      </div>

      {/* City/Municipality */}
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          City/Municipality <span className="text-red-500">*</span>
        </label>
        <select
          name="city"
          value={selectedCity}
          onChange={(e) => handleCityChange(e.target.value)}
          className={`w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent ${inputClassName} ${
            errors.city ? 'border-red-500' : ''
          }`}
          disabled={!selectedProvince || filteredCities.length === 0}
          required
        >
          <option value="">
            {!selectedProvince
              ? 'Select a province first'
              : filteredCities.length === 0
              ? 'No cities available'
              : 'Choose City/Municipality'}
          </option>
          {filteredCities.map((city) => (
            <option key={city.city_code} value={city.city_code}>
              {city.city_name}
            </option>
          ))}
        </select>
        {errors.city && (
          <p className="mt-1 text-sm text-red-500">{errors.city}</p>
        )}
      </div>

      {/* Barangay */}
      <div>
        <label className="block text-white text-sm font-medium mb-2">
          Barangay <span className="text-red-500">*</span>
        </label>
        <select
          name="barangay"
          value={selectedBarangay}
          onChange={(e) => handleBarangayChange(e.target.value)}
          className={`w-full bg-white border border-gray-600 rounded-lg p-3 text-black focus:ring-2 focus:ring-[#5290ca] focus:border-transparent ${inputClassName} ${
            errors.barangay ? 'border-red-500' : ''
          }`}
          disabled={!selectedCity || filteredBarangays.length === 0}
          required
        >
          <option value="">
            {!selectedCity
              ? 'Select a city first'
              : filteredBarangays.length === 0
              ? 'No barangays available'
              : 'Choose Barangay'}
          </option>
          {filteredBarangays.map((barangay) => (
            <option key={barangay.brgy_code} value={barangay.brgy_code}>
              {barangay.brgy_name}
            </option>
          ))}
        </select>
        {errors.barangay && (
          <p className="mt-1 text-sm text-red-500">{errors.barangay}</p>
        )}
      </div>
    </div>
  );
};

export default PhilippineAddressFields;
