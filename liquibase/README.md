# Pax Liquibase (and Database)

Our database engine is Postgres 14.  We're using Liquibase to manage our scheme so that it is easy to make on-going changes to the schema without needed to delete the entire database and re-apply the up-to-date schema.


## Usage of the Database

###### Overview
- Spin up the database docker-compose
- Migrate the local database using liquibase
- Migrate the shared-dev database using liquibase


### Reset the database

```
docker-compose down; docker rm -f $(docker ps -a -q) ; docker volume rm $(docker volume ls -q)
docker-compose up
```

### Connect to the database

```
docker run -it --rm --network host postgres \
  psql -h localhost -p 5432 -U ${PAX_DATABASE_USERNAME} -W dbmodels
```
docker run -it --rm --network host postgres \
  psql -h 35.238.72.41 -p 5432 -U ${PAX_DATABASE_USERNAME} -W dbmodels

### Connect to the database (BAD)

```
# Warning! this method may not work... it's maybe starting in the wrong schema or connecting to the wrong postgres service all together.

docker exec -ti database_db_1 /bin/bash
psql -U postgres
```


## Usage of Liquibase

Test

```
liquibase --username "${PAX_DATABASE_USERNAME}" --password "${PAX_DATABASE_PASSWORD}" generateChangeLog
```

Migrate

```
liquibase --url jdbc:postgresql://35.238.72.41:5432/dbmodels --username "${PAX_DATABASE_USERNAME}" --password "${PAX_DATABASE_PASSWORD}" update
```


Debug Notes:

```
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

# Show all users
# > \du
```
