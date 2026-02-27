export const MIN_LATITUDE = -90;
export const MAX_LATITUDE = 90;
export const MIN_LONGITUDE = -180;
export const MAX_LONGITUDE = 180;

export function isValidLatitude(value: number): boolean {
  return Number.isFinite(value) && value >= MIN_LATITUDE && value <= MAX_LATITUDE;
}

export function isValidLongitude(value: number): boolean {
  return Number.isFinite(value) && value >= MIN_LONGITUDE && value <= MAX_LONGITUDE;
}

export function hasValidCoordinates(latitude: number, longitude: number): boolean {
  return isValidLatitude(latitude) && isValidLongitude(longitude);
}
