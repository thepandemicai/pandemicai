"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';  // Import Mapbox CSS
import styles from "./styles.module.css"
import Link from 'next/link';
import Image from 'next/image';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;

const WorldMap = () => {
  const mapContainerRef = useRef(null);
  const [citiesCount, setCitiesCount] = useState(0);
  const [informedRef, setInformedRef] = useState("0");
  const [headlines, setHeadlines] = useState("");
  const [popup, setPopup] = useState({
    title: "",
    mainMessage: "",
    icon: "",
    supportingNews: []
  });
  const population = useRef(8161972);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const getUpdates = async (map) => {
    try { 
        const data_uri = "/api/data";
        const res = await fetch(data_uri);
        if (res.ok) {
            const data = await res.json();
            const {
              news,
              places,
              transactions
            } = data;
            
            if(transactions > 0){
              setInformedRef(transactions.toLocaleString());

              if (news) {
                setPopup(prev => {
                  if (news?.title && news.title !== prev.title) {
                    setHeadlines(() => news.supportingNews?.join(" ") || "");
                    setShowPopup(true);
                    displayMarker(map, places);
                    return news;
                  }
                  return prev;
                });
              }
            }

            setLoading(false);
            setTimeout(()=> getUpdates(map), 30000 );
        }
    } catch (error) {
        console.error('Fetch error:', error);
        setLoading(false);
    }  
  }

  const createCustomMarker = (iconUrl, size) => {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.backgroundImage = `url(${iconUrl})`;
    el.style.width = size + 'px';
    el.style.height = size + 'px';
    el.style.backgroundSize = '100%';
    return el;
  }

  const displayMarker = (map, places) => {
    places.slice(citiesCount, places.length).forEach(city => {
      const marker = createCustomMarker('https://i.postimg.cc/pV7yfZJR/vecteezy-red-brush-circle-png-21911751.png', 20);
      new mapboxgl.Marker(marker)
          .setLngLat([city.lng, city.lat])
          .addTo(map);
    });
    setCitiesCount(places.length);
    setLoading(false);
  }

  const initMap = () => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/craftyprogrammer/cm2pa3zte008q01pmb2d4e97l",
      center: [0, 20],
      zoom: 1,
      maxZoom: 4,
      projection: 'mercator',
      maxBounds: [[-180, -85], [180, 85]],
      dragRotate: false,
      touchZoomRotate: false,
    });

    map.on('load', () => {
      getUpdates(map);
    });

    return map;
  }

  useEffect(() => {
    if (mounted) {
      const map = initMap();
      return () => map.remove();  // Clean up on unmount
    }
  }, [mounted]);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <></>;

  return (
    <div className='relative flex flex-col h-screen text-white'>
      <div style={{ width: '100%', height: '100%' }} ref={mapContainerRef} />
      
      {/* Legend */}
      <div className={`${styles.popup} absolute top-40 left-4 z-10 p-4 md:p-6 hidden md:block`}>
        <div className="space-y-3 md:space-y-4">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-xs md:text-sm">Active Infection</span>
          </div>
        </div>
      </div>

      {/* Enhanced Statistics */}
      {<div className={styles.infoWrap}>
        <div className={`${styles.infoContainer} w-[95%] md:w-auto max-w-full md:max-w-xl`}>
          <div className='w-full p-2 flex flex-col items-center'>
            <div className='flex gap-3 md:gap-6 mb-2 flex-wrap justify-center'>
              <div className='flex flex-col items-center min-w-[80px]'>
                <div className='text-red-500 text-sm md:text-lg font-bold'>{informedRef}</div>
                <div className='text-[8px] md:text-[10px] opacity-80 text-center'>TOTAL INFECTED</div>
              </div>
              <div className='flex flex-col items-center min-w-[80px]'>
                <div className='text-blue-500 text-sm md:text-lg font-bold'>{population.current.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                <div className='text-[8px] md:text-[10px] opacity-80 text-center'>POPULATION</div>
              </div>
              <div className='flex flex-col items-center min-w-[80px]'>
                <div className='text-green-500 text-sm md:text-lg font-bold'>{citiesCount}</div>
                <div className='text-[8px] md:text-[10px] opacity-80 text-center'>CITIES AFFECTED</div>
              </div>
            </div>
            <div className='w-full px-2'>
              <div className='flex justify-between mb-0.5'>
                <span className='text-[8px] md:text-[10px]'>Infection Progress</span>
                <span className='text-[8px] md:text-[10px]'>{((Number(informedRef.replace(/,/g, "")) / population.current) * 100).toFixed(2)}%</span>
              </div>
              <progress 
                className="progress progress-error w-full h-1.5" 
                value={(Number(informedRef.replace(/,/g, "")) / population.current) * 100} 
                max="100"
              />
            </div>
          </div>
        </div>
      </div>}

      {/* News Ticker */}
      <div className={`${styles.newsWrap} w-[95%] md:w-[90%]`}>
        <div className="relative">
          <img src='/news2.jpg' className="w-12 h-12 rounded-full border border-red-500"/>
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        {popup?.title && !loading && 
          <marquee className={`font-bold ${styles.marquee} text-[10px] md:text-xs`}>
            <span className="text-red-500">BREAKING NEWS:</span> {headlines || ""}
          </marquee>
        }
      </div>

      {/* Popup */}
      {showPopup && popup?.title && !loading && (
        <div className={`${styles.popupWrap} animate-slideUp`}>
          <div className={`${styles.popup} w-[90%] md:w-[400px] mx-auto`}>
            <img 
              src={popup?.icon || '/news2.jpg'} 
              width={60} 
              className="md:w-[80px] w-[60px] mx-auto mb-2" 
              alt="News Icon" 
            />
            <div className='flex flex-col px-2 md:px-3'>
              <h2 className='font-bold text-sm md:text-base mb-1.5'>{popup?.title}</h2>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed">{popup?.mainMessage}</p>
              <div className="my-2 md:my-3 border-t border-gray-700"></div>
              <div className="flex justify-end w-full">
                <button 
                  onClick={() => setShowPopup(false)} 
                  className='bg-red-600 hover:bg-red-700 px-3 md:px-4 py-1 md:py-1.5 text-xs md:text-sm text-white rounded transition-colors'
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='fixed top-1/4 bg-black bg-opacity-50 right-2 p-2 md:p-4 rounded flex flex-col gap-6 md:gap-10'>
        <Link href="https://x.com/PandemicSolana"><img src='https://i.postimg.cc/bvBzL4mD/x.png' alt='twitter' width={30} height={30} className="md:w-[40px] md:h-[40px]"/></Link>
        <Link href="https://github.com/thepandemicai/pandemicai"><img src='https://i.postimg.cc/NjQf06yM/github.png' alt='github' width={30} height={30} className="md:w-[40px] md:h-[40px]"/></Link>
      </div>
    </div>
  );
};

export default WorldMap;
