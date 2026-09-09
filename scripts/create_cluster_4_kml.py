import os
import pandas as pd
import xml.sax.saxutils as saxutils

# Load data
df = pd.read_csv(os.path.join("data", "reports", "HUMAN_LABELING_SHEET.csv"))
c4 = df[df['cluster_id'] == 4].sort_values(by=['acq_date', 'acq_time']).reset_index(drop=True)

# Generate KML content
kml_lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<kml xmlns="http://www.opengis.net/kml/2.2">',
    '  <Document>',
    '    <name>Cluster 4 Thermal Anomaly Events (SIH26162)</name>',
    '    <description>All 25 persistent nocturnal thermal anomaly events in Cluster 4 (March 7 - May 27, 2026) for GIS/Google Earth human validation.</description>',
    '    ',
    '    <!-- Styles -->',
    '    <Style id="thermalPoint">',
    '      <IconStyle>',
    '        <color>ff0000ff</color>', # red
    '        <scale>1.1</scale>',
    '        <Icon>',
    '          <href>http://maps.google.com/mapfiles/kml/shapes/firedept.png</href>',
    '        </Icon>',
    '      </IconStyle>',
    '      <LabelStyle>',
    '        <scale>0.9</scale>',
    '      </LabelStyle>',
    '    </Style>',
    '    <Style id="centroidPoint">',
    '      <IconStyle>',
    '        <color>ff00ffff</color>', # yellow
    '        <scale>1.4</scale>',
    '        <Icon>',
    '          <href>http://maps.google.com/mapfiles/kml/shapes/target.png</href>',
    '        </Icon>',
    '      </IconStyle>',
    '    </Style>',
    '    ',
    '    <!-- Cluster Centroid -->',
    '    <Placemark>',
    '      <name>Cluster 4 Centroid</name>',
    '      <styleUrl>#centroidPoint</styleUrl>',
    '      <description><![CDATA[',
    f'        <h3>Cluster 4 Geometric Centroid</h3>',
    f'        <p><b>Events in Cluster:</b> 25<br/>',
    f'        <b>Unique Dates:</b> 21 (81 days span: 2026-03-07 to 2026-05-27)<br/>',
    f'        <b>Mean Coordinates:</b> Lat {c4["latitude"].mean():.5f}, Lon {c4["longitude"].mean():.5f}<br/>',
    f'        <b>Mean FRP:</b> {c4["frp"].mean():.2f} MW<br/>',
    f'        <b>Mean Bright TI4:</b> {c4["bright_ti4"].mean():.2f} K<br/>',
    f'        <b>Mean Distance to Industry:</b> {c4["nearest_industry_distance_m"].mean():.1f} m</p>',
    '      ]]></description>',
    f'      <Point><coordinates>{c4["longitude"].mean():.6f},{c4["latitude"].mean():.6f},0</coordinates></Point>',
    '    </Placemark>',
    '    ',
    '    <!-- Folder for Individual Events -->',
    '    <Folder>',
    '      <name>Individual Events (25 Detections)</name>'
]

for idx, r in c4.iterrows():
    ev_id = r['event_id']
    lat = r['latitude']
    lon = r['longitude']
    date_str = r['acq_date']
    time_str = r['acq_time']
    frp = r['frp']
    ti4 = r['bright_ti4']
    ti5 = r['bright_ti5']
    delta_t = r['delta_ti4_ti5']
    dist = r['nearest_industry_distance_m']
    ndvi = r['NDVI']
    ndbi = r['NDBI']
    ndwi = r['NDWI']
    conf = r['confidence']
    
    desc_html = f"""<![CDATA[
      <div style="font-family: Arial, sans-serif; font-size: 13px;">
        <h3 style="margin: 0 0 8px 0; color: #b30000;">{ev_id} (Cluster 4)</h3>
        <table style="border-collapse: collapse; width: 100%;">
          <tr><td><b>Acquisition Date:</b></td><td>{date_str}</td></tr>
          <tr><td><b>Acquisition Time:</b></td><td>{time_str} UTC (Night)</td></tr>
          <tr><td><b>Latitude:</b></td><td>{lat:.5f}</td></tr>
          <tr><td><b>Longitude:</b></td><td>{lon:.5f}</td></tr>
          <tr><td><b>FRP:</b></td><td>{frp:.2f} MW</td></tr>
          <tr><td><b>Bright TI4:</b></td><td>{ti4:.2f} K</td></tr>
          <tr><td><b>Bright TI5:</b></td><td>{ti5:.2f} K</td></tr>
          <tr><td><b>Delta T (TI4 - TI5):</b></td><td>{delta_t:.2f} K</td></tr>
          <tr><td><b>Distance to Industry:</b></td><td>{dist:.1f} m</td></tr>
          <tr><td><b>NDVI:</b></td><td>{ndvi:.3f}</td></tr>
          <tr><td><b>NDBI:</b></td><td>{ndbi:.3f}</td></tr>
          <tr><td><b>NDWI:</b></td><td>{ndwi:.3f}</td></tr>
          <tr><td><b>Quality Confidence:</b></td><td>{conf}</td></tr>
        </table>
      </div>
    ]]>"""
    
    kml_lines.extend([
        '      <Placemark>',
        f'        <name>{ev_id} ({date_str})</name>',
        f'        <styleUrl>#thermalPoint</styleUrl>',
        f'        <description>{desc_html}</description>',
        f'        <Point><coordinates>{lon:.6f},{lat:.6f},0</coordinates></Point>',
        '      </Placemark>'
    ])

kml_lines.extend([
    '    </Folder>',
    '  </Document>',
    '</kml>'
])

kml_content = "\n".join(kml_lines)
output_kml = os.path.join("data", "reports", "cluster_4_events.kml")

with open(output_kml, "w", encoding="utf-8") as f:
    f.write(kml_content)

print(f"KML file with 25 events successfully created at {output_kml}")
