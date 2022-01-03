import {
  html
} from "lit-element";

import {getUnit, getWindDirections, numFormat} from "./ha-cwc-utils" ;
import {Current, Forecast, ITerms} from "./types";
import {HomeAssistant} from "custom-card-helpers/dist";

/**
 *
 * @param entity_min
 * @param entity_unit_min
 * @param entity_max
 * @param entity_unit_max
 * @param icon
 * @private
 */
const _renderPresentDouble = (entity_min, entity_unit_min, entity_max, entity_unit_max, icon:string) => {
  return((undefined !== entity_min) || (undefined !== entity_max) ? html`
    <li>
      <ha-icon icon="${icon}"></ha-icon>${undefined !== entity_min ? entity_min : "Na"} ${entity_unit_min} /
          <b>${undefined !== entity_max ? entity_max : "Na"} ${entity_unit_max}</b>
    </li>
  ` : "") ;
} ;

const _renderPresentSingle = (entity, entity_unit, icon:string) => {
  return(html`
    <li>
      <ha-icon icon="${icon}"></ha-icon>${undefined !== entity ? entity : "Na"} ${entity_unit}
    </li>
  `) ;
} ;

/**
 *
 * @param hass
 * @param currentCfg
 * @param forecastCfg
 * @param language
 * @param terms
 * @param border
 */
export const renderPresent = (hass: HomeAssistant, currentCfg: Current, forecastCfg: Forecast, language: string, terms: ITerms, border: boolean) => {
  let temperature_high, temperature_low, precipitation_probability, precipitation_intensity ;
  let next_rising, next_setting;

  const lang = language || hass.selectedLanguage || hass.language ;

  let sun = currentCfg.sun ? hass.states[currentCfg.sun] : undefined;
  if (sun) {
    next_rising = new Date(sun.attributes.next_rising);
    next_setting = new Date(sun.attributes.next_setting);
    //console.log( "now:" + (new Date()).toLocaleTimeString() + " next_rising:" + next_rising.toLocaleTimeString() ) ;
  }

  if (currentCfg.forecast) {
    let temp_high = forecastCfg.temperature_high
      ? Object.entries(forecastCfg.temperature_high) : undefined;
    let temp_low = forecastCfg.temperature_low
      ? Object.entries(forecastCfg.temperature_low) : undefined;
    let prec_probability = forecastCfg.precipitation_probability
      ? Object.entries(forecastCfg.precipitation_probability) : undefined;
    let prec_intensity = forecastCfg.precipitation_intensity
      ? Object.entries(forecastCfg.precipitation_intensity) : undefined;

    // @ts-ignore
    temperature_high = Object.isSet(temp_high) && Object.isSet(hass.states[temp_high[0][1]])
      ? numFormat(hass.states[temp_high[0][1]].state, 0) : undefined;
    // @ts-ignore
    temperature_low = Object.isSet(temp_low) && Object.isSet(hass.states[temp_low[0][1]])
      ? numFormat(hass.states[temp_low[0][1]].state, 0) : undefined;
    // @ts-ignore
    precipitation_probability = Object.isSet(prec_probability) && Object.isSet(hass.states[prec_probability[0][1]])
      ? numFormat(hass.states[prec_probability[0][1]].state, 0) : undefined;
    // @ts-ignore
    precipitation_intensity = Object.isSet(prec_intensity) && Object.isSet(hass.states[prec_intensity[0][1]])
      ? numFormat(hass.states[prec_intensity[0][1]].state, 0) : undefined;
  }

  // @ts-ignore
  let precipitation: number = Object.isSet(currentCfg.precipitation) && Object.isSet(hass.states[currentCfg.precipitation])
    ? numFormat(hass.states[currentCfg.precipitation].state, 0) : undefined ;
  // @ts-ignore
  let humidity: number = Object.isSet(currentCfg.humidity) && Object.isSet(hass.states[currentCfg.humidity])
    ? numFormat(hass.states[currentCfg.humidity].state, 0) : undefined ;
  // @ts-ignore
  let wind_bearing: number = Object.isSet(currentCfg.wind_bearing) && Object.isSet(hass.states[currentCfg.wind_bearing])
    ? numFormat(hass.states[currentCfg.wind_bearing].state) : undefined ;
  // @ts-ignore
  let wind_speed: number = Object.isSet(currentCfg.wind_speed) && Object.isSet(hass.states[currentCfg.wind_speed])
    ? numFormat(hass.states[currentCfg.wind_speed].state) : undefined ;
  // @ts-ignore
  let pressure: number = Object.isSet(currentCfg.pressure) && Object.isSet(hass.states[currentCfg.pressure])
    ? numFormat(hass.states[currentCfg.pressure].state, 0) : undefined ;
  // @ts-ignore
  let visibility: number = Object.isSet(currentCfg.visibility) && Object.isSet(hass.states[currentCfg.visibility])
    ? numFormat(hass.states[currentCfg.visibility].state, 0) : undefined ;

  return html`
    <ul class="variations ${border ? "spacer" : ""}">
        ${void 0 !== typeof precipitation_probability || void 0 !== typeof precipitation_intensity 
          ? _renderPresentDouble( precipitation_probability, '%', 
                                  precipitation_intensity, getUnit(hass,"precipitation") + '/h', 
                            'mdi:weather-rainy') : ""}
        ${currentCfg.forecast && (undefined !== temperature_low || undefined !== temperature_high)
          ? _renderPresentDouble( temperature_low, '',
                                  temperature_high, getUnit(hass,"temperature"),
                            'mdi:thermometer') : ""}
        ${undefined !== precipitation && precipitation > 0 ? html`
          <li>
            <ha-icon icon="mdi:weather-rainy"></ha-icon>${precipitation}
            <span class="unit"> ${getUnit(hass,"precipitation")}/h</span>
          </li>
          <li><ha-icon icon="none"></ha-icon><span class="unit"></span></li>
        ` : ""}            
        ${undefined !== pressure ? _renderPresentSingle(
          pressure, getUnit(hass,"air_pressure"), 'mdi:gauge') : ""}
        ${undefined !== humidity ? _renderPresentSingle(
          humidity, '%', 'mdi:water-percent') : ""}
        ${undefined !== visibility ? _renderPresentSingle(
          visibility, getUnit(hass,"length"), 'mdi:weather-fog') : ""}
        ${(!!wind_speed) || (!!wind_bearing) ? html`
          <li>
            <ha-icon icon="mdi:weather-windy"></ha-icon> ${getWindDirections(wind_bearing, terms.windDirections)} ${wind_speed}
            <span class="unit">${getUnit(hass,"wind_speed")}/h</span>
          </li>
        ` : ""}        
        ${undefined !== next_rising ? _renderPresentSingle(
          next_rising.toLocaleTimeString(language), '', 'mdi:weather-sunset-up') : ""}               
        ${undefined !== next_setting ? _renderPresentSingle(
          next_setting.toLocaleTimeString(language), '', 'mdi:weather-sunset-down') : ""}           
    </ul>
  `;
} ;

