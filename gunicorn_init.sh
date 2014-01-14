#!/bin/bash
set -e
echo "Gunicorn Django "
LOGFILE=/var/log/gunicorn/django-tweetout.log
LOGDIR=$(dirname $LOGFILE)
NUM_WORKERS=11
# user/group to run as
USER=jon
GROUP=jon
cd /var/tweetout/tweetout
pwd
source /var/tweetout/env/bin/activate
test -d $LOGDIR || mkdir -p $LOGDIR
exec ../env/bin/gunicorn_django -w $NUM_WORKERS \
    --user=$USER --group=$GROUP --log-level=debug \
    --log-file=$LOGFILE 2>>$LOGFILE
