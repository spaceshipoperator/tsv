#!/bin/sh
isql -c -d, edwdev < $1 | sed '1,9d' | tac | sed '1d' | tac 
