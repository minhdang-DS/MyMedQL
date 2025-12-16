-- Completion marker
-- This runs after all other SQL files
SELECT '======================================' AS '';
SELECT 'MyMedQL Database Setup Complete!' AS '';
SELECT '======================================' AS '';
SELECT CONCAT('Database: ', DATABASE()) AS '';
SELECT CONCAT('Tables created: ', COUNT(*)) AS '' 
FROM information_schema.tables 
WHERE table_schema = DATABASE();
SELECT CURRENT_TIMESTAMP AS completed_at;

