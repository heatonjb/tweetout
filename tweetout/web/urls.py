from django.conf.urls.defaults import *


urlpatterns = patterns('web.views',
    url(r'^$', 'main', name='main_view'),
    url(r'^auth/$', 'auth', name='auth'),
    url(r'^view/$', 'view', name='view'),
)

