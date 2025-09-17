function calcularCentroide(coords: number[][]) {
  let x = 0,
    y = 0;

  coords.forEach(([long, lat]) => {
    x += long;
    y += lat;
  });

  return [x / coords.length, y / coords.length];
}

function haversine([long1, lat1]: number[], [long2, lat2]: number[]) {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLong = toRad(long2 - long1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLong / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function calcularRaioEmKm(coords: number[][]) {
  const centro = calcularCentroide(coords);
  const distancias = coords.map((p) => haversine(p, centro));
  const soma = distancias.reduce((acc, d) => acc + d, 0);
  return soma / distancias.length / 1000;
}
