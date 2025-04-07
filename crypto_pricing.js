/**
 * Cryptocurrency Pricing Module for IOG MCP Server
 * 
 * This module provides real-time cryptocurrency pricing data
 * using the CoinGecko API.
 */

const axios = require('axios');

// CoinGecko API base URL
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

/**
 * Get the current price of a cryptocurrency in specified currencies
 * @param {string} coinId - The CoinGecko ID of the cryptocurrency (e.g., 'cardano' for ADA)
 * @param {string[]} currencies - Array of currency codes (e.g., ['usd', 'eur'])
 * @returns {Promise<Object>} - Price data
 */
async function getCoinPrice(coinId, currencies = ['usd']) {
  try {
    const currencyString = currencies.join(',');
    const response = await axios.get(`${COINGECKO_API_URL}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: currencyString,
        include_24hr_change: true
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching cryptocurrency price:', error.message);
    throw new Error(`Failed to fetch price for ${coinId}: ${error.message}`);
  }
}

/**
 * Search for cryptocurrencies by name or symbol
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Array of matching cryptocurrencies
 */
async function searchCoins(query) {
  try {
    const response = await axios.get(`${COINGECKO_API_URL}/search`, {
      params: { query }
    });
    
    return response.data.coins.slice(0, 10); // Return top 10 results
  } catch (error) {
    console.error('Error searching cryptocurrencies:', error.message);
    throw new Error(`Failed to search for cryptocurrencies: ${error.message}`);
  }
}

/**
 * Calculate staking returns for a given amount, duration, and APY
 * @param {number} amount - The amount of cryptocurrency
 * @param {number} years - Duration in years
 * @param {number} apy - Annual percentage yield (as a percentage, e.g., 5 for 5%)
 * @param {string} coinId - The CoinGecko ID of the cryptocurrency
 * @param {string} currency - Currency for price conversion
 * @returns {Promise<Object>} - Staking return calculation
 */
async function calculateStakingReturns(amount, years, apy, coinId = 'cardano', currency = 'usd') {
  try {
    // Get current price
    const priceData = await getCoinPrice(coinId, [currency]);
    
    if (!priceData[coinId]) {
      throw new Error(`Price data not available for ${coinId}`);
    }
    
    const currentPrice = priceData[coinId][currency];
    const currentValue = amount * currentPrice;
    
    // Calculate future token amount with compound interest
    const apyDecimal = apy / 100;
    const futureTokenAmount = amount * Math.pow(1 + apyDecimal, years);
    const tokensEarned = futureTokenAmount - amount;
    
    // Calculate future value based on current price
    const futureValue = futureTokenAmount * currentPrice;
    const valueEarned = futureValue - currentValue;
    
    return {
      initialTokens: amount,
      initialValue: currentValue,
      currentPrice,
      futureTokens: futureTokenAmount,
      tokensEarned,
      futureValue,
      valueEarned,
      years,
      apy,
      currency
    };
  } catch (error) {
    console.error('Error calculating staking returns:', error.message);
    throw new Error(`Failed to calculate staking returns: ${error.message}`);
  }
}

module.exports = {
  getCoinPrice,
  searchCoins,
  calculateStakingReturns
};
