# MyMedQL Device Simulator

A Node.js application that generates realistic, time-series vital signs data and sends it to the MyMedQL backend API. The simulator uses deterministic scenarios with smooth transitions and realistic noise to test the complete system pipeline.

## Features

- **Realistic Data Generation**: Smooth transitions between states with configurable noise
- **Multiple Scenarios**: Pre-defined scenarios for testing different system behaviors
- **High-Frequency Ingestion**: Configurable send intervals (1-5 seconds)
- **Device Assignment**: Support for device-to-patient assignment workflow
- **Error Handling**: Robust error handling with retry logic
- **Comprehensive Testing**: Unit and integration tests

## Installation

```bash
cd simulator
npm install
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your settings:
```env
API_BASE_URL=http://localhost:3000
INGESTION_API_KEY=your-api-key-here
PATIENT_ID=1
DEVICE_ID=1
SEND_INTERVAL=2
```

The API key should match the `INGESTION_API_KEY` in your backend `.env` file.

## Usage

### Run a Scenario

```bash
# Run stable scenario (default)
npm start

# Or specify a scenario
npm start stable
npm start deteriorate
npm start assign_and_run

# Or use npm scripts
npm run scenario:stable
npm run scenario:deteriorate
npm run scenario:assign
```

### Command Line Options

You can also set environment variables:

```bash
PATIENT_ID=2 DEVICE_ID=3 SEND_INTERVAL=1 npm start deteriorate
```

## Scenarios

### 1. Stable State (`stable.js`)

- **Duration**: 5 minutes
- **Goal**: High-frequency ingestion without triggering alerts
- **Vitals**: All within normal ranges
- **Expected Result**: Many vitals records, zero alerts

```bash
npm run scenario:stable
```

### 2. Deterioration and Recovery (`deteriorate.js`)

- **Duration**: 10 minutes
- **Goal**: Test trigger-based alert creation
- **Timeline**:
  - 0-3 min: Stable state
  - 3-5 min: Deterioration (HR crosses threshold)
  - 5-8 min: Critical state (continuous alerts)
  - 8-10 min: Recovery (back to safe range)
- **Expected Result**: Alerts created during breach window

```bash
npm run scenario:deteriorate
```

### 3. Device Assignment (`assign_and_run.js`)

- **Duration**: 3 minutes
- **Goal**: Validate device assignment workflow
- **Process**: Assigns device to patient, then runs stable vitals
- **Requires**: JWT authentication token

```bash
# First, get auth token from backend
AUTH_TOKEN=your-jwt-token npm run scenario:assign
```

## How It Works

### Data Generation Algorithm

1. **Load Scenario**: Reads target values from scenario file
2. **Smoothing**: Gradually transitions between target values (60-second window)
3. **Noise**: Applies ±3% random deviation for realism
4. **Send Loop**: Sends data every N seconds (default: 2 seconds)

### Smoothing Formula

Values transition smoothly using:
```
V_current(t) = V_previous + (V_target - V_previous) * smoothing_factor
```

Where `smoothing_factor = 1 / (smoothing_window / send_interval)`

### Noise Application

```
V_final = V_smoothed * (1 + random(-noise_level, +noise_level))
```

Default noise level: 3% (±1.5% to ±3%)

## API Client

The `api_client.js` handles all backend communication:

- **sendData()**: Sends vital signs to `/api/v1/devices/ingest`
- **assignDevice()**: Assigns device to patient (requires auth)
- **testConnection()**: Verifies backend is reachable

## Testing

### Unit Tests

Test the API client and core logic:

```bash
npm test
```

### Integration Tests

Test with running backend (requires database):

```bash
# Make sure backend is running first
npm test -- --testPathPattern=integration
```

**Note**: Integration tests are skipped by default. Uncomment in `tests/integration/scenarios.test.js` to run.

## Scenario File Format

Scenarios are JavaScript modules that export a configuration object:

```javascript
module.exports = {
  name: 'Scenario Name',
  duration: 300, // seconds
  description: 'What this scenario tests',
  
  vitals: {
    heart_rate: [
      { time: 0, type: 'constant', value: 70 },
      { time: 180, type: 'linear', value: 120 },
      { time: 300, type: 'constant', value: 120 },
    ],
    // ... other vitals
  },
};
```

**Segment Types:**
- `constant`: Value remains fixed
- `linear`: Smoothly transitions to target value

## Troubleshooting

### "Cannot connect to backend API"

- Verify backend is running: `curl http://localhost:3000/health`
- Check `API_BASE_URL` in `.env`
- Check firewall/network settings

### "Authentication error: Invalid or missing API key"

- Verify `INGESTION_API_KEY` in `.env` matches backend's `INGESTION_API_KEY`
- Check backend is configured correctly

### "Validation error: patient_id is required"

- Ensure patient exists in database
- Check patient has active admission
- Verify `PATIENT_ID` in `.env` is correct

### "Device assignment failed"

- Ensure you have a valid JWT token
- Token must be from a user with `admin`, `doctor`, or `nurse` role
- Get token: `POST /api/v1/auth/login` with staff credentials

## Performance

The simulator is designed to handle high-frequency data:

- **Default**: 2-second intervals (30 records/minute)
- **Maximum**: Can run at 1-second intervals (60 records/minute)
- **Smoothing**: Prevents unrealistic jumps in values
- **Error Handling**: Continues running even if some sends fail

## Integration with Backend

The simulator works seamlessly with the backend:

1. **Ingestion**: Sends data to `/api/v1/devices/ingest`
2. **Triggers**: Backend triggers automatically create alerts
3. **WebSocket**: Backend broadcasts updates to connected clients
4. **Validation**: Backend validates patient admission status

## Example Output

```
✅ Loaded scenario: deteriorate
   Duration: 600 seconds
   Vitals: heart_rate, spo2, bp_systolic, bp_diastolic, temperature, respiration

🚀 Starting simulation...
   Patient ID: 1
   Device ID: 1
   Send interval: 2s
   Duration: 600s

✅ Backend API connection verified

📊 Sent: 10 | Failed: 0
📊 Sent: 20 | Failed: 0
...
📊 Sent: 300 | Failed: 0

✅ Simulation completed
   Duration: 600.0s
   Successfully sent: 300
   Failed: 0
```

## License

Private project for COMP3030 course.
