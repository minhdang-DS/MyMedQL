"""
WebSocket connection manager for broadcasting updates to connected clients
"""
from fastapi import WebSocket
from typing import List
import json


class ConnectionManager:
    """
    Manages WebSocket connections and broadcasts messages to all connected clients.
    """
    
    def __init__(self):
        """Initialize connection manager with empty connection list."""
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        """
        Accept and register a new WebSocket connection.
        
        Args:
            websocket: WebSocket connection to add
        """
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"✅ WebSocket client connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        """
        Remove a WebSocket connection.
        
        Args:
            websocket: WebSocket connection to remove
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"❌ WebSocket client disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        """
        Send a message to a specific WebSocket connection.
        
        Args:
            message: Message to send
            websocket: Target WebSocket connection
        """
        try:
            await websocket.send_text(message)
        except Exception as e:
            print(f"Error sending personal message: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: dict):
        """
        Broadcast a message to all connected WebSocket clients.
        
        Args:
            message: Dictionary to broadcast (will be JSON-encoded)
        """
        if not self.active_connections:
            return
        
        message_text = json.dumps(message, default=str)  # default=str handles datetime serialization
        disconnected = []
        
        for connection in self.active_connections:
            try:
                await connection.send_text(message_text)
            except Exception as e:
                print(f"Error broadcasting to client: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
    
    def disconnect_all(self):
        """Disconnect all active WebSocket connections."""
        self.active_connections.clear()
        print("All WebSocket connections closed")

