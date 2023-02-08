# Pax Database

Our database engine is Postgres 14.  We're using Liquibase to manage our scheme so that it is easy to make on-going changes to the schema without needed to delete the entire database and re-apply the up-to-date schema.


## Usage

###### Overview
- Spin up the database docker-compose
- Migrate the local database using liquibase
- Migrate the shared-dev database using liquibase


## Reset the database

```
docker-compose down; docker rm -f $(docker ps -a -q) ; docker volume rm $(docker volume ls -q)
docker-compose up --build
```

## Connect to the database

```
docker run -it --rm --network host postgres \
  psql -h localhost -p 5432 -U ${PAX_DATABASE_USERNAME} -W dbmodels
```

## Connect to the database (BAD)

```
# Warning! this method may not work... it's maybe starting in the wrong schema or connecting to the wrong postgres service all together.

docker exec -ti database_db_1 /bin/bash
psql -U postgres
```
