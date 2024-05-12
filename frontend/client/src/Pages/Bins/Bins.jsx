import React, { useState, useEffect, useRef } from 'react';
import FeederNav from "../../FeederNav/FeederNav";
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';

// Define libraries as a constant variable
const libraries = ['places'];

const Bins = () => {
    const mapStyles = {
        height: "100vh",
        width: "100%"
    };

    // State to store user's current location
    const [userLocation, setUserLocation] = useState(null);
    // State to store recycling bin locations
    const [recyclingBins, setRecyclingBins] = useState([]);
    
    // Reference for autocomplete
    const autocompleteRef = useRef(null);

    // Function to get user's current location
    useEffect(() => {
        
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ lat: latitude, lng: longitude });
                },
                error => {
                    console.error("Error getting user location:", error);
                }
            );
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }, []);

    // Function to handle search result selection
    const handlePlaceSelect = () => {
        if (autocompleteRef.current !== null) {
            const place = autocompleteRef.current.getPlace();
            if (place.geometry) {
                setUserLocation({
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                });
            } else {
                console.error("Place details not found for the input: ", place);
            }
        } else {
            console.error("Autocomplete is not initialized.");
        }
    };

    return (
        <div>
            <FeederNav />
            <div>
                <LoadScript
                
                    googleMapsApiKey="AIzaSyDjrPwiOXAsGFEeiAdoiRMd7P8anlg4H0U"
                    libraries={libraries} // Pass libraries as a constant variable
                    loadingElement={<div style={{ height: "100%" }} />}
                >
                    <GoogleMap
                        mapContainerStyle={mapStyles}
                        zoom={13}
                        center={userLocation || { lat: 0, lng: 0 }} // Center map on user's location if available
                    >
                        {userLocation && <Marker position={userLocation} />}
                        {recyclingBins.map((bin, index) => (
                            <Marker key={index} position={{ lat: bin.geometry.location.lat(), lng: bin.geometry.location.lng() }} />
                        ))}
                        {/* Search box */}
                        <Autocomplete
                            onLoad={autocomplete => (autocompleteRef.current = autocomplete)}
                            onPlaceChanged={handlePlaceSelect}
                        >
                            <input
                                type="text"
                                placeholder="Search for a location"
                                style={{
                                    boxSizing: `border-box`,
                                    border: `1px solid transparent`,
                                    width: `240px`,
                                    height: `32px`,
                                    padding: `0 12px`,
                                    borderRadius: `3px`,
                                    boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
                                    fontSize: `14px`,
                                    outline: `none`,
                                    textOverflow: `ellipses`,
                                    position: "absolute",
                                    left: "50%",
                                    marginLeft: "-120px"
                                }}
                            />
                        </Autocomplete>
                    </GoogleMap>
                </LoadScript>
            </div>
        </div>
    );
};

export default Bins;
