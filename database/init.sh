#!/bin/bash

# Debugging Notes:
# docker-compose down; docker rm -f $(docker ps -a -q) ; docker volume rm $(docker volume ls -q)
# docker-compose up --build
# docker exec -ti  database_db_1 /bin/bash

psql -U postgres -f ../bootstrap.sql
psql -U postgres -d mydb -f ../games.sql
psql -U postgres -d mydb -f ../players.sql
psql -U postgres -d mydb -f ../systems.sql
psql -U postgres -d mydb -f ../planets.sql
