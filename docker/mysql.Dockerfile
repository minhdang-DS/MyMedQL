FROM mysql:8.0

# Set default character set and collation
ENV MYSQL_DATABASE=mymedql
ENV MYSQL_ROOT_PASSWORD=root

# Copy initialization scripts
# Files in /docker-entrypoint-initdb.d/ are executed in alphabetical order
COPY init/*.sql /docker-entrypoint-initdb.d/

# Expose MySQL port
EXPOSE 3306

# Configure MySQL for better performance and timezone
RUN echo "[mysqld]" > /etc/mysql/conf.d/custom.cnf && \
    echo "max_connections=200" >> /etc/mysql/conf.d/custom.cnf && \
    echo "character-set-server=utf8mb4" >> /etc/mysql/conf.d/custom.cnf && \
    echo "collation-server=utf8mb4_unicode_ci" >> /etc/mysql/conf.d/custom.cnf && \
    echo "default-time-zone='+07:00'" >> /etc/mysql/conf.d/custom.cnf
