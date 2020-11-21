import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from 'components/Layout';
import Map from 'components/Map';
import axios from "axios"
import L from 'leaflet';

const LOCATION = {
  lat: 0,
  lng: 0,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;


const IndexPage = () => {

  async function mapEffect({ leafletElement : map } = {}) {
    let response_1,response_2;
    try {
        response_1 = await axios.get("https://corona.lmao.ninja/v2/countries")
        response_2 = await axios.get("https://corona.lmao.ninja/v2/all")
    } catch (error) {
        console.log(error.message)
        return
    }
    const {data=[]}=response_1
    const {stats=[]}=response_2
    const hasData = Array.isArray(data) && Array.isArray(stats) && stats.length >0 && data.length > 0
    if (!hasData) {
        return
    }

    const geoJson = {
        type: "FeatureColletion",
        features: data.map((country={})=>{
            const {countryInfo = {}} = country
            const {lat,long:lng} = countryInfo
            return {
                type: "Feature",
                properties: {
                    ...country
                },
                geometry: {
                    type:"Point",
                    coordinates: [lng,lat]
                }
            }
        })
    }

    const geoJsonLayers = new L.GeoJSON(geoJson,{

     pointToLayer: (feature={},latlng) => {
         const {properties={}} = feature
         let updatedFormatted;
         let casesString;
         const {country,updated,cases,deaths,recovered} = properties
         casesString = `${cases}`
         
         if ( cases>1000) {
            casesString = `${casesString.slice(0,-3)}k+`
         }

         if (updated) {
             updatedFormatted = new Date(updated).toLocaleString()
         }
         const html = `
         <span class="icon-marker">
         <span class="icon-marker-tooltip">
          <h2>
          ${country}
          </h2>
          <ul>
          <li><strong>Confirmed:</strong> ${cases}</li>
          <li><strong>Deaths:</strong> ${deaths}</li>
          <li><strong>Recovered:</strong> ${recovered}</li>
          <li><strong>Last Update:</strong> ${updatedFormatted}</li>
          </ul>
         </span>
         ${casesString}
         </span>
         `
         return L.marker(latlng,{icon:L.divIcon({className:"icon",html}),riseOnHover:true})
     }

     

    })
    geoJsonLayers.addTo(map)
    window.dispatchEvent(new Event('resize'));
  }

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'Mapbox',
    zoom: DEFAULT_ZOOM,
    mapEffect,
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>
      <Map {...mapSettings}>
      </Map>
    </Layout>
  );
};

export default IndexPage;
