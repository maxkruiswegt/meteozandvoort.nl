/**
 * Converts wind direction in degrees to a compass direction.
 *
 * @param {number} degrees - The wind direction in degrees.
 * @returns {string} The compass direction corresponding to the given degrees.
 */
const convertWindDirection = (degrees) => {
  const directions = [
    'Noord',
    'Noordoost',
    'Oost',
    'Zuidoost',
    'Zuid',
    'Zuidwest',
    'West',
    'Noordwest',
  ];
  return directions[Math.round(degrees / 45) % 8];
};

/**
 * Converts a temperature from Fahrenheit to Celsius.
 *
 * @param {number} fahrenheit - The temperature in Fahrenheit.
 * @returns {number} The temperature converted to Celsius.
 */
const convertFahrenheitToCelsius = (fahrenheit) => {
  return ((fahrenheit - 32) * 5) / 9;
};

/**
 * Converts speed from miles per hour (mph) to kilometers per hour (km/h).
 *
 * @param {number} mph - The speed in miles per hour.
 * @returns {number} The speed in kilometers per hour.
 */
const convertMphToKmh = (mph) => {
  return mph * 1.609344;
};

/**
 * Converts wind speed from miles per hour (mph) to the Beaufort wind scale.
 *
 * @param {number} mph - The wind speed in miles per hour.
 * @returns {Object} An object containing the Beaufort scale value and its description.
 * @returns {number} return.value - The Beaufort scale value.
 * @returns {string} return.description - The description of the wind speed.
 */
const convertMphToWindScale = (mph) => {
  switch (true) {
    case mph < 1:
      return { value: 0, description: 'stil' };
    case mph < 4:
      return { value: 1, description: 'licht' };
    case mph < 8:
      return { value: 2, description: 'licht' };
    case mph < 13:
      return { value: 3, description: 'matig' };
    case mph < 19:
      return { value: 4, description: 'matig' };
    case mph < 25:
      return { value: 5, description: 'vrij krachtig' };
    case mph < 32:
      return { value: 6, description: 'krachtig' };
    case mph < 39:
      return { value: 7, description: 'hard' };
    case mph < 47:
      return { value: 8, description: 'stormachtig' };
    case mph < 55:
      return { value: 9, description: 'storm' };
    case mph < 64:
      return { value: 10, description: 'zware storm' };
    case mph < 73:
      return { value: 11, description: 'zeer zware storm' };
    default:
      return { value: 12, description: 'orkaan' };
  }
};

/**
 * Converts a pressure value from inches of mercury (inHg) to millibars (mb).
 *
 * @param {number} inches - The pressure value in inches of mercury.
 * @returns {number} The pressure value in millibars.
 */
const convertInchesOfMercuryToMillibar = (inches) => {
  return inches * 33.8639;
};

export {
  convertWindDirection,
  convertFahrenheitToCelsius,
  convertMphToKmh,
  convertMphToWindScale,
  convertInchesOfMercuryToMillibar,
};
