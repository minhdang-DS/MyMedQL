# MySQL Dockerfile placeholder
FROM mysql:8
COPY init/init.sql /docker-entrypoint-initdb.d/init.sql
