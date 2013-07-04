# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'User'
        db.create_table(u'web_user', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('oauth_token', self.gf('django.db.models.fields.CharField')(max_length=90)),
            ('oauth_token_secret', self.gf('django.db.models.fields.CharField')(max_length=90)),
            ('last_tweet_id', self.gf('django.db.models.fields.IntegerField')()),
            ('read_only_latest_tweet', self.gf('django.db.models.fields.BooleanField')(default=True)),
        ))
        db.send_create_signal(u'web', ['User'])


    def backwards(self, orm):
        # Deleting model 'User'
        db.delete_table(u'web_user')


    models = {
        u'web.user': {
            'Meta': {'object_name': 'User'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'last_tweet_id': ('django.db.models.fields.IntegerField', [], {}),
            'oauth_token': ('django.db.models.fields.CharField', [], {'max_length': '90'}),
            'oauth_token_secret': ('django.db.models.fields.CharField', [], {'max_length': '90'}),
            'read_only_latest_tweet': ('django.db.models.fields.BooleanField', [], {'default': 'True'})
        }
    }

    complete_apps = ['web']