import React, { createContext, useState, useEffect } from 'react';

export const CurrencyContext = createContext();

const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('LKR'); // Default currency
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        const response = await fetch(
          'https://open.er-api.com/v6/latest/USD' // Example API for exchange rates
        );
        const data = await response.json();
        setExchangeRates(data.rates);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      }
    };

    fetchExchangeRates();
  }, []);

  const convertCurrency = (amount, currency) => {
    // console.log('Converting Amount:', amount); // Log the amount being converted
    // console.log('Selected Currency:', currency); // Log the selected currency
    // console.log('Exchange Rates:', exchangeRates); // Log the exchange rates object
  
    if (!exchangeRates['LKR']) {
      // console.warn('Exchange rate for LKR not found.');
      return amount; // Fallback if LKR rate is not available
    }
  
    if (!exchangeRates[currency]) {
      // console.warn(`Exchange rate for ${currency} not found.`);
      return amount; // Fallback if the selected currency rate is not available
    }
  
    // Convert LKR to USD first, then to the selected currency
    const amountInUSD = amount / exchangeRates['LKR'];
    const convertedAmount = (amountInUSD * exchangeRates[currency]).toFixed(2);
  
    // console.log(`Converted Amount (${currency}):`, convertedAmount); // Log the converted amount
    return convertedAmount;
  };
  return (
    <CurrencyContext.Provider
      value={{
        selectedCurrency,
        setSelectedCurrency,
        exchangeRates,
        convertCurrency,
        loading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export default CurrencyProvider;