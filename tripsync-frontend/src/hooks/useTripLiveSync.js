import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/ws';

export function useTripLiveSync(tripId, onEvent) {
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    if (!tripId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        client.subscribe(`/topic/trips/${tripId}`, (frame) => {
          if (frame.body) {
            try {
              const event = JSON.parse(frame.body);
              callbackRef.current?.(event);
            } catch (e) {
              console.error('Invalid WS payload:', e);
            }
          }
        });
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [tripId]);
}