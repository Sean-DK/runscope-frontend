import { Route } from '../types'

export const generateGpx = (route: Route): string => {
  const points = route.segments
    .flatMap((seg) => seg.path)
    .map(([lng, lat]) => `    <trkpt lat="${lat}" lon="${lng}"></trkpt>`)
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="RunScope"
  xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>${route.name}</name>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>`
}

export const downloadGpx = (route: Route): void => {
  const gpx = generateGpx(route)
  const blob = new Blob([gpx], { type: 'application/gpx+xml' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${route.name.replace(/\s+/g, '_')}.gpx`
  a.click()
  URL.revokeObjectURL(url)
}