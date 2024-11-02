import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { auth } from "../firebase/firebase";

const ArtistPage = () => {
  const { userUid } = useParams();
  const [artistData, setArtistData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchArtistData = async () => {
      if (!auth.currentUser) {
        setErrorMessage("User not authenticated");
        return;
      }

      try {
        const token = await auth.currentUser.getIdToken();
        const response = await fetch(
          `http://localhost:5000/api/artists/${userUid}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            `Failed to fetch artist data: ${errorData.error || "Unknown error"}`
          );
        }

        const data = await response.json();
        console.log("Fetched artist data:", data);
        setArtistData(data);
      } catch (error) {
        setErrorMessage(error.message);
        console.error("Error fetching artist data:", error);
      }
    };

    fetchArtistData();
  }, [userUid]);

  if (errorMessage) {
    return <div>Error: {errorMessage}</div>;
  }

  if (!artistData) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{artistData.title}</h2>
      <p>Phone: {artistData.phone}</p>
      <p>Description: {artistData.description}</p>
      <p>City: {artistData.city}</p>
      <p>Instagram: {artistData.instagramLink || "N/A"}</p>
      <p>Facebook: {artistData.facebookLink || "N/A"}</p>
      {/* Add any additional fields or styling as needed */}
    </div>
  );
};

export default ArtistPage;
