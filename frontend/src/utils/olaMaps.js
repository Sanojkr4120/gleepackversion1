import { OlaMaps } from 'olamaps-web-sdk';

export const initOlaMaps = () => {
    return new OlaMaps({
        apiKey: import.meta.env.VITE_OLA_MAPS_API_KEY
    });
};
