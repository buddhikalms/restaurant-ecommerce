import { type DeliveryZoneType } from "prisma-generated-client-v2";

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type DeliveryZoneRule = {
  id: string;
  name: string;
  zoneType: DeliveryZoneType;
  centerLatitude: number | null;
  centerLongitude: number | null;
  radiusKm: number | null;
  polygonCoordinates: GeoPoint[];
  deliveryFee: number | null;
  minimumOrderAmount: number | null;
  freeDeliveryMinimum: number | null;
};

const EARTH_RADIUS_KM = 6371;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function calculateDistanceKm(origin: GeoPoint, destination: GeoPoint) {
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) * Math.sin(latitudeDelta / 2) +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) *
      Math.sin(longitudeDelta / 2);

  const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return EARTH_RADIUS_KM * centralAngle;
}

export function isPointInsidePolygon(point: GeoPoint, polygon: GeoPoint[]) {
  if (polygon.length < 3) {
    return false;
  }

  let inside = false;

  for (let index = 0, previousIndex = polygon.length - 1; index < polygon.length; previousIndex = index++) {
    const current = polygon[index];
    const previous = polygon[previousIndex];

    const intersects =
      current.longitude > point.longitude !== previous.longitude > point.longitude &&
      point.latitude <
        ((previous.latitude - current.latitude) * (point.longitude - current.longitude)) /
          (previous.longitude - current.longitude) +
          current.latitude;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

export function matchesDeliveryZone(zone: DeliveryZoneRule, point: GeoPoint) {
  if (zone.zoneType === "RADIUS") {
    if (
      zone.centerLatitude === null ||
      zone.centerLongitude === null ||
      zone.radiusKm === null
    ) {
      return {
        matches: false,
        distanceKm: null,
      };
    }

    const distanceKm = calculateDistanceKm(
      {
        latitude: zone.centerLatitude,
        longitude: zone.centerLongitude,
      },
      point,
    );

    return {
      matches: distanceKm <= zone.radiusKm,
      distanceKm,
    };
  }

  return {
    matches: isPointInsidePolygon(point, zone.polygonCoordinates),
    distanceKm: null,
  };
}

