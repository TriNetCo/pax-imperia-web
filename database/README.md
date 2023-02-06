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
docker exec -ti  database_db_1 /bin/bash
```

