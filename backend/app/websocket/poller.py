"""
Background poller task for checking database updates and broadcasting via WebSocket
"""
import asyncio
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy import text
from app.db.database import get_engine
from app.websocket.connection_manager import ConnectionManager


class VitalsPoller:
    """
    Polls the database for new vital signs and broadcasts updates via WebSocket.
    """
    
    def __init__(self, manager: ConnectionManager, poll_interval: float = 1.0):
        """
        Initialize the poller.
        
        Args:
            manager: ConnectionManager instance for broadcasting
            poll_interval: Polling interval in seconds (default: 1.0)
        """
        self.manager = manager
        self.poll_interval = poll_interval
        self.last_check: Optional[datetime] = None
        self.running = False
        self._task: Optional[asyncio.Task] = None
    
    async def start(self):
        """Start the polling task."""
        if self.running:
            return
        
        self.running = True
        # Initialize last_check to current time minus 1 minute to get recent data on startup
        self.last_check = datetime.utcnow() - timedelta(minutes=1)
        self._task = asyncio.create_task(self._poll_loop())
        print("🚀 Vitals poller started")
    
    async def stop(self):
        """Stop the polling task."""
        self.running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        print("🛑 Vitals poller stopped")
    
    async def _poll_loop(self):
        """Main polling loop."""
        while self.running:
            try:
                await self._check_and_broadcast()
            except Exception as e:
                print(f"❌ Error in poller loop: {e}")
            
            await asyncio.sleep(self.poll_interval)
    
    async def _check_and_broadcast(self):
        """
        Check database for new vitals and broadcast if found.
        """
        if not self.last_check:
            self.last_check = datetime.utcnow() - timedelta(minutes=1)
        
        try:
            engine = get_engine()
            with engine.connect() as conn:
                # Query for new vitals since last check
                # Use the view if available, otherwise query vitals directly
                query = """
                    SELECT v.vitals_id, v.patient_id, v.device_id, v.ts,
                           v.heart_rate, v.spo2, v.bp_systolic, v.bp_diastolic,
                           v.temperature_c, v.respiration, v.metadata,
                           p.first_name, p.last_name
                    FROM vitals v
                    LEFT JOIN patients p ON v.patient_id = p.patient_id
                    WHERE v.ts > :last_check
                    ORDER BY v.ts ASC
                    LIMIT 100
                """
                
                result = conn.execute(
                    text(query),
                    {"last_check": self.last_check}
                )
                
                new_vitals = [dict(row._mapping) for row in result]
                
                if new_vitals:
                    # Update last_check to the most recent timestamp
                    latest_ts = max(v["ts"] for v in new_vitals if v.get("ts"))
                    if latest_ts:
                        self.last_check = latest_ts
                    
                    # Broadcast updates
                    await self.manager.broadcast({
                        "type": "vitals_update",
                        "count": len(new_vitals),
                        "data": new_vitals,
                        "timestamp": datetime.utcnow().isoformat()
                    })
                    print(f"📡 Broadcasted {len(new_vitals)} new vital sign(s)")
        
        except Exception as e:
            print(f"❌ Error checking for new vitals: {e}")


# Global poller instance (will be initialized in main.py)
_poller: Optional[VitalsPoller] = None


def get_poller(manager: ConnectionManager) -> VitalsPoller:
    """
    Get or create the global poller instance.
    
    Args:
        manager: ConnectionManager instance
        
    Returns:
        VitalsPoller instance
    """
    global _poller
    if _poller is None:
        _poller = VitalsPoller(manager)
    return _poller


async def start_poller(manager: ConnectionManager):
    """
    Start the vitals poller.
    
    Args:
        manager: ConnectionManager instance
    """
    poller = get_poller(manager)
    await poller.start()


async def stop_poller():
    """Stop the vitals poller."""
    global _poller
    if _poller:
        await _poller.stop()
        _poller = None

