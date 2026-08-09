/*
 * API 配置信息
 */

// Pixel Tetsudo - API Configuration
// Configurable endpoints for real-time running status data

window.API_CONFIG = {
    // Base URL for API requests
    // In production, point to the actual transit operator's API
    baseUrl: window.location.origin + '/api',
    
    // Endpoint for line status data
    linesEndpoint: 'lines?include=status',
    
    // Real-time train positions endpoint (separate from line status)
    trainsEndpoint: 'trains/positions',
    
    // Request timeout in milliseconds
    timeout: 5000,
    
    // Cache TTL in milliseconds (for client-side caching)
    cacheTtl: 30000, // 30 seconds
    
    // Fallback: use local mock data if API fails
    fallbackEnabled: true,
    
    // Developer override: set to true to force reload from API on every visit
    forceReload: false
};
