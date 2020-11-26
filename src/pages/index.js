import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import Layout from "components/Layout";
import Map from "components/Map";
import axios from "axios";
import L from "leaflet";

const LOCATION = {
  lat: 0,
  lng: 0,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;

const IndexPage = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    (async function () {
      try {
        let response = await axios.get("https://corona.lmao.ninja/v2/all");
        const { data: stats = {} } = response;
        setStats(stats);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  async function mapEffect({ leafletElement: map } = {}) {
    let response_1;
    try {
      response_1 = await axios.get("https://corona.lmao.ninja/v2/countries");
    } catch (error) {
      console.log(error.message);
      return;
    }
    const { data = [] } = response_1;
    const hasData = Array.isArray(data) && data.length > 0;
    if (!hasData) {
      return;
    }

    const geoJson = {
      type: "FeatureColletion",
      features: data.map((country = {}) => {
        const { countryInfo = {} } = country;
        const { lat, long: lng } = countryInfo;
        return {
          type: "Feature",
          properties: {
            ...country,
          },
          geometry: {
            type: "Point",
            coordinates: [lng, lat],
          },
        };
      }),
    };

    const geoJsonLayers = new L.GeoJSON(geoJson, {
      pointToLayer: (feature = {}, latlng) => {
        const { properties = {} } = feature;
        let updatedFormatted;
        let casesString;
        const {
          country,
          updated,
          cases,
          deaths,
          recovered,
          countryInfo,
        } = properties;
        casesString = `${cases}`;

        if (cases > 1000) {
          casesString = `${casesString.slice(0, -3)}k+`;
        }

        if (updated) {
          updatedFormatted = new Date(updated).toLocaleString();
        }
        const html = `
         <span class="icon-marker">
         <span class="icon-marker-tooltip">
         <img class="country-flag" src=${countryInfo.flag} alt="flag"/>
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
         `;
        return L.marker(latlng, {
          icon: L.divIcon({ className: "icon", html }),
          riseOnHover: true,
        });
      },
    });
    geoJsonLayers.addTo(map);
    window.dispatchEvent(new Event("resize"));
  }

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: "Mapbox",
    zoom: DEFAULT_ZOOM,
    mapEffect,
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Covid-19 Dashboard</title>
      </Helmet>
      <Map {...mapSettings}></Map>
      <div className="tracker">
        <div className="tracker-stats">
          <ul>
            <li className="tracker-stat">
              <p className="tracker-stat-primary">
                {stats ? stats.tests : "-"}
                <strong>Total Tests</strong>
              </p>
              <p className="tracker-stat-secondary">
                {stats ? stats.testsPerOneMillion : "-"}
                <strong>Per 1 Million</strong>
              </p>
            </li>
            <li className="tracker-stat">
              <p className="tracker-stat-primary">
                {stats ? stats.cases : "-"}
                <strong>Total Cases</strong>
              </p>
              <p className="tracker-stat-secondary">
                {stats ? stats.casesPerOneMillion : "-"}
                <strong>Per 1 Million</strong>
              </p>
            </li>
            <li className="tracker-stat">
              <p className="tracker-stat-primary">
                {stats ? stats.deaths : "-"}
                <strong>Total Deaths</strong>
              </p>
              <p className="tracker-stat-secondary">
                {stats ? stats.deathsPerOneMillion : "-"}
                <strong>Per 1 Million</strong>
              </p>
            </li>
            <li className="tracker-stat">
              <p className="tracker-stat-primary">
                {stats ? stats.active : "-"}
                <strong>Active</strong>
              </p>
            </li>
            <li className="tracker-stat">
              <p className="tracker-stat-primary">
                {stats ? stats.critical : "-"}
                <strong>Critical</strong>
              </p>
            </li>
            <li className="tracker-stat">
              <p className="tracker-stat-primary">
                {stats ? stats.recovered : "-"}
                <strong>Recovered</strong>
              </p>
            </li>
          </ul>
        </div>

        <div className="tracker-last-updated">
          <p>
            Last Updated:{" "}
            {stats ? new Date(stats.updated).toLocaleDateString() : "-"}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default IndexPage;
