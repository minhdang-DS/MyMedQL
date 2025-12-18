"""
WebSocket endpoints for real-time updates
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.connection_manager import ConnectionManager

router = APIRouter(tags=["websocket"])

# Global connection manager (initialized in main.py)
manager: ConnectionManager = None


def set_manager(mgr: ConnectionManager):
    """Set the connection manager instance."""
    global manager
    manager = mgr


@router.websocket("/ws/vitals")
async def websocket_vitals(websocket: WebSocket):
    """
    WebSocket endpoint for real-time vital signs updates.
    
    Clients connect to this endpoint to receive live updates when new
    vital signs data is inserted into the database.
    """
    if manager is None:
        await websocket.close(code=1013, reason="Server not ready")
        return
    
    await manager.connect(websocket)
    
    try:
        # Keep connection alive and wait for messages
        while True:
            # Optionally receive messages from client (ping/pong, etc.)
            data = await websocket.receive_text()
            # Echo back or handle client messages if needed
            # For now, we just keep the connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket)

