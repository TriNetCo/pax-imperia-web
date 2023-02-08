# Pax Liquibase


## Usage

Test

```
liquibase --username "${PAX_DATABASE_USERNAME}" --password "${PAX_DATABASE_PASSWORD}" generateChangeLog
```

Migrate

```
liquibase --url jdbc:postgresql://35.238.72.41:5432/dbmodels --username "${PAX_DATABASE_USERNAME}" --password "${PAX_DATABASE_PASSWORD}" update
```
