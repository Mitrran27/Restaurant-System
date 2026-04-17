import { useEffect, useRef } from 'react';
import { initSocket } from '../services/socket';

/**
 * Custom hook for socket.io subscriptions.
 * Automatically handles cleanup on unmount.
 *
 * @param {string | string[]} events - Event name(s) to listen for
 * @param {Function} handler - Callback fired when event is received
 * @param {any[]} deps - Effect dependencies (like branchId, userId etc.)
 * @param {Object} opts - Options: { rooms: [] } — rooms to join
 */
export default function useSocket(events, handler, deps = [], opts = {}) {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = initSocket();
    const eventList = Array.isArray(events) ? events : [events];

    // Join rooms
    if (opts.rooms) {
      opts.rooms.forEach((room) => socket.emit('join:' + room.type, room.id));
    }

    const wrappedHandler = (...args) => handlerRef.current(...args);
    eventList.forEach((ev) => socket.on(ev, wrappedHandler));

    return () => {
      eventList.forEach((ev) => socket.off(ev, wrappedHandler));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
