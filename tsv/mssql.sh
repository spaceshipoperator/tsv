#!/bin/sh
## all sorts of acrobatics because we don't have odbc or freetds in nodejs as yet,
## this lil script relies on freeTDS, unixODBC, a DSN (in this case named edwdev) and 
## some samba winbind magic to handle the authentification of the nix user in teh db

CMD=$1

SQLFILE=/tmp/isql_query.$RANDOM.sql

echo $CMD > $SQLFILE

isql -c -d, edwdev < $SQLFILE | sed '1,9d' | tac | sed '1d' | tac 

rm $SQLFILE
