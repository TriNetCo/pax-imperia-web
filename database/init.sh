#!/bin/bash

# Debugging Notes:
# docker-compose down; docker rm -f $(docker ps -a -q) ; docker volume rm $(docker volume ls -q)
# docker-compose up --build

# Get shell on running psql container
# docker exec -ti  database_db_1 /bin/bash

# Or use an external psql client and connect over the host network
# docker run -it --rm --network host postgres psql -h localhost -p 5432 -U app_rpm -W dbmodels

# Show All Databases
# > SELECT datname FROM pg_database;

# Show All Tables
# > SELECT * FROM pg_catalog.pg_tables WHERE schemaname = 'pax';
# > \dt pax.*

# Show records in table
# > SELECT * FROM pax.players;


psql -U postgres -f ../bootstrap.sql
psql -U postgres -d dbmodels -f ../games.sql
psql -U postgres -d dbmodels -f ../players.sql
psql -U postgres -d dbmodels -f ../systems.sql
psql -U postgres -d dbmodels -f ../planets.sql
psql -U postgres -d dbmodels -f ../db_users.sql
