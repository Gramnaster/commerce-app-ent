import { useState, useEffect, useMemo } from 'react';
import regionsData from '../assets/data/philippines/region.json';
import provincesData from '../assets/data/philippines/province.json';
import citiesData from '../assets/data/philippines/city.json';
import barangaysData from '../assets/data/philippines/barangay.json';

interface Region {
  id: number;
  psgc_code: string;
  region_name: string;
  region_code: string;
}

interface Province {
  province_code: string;
  province_name: string;
  psgc_code: string;
  region_code: string;
}

interface City {
  city_code: string;
  city_name: string;
  province_code: string;
  psgc_code: string;
  region_desc: string;
}

interface Barangay {
  brgy_code: string;
  brgy_name: string;
  city_code: string;
  province_code: string;
  region_code: string;
}

interface UsePhilippineAddressProps {
  initialRegion?: string;
  initialProvince?: string;
  initialCity?: string;
  initialBarangay?: string;
  onAddressChange: (field: string, value: string) => void;
}

export const usePhilippineAddress = ({
  initialRegion = '',
  initialProvince = '',
  initialCity = '',
  initialBarangay = '',
  onAddressChange,
}: UsePhilippineAddressProps) => {
  const [loading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedProvince, setSelectedProvince] = useState(initialProvince);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedBarangay, setSelectedBarangay] = useState(initialBarangay);

  const regions: Region[] = regionsData;
  const provinces: Province[] = provincesData;
  const cities: City[] = citiesData;
  const barangays: Barangay[] = barangaysData as Barangay[];

  // Filter provinces based on selected region
  const filteredProvinces = useMemo(() => {
    if (!selectedRegion) return [];
    return provinces.filter((province) => province.region_code === selectedRegion);
  }, [selectedRegion, provinces]);

  // Filter cities based on selected province
  const filteredCities = useMemo(() => {
    if (!selectedProvince) return [];
    return cities.filter((city) => city.province_code === selectedProvince);
  }, [selectedProvince, cities]);

  // Filter barangays based on selected city
  const filteredBarangays = useMemo(() => {
    if (!selectedCity) return [];
    return barangays.filter((barangay) => barangay.city_code === selectedCity);
  }, [selectedCity, barangays]);

  const handleRegionChange = (regionCode: string) => {
    setSelectedRegion(regionCode);
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedBarangay('');
    
    const region = regions.find((r) => r.region_code === regionCode);
    onAddressChange('region', region?.region_name || '');
    onAddressChange('province', '');
    onAddressChange('city', '');
    onAddressChange('barangay', '');
  };

  const handleProvinceChange = (provinceCode: string) => {
    setSelectedProvince(provinceCode);
    setSelectedCity('');
    setSelectedBarangay('');
    
    const province = provinces.find((p) => p.province_code === provinceCode);
    onAddressChange('province', province?.province_name || '');
    onAddressChange('city', '');
    onAddressChange('barangay', '');
  };

  const handleCityChange = (cityCode: string) => {
    setSelectedCity(cityCode);
    setSelectedBarangay('');
    
    const city = cities.find((c) => c.city_code === cityCode);
    onAddressChange('city', city?.city_name || '');
    onAddressChange('barangay', '');
  };

  const handleBarangayChange = (barangayCode: string) => {
    setSelectedBarangay(barangayCode);
    
    const barangay = barangays.find((b) => b.brgy_code === barangayCode);
    onAddressChange('barangay', barangay?.brgy_name || '');
  };

  // Initialize on mount if initial values are provided
  useEffect(() => {
    if (initialRegion) setSelectedRegion(initialRegion);
    if (initialProvince) setSelectedProvince(initialProvince);
    if (initialCity) setSelectedCity(initialCity);
    if (initialBarangay) setSelectedBarangay(initialBarangay);
  }, [initialRegion, initialProvince, initialCity, initialBarangay]);

  return {
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
  };
};
