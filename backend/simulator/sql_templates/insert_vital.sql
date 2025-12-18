INSERT INTO vitals (
    patient_id,
    device_id,
    ts,
    heart_rate,
    spo2,
    bp_systolic,
    bp_diastolic,
    temperature_c,
    respiration,
    metadata
)
VALUES (
    :patient_id,
    :device_id,
    :ts,
    :heart_rate,
    :spo2,
    :bp_systolic,
    :bp_diastolic,
    :temperature_c,
    :respiration,
    :metadata
)

