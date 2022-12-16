#!/bin/bash

# Debugging Notes:
# docker-compose down; docker rm -f $(docker ps -a -q) ; docker volume rm $(docker volume ls -q)
# docker-compose up --build
# docker exec -ti  database_db_1 /bin/bash

psql -U postgres -f ../bootstrap.sql
psql -U postgres -d dbmodels -f ../games.sql
psql -U postgres -d dbmodels -f ../players.sql
psql -U postgres -d dbmodels -f ../systems.sql
psql -U postgres -d dbmodels -f ../planets.sql
psql -U postgres -d dbmodels -f ../db_users.sql
