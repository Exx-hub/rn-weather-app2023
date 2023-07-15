import { View, Text, SafeAreaView, Image, TouchableOpacity, ScrollView } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { theme } from "../theme";
import { TextInput } from "react-native";

import { MagnifyingGlassIcon } from "react-native-heroicons/outline";
import { CalendarDaysIcon, MapPinIcon } from "react-native-heroicons/solid";

import { debounce } from "lodash";
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "../constants";

import * as Progress from "react-native-progress";
import { getData, storeData } from "../utils/asyncStorage";

const HomeScreen = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});

  const [isLoading, setIsLoading] = useState(true);

  const { current, location } = weather;

  const handleLocation = async (loc) => {
    console.log(loc);

    const { name } = loc;

    if (name) {
      setIsLoading(true);
      setLocations([]);
      setShowSearch(false);

      const fetchedData = await fetchWeatherForecast(name, "7");

      console.log("fetched forecast:", fetchedData);

      setWeather(fetchedData);
      setIsLoading(false);
      await storeData("cityName", name);
    }
  };

  const handleSearch = async (value) => {
    console.log("value", value);

    if (value.length > 2) {
      const fetchedData = await fetchLocations(value);
      console.log("fetched locations:", fetchedData);

      setLocations(fetchedData);
    }
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const fetchDataOnAppLoad = async () => {
    let lastCity = await getData("cityName");

    let defaultCity = "Manila";

    if (lastCity) {
      defaultCity = lastCity;
    }

    const data = await fetchWeatherForecast(lastCity, "7");
    setWeather(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDataOnAppLoad();
  }, []);

  return (
    <View className="relative flex-1">
      <StatusBar style="light" />
      <Image
        blurRadius={70}
        source={require("../assets/images/bg.png")}
        className="absolute w-full h-full"
      />

      {!isLoading ? (
        <SafeAreaView className="flex flex-1">
          {/* SEARCH SECTION VIEW */}
          <View style={{ height: "7%" }} className="mx-4 relative z-50">
            {/* search input  */}
            <View
              className="flex-row justify-end items-center rounded-full"
              style={{ backgroundColor: showSearch ? theme.bgWhite(0.2) : "transparent" }}
            >
              {showSearch ? (
                <TextInput
                  onChangeText={handleTextDebounce}
                  placeholder="Search city"
                  placeholderTextColor="lightgray"
                  className="pl-6 h-10 flex-1 text-white"
                />
              ) : null}

              <TouchableOpacity
                style={{ backgroundColor: theme.bgWhite(0.3) }}
                className="rounded-full p-3 m-1"
                onPress={() => setShowSearch(!showSearch)}
              >
                <MagnifyingGlassIcon size={18} color="white" />
              </TouchableOpacity>
            </View>
            {/* autocomplete suggestions  */}
            {locations.length > 0 && showSearch ? (
              <View className="absolute w-full bg-gray-300 top-16 rounded-3xl">
                {locations.map((loc, i) => {
                  let showBorder = i + 1 !== locations.length;
                  let borderClass = showBorder ? "border-b-2 border-b-gray-400" : "";

                  return (
                    <TouchableOpacity
                      key={loc.id}
                      onPress={() => handleLocation(loc)}
                      className={`flex-row items-center border-0 p-3 px-4 mb-1 ${borderClass}`}
                    >
                      <MapPinIcon size={20} color="gray" />
                      <Text className="text-black text-base ml-2">
                        {loc.name}, {loc.country}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>

          {/* FORECAST SECTION VIEW  */}
          <View className="mx-4 flex-1 justify-around mb-2">
            {/* location  */}
            <Text className="text-white text-center text-2xl font-bold">
              {location?.name},
              <Text className="text-gray-300 text-lg font-semiboldbold"> {location?.country}</Text>
            </Text>

            {/* weather icon  */}
            <View className="flex-row justify-center">
              <Image source={weatherImages[current?.condition?.text]} className="h-52 w-52" />
            </View>

            {/* temperature and weather desc */}
            <View className="space-y-2">
              <Text className="text-center font-bold text-white text-6xl ml-5">
                {current?.temp_c}&#176;
              </Text>
              <Text className="text-center text-white text-xl tracking-widest">
                {current?.condition?.text}
              </Text>
            </View>

            {/* more stats  */}
            <View className="flex-row justify-between mx-4">
              <View className="flex-row space-x-2 items-center">
                <Image source={require("../assets/icons/wind.png")} className="h-6 w-6" />
                <Text className="text-white font-semibold text-base">{current?.wind_kph}km</Text>
              </View>

              <View className="flex-row space-x-2 items-center">
                <Image source={require("../assets/icons/drop.png")} className="h-6 w-6" />
                <Text className="text-white font-semibold text-base">{current?.humidity}%</Text>
              </View>

              <View className="flex-row space-x-2 items-center">
                <Image source={require("../assets/icons/sun.png")} className="h-6 w-6" />
                <Text className="text-white font-semibold text-base">
                  {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                </Text>
              </View>
            </View>
          </View>

          {/* NEXT DAYS FORECAST SECTION VIEW  */}

          <View className="mb-2 space-y-3">
            <View className="flex-row items-center mx-5 space-x-2">
              <CalendarDaysIcon size="22" color="white" />
              <Text className="text-base text-white">Daily Forecast</Text>
            </View>
            <ScrollView
              horizontal
              contentContainerStyle={{ paddingHorizontal: 15 }}
              showsHorizontalScrollIndicator={false}
            >
              {weather?.forecast?.forecastday?.map((item, index) => {
                const date = new Date(item.date);
                const options = { weekday: "long" };
                let dayName = date.toLocaleDateString("en-US", options);
                dayName = dayName.split(",")[0];

                return (
                  <View
                    key={item.date}
                    className="justify-center items-center w-24 rounded-3xl py-3 space-y-1 mr-4"
                    style={{ backgroundColor: theme.bgWhite(0.15) }}
                  >
                    <Image
                      source={weatherImages[item?.day?.condition?.text]}
                      className="h-11 w-11"
                    />
                    <Text className="text-white">{dayName}</Text>
                    <Text className="text-white text-xl font-semibold">
                      {item?.day?.avgtemp_c}&#176;
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </SafeAreaView>
      ) : (
        <View className="flex-1 flex-row justify-center items-center">
          <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
        </View>
      )}
    </View>
  );
};

export default HomeScreen;
