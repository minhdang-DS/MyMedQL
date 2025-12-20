import { useState, useEffect, useRef, useCallback } from 'react';

// Use environment variable if available, otherwise default to localhost:3001
// For Docker, use the API URL and convert to WebSocket URL
const getWebSocketUrl = () => {
  if (typeof window === 'undefined') return 'ws://localhost:3001/ws/vitals';
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  // Convert http:// to ws:// and https:// to wss://
  const wsUrl = apiUrl.replace('http://', 'ws://').replace('https://', 'wss://');
  return `${wsUrl}/ws/vitals`;
};

const WS_URL = getWebSocketUrl();

export function useWebSocket() {
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(() => {
        try {
            const ws = new WebSocket(WS_URL);

            ws.onopen = () => {
                console.log('WebSocket Connected');
                setIsConnected(true);
                // Clear any reconnect timeout
                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                    reconnectTimeoutRef.current = null;
                }
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('WebSocket message received:', data);
                    setLastMessage(data);
                } catch (e) {
                    console.error('Error parsing WebSocket message:', e);
                }
            };

            ws.onclose = () => {
                console.log('WebSocket Disconnected');
                setIsConnected(false);
                // Attempt reconnect after 3 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    console.log('Attempting to reconnect...');
                    connect();
                }, 3000);
            };

            ws.onerror = (error) => {
                console.error('WebSocket Error:', error);
                ws.close();
            };

            wsRef.current = ws;
        } catch (error) {
            console.error('WebSocket Connection Error:', error);
        }
    }, []);

    useEffect(() => {
        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]);

    const sendMessage = useCallback((message) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        } else {
            console.warn('WebSocket is not open. Cannot send message.');
        }
    }, []);

    return { isConnected, lastMessage, sendMessage };
}
