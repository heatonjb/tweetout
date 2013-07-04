# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):

        # Changing field 'User.last_tweet_id'
        db.alter_column(u'web_user', 'last_tweet_id', self.gf('django.db.models.fields.IntegerField')(null=True))

    def backwards(self, orm):

        # Changing field 'User.last_tweet_id'
        db.alter_column(u'web_user', 'last_tweet_id', self.gf('django.db.models.fields.IntegerField')(default=None))

    models = {
        u'web.user': {
            'Meta': {'object_name': 'User'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_tweet_id': ('django.db.models.fields.IntegerField', [], {'null': 'True', 'blank': 'True'}),
            'oauth_token': ('django.db.models.fields.CharField', [], {'max_length': '90'}),
            'oauth_token_secret': ('django.db.models.fields.CharField', [], {'max_length': '90'}),
            'read_only_latest_tweet': ('django.db.models.fields.BooleanField', [], {'default': 'True'})
        }
    }

    complete_apps = ['web']