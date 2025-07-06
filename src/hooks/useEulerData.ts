import { useState } from 'react';

export const useEulerData = () => {
  const [balances] = useState({});
  const [userPool] = useState(null);
  const [loading] = useState(false);

  const refetch = () => {
    console.log('Refetching data');
  };

  return {
    balances,
    userPool,
    loading,
    refetch,
  };
};