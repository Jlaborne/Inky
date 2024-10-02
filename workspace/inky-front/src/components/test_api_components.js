import React, { useState, useEffect } from 'react';

function TestApiComponent() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('http://localhost:5000/')
      .then(response => response.json())
      .then(json => setData(json))
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : 'Loading...'}
    </div>
  );
}

export default TestApiComponent;